import { Router } from 'express';
import { callClaude } from '../lib/anthropic';
import { intakePrompt } from '../lib/prompts';

const router = Router();

// POST /api/intake
router.post('/', async (req, res) => {
  const { bizType, tools, painPoints, freq } = req.body;

  try {
    const result = await callClaude(
      'You are a business automation consultant. Return only a JSON object, no markdown, no backticks.',
      intakePrompt(bizType || '', tools || '', painPoints || '', freq || '')
    );

    const supabase = (req as any).supabase;
    const user = (req as any).user;
    await supabase.from('usage_events').insert({ user_id: user.id, event_type: 'intake' });

    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
