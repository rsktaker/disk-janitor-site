import Stripe from 'stripe';

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY missing.');
  }
  client = new Stripe(key);
  return client;
}

export const PRICE_USD_CENTS = 199;
export const SUCCESS_URL = 'https://diskjanitor.com/thanks?session_id={CHECKOUT_SESSION_ID}';
export const CANCEL_URL = 'https://diskjanitor.com/?cancelled=1';
