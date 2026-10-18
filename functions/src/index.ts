import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  initializeApp({
    projectId: 'nazrulstudio',
    storageBucket: 'nazrulstudio.firebasestorage.app',
  });
}

const FIRESTORE_DATABASE_ID =
  'ai-studio-nazrulstudio-3a110f7a-e7a4-42b9-9726-b3d2ba559de2';
const AUTHORIZED_ADMIN_EMAIL = 'nazrulcxd@gmail.com';
const SIGNED_URL_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutes

// Map logical file keys to protected Firebase Storage object paths
const PROTECTED_STORAGE_FILES: Record<
  string,
  { storagePath: string; downloadFilename: string; contentType: string }
> = {
  zxp: {
    storagePath: 'protected-products/SerialPlacer.zxp',
    downloadFilename: 'SerialPlacer.zxp',
    contentType: 'application/octet-stream',
  },
  jsx: {
    storagePath: 'protected-products/Serial_Placer_v4.jsx',
    downloadFilename: 'Serial_Placer_v4.jsx',
    contentType: 'application/javascript',
  },
  guide: {
    storagePath: 'protected-products/Serial_Placer_User_Guide.txt',
    downloadFilename: 'Serial_Placer_User_Guide.txt',
    contentType: 'text/plain',
  },
  samples: {
    storagePath: 'protected-products/Sample_Serials.txt',
    downloadFilename: 'Sample_Serials.txt',
    contentType: 'text/plain',
  },
};

/**
 * Server-Side Cloud Function: getSignedProductDownloadUrl
 *
 * 1. Verifies the caller's payment status in Firestore (`/orders/{orderId}` with `status == 'verified'`
 *    OR `/licenses/{licenseKey}` with `status == 'active'` and `downloadsCount < maxDownloads`),
 *    or verifies the Firebase Auth ID token for the authorized Admin (`nazrulcxd@gmail.com`).
 * 2. Atomically increments the download counter (`downloadsCount`) and updates `lastDownloadAt` in Firestore.
 * 3. Generates a time-limited V4 Signed URL from Firebase Cloud Storage (`protected-products/{file}`)
 *    valid for 15 minutes, preventing any direct unauthenticated access to product files.
 */
