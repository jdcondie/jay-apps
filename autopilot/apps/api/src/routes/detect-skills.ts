import { Router } from 'express';
import { callClaude } from '../lib/anthropic';
import { detectSkillsPrompt } from '../lib/prompts';

const router = Router();

// POST /api/detect-skills
router.post('/', async (req, res) => {
  const { task, summary, skills } = req.body;
  if (!task || !skills?.length) {
    return res.json({ matches: [] });
  }

  try {
    const result = await callClaude(
      'You are a skill relevance classifier. Return only a JSON object, no markdown, no backticks.',
      detectSkillsPrompt(task, summary || '', skills)
    );

    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
