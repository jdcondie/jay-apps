// Career fit scored almost entirely from the user's report findings.
// Components (all 0-100):
//   energyFit   — zone alignment, weighted by where the user actually spends energy
//   strengthFit — do the modes this career rewards being HIGH match the user's genuine strengths
//   dominantFit — does the career reward the user's top engine
//   drain       — penalty when the career demands the user's weakest mode run high
// desirability (freedom/creation/income) is career-intrinsic and identical for
// everyone, so it's kept only as a light 12% tiebreaker.

const MODES = ["FF", "FT", "QS", "IMP"];

export function scoreCareerFit(career, userZones, userEnergy, userDominant, userResistance) {
  // 1) ENERGY FIT — zone match weighted by energy (high-energy modes matter more)
  let zoneMatch = 0, totalWeight = 0;
  for (const m of MODES) {
    const w = userEnergy[m] / 25;
    totalWeight += w;
    const ideal = career.idealZones[m];
    if (ideal.includes(userZones[m])) zoneMatch += w;
    else if (userZones[m] === "accommodate" || ideal.includes("accommodate")) zoneMatch += w * 0.5;
  }
  const energyFit = Math.round((zoneMatch / totalWeight) * 100);

  // 2) STRENGTH FIT — the modes the career needs maxed vs the user's real strengths
  const demandModes = MODES.filter(m => career.idealZones[m].includes("initiate"));
  let strengthFit;
  if (demandModes.length === 0) {
    strengthFit = 70; // career doesn't require any mode maxed — neutral-positive
  } else {
    let s = 0;
    for (const m of demandModes) {
      if (userZones[m] === "initiate") s += 1;
      else if (userZones[m] === "accommodate") s += 0.5;
      // counteract scores 0: career wants this high, the user runs low on it
    }
    strengthFit = Math.round((s / demandModes.length) * 100);
  }

  // 3) DOMINANT ALIGNMENT — does the career reward the user's top engine?
  const domIdeal = career.idealZones[userDominant];
  const dominantFit = domIdeal.includes("initiate") ? 100 : domIdeal.includes("accommodate") ? 55 : 15;

  // 4) DRAIN PENALTY — career demands the user's weakest mode run high
  let drain = 0;
  if (userResistance && career.idealZones[userResistance].includes("initiate") && userZones[userResistance] !== "initiate") {
    drain = 18;
  }

  // career-intrinsic desirability — light tiebreaker only
  const desirability = (career.freedom + career.creation + career.income) / 3;

  let personal = energyFit * 0.40 + strengthFit * 0.30 + dominantFit * 0.18 + desirability * 0.12 - drain;
  personal = Math.max(0, Math.min(100, personal));

  const alignment = Math.round(personal) / 10; // 0-10
  const fit = alignment >= 7.5 ? 1 : alignment >= 5.5 ? 2 : 3;

  return { energyFit, strengthFit, dominantFit, alignment, fit };
}
