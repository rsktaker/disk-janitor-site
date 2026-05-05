import { NextResponse } from 'next/server';
import { lookupLicense } from '@/lib/license';

export const runtime = 'nodejs';

/**
 * App calls this with the license key it has stored in Keychain to
 * confirm it's still valid. Returns { valid: true } or { valid: false }.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json().catch(() => ({}))) as { key?: string };
    const key = body.key;
    if (!key || typeof key !== 'string') {
      return NextResponse.json({ valid: false, reason: 'missing_key' });
    }
    const record = await lookupLicense(key);
    if (!record) {
      return NextResponse.json({ valid: false, reason: 'unknown_key' });
    }
    return NextResponse.json({
      valid: true,
      created_at: record.createdAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ valid: false, reason: message }, { status: 500 });
  }
}
