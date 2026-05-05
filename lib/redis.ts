import { Redis } from '@upstash/redis';

let client: Redis | null = null;

export function getRedis(): Redis {
  if (client) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      'Upstash Redis credentials missing. Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN, or provision Upstash Redis via the Vercel Marketplace.'
    );
  }
  client = new Redis({ url, token });
  return client;
}
