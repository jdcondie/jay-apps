import { Router } from 'express';
import { callClaude } from '../lib/anthropic';
import { scannerPrompt } from '../lib/prompts';

const router = Router();

// POST /api/scanner
router.post('/', async (req, res) => {
  const { tasks } = req.body;
  if (!tasks) return res.status(400).json({ error: 'tasks required' });

  try {
    const result = await callClaude(
      'You are an automation prioritization analyst. Return only a JSON object, no markdown, no backticks.',
      scannerPrompt(tasks)
    );

    const supabase = (req as any).supabase;
    const user = (req as any).user;
    await supabase.from('usage_events').insert({ user_id: user.id, event_type: 'scan' });

    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
