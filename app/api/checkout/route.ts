import { NextResponse } from 'next/server';
import { getStripe, PRICE_USD_CENTS, SUCCESS_URL, CANCEL_URL } from '@/lib/stripe';

export const runtime = 'nodejs';

/**
 * Creates a Stripe Checkout session for the $5 Disk Janitor license and
 * returns the URL. The Mac app calls this, then opens the URL in the
 * user's browser. After payment, Stripe redirects to /thanks where the
 * license is minted and shown.
 */
export async function POST(): Promise<Response> {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: PRICE_USD_CENTS,
            product_data: {
              name: 'Disk Janitor License',
              description: 'Unlocks unlimited cleanup. One-time purchase, no subscription.',
            },
          },
        },
      ],
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
      allow_promotion_codes: true,
    });
    if (!session.url) {
      return NextResponse.json({ error: 'no_url' }, { status: 500 });
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
