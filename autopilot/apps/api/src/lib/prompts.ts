export const QUALIFY_SYSTEM = `You are an automation qualification analyst. Return only a JSON object, no markdown, no backticks.`;

export function qualifyPrompt(task: string, stack?: string) {
  return `Analyze this task for automation potential: "${task}"
${stack ? `Client software stack: ${stack}` : ''}

Run phases 1 and 2 of the Universal Automation Protocol:
1. QUALIFY — Is it repeatable with writeable decision rules?
2. FILTER — Volume (10+/month), Value ($50+/run), Rules (logic in plain language)?

Return ONLY:
{
  "task_title": "short title",
  "task_summary": "one sentence",
  "qualify": {"score":0-100,"verdict":"PASS or FAIL","assessment":"2 sentences","gates":{"repeatable":true/false,"rules_based":true/false}},
  "filter": {"score":0-100,"verdict":"PASS or FAIL","assessment":"2 sentences","gates":{"volume":true/false,"value":true/false,"rules":true/false}},
  "overall_verdict": "BUILD or SKIP or MODIFY",
  "verdict_reason": "one sentence"
}`;
}

export const MAP_SYSTEM = `You are an automation systems architect. Return only a JSON object, no markdown, no backticks.`;

export function mapPrompt(task: string, stack?: string) {
  return `Draft an execution map for: "${task}"
${stack ? `Client software stack: ${stack}. Tailor all steps to this stack.` : ''}

Return ONLY:
{
  "input": "specific trigger",
  "steps": [{"order":1,"action":"specific action","agent":"OpenClaw or Claude or Python script","note":"brief or null"}],
  "output": "specific deliverable",
  "failure": "failure point and fallback"
}`;
}

export const BLUEPRINT_SYSTEM = `You are an OpenClaw automation architect. Return only a JSON object, no markdown, no backticks.`;

export function blueprintPrompt(
  task: string,
  execMap: object,
  stack?: string,
  skills?: string[],
  overridePrompt?: string
) {
  const skillBlock = skills?.length
    ? `\n\nACTIVE SKILLS — embed these in the system prompt:\n${skills.join('\n\n')}\n`
    : '';

  return `Full deployment blueprint.
Task: "${task}"
${stack ? `Stack: ${stack}` : ''}
Confirmed execution map: ${JSON.stringify(execMap)}
${overridePrompt ? `Use this exact system prompt for Claude sub-agent:\n${overridePrompt}\n` : ''}
${skillBlock}

Architecture:
- OpenClaw = orchestrator (local, holds project memory and file access)
- Claude = sub-agent (receives instructions, processes code, reports back — does NOT manage flow)
- Python scripts replace all screenshot-based UI navigation
- Scripts hook into client software via API
${skills?.length ? `IMPORTANT: system_prompt must instruct Claude to follow the active skill methodologies.` : ''}

Return ONLY:
{
  "architect": {
    "score": 0-100,
    "assessment": "2-3 sentences",
    "openclaw_role": "string",
    "claude_role": "string",
    "subagents": [{"name":"string","owns":"string"}],
    "system_prompt": "${overridePrompt ? '<USE_INJECTED_PROMPT>' : 'Full OpenClaw system prompt starting: You are acting as the specialized AI assistant within the OpenClaw framework...'}"
  },
  "replace": {
    "score": 0-100,
    "assessment": "2 sentences",
    "scripts": [{"name":"filename.py","replaces":"UI action","stub":"8-12 line Python stub${stack ? ` using ${stack}` : ''}"}]
  },
  "optimize": {
    "score": 0-100,
    "assessment": "2 sentences",
    "log_targets": ["item1","item2","item3"],
    "first_fix": "most likely first bottleneck"
  },
  "overall_score": 0-100,
  "decisive_variable": "single most important unlock"
}`;
}

export const EXPAND_SYSTEM = `You are a Python automation engineer. Write complete, production-ready Python scripts. Return only Python code, no markdown fences, no explanation.`;

export function expandPrompt(
  stub: string,
  task: string,
  replaces: string,
  stack?: string,
  execMap?: object
) {
  return `Expand this Python stub into a complete, production-ready script.

Task: ${task}
${stack ? `Target software stack: ${stack}` : ''}
Script purpose: ${replaces}
Execution map context: ${JSON.stringify(execMap || {})}

Stub:
${stub}

Requirements:
- Full error handling with try/except
- Logging with timestamps
- Real API calls for ${stack || 'the relevant software'}
- Retry logic with exponential backoff on failure
- Clear comments on each section
- Main guard and CLI args if appropriate
- Return meaningful status/result

Write complete Python only.`;
}

export function detectSkillsPrompt(
  task: string,
  summary: string,
  skills: Array<{ name: string; trigger_phrase?: string; description?: string }>
) {
  return `Task: "${task}"
Summary: "${summary}"

Available skills:
${skills.map((s, i) => `${i}. name="${s.name}" trigger="${s.trigger_phrase || ''}" description="${s.description?.slice(0, 120) || ''}"`).join('\n')}

Return ONLY:
{"matches":[{"skill_index":0,"relevance":"HIGH or MEDIUM","reason":"one sentence why this skill applies"}]}
Only include HIGH or MEDIUM relevance. Empty array if none match.`;
}

export function scannerPrompt(tasks: string) {
  return `Analyze these tasks and rank by automation potential:

${tasks}

For each task:
- automation_score (0-100)
- value_score (0-100)
- effort_score (0-100, higher = harder to build)
- priority_score = automation_score * 0.4 + value_score * 0.4 + (100 - effort_score) * 0.2

Return ONLY:
{
  "tasks": [{"task":"name","automation_score":0-100,"value_score":0-100,"effort_score":0-100,"priority_score":0-100,"verdict":"BUILD or SKIP or MODIFY","reason":"one sentence","quick_win":true/false}],
  "top_pick": "task name",
  "top_pick_reason": "one sentence"
}
Sort tasks array by priority_score descending.`;
}

export function intakePrompt(bizType: string, tools: string, painPoints: string, freq: string) {
  return `Generate an automation task list for this client.
Business type: ${bizType || 'not specified'}
Current tools: ${tools || 'not specified'}
Pain points: ${painPoints || 'not specified'}
Frequency: ${freq || 'not specified'}

Identify 5-8 specific automatable tasks. For each assess automation potential.
Return ONLY:
{
  "client_summary": "2 sentence client profile",
  "tasks": [{"task":"specific task","rationale":"why this client has this","automation_score":0-100,"value_score":0-100,"quick_win":true/false}],
  "recommended_stack": "what tools to build with",
  "top_task": "highest priority task name"
}
Sort tasks by automation_score descending.`;
}
