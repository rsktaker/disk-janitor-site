import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { issueLicenseForSession } from '@/lib/license';

export const runtime = 'nodejs';

/**
 * Issue-on-demand: given a Stripe Checkout session ID (from the success
 * redirect URL), verify with Stripe that it's paid, then mint a license
 * (or return the existing one) and return it. Idempotent — calling
 * twice returns the same license.
 *
 * Called by /thanks page after Stripe redirect.
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ sessionId: string }> }
): Promise<Response> {
  const { sessionId } = await context.params;
  if (!sessionId) {
    return NextResponse.json({ error: 'missing_session_id' }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'not_paid', payment_status: session.payment_status },
        { status: 402 }
      );
    }
    const customerEmail =
      session.customer_details?.email ?? session.customer_email ?? null;
    const license = await issueLicenseForSession(sessionId, customerEmail);
    return NextResponse.json({
      key: license.key,
      email: license.customerEmail,
      created_at: license.createdAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
