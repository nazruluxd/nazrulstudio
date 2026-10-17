import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { AUTHORIZED_ADMIN_EMAIL } from '../components/AdminModal';

export interface LicenseRecord {
  licenseKey: string;
  buyerEmail: string;
  paypalTxId: string;
  users: number;
  amountPaid: number;
  status: 'active' | 'pending' | 'revoked';
  downloadsCount: number;
  maxDownloads: number;
  createdAt: string;
  lastDownloadAt?: string;
}

export interface OrderRecord {
  orderId: string;
  paypalTxId: string;
  buyerEmail: string;
  users: number;
  amount: number;
  status: 'pending' | 'verified' | 'revoked';
  licenseKey: string;
  createdAt: string;
}

const SESSION_VERIFIED_TOKEN_KEY = 'nazrul_verified_license_session_v1';
const CHECKOUT_LAUNCH_TIMESTAMP_KEY = 'nazrul_paypal_checkout_launched_at';
const CHECKOUT_BUYER_EMAIL_KEY = 'nazrul_paypal_checkout_email';

/**
 * Generates a formatted cryptographic License Key: SP-XXXX-XXXX-XXXX
 */
export function generateLicenseKey(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const segment = () => {
    const arr = new Uint8Array(4);
    window.crypto.getRandomValues(arr);
    return Array.from(arr)
      .map((b) => chars[b % chars.length])
      .join('');
  };
  return `SP-${segment()}-${segment()}-${segment()}`;
}

/**
 * Record when a customer genuinely launches the PayPal checkout flow
 */
export function recordPayPalCheckoutLaunch(email: string, users: number, amount: number) {
  try {
    sessionStorage.setItem(CHECKOUT_LAUNCH_TIMESTAMP_KEY, String(Date.now()));
    sessionStorage.setItem(CHECKOUT_BUYER_EMAIL_KEY, email.trim().toLowerCase());
    sessionStorage.setItem('nazrul_paypal_checkout_users', String(users));
    sessionStorage.setItem('nazrul_paypal_checkout_amount', String(amount));
  } catch {
    // ignore storage errors
  }
}

export function getPayPalCheckoutLaunchInfo(): {
  launchedAt: number | null;
  email: string;
  elapsedSeconds: number;
} {
  try {
    const rawTime = sessionStorage.getItem(CHECKOUT_LAUNCH_TIMESTAMP_KEY);
    const email = sessionStorage.getItem(CHECKOUT_BUYER_EMAIL_KEY) || '';
    if (!rawTime) return { launchedAt: null, email, elapsedSeconds: 0 };
    const launchedAt = parseInt(rawTime, 10);
    const elapsedSeconds = Math.floor((Date.now() - launchedAt) / 1000);
    return { launchedAt, email, elapsedSeconds };
  } catch {
    return { launchedAt: null, email: '', elapsedSeconds: 0 };
  }
}

/**
 * Strictly validates a genuine 17-character PayPal Transaction / Receipt ID.
 * Rejects fake, sequential, low-entropy, or test inputs.
 */
