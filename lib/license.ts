import { getRedis } from './redis';
import { randomBytes } from 'crypto';

/**
 * License keys are 24 hex chars prefixed with "DJ-" for visual identity.
 * Format: "DJ-XXXXXXXX-XXXXXXXX-XXXXXXXX". Easy to copy/paste, hard to guess.
 */
function generateLicenseKey(): string {
  const raw = randomBytes(12).toString('hex').toUpperCase();
  return `DJ-${raw.slice(0, 8)}-${raw.slice(8, 16)}-${raw.slice(16, 24)}`;
}

export type LicenseRecord = {
  key: string;
  stripeSessionId: string;
  customerEmail: string | null;
  createdAt: number; // ms epoch
};

const LICENSE_PREFIX = 'license:';
const SESSION_TO_LICENSE_PREFIX = 'sess2lic:';

/**
 * Idempotent: if a license already exists for this Stripe session, return it.
 * Otherwise mint a new one, store it, and store the session→license mapping.
 */
export async function issueLicenseForSession(
  stripeSessionId: string,
  customerEmail: string | null
): Promise<LicenseRecord> {
  const redis = getRedis();

  // Idempotency check
  const existingKey = await redis.get<string>(`${SESSION_TO_LICENSE_PREFIX}${stripeSessionId}`);
  if (existingKey) {
    const record = await redis.get<LicenseRecord>(`${LICENSE_PREFIX}${existingKey}`);
    if (record) return record;
  }

  const key = generateLicenseKey();
  const record: LicenseRecord = {
    key,
    stripeSessionId,
    customerEmail,
    createdAt: Date.now(),
  };
  await Promise.all([
    redis.set(`${LICENSE_PREFIX}${key}`, record),
    redis.set(`${SESSION_TO_LICENSE_PREFIX}${stripeSessionId}`, key),
  ]);
  return record;
}

export async function lookupLicense(key: string): Promise<LicenseRecord | null> {
  if (!key || typeof key !== 'string') return null;
  const normalized = key.trim().toUpperCase();
  if (!normalized.startsWith('DJ-')) return null;
  const redis = getRedis();
  return await redis.get<LicenseRecord>(`${LICENSE_PREFIX}${normalized}`);
}