export const getSignedProductDownloadUrl = onRequest(
  {
    region: 'europe-west2',
    cors: true,
    maxInstances: 10,
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
      return;
    }

    try {
      const { code, orderId, buyerEmail, fileKey } = req.body || {};
      const cleanCode = String(code || '').trim().toUpperCase();
      const cleanOrderId = String(orderId || cleanCode).trim().toUpperCase();
      const cleanEmail = String(buyerEmail || '').trim().toLowerCase();
      const requestedFile = PROTECTED_STORAGE_FILES[String(fileKey || '').toLowerCase()];

      if (!requestedFile) {
        res.status(400).json({
          error: 'Invalid fileKey. Allowed values: zxp, jsx, guide, samples.',
        });
        return;
      }

      const app = getApp();
      const db = getFirestore(app, FIRESTORE_DATABASE_ID);

      // 1. Check if caller provided a valid Firebase Auth Bearer token for Admin (nazrulcxd@gmail.com)
      let isAdminAuthorized = false;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const idToken = authHeader.substring(7).trim();
        if (idToken) {
          try {
            const decoded = await getAuth(app).verifyIdToken(idToken);
            if (
              decoded.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL &&
              decoded.email_verified
            ) {
              isAdminAuthorized = true;
            }
          } catch {
            // Invalid token, proceed with license/order verification
          }
        }
      }

      let verifiedLicenseKey = 'ADMIN-MASTER-LICENSE';
      let verifiedBuyerEmail = AUTHORIZED_ADMIN_EMAIL;

      // 2. If not Admin, strictly verify payment/license status in Firestore
      if (!isAdminAuthorized) {
        if (!cleanCode || cleanCode.length < 8) {
          res.status(403).json({
            error:
              'Payment verification required: Missing valid License Key or PayPal Transaction ID.',
          });
          return;
        }

        let isPaymentVerified = false;

        // 2a. Check /licenses/{cleanCode}
        const licenseRef = db.collection('licenses').doc(cleanCode);
        const licenseSnap = await licenseRef.get();

        if (licenseSnap.exists) {
          const lic = licenseSnap.data()!;
          if (lic.status === 'revoked') {
            res.status(403).json({
              error: 'Access Denied: This license key has been revoked.',
            });
            return;
          }
          if (lic.status !== 'active') {
            res.status(403).json({
              error: 'Access Denied: This license key is pending activation.',
            });
            return;
          }
          const downloadsCount = Number(lic.downloadsCount || 0);
          const maxDownloads = Number(lic.maxDownloads || 5);
          if (downloadsCount >= maxDownloads) {
            res.status(403).json({
              error: `Maximum download limit (${maxDownloads}) reached for this license key.`,
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
              error: 'Buyer email does not match the email registered to this License Key.',
            });
            return;
          }

          // Increment download counter in Firestore
          await licenseRef.update({
            downloadsCount: FieldValue.increment(1),
            lastDownloadAt: new Date().toISOString(),
          });

          isPaymentVerified = true;
          verifiedLicenseKey = String(lic.licenseKey || cleanCode);
          verifiedBuyerEmail = String(lic.buyerEmail || cleanEmail);
        }

        // 2b. If not found in /licenses, check /orders/{cleanCode} or /orders/{cleanOrderId}
        if (!isPaymentVerified) {
          const candidates = Array.from(new Set([cleanCode, cleanOrderId])).filter(Boolean);
          for (const candidateId of candidates) {
            const orderRef = db.collection('orders').doc(candidateId);
            const orderSnap = await orderRef.get();
            if (!orderSnap.exists) continue;

            const ord = orderSnap.data()!;
            if (
              String(ord.orderId || '').toUpperCase() !== cleanCode &&
              String(ord.licenseKey || '').toUpperCase() !== cleanCode &&
              String(ord.orderId || '').toUpperCase() !== cleanOrderId
            ) {
              continue;
            }

            if (ord.status === 'revoked') {
              res.status(403).json({
                error: 'Access Denied: This order has been revoked by the administrator.',
              });
              return;
            }
            if (ord.status !== 'verified') {
              res.status(403).json({
                error:
                  'Access Denied: Payment is still pending verification in Firestore.',
              });
              return;
            }
            if (
              cleanEmail &&
              ord.buyerEmail &&
              String(ord.buyerEmail).toLowerCase() !== cleanEmail
            ) {
              res.status(403).json({
                error: 'Buyer email does not match the PayPal order record.',
              });
              return;
            }

            isPaymentVerified = true;
            verifiedLicenseKey = String(ord.licenseKey || ord.orderId || candidateId);
            verifiedBuyerEmail = String(ord.buyerEmail || cleanEmail);
            break;
          }
        }

        if (!isPaymentVerified) {
          res.status(403).json({
            error:
              'Access Denied: No verified payment or active license found in Firestore.',
          });
          return;
        }
      }

      // 3. Payment is verified in Firestore — Generate V4 Signed URL from Firebase Storage
      const expiresAt = Date.now() + SIGNED_URL_EXPIRATION_MS;
      const bucket = getStorage(app).bucket('nazrulstudio.firebasestorage.app');
      const file = bucket.file(requestedFile.storagePath);

      const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: expiresAt,
        responseDisposition: `attachment; filename="${requestedFile.downloadFilename}"`,
        responseType: requestedFile.contentType,
      });

      res.status(200).json({
        verified: true,
        signedUrl,
        filename: requestedFile.downloadFilename,
        licenseKey: verifiedLicenseKey,
        buyerEmail: verifiedBuyerEmail,
        expiresAt,
      });
    } catch (error: any) {
      console.error('Error in getSignedProductDownloadUrl:', error);
      res.status(500).json({
        error: 'Internal server error while generating signed download URL.',
      });
    }
  }
);