export function validatePayPalTransactionIdFormat(rawTxId: string): {
  valid: boolean;
  normalized: string;
  reason?: string;
} {
  const cleaned = rawTxId.trim().toUpperCase().replace(/[\s-]/g, '');

  // Standard PayPal Transaction IDs are 17 uppercase alphanumeric characters (allow 15-19 for international variants)
  if (!/^[A-Z0-9]{15,19}$/.test(cleaned)) {
    return {
      valid: false,
      normalized: cleaned,
      reason:
        'Invalid PayPal Transaction ID format. A genuine PayPal Receipt / Transaction ID is a 17-character alphanumeric code (e.g., 8XL9283746192837K) found in your PayPal confirmation email.',
    };
  }

  // Must contain both letters and numbers
  const digitCount = (cleaned.match(/[0-9]/g) || []).length;
  const letterCount = (cleaned.match(/[A-Z]/g) || []).length;
  if (digitCount < 5 || letterCount < 2) {
    return {
      valid: false,
      normalized: cleaned,
      reason:
        'Invalid PayPal Transaction ID structure. Please copy the exact 17-character Transaction ID from your PayPal receipt.',
    };
  }

  // Reject repeating characters (e.g. AAAA, 1111)
  if (/(.)\1{3,}/.test(cleaned)) {
    return {
      valid: false,
      normalized: cleaned,
      reason: 'Unrecognized or test Transaction ID detected.',
    };
  }

  // Reject common sequential or fake words
  const forbiddenSubstrings = [
    '12345',
    '23456',
    '34567',
    '45678',
    '56789',
    '67890',
    '09876',
    'ABCDE',
    'QWERT',
    'ASDFG',
    'ZXCVB',
    'PAYPAL',
    'VERIFY',
    'VERIFIED',
    'CONFIRM',
    'TEST',
    'ADMIN',
    'SAMPLE',
    'SERIAL',
    'PLACER',
    'NAZRUL',
    'STUDIO',
    'FREE',
    'DEMO',
  ];

  for (const word of forbiddenSubstrings) {
    if (cleaned.includes(word)) {
      return {
        valid: false,
        normalized: cleaned,
        reason: 'This Transaction ID is invalid or flagged by security check.',
      };
    }
  }

  // Require sufficient character diversity (at least 7 distinct characters)
  const uniqueChars = new Set(cleaned.split('')).size;
  if (uniqueChars < 7) {
    return {
      valid: false,
      normalized: cleaned,
      reason: 'Transaction ID failed cryptographic entropy verification.',
    };
  }

  return { valid: true, normalized: cleaned };
}

/**
 * Checks if input is formatted as a Nazrul Studio License Key (SP-XXXX-XXXX-XXXX)
 */
export function isLicenseKeyFormat(input: string): boolean {
  const cleaned = input.trim().toUpperCase();
  return /^SP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(cleaned);
}

/**
 * Stores verified session token in sessionStorage after Firestore confirmation
 */
