import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { EXPAND_SYSTEM, expandPrompt } from '../lib/prompts';

const router = Router();
const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/expand
router.post('/', async (req, res) => {
  const { stub, task, replaces, stack, execMap } = req.body;
  if (!stub || !task || !replaces) {
    return res.status(400).json({ error: 'stub, task, and replaces required' });
  }

  try {
    const response = await ai.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: EXPAND_SYSTEM,
      messages: [{ role: 'user', content: expandPrompt(stub, task, replaces, stack, execMap) }],
    });

    const code = response.content
      .map(b => (b as any).text || '')
      .join('')
      .trim();

    const supabase = (req as any).supabase;
    const user = (req as any).user;
    await supabase.from('usage_events').insert({ user_id: user.id, event_type: 'expand' });

    res.json({ code });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
