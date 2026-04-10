import type { ExecMap } from '@autopilot/shared';

export interface MapHealthResult {
  score: number;
  errors: string[];
  warnings: string[];
}

const UI_KEYWORDS = [
  'screenshot', 'click', 'mouse', 'drag', 'scroll', 'visual', 'screen',
  'browser automation', 'selenium', 'playwright', 'puppeteer',
];

export function checkMapHealth(map: ExecMap): MapHealthResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!map.input?.trim())   errors.push('Input trigger is empty');
  if (!map.output?.trim())  errors.push('Output deliverable is empty');
  if (!map.failure?.trim()) warnings.push('No failure/fallback defined');

  // Steps
  if (!map.steps?.length) {
    errors.push('No steps defined');
  } else {
    map.steps.forEach((step, i) => {
      if (!step.action?.trim()) errors.push(`Step ${i + 1}: action is empty`);
      if (!step.agent)          errors.push(`Step ${i + 1}: no agent assigned`);

      const text = [step.action, step.note].join(' ').toLowerCase();
      const uiHit = UI_KEYWORDS.find(kw => text.includes(kw));
      if (uiHit) {
        warnings.push(`Step ${i + 1}: UI navigation detected ("${uiHit}") — replace with Python script`);
      }
    });
  }

  // Score: start at 100, deduct per issue
  const deduct = errors.length * 15 + warnings.length * 5;
  const score = Math.max(0, 100 - deduct);

  return { score, errors, warnings };
}
