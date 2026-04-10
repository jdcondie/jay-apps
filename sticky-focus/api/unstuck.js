export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { step, goal } = req.body || {}
  if (!step || !goal) return res.status(400).json({ error: 'step and goal are required' })

  const prompt = `Someone with ADHD is completely stuck on this task step:
"${step}"

They are working toward this goal: "${goal}"

Give exactly 3 ultra-specific micro-actions that would IMMEDIATELY unstick them.
Each action must:
- Take under 2 minutes
- Be completely concrete (no "think about" or "consider")
- Start with a verb
- Assume they have zero momentum right now

Respond ONLY with valid JSON:
{"actions":["action1","action2","action3"]}`

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
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data   = await response.json()
    const raw    = data.content.find(b => b.type === 'text')?.text || ''
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
    return res.status(200).json(parsed)

  } catch (err) {
    return res.status(200).json({
      actions: [
        'Open a blank document and write the first word that comes to mind about this task',
        'Set a 2-minute timer and do only the very first physical action',
        'Read the task out loud and write down exactly what is blocking you',
      ]
    })
  }
}
