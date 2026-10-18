import express, { Request, Response } from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp as initializeClientApp, getApps as getClientApps } from 'firebase/app';
import {
  getFirestore as getClientFirestore,
  doc,
  getDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { initializeApp as initializeAdminApp, getApps as getAdminApps } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getStorage as getAdminStorage } from 'firebase-admin/storage';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };
import { SERVER_PRODUCT_VAULT } from './server/productVault.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const AUTHORIZED_ADMIN_EMAIL = 'nazrulcxd@gmail.com';
const SIGNED_URL_TTL_MS = 15 * 60 * 1000; // 15 minutes expiration

// Automatic server-side 256-bit HMAC secret for signing time-limited download URLs
const SERVER_BOOT_ENTROPY = crypto.randomBytes(32).toString('hex');
const DOWNLOAD_SIGNING_SECRET =
  process.env.DOWNLOAD_SIGNING_SECRET ||
  crypto
    .createHmac('sha256', SERVER_BOOT_ENTROPY)
    .update(`${firebaseConfig.projectId}:${firebaseConfig.appId}:nazrul-studio-vault-v4`)
    .digest('hex');

// Initialize server-side Firebase client SDK for Firestore verification
const clientApp =
  getClientApps().length === 0 ? initializeClientApp(firebaseConfig) : getClientApps()[0];
