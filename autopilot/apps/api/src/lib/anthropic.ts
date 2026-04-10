import Anthropic from '@anthropic-ai/sdk';

export const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export function parseJSON(raw: string): any {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in response');
  return JSON.parse(match[0]);
}

export async function callClaude(
  system: string,
  user: string,
  maxTokens = 2000
): Promise<any> {
  const res = await ai.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
  });
  const text = res.content.map((b: any) => b.text || '').join('');
  return parseJSON(text);
}
