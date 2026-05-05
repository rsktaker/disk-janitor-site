import { NextResponse } from 'next/server';
import { getAnthropic, HAIKU_MODEL } from '@/lib/anthropic';

export const runtime = 'nodejs';
export const maxDuration = 60;

type ChatMessage = { role: 'user' | 'assistant'; content: string };

/**
 * Proxy for Ask AI chat. Client sends { system, messages }; we call
 * Anthropic with our key and return the assistant text.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      system?: string;
      messages?: ChatMessage[];
    };
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: 'missing_messages' }, { status: 400 });
    }
    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 600,
      system: body.system,
      messages: body.messages,
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
