import { PrismaClient, User } from '@prisma/client';

let prisma: PrismaClient;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export interface NDPAComplianceResult {
  allowed: boolean;
  message?: string;
  user?: User | null;
}

// Check if user has given NDPA consent before allowing data storage
export async function checkNDPAConsent(userId: string): Promise<NDPAComplianceResult> {
  try {
    const user = await getPrisma().user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        allowed: false,
        message: 'User not found. Please register first.'
      };
    }

    if (!user.consent_given) {
      return {
        allowed: false,
        message: 'Under Nigeria\'s Data Protection Act 2023, we need your consent before storing your information.',
        user
      };
    }

    return {
      allowed: true,
      user
    };
  } catch (error) {
    console.error('NDPA consent check error:', error);
    return {
      allowed: false,
      message: 'System error. Please try again or contact support.'
    };
  }
}

// Middleware to block DB writes without consent
export async function requireNDPAConsent(userId: string): Promise<void> {
  const result = await checkNDPAConsent(userId);  
  if (!result.allowed) {
    throw new Error(`NDPA Consent Required: ${result.message}`);
  }
}

// Log consent timestamp (AGENTS.md Section 14 checklist)
export async function recordConsent(userId: string): Promise<void> {
  await getPrisma().user.update({
    where: { id: userId },
    data: { 
      consent_given: true,
      last_active: new Date() // Update last active on consent
    }
  });
}

// NDPA Compliance Checklist Verification (AGENTS.md Section 14)
export const NDPA_CHECKLIST = {
  CONSENT_CAPTURED: 'consent_given = true before any user data is written',
  DATA_MINIMIZATION: 'Only data necessary for the service is collected',
  NO_DATA_SHARING: 'No user\'s personal data is ever surfaced to another user',
  NO_PAYMENT_LOGGING: 'Payment details and ID numbers are never stored in conversation logs',
  DATA_REQUEST_HANDLER: 'A data request handler exists (view / correct / delete user data)',
  DATA_CONTACT_DOCUMENTED: 'Designated data contact is documented: Princess Ngozi Chinedu via WhatsApp (+23481058478551)',
  NDPC_REGISTRATION: 'If >1,000 data subjects are processed annually → register with NDPC as a data controller'
};

// Verify no card data in interaction logs (AGENTS.md Section 14)
export function sanitizeInteractionLog(message: string, response: string): { message: string; response: string } {
  // Remove potential card numbers (16 digits), CVV (3 digits), expiry dates
  const cardNumberRegex = /\b\d{16}\b/g;
  const cvvRegex = /\b\d{3}\b/g;
  const expiryRegex = /\b(0[1-9]|1[0-2])\/\d{2}\b/g;

  return {
    message: message
      .replace(cardNumberRegex, '[REDACTED]')
      .replace(cvvRegex, '[REDACTED]')
      .replace(expiryRegex, '[REDACTED]'),
    response: response
      .replace(cardNumberRegex, '[REDACTED]')
      .replace(cvvRegex, '[REDACTED]')
      .replace(expiryRegex, '[REDACTED]')
  };
}