const serverDb = getClientFirestore(clientApp, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Admin SDK for V4 Storage Signed URLs when service account credentials are available
if (getAdminApps().length === 0) {
  try {
    initializeAdminApp({
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
    });
  } catch {
    // Admin SDK optional fallback
  }
}

interface SignedDownloadPayload {
  fileKey: string;
  licenseKey: string;
  orderId: string;
  buyerEmail: string;
  expiresAt: number;
  nonce: string;
}

function createSignedDownloadToken(payload: SignedDownloadPayload): {
  encodedPayload: string;
  signature: string;
} {
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', DOWNLOAD_SIGNING_SECRET)
    .update(encodedPayload)
    .digest('base64url');
  return { encodedPayload, signature };
}

function verifySignedDownloadToken(
  encodedPayload: string,
  signature: string
): SignedDownloadPayload | null {
  try {
    const expectedSig = crypto
      .createHmac('sha256', DOWNLOAD_SIGNING_SECRET)
      .update(encodedPayload)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as SignedDownloadPayload;

    if (!decoded.expiresAt || Date.now() > decoded.expiresAt) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Verify a Firebase Auth Google ID Token via Google's public tokeninfo/securetoken check or Admin SDK
 */
async function verifyAdminIdToken(idToken?: string): Promise<boolean> {
  if (!idToken) return false;
  try {
    // First try Firebase Admin Auth
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    if (
      decoded.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase() &&
      decoded.email_verified
    ) {
      return true;
    }
  } catch {
    // Fallback: decode JWT claims and verify via Firebase Auth REST lookup using project apiKey
    try {
      const resp = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }
      );
      if (resp.ok) {
        const data = (await resp.json()) as {
          users?: Array<{ email?: string; emailVerified?: boolean }>;
        };
        const user = data.users?.[0];
        if (
          user?.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase() &&
          user?.emailVerified
        ) {
          return true;
        }
      }
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Attempt to mint a Firebase Cloud Storage V4 Signed URL if the object exists in the bucket
 * and service account signing credentials are configured in the environment.
 */
async function tryMintFirebaseStorageSignedUrl(
  storagePath: string,
  downloadFilename: string,
  mimeType: string,
  expiresAt: number
): Promise<string | null> {
  try {
    const bucket = getAdminStorage().bucket(firebaseConfig.storageBucket);
    const file = bucket.file(storagePath);
    const [exists] = await file.exists();
    if (!exists) return null;

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: expiresAt,
      responseDisposition: `attachment; filename="${downloadFilename}"`,
      responseType: mimeType,
    });
    return signedUrl;
  } catch {
    return null;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Allow AI Studio preview and parent frames to embed the app
  app.use((_req, res, next) => {
    res.setHeader('Content-Security-Policy', "frame-ancestors *");
    res.removeHeader('X-Frame-Options');
    next();
  });

  /**
   * Server-Side Cloud Function Endpoint:
   * POST /api/generate-signed-download
   *
   * Verifies payment status in Firestore (`/orders/{orderId}` or `/licenses/{licenseKey}`)
   * before granting a short-lived Signed Download URL.
   */
  app.post('/api/generate-signed-download', async (req: Request, res: Response) => {
    try {
      const { code, orderId, buyerEmail, fileKey, idToken } = req.body || {};
      const cleanCode = String(code || '').trim().toUpperCase();
      const cleanOrderId = String(orderId || cleanCode).trim().toUpperCase();
      const cleanEmail = String(buyerEmail || '').trim().toLowerCase();
      const cleanFileKey = String(fileKey || '').trim().toLowerCase();

      const productFile = SERVER_PRODUCT_VAULT[cleanFileKey];
      if (!productFile) {
        res.status(400).json({
          verified: false,
          error: 'Invalid product file requested.',
        });
        return;
      }

      // 1. Check if caller is authenticated as the authorized Admin (nazrulcxd@gmail.com)
      const bearerToken = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.substring(7).trim()
        : idToken;
      const isAdmin = await verifyAdminIdToken(bearerToken);

      let verifiedLicenseKey = 'ADMIN-MASTER-LICENSE';
      let verifiedOrderId = 'ADMIN-MASTER';
      let verifiedBuyerEmail = AUTHORIZED_ADMIN_EMAIL;

      // 2. If not Admin, verify payment/license status directly in Firestore
      if (!isAdmin) {
        if (!cleanCode || cleanCode.length < 8) {
          res.status(403).json({
            verified: false,
            error:
              'Payment verification required: Please provide a valid License Key or verified PayPal Transaction ID.',
          });
          return;
        }

        let isVerifiedInFirestore = false;

        // 2a. Check /licenses/{cleanCode} in Firestore
        const licenseRef = doc(serverDb, 'licenses', cleanCode);
        const licenseSnap = await getDoc(licenseRef);

        if (licenseSnap.exists()) {
          const lic = licenseSnap.data();
          if (lic.status === 'revoked') {
            res.status(403).json({
              verified: false,
              error: 'Access Denied: This license key has been revoked.',
            });
            return;
          }
          if (lic.status !== 'active') {
            res.status(403).json({
              verified: false,
              error: 'Access Denied: This license key is pending activation.',
            });
            return;
          }
          const downloadsCount = Number(lic.downloadsCount || 0);
          const maxDownloads = Number(lic.maxDownloads || 5);
          if (downloadsCount >= maxDownloads) {
            res.status(403).json({
              verified: false,
              error: `Maximum download limit (${maxDownloads}) reached for this license key. Contact hello@nazrulstudio.uk.`,
            });
            return;
          }
          if (
            lic.buyerEmail &&
            lic.buyerEmail !== 'any' &&
            cleanEmail &&
            String(lic.buyerEmail).toLowerCase() !== cleanEmail
          ) {
            res.status(403).json({
              verified: false,
              error: 'Buyer email does not match the email registered to this License Key.',
            });
            return;
          }

          // Atomically increment download counter in Firestore
          await updateDoc(licenseRef, {
            downloadsCount: increment(1),
            lastDownloadAt: new Date().toISOString(),
          });

          isVerifiedInFirestore = true;
          verifiedLicenseKey = String(lic.licenseKey || cleanCode);
          verifiedOrderId = String(lic.paypalTxId || verifiedLicenseKey);
          verifiedBuyerEmail = String(lic.buyerEmail || cleanEmail || 'verified@customer');
        }

        // 2b. Check /orders/{candidateId} in Firestore if not matched in /licenses
        if (!isVerifiedInFirestore) {
          const candidates = Array.from(new Set([cleanCode, cleanOrderId])).filter(Boolean);

          for (const candidateId of candidates) {
            const orderRef = doc(serverDb, 'orders', candidateId);
            const orderSnap = await getDoc(orderRef);
            if (!orderSnap.exists()) continue;

            const ord = orderSnap.data();
            const matchesOrder =
              String(ord.orderId || '').toUpperCase() === cleanCode ||
              String(ord.licenseKey || '').toUpperCase() === cleanCode ||
              String(ord.orderId || '').toUpperCase() === cleanOrderId;

            if (!matchesOrder) continue;

            if (ord.status === 'revoked') {
              res.status(403).json({
                verified: false,
                error: 'Access Denied: This order has been revoked by the administrator.',
              });
              return;
            }
            if (ord.status !== 'verified') {
              res.status(403).json({
                verified: false,
                error:
                  'Access Denied: Your PayPal transaction is still pending verification in Firestore.',
              });
              return;
            }
            if (
              cleanEmail &&
              ord.buyerEmail &&
              String(ord.buyerEmail).toLowerCase() !== cleanEmail
            ) {
              res.status(403).json({
                verified: false,
                error: 'Buyer email does not match the registered PayPal order.',
              });
              return;
            }

            // If a corresponding /licenses/{ord.licenseKey} doc exists, increment its download counter too
            if (ord.licenseKey) {
              try {
                const linkedLicRef = doc(serverDb, 'licenses', String(ord.licenseKey));
                const linkedLicSnap = await getDoc(linkedLicRef);
                if (linkedLicSnap.exists()) {
                  const licData = linkedLicSnap.data();
                  if (licData.status === 'revoked') {
                    res.status(403).json({
                      verified: false,
                      error: 'Access Denied: Your associated license key has been revoked.',
                    });
                    return;
                  }
                  if (Number(licData.downloadsCount || 0) >= Number(licData.maxDownloads || 5)) {
                    res.status(403).json({
                      verified: false,
                      error: `Maximum download limit (${licData.maxDownloads}) reached for this license.`,
                    });
                    return;
                  }
                  await updateDoc(linkedLicRef, {
                    downloadsCount: increment(1),
                    lastDownloadAt: new Date().toISOString(),
                  });
                }
              } catch {
                // ignore if linked license doc wasn't created separately
              }
            }

            isVerifiedInFirestore = true;
            verifiedLicenseKey = String(ord.licenseKey || ord.orderId || candidateId);
            verifiedOrderId = String(ord.orderId || candidateId);
            verifiedBuyerEmail = String(ord.buyerEmail || cleanEmail || 'verified@customer');
            break;
          }
        }

        if (!isVerifiedInFirestore) {
          res.status(403).json({
            verified: false,
            error:
              'Access Denied: Payment status could not be verified in Firestore. Unauthorized direct downloads are blocked.',
          });
          return;
        }
      }

      // 3. Payment verified in Firestore! Generate short-lived Signed Download URL (15-min TTL)
      const expiresAt = Date.now() + SIGNED_URL_TTL_MS;

      // Try Firebase Storage V4 Signed URL first if object is hosted in bucket
      const firebaseStorageSignedUrl = await tryMintFirebaseStorageSignedUrl(
        productFile.storagePath,
        productFile.filename,
        productFile.mimeType,
        expiresAt
      );

      // Generate HMAC-SHA256 Signed URL served from the protected server vault
      const { encodedPayload, signature } = createSignedDownloadToken({
        fileKey: productFile.fileKey,
        licenseKey: verifiedLicenseKey,
        orderId: verifiedOrderId,
        buyerEmail: verifiedBuyerEmail,
        expiresAt,
        nonce: crypto.randomBytes(8).toString('hex'),
      });

      const serverSignedUrl = `/api/download-signed?token=${encodeURIComponent(
        encodedPayload
      )}&sig=${encodeURIComponent(signature)}`;

      res.status(200).json({
        verified: true,
        signedUrl: firebaseStorageSignedUrl || serverSignedUrl,
        storageProvider: firebaseStorageSignedUrl
          ? 'firebase-storage-v4-signed-url'
          : 'server-hmac-signed-url',
        filename: productFile.filename,
        licenseKey: verifiedLicenseKey,
        buyerEmail: verifiedBuyerEmail,
        expiresAt,
      });
    } catch (error) {
      console.error('Server-side payment verification error:', error);
      res.status(500).json({
        verified: false,
        error: 'Server error while verifying payment status in Firestore.',
      });
    }
  });

  /**
   * Protected Signed URL Download Streaming Endpoint:
   * GET /api/download-signed?token=...&sig=...
   *
   * Validates the cryptographic HMAC-SHA256 signature and expiration timestamp
   * before streaming the watermarked file from the server vault.
   */
  app.get('/api/download-signed', (req: Request, res: Response) => {
    const token = String(req.query.token || '');
    const sig = String(req.query.sig || '');

    if (!token || !sig) {
      res.status(403).json({
        error: 'Access Denied: Missing cryptographic signature or token.',
      });
      return;
    }

    const verifiedPayload = verifySignedDownloadToken(token, sig);
    if (!verifiedPayload) {
      res.status(403).json({
        error: 'Access Denied: Signed download URL is invalid, tampered with, or expired.',
      });
      return;
    }

    const productFile = SERVER_PRODUCT_VAULT[verifiedPayload.fileKey];
    if (!productFile) {
      res.status(404).json({ error: 'Requested file not found in secure vault.' });
      return;
    }

    const stampedContent = productFile.buildContent({
      buyerEmail: verifiedPayload.buyerEmail,
      licenseKey: verifiedPayload.licenseKey,
      orderId: verifiedPayload.orderId,
      issuedAt: new Date().toISOString(),
    });

    res.setHeader('Content-Type', productFile.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${productFile.filename}"`
    );
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200).send(stampedContent);
  });

  // Mount Vite dev server in development or static dist in production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `Nazrul Studio server & Firestore Payment Gatekeeper running on http://0.0.0.0:${PORT}`
    );
  });
}

startServer();
