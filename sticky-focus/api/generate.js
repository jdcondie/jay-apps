export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { goal } = req.body || {}
  if (!goal || typeof goal !== 'string' || !goal.trim())
    return res.status(400).json({ error: 'Goal is required' })
  if (goal.length > 500)
    return res.status(400).json({ error: 'Goal too long' })

  const prompt = `You are a productivity coach helping someone with ADHD.
Break this goal into clear, small, concrete tasks with sequential subtasks.
Each subtask must be ONE atomic action doable in under 20 minutes.
Use plain, encouraging language. No jargon.

Goal: "${goal.trim()}"

Respond ONLY with valid JSON, no markdown fences:
{
  "why": "One motivating sentence — why completing this goal matters right now.",
  "tasks": [
    {
      "title": "Task title (priority order, most important first)",
      "subtasks": [{ "text": "One clear action", "minutes": 10 }]
    }
  ]
}

Rules:
- 3–5 tasks ordered by priority
- 2–5 subtasks per task ordered sequentially
- minutes must be 5–20 (ADHD-friendly chunks)
- why must feel personal and motivating, not generic`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Anthropic error:', err)
      return res.status(500).json({ error: 'AI generation failed' })
    }

    const data   = await response.json()
    const raw    = data.content.find(b => b.type === 'text')?.text || ''
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
    return res.status(200).json(parsed)

  } catch (err) {
    console.error('Generate error:', err)
    return res.status(500).json({ error: 'Something went wrong' })
  }
}
