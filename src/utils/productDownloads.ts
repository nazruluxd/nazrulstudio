import { getVerifiedSessionToken } from './licenseSecurity';
import { auth } from '../firebase';
import { AUTHORIZED_ADMIN_EMAIL } from '../components/AdminModal';

export type ProtectedFileKey = 'zxp' | 'jsx' | 'guide' | 'samples';

export interface SignedDownloadResult {
  success: boolean;
  signedUrl?: string;
  filename?: string;
  expiresAt?: number;
  storageProvider?: string;
  error?: string;
}

/**
 * Requests a short-lived, cryptographically signed download URL from the server-side
 * Cloud Function (`/api/generate-signed-download`).
 *
 * The server verifies payment status directly in Firestore (`/orders/{orderId}` or `/licenses/{licenseKey}`)
 * before minting the signed URL. No product files are stored in the client bundle.
 */
export async function requestSignedProductDownload(
  fileKey: ProtectedFileKey
): Promise<SignedDownloadResult> {
  const currentUser = auth.currentUser;
  const isAdmin =
    currentUser?.email?.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
  const session = getVerifiedSessionToken();

  if (!isAdmin && !session) {
    return {
      success: false,
      error:
        'Access Denied: No verified payment session found. Please verify your License Key or PayPal Transaction ID first.',
    };
  }

  try {
    let idToken: string | undefined;
    if (currentUser) {
      try {
        idToken = await currentUser.getIdToken();
      } catch {
        // ignore token error
      }
    }

    const response = await fetch('/api/generate-signed-download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({
        fileKey,
        code: session?.licenseKey || session?.orderId || '',
        orderId: session?.orderId || '',
        buyerEmail: session?.buyerEmail || currentUser?.email || '',
        idToken,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.verified || !data.signedUrl) {
      return {
        success: false,
        error:
          data.error ||
          'Server rejected download request: Payment status could not be verified in Firestore.',
      };
    }

    // Trigger browser download from the server-issued signed URL
    const a = document.createElement('a');
    a.href = data.signedUrl;
    a.download = data.filename || fileKey;
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    return {
      success: true,
      signedUrl: data.signedUrl,
      filename: data.filename,
      expiresAt: data.expiresAt,
      storageProvider: data.storageProvider,
    };
  } catch (err) {
    console.error('Error requesting signed download URL:', err);
    return {
      success: false,
      error: 'Unable to reach security server to generate signed download URL.',
    };
  }
}

export async function downloadZxpExtension(): Promise<SignedDownloadResult> {
  return requestSignedProductDownload('zxp');
}

export async function downloadJsxScript(): Promise<SignedDownloadResult> {
  return requestSignedProductDownload('jsx');
}

export async function downloadUserGuide(): Promise<SignedDownloadResult> {
  return requestSignedProductDownload('guide');
}

export async function downloadSampleSerials(): Promise<SignedDownloadResult> {
  return requestSignedProductDownload('samples');
}
