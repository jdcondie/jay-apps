import { S } from '../styles/theme.js';

// One-liner per dimension × zone. Zone = counteract | accommodate | initiate.
export const BEHAVIORAL_LINES = {
  FF: {
    counteract: "You pull signal from noise. You read the situation, skip the detail, and act on what matters.",
    accommodate: "You balance depth with speed. You know when to dig deeper and when you already have enough.",
    initiate:   "You go deep before you move. You need the full picture, and you build it fast.",
  },
  FT: {
    counteract: "You create your own structure. Imposed systems feel like cages.",
    accommodate: "You adapt structure to the situation. You can work inside a system or build around it.",
    initiate:   "You create order wherever you go. Undefined processes drain your energy fast.",
  },
  QS: {
    counteract: "You need stable ground. Constant change fragments your focus and output.",
    accommodate: "You handle change in doses. Total chaos and rigid routine both wear you out.",
    initiate:   "You need new inputs to stay sharp. Routine is a slow drain on your output.",
  },
  IMP: {
    counteract: "You think in frameworks and concepts. Execution needs a partner or a hard deadline.",
    accommodate: "You move between thinking and making. You plan enough, then build.",
    initiate:   "You need to make things. Abstract-only work stalls your momentum fast.",
  },
};

export const SPECTRUM_PAIRS = {
  FF:  { low: 'Simplify',  high: 'Specify',     label: 'INFORMATION' },
  FT:  { low: 'Adapt',     high: 'Systematize', label: 'ORGANIZATION' },
  QS:  { low: 'Stabilize', high: 'Innovate',    label: 'CHANGE' },
  IMP: { low: 'Envision',  high: 'Build',       label: 'EXECUTION' },
};

/**
 * SpectrumBar — displays a dimension as a spectrum position.
 * Props:
 *   mode    — 'FF' | 'FT' | 'QS' | 'IMP'
 *   score   — internal 1-10 score (used only for dot position)
 *   energy  — energy % (shown to user)
 *   name    — strength name (e.g. "The Translator")
 *   dark    — bool, inverts colors for dark backgrounds
 *   compact — bool, reduces vertical spacing (for hero/dashboard)
 */
export default function SpectrumBar({ mode, score, energy: eng, name, dark = false, compact = false }) {
  const pair = SPECTRUM_PAIRS[mode];
  const pct = Math.round(((score - 1) / 9) * 100);

  const fg     = dark ? S.white : S.black;
  const fgLine = dark ? '#2a2a2a' : '#d0d0d0';
  const fgDim  = dark ? '#444' : '#aaa';

  return (
    <div style={{ marginBottom: compact ? 20 : 28 }}>
      {/* Mode label */}
      <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.25em', color: fgDim, marginBottom: compact ? 8 : 10 }}>
        {pair.label}
      </div>

      {/* Track + dot */}
      <div style={{ position: 'relative', height: compact ? 16 : 20, marginBottom: 4 }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: fgLine, transform: 'translateY(-50%)' }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: `${pct}%`,
          width: 12, height: 12, borderRadius: '50%',
          background: fg,
          transform: 'translate(-50%, -50%)',
          flexShrink: 0,
        }} />
      </div>

      {/* Endpoint labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: compact ? 6 : 8 }}>
        <span style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.08em', color: fgDim }}>{pair.low.toUpperCase()}</span>
        <span style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.08em', color: fgDim }}>{pair.high.toUpperCase()}</span>
      </div>

      {/* Strength name + energy */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: S.bebas, fontSize: compact ? 18 : 22, color: fg, letterSpacing: '0.03em', lineHeight: 1 }}>{name}</span>
        <span style={{ fontFamily: S.bebas, fontSize: compact ? 16 : 20, color: fgDim }}>{eng}%</span>
      </div>
    </div>
  );
}