export function saveVerifiedSessionToken(data: {
  orderId: string;
  licenseKey: string;
  buyerEmail: string;
  users: number;
  verifiedAt: number;
}) {
  try {
    sessionStorage.setItem(SESSION_VERIFIED_TOKEN_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getVerifiedSessionToken(): {
  orderId: string;
  licenseKey: string;
  buyerEmail: string;
  users: number;
  verifiedAt: number;
} | null {
  try {
    const raw = sessionStorage.getItem(SESSION_VERIFIED_TOKEN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearVerifiedSessionToken() {
  try {
    sessionStorage.removeItem(SESSION_VERIFIED_TOKEN_KEY);
  } catch {
    // ignore
  }
}

/**
 * Verifies an existing License Key or Order ID directly against Firestore
 */
export async function verifyExistingLicenseOrOrder(
  codeInput: string,
  buyerEmailInput?: string
): Promise<{
  verified: boolean;
  status?: 'active' | 'verified' | 'pending' | 'revoked';
  orderId?: string;
  licenseKey?: string;
  users?: number;
  buyerEmail?: string;
  error?: string;
}> {
  const cleanedCode = codeInput.trim().toUpperCase();
  const cleanedEmail = (buyerEmailInput || '').trim().toLowerCase();

  if (!cleanedCode || cleanedCode.length < 8) {
    return {
      verified: false,
      error: 'Please enter a valid License Key (SP-XXXX-XXXX-XXXX) or 17-character PayPal Transaction ID.',
    };
  }

  try {
    // 1. Check /licenses/{cleanedCode}
    const licenseRef = doc(db, 'licenses', cleanedCode);
    const licenseSnap = await getDoc(licenseRef);

    if (licenseSnap.exists()) {
      const lic = licenseSnap.data() as LicenseRecord;
      if (lic.status === 'revoked') {
        return {
          verified: false,
          status: 'revoked',
          error: 'This license key has been revoked. Please contact hello@nazrulstudio.uk.',
        };
      }
      if (lic.status !== 'active') {
        return {
          verified: false,
          status: lic.status,
          error: 'This license key is pending activation.',
        };
      }
      if (lic.downloadsCount >= lic.maxDownloads) {
        return {
          verified: false,
          error: `Maximum download limit (${lic.maxDownloads}) reached for this license key. Email hello@nazrulstudio.uk to reset your activations.`,
        };
      }
      // If license is already bound to a specific buyer email, require matching email if provided
      if (
        lic.buyerEmail &&
        lic.buyerEmail !== 'any' &&
        cleanedEmail &&
        lic.buyerEmail.toLowerCase() !== cleanedEmail
      ) {
        return {
          verified: false,
          error: 'The email entered does not match the buyer email registered to this License Key.',
        };
      }

      saveVerifiedSessionToken({
        orderId: lic.paypalTxId || lic.licenseKey,
        licenseKey: lic.licenseKey,
        buyerEmail: lic.buyerEmail || cleanedEmail || 'verified@customer',
        users: lic.users || 1,
        verifiedAt: Date.now(),
      });

      return {
        verified: true,
        status: 'active',
        orderId: lic.paypalTxId || lic.licenseKey,
        licenseKey: lic.licenseKey,
        users: lic.users || 1,
        buyerEmail: lic.buyerEmail || cleanedEmail,
      };
    }

    // 2. Check /orders/{cleanedCode}
    const orderRef = doc(db, 'orders', cleanedCode);
    const orderSnap = await getDoc(orderRef);

    if (orderSnap.exists()) {
      const ord = orderSnap.data() as OrderRecord;
      if (ord.status === 'revoked') {
        return {
          verified: false,
          status: 'revoked',
          error: 'This order / transaction has been revoked by the administrator.',
        };
      }
      if (cleanedEmail && ord.buyerEmail.toLowerCase() !== cleanedEmail) {
        return {
          verified: false,
          error: 'The email address does not match the PayPal buyer email for this Transaction ID.',
        };
      }
      if (ord.status === 'pending') {
        return {
          verified: false,
          status: 'pending',
          orderId: ord.orderId,
          users: ord.users,
          buyerEmail: ord.buyerEmail,
          error:
            'Your PayPal transaction is currently pending verification. As soon as your payment is confirmed, your download will unlock automatically on this screen.',
        };
      }
      if (ord.status === 'verified') {
        saveVerifiedSessionToken({
          orderId: ord.orderId,
          licenseKey: ord.licenseKey || ord.orderId,
          buyerEmail: ord.buyerEmail,
          users: ord.users || 1,
          verifiedAt: Date.now(),
        });
        return {
          verified: true,
          status: 'verified',
          orderId: ord.orderId,
          licenseKey: ord.licenseKey || ord.orderId,
          users: ord.users || 1,
          buyerEmail: ord.buyerEmail,
        };
      }
    }

    return {
      verified: false,
      error:
        'No verified order or license key found matching this code. Please complete your PayPal payment first or double-check your License Key.',
    };
  } catch (err) {
    console.error('License verification error:', err);
    return {
      verified: false,
      error: 'Unable to verify license with security server. Please check your connection and try again.',
    };
  }
}

/**
 * Submits a PayPal Transaction ID after launching checkout
 */
export async function submitPayPalTransactionVerification(params: {
  paypalTxId: string;
  buyerEmail: string;
  users: number;
  amount: number;
}): Promise<{
  success: boolean;
  status?: 'verified' | 'pending';
  orderId?: string;
  licenseKey?: string;
  error?: string;
}> {
  const email = params.buyerEmail.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      success: false,
      error: 'Please enter the valid email address used for your PayPal payment.',
    };
  }

  // First check if the user actually entered a pre-issued License Key (SP-XXXX-XXXX-XXXX)
  if (isLicenseKeyFormat(params.paypalTxId)) {
    const res = await verifyExistingLicenseOrOrder(params.paypalTxId, email);
    if (res.verified) {
      return {
        success: true,
        status: 'verified',
        orderId: res.orderId,
        licenseKey: res.licenseKey,
      };
    }
    return {
      success: false,
      error: res.error || 'Invalid License Key.',
    };
  }

  // Validate PayPal Transaction ID format & entropy
  const txValidation = validatePayPalTransactionIdFormat(params.paypalTxId);
  if (!txValidation.valid) {
    return {
      success: false,
      error: txValidation.reason,
    };
  }

  const normalizedTxId = txValidation.normalized;

  try {
    // Check if this order already exists in Firestore
    const existingRes = await verifyExistingLicenseOrOrder(normalizedTxId, email);
    if (existingRes.verified) {
      return {
        success: true,
        status: 'verified',
        orderId: existingRes.orderId,
        licenseKey: existingRes.licenseKey,
      };
    }
    if (existingRes.status === 'revoked') {
      return {
        success: false,
        error: existingRes.error,
      };
    }
    if (existingRes.status === 'pending') {
      return {
        success: true,
        status: 'pending',
        orderId: normalizedTxId,
      };
    }

    // Ensure the user actually launched the PayPal checkout flow in this session
    const launchInfo = getPayPalCheckoutLaunchInfo();
    if (!launchInfo.launchedAt || launchInfo.elapsedSeconds < 12) {
      return {
        success: false,
        error:
          'Security Check Failed: No active completed PayPal checkout detected in this session. Please click "Pay with PayPal" and complete your payment on PayPal first, or enter an issued License Key (SP-XXXX-XXXX-XXXX).',
      };
    }

    // Check siteConfig/main for paymentSecurity settings.
    // HIGH SECURITY DEFAULT: requireManualApproval is TRUE by default so fake Transaction IDs can NEVER unlock downloads!
    let requireManualApproval = true;
    try {
      const configSnap = await getDoc(doc(db, 'siteConfig', 'main'));
      if (configSnap.exists()) {
        const cfg = configSnap.data();
        if (cfg?.paymentSecurity?.requireManualApproval === false) {
          requireManualApproval = false;
        }
      }
    } catch {
      // default to true (strict security) if config read fails
    }

    const issuedLicenseKey = generateLicenseKey();
    const initialStatus: 'pending' | 'verified' = requireManualApproval ? 'pending' : 'verified';

    const newOrder: OrderRecord = {
      orderId: normalizedTxId,
      paypalTxId: normalizedTxId,
      buyerEmail: email,
      users: params.users,
      amount: params.amount,
      status: initialStatus,
      licenseKey: issuedLicenseKey,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'orders', normalizedTxId), newOrder);

    if (initialStatus === 'verified') {
      saveVerifiedSessionToken({
        orderId: normalizedTxId,
        licenseKey: issuedLicenseKey,
        buyerEmail: email,
        users: params.users,
        verifiedAt: Date.now(),
      });
    }

    return {
      success: true,
      status: initialStatus,
      orderId: normalizedTxId,
      licenseKey: issuedLicenseKey,
    };
  } catch (err) {
    console.error('Order submission error:', err);
    return {
      success: false,
      error: 'Could not register your PayPal transaction. Make sure the Transaction ID has not already been claimed by another email.',
    };
  }
}

/**
 * Increments download counter in Firestore when a verified license downloads a file
 */
export async function recordAuthorizedDownload(code: string): Promise<boolean> {
  // Always allow authenticated Admin (nazrulcxd@gmail.com)
  if (
    auth.currentUser?.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()
  ) {
    return true;
  }

  const session = getVerifiedSessionToken();
  if (!session) return false;

  try {
    const cleanCode = code.trim().toUpperCase();
    if (isLicenseKeyFormat(cleanCode)) {
      const licRef = doc(db, 'licenses', cleanCode);
      const snap = await getDoc(licRef);
      if (snap.exists()) {
        const data = snap.data() as LicenseRecord;
        if (data.status !== 'active' || data.downloadsCount >= data.maxDownloads) {
          return false;
        }
        await updateDoc(licRef, {
          downloadsCount: increment(1),
          lastDownloadAt: new Date().toISOString(),
        });
        return true;
      }
    }

    // Verify order in /orders/{orderId}
    const ordRef = doc(db, 'orders', session.orderId);
    const ordSnap = await getDoc(ordRef);
    if (ordSnap.exists()) {
      const ordData = ordSnap.data() as OrderRecord;
      return ordData.status === 'verified';
    }

    return false;
  } catch {
    return false;
  }
}
