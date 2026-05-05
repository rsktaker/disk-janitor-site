import { NextResponse } from 'next/server';
import { getAnthropic, HAIKU_MODEL } from '@/lib/anthropic';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Proxy for the summarize prompt. Client sends { prompt: string }; we
 * call Anthropic with our key and return the assistant text. Free for
 * now (no auth) — costs are pennies per scan and gating it would block
 * the "first scan free" funnel that drives the paywall conversion.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json().catch(() => ({}))) as { prompt?: string; max_tokens?: number };
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json({ error: 'missing_prompt' }, { status: 400 });
    }
    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: body.max_tokens ?? 4000,
      messages: [{ role: 'user', content: body.prompt }],
    });
    const text =
      response.content
        .map((block) => (block.type === 'text' ? block.text : ''))
        .join('') ?? '';
    return NextResponse.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    const status = err instanceof Error && err.message.includes('rate') ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
