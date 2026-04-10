import { MODE_LABELS } from '../data/strengthData.js';

export function scoreCareerFit(career, userZones, userEnergy, userDominant) {
  let zoneMatch = 0;
  let totalWeight = 0;
  const modes = ["FF", "FT", "QS", "IMP"];
  for (const m of modes) {
    const w = userEnergy[m] / 25;
    totalWeight += w;
    if (career.idealZones[m].includes(userZones[m])) zoneMatch += w;
    else {
      const uz = userZones[m];
      const idealSet = career.idealZones[m];
      if (uz === "accommodate" || idealSet.includes("accommodate")) zoneMatch += w * 0.5;
    }
  }
  const energyFit = Math.round((zoneMatch / totalWeight) * 100);
  const avg = (career.freedom + career.creation + career.income + energyFit) / 4;
  const alignment = Math.round(avg) / 10;
  const fit = alignment >= 8.5 ? 1 : alignment >= 6.5 ? 2 : 3;
  return { energyFit, alignment: Math.min(10, alignment), fit };
}
