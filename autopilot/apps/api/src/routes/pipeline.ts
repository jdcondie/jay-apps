import { Router } from 'express';
import { callClaude } from '../lib/anthropic';
import {
  QUALIFY_SYSTEM, qualifyPrompt,
  MAP_SYSTEM, mapPrompt,
  BLUEPRINT_SYSTEM, blueprintPrompt,
} from '../lib/prompts';

const router = Router();

// POST /api/pipeline/qualify
router.post('/qualify', async (req, res) => {
  const { task, stack } = req.body;
  if (!task) return res.status(400).json({ error: 'task required' });

  try {
    const result = await callClaude(QUALIFY_SYSTEM, qualifyPrompt(task, stack));
    const supabase = (req as any).supabase;
    const user = (req as any).user;
    await supabase.from('usage_events').insert({ user_id: user.id, event_type: 'qualify' });
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/pipeline/map
router.post('/map', async (req, res) => {
  const { task, stack } = req.body;
  if (!task) return res.status(400).json({ error: 'task required' });

  try {
    const result = await callClaude(MAP_SYSTEM, mapPrompt(task, stack));
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/pipeline/blueprint
router.post('/blueprint', async (req, res) => {
  const { task, execMap, stack, skills, overridePrompt } = req.body;
  if (!task || !execMap) return res.status(400).json({ error: 'task and execMap required' });

  try {
    const result = await callClaude(
      BLUEPRINT_SYSTEM,
      blueprintPrompt(task, execMap, stack, skills, overridePrompt),
      3200
    );

    if (overridePrompt) {
      result.architect.system_prompt = overridePrompt;
    } else if (skills?.length) {
      result.architect.system_prompt +=
        '\n\n' + skills.map((s: string, i: number) =>
          `--- SKILL ${i + 1} ---\n${s}`
        ).join('\n\n');
    }

    const supabase = (req as any).supabase;
    const user = (req as any).user;
    await supabase.from('usage_events').insert({ user_id: user.id, event_type: 'blueprint' });

    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
