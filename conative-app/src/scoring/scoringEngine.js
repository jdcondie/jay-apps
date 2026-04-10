import { QUESTIONS } from '../data/questions.js';
import { STRENGTH_DATA } from '../data/strengthData.js';

export function scoreAssessment(responses) {
  const rawScores = { FF: 0, FT: 0, QS: 0, IMP: 0 };
  for (const q of QUESTIONS) {
    const r = responses[q.id];
    if (!r) continue;
    const mostMode = q.options.find(o => o.id === r.most)?.mode;
    const leastMode = q.options.find(o => o.id === r.least)?.mode;
    if (mostMode) rawScores[mostMode] += 2;
    if (leastMode) rawScores[leastMode] -= 2;
  }
  const DIVISOR = 12;
  const normalized = {};
  for (const [m, raw] of Object.entries(rawScores)) {
    normalized[m] = Math.max(1, Math.min(10, Math.round(5.5 + raw / DIVISOR)));
  }
  const devs = {};
  let totalDev = 0;
  for (const [m, s] of Object.entries(normalized)) { devs[m] = Math.abs(s - 5.5); totalDev += devs[m]; }
  const energy = {};
  if (totalDev === 0) { for (const m of Object.keys(normalized)) energy[m] = 25; }
  else {
    const floored = [];
    for (const [m, d] of Object.entries(devs)) {
      let p = (d / totalDev) * 100;
      if (p < 5) { p = 5; floored.push(m); }
      energy[m] = p;
    }
    const nonF = Object.keys(energy).filter(m => !floored.includes(m));
    const nonFTotal = nonF.reduce((s, m) => s + energy[m], 0);
    if (nonFTotal > 0) {
      const adj = (100 - floored.length * 5) / nonFTotal;
      for (const m of nonF) energy[m] = Math.round(energy[m] * adj);
    }
    for (const m of floored) energy[m] = 5;
    const tot = Object.values(energy).reduce((a, b) => a + b, 0);
    if (tot !== 100) { const mx = Object.entries(energy).sort((a, b) => b[1] - a[1])[0][0]; energy[mx] += 100 - tot; }
  }
  const zones = {}, strengths = {};
  for (const [m, s] of Object.entries(normalized)) {
    zones[m] = s <= 3 ? "counteract" : s <= 6 ? "accommodate" : "initiate";
    strengths[m] = STRENGTH_DATA[m][zones[m]];
  }
  const sorted = Object.entries(energy).sort((a, b) => b[1] - a[1]);
  return { rawScores, scores: normalized, energy, zones, strengths, dominant: sorted[0][0], resistance: sorted[sorted.length - 1][0], mo: `${normalized.FF}-${normalized.FT}-${normalized.QS}-${normalized.IMP}` };
}
