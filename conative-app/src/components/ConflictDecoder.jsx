import { useState } from 'react';
import { S } from '../styles/theme.js';
import { MODE_LABELS, STRENGTH_DATA } from '../data/strengthData.js';
import { useIsMobile } from '../hooks/useIsMobile.js';

const MODES = ['FF', 'FT', 'QS', 'IMP'];
const ZONE_MAP = { I: 'initiate', C: 'counteract', A: 'accommodate' };

const TENSION_DATA = {
  FF: {
    IC: {
      friction: "One of you needs all the data before moving. The other wants the headline and a decision. Every briefing becomes a negotiation about how much research is enough.",
      bridge: "Agree on a research time-box upfront. The Specify person delivers a 3-point summary. Set a decision deadline and honor it."
    },
    IA: {
      friction: "The deep researcher digs past what the situation requires. The translator feels the pressure to keep up. That depth gap shows up most in how you prep for decisions.",
      bridge: "The Specify person anchors on depth, the Explain person sets the translation layer. Split the labor: one researches, one communicates."
    },
    CA: {
      friction: "The simplifier cuts too fast; the translator second-guesses whether they cut enough. Both end up managing depth anxiety instead of making a decision.",
      bridge: "Assign clear lanes. Simplifier owns the executive summary; translator owns the team brief. Don't let them collapse into each other."
    },
  },
  FT: {
    IC: {
      friction: "One of you builds the process. The other routes around it. Every system the builder creates will feel like a cage to the adapter, and every shortcut the adapter takes will feel like sabotage to the builder.",
      bridge: "Builder creates the framework, shortcut finder operates inside it with freedom on the 'how.' Agree on outcomes, not methods. Hold them to the destination, not the steps."
    },
    IA: {
      friction: "The system builder wants sequential clarity; the system keeper wants to adjust as they go. The initiator will feel like the keeper is dragging, the keeper will feel steamrolled.",
      bridge: "Builder sets the initial structure, keeper owns iteration. Frame the system as a first draft. Regular review cycles help both."
    },
    CA: {
      friction: "Neither person instinctively owns structure. The shortcut finder avoids process; the system keeper adjusts but doesn't create. Things fall through gaps neither notices.",
      bridge: "Explicitly assign who owns the system, even if it's temporary. If no one owns structure, both will assume the other is handling it."
    },
  },
  QS: {
    IC: {
      friction: "One wants to reinvent. The other wants to protect what works. Classic innovator-anchor tension. Left unmanaged, the innovator creates chaos, the anchor creates stagnation. Both genuinely believe they're right.",
      bridge: "Name the sacred cows upfront: what won't change. Then give the innovator a defined sandbox where change is encouraged. Protect the core, experiment at the edges."
    },
    IA: {
      friction: "The innovator moves fast, the bridge-builder needs to evaluate risk first. The innovator reads this as resistance; the modifier reads the innovator as reckless. Both slow down the other.",
      bridge: "Innovator pitches ideas in batches, not one at a time. Bridge-builder gives a time-bounded evaluation window. Fast no is better than slow maybe."
    },
    CA: {
      friction: "The anchor resists; the bridge-builder hedges. New ideas face two layers of friction without a clear champion. The team gets stuck in 'let's wait and see' indefinitely.",
      bridge: "Designate a decision owner for change questions. Without one, the default answer is always no. Sometimes that's right. It shouldn't be automatic."
    },
  },
  IMP: {
    IC: {
      friction: "One thinks with their hands and needs to build it to understand it. The other already sees it fully formed in their head. They're working on the same idea and talking past each other completely.",
      bridge: "Abstract thinker narrates what they see in explicit detail. Builder makes a rough version. That's not wasted effort — that's the translation layer. Let the prototype be the shared language."
    },
    IA: {
      friction: "The maker wants to build; the fixer wants to improve what already exists. The builder sees the fixer as incremental; the fixer sees the builder as unnecessarily starting from zero.",
      bridge: "Start with a salvage audit: what's worth keeping before anything gets built. This gives the fixer a role and prevents the builder from reinventing what already works."
    },
    CA: {
      friction: "Abstract thinker wants to stay in the conceptual. Fixer wants to improve what's real. Neither is actively building, and the vision never becomes tangible without someone forcing it.",
      bridge: "Force a concrete artifact early (even a sketch or outline) so the fixer has something to improve. The envisioner narrates, the restorer refines. Assign the first physical output."
    },
  }
};

function getInsight(dim, zA, zB) {
  if (zA === zB) {
    const shared = STRENGTH_DATA[dim][zA];
    return {
      tension: 'low',
      friction: `You share the same ${MODE_LABELS[dim]} wiring. Both of you ${shared.name.toLowerCase()} instinctively. Alignment here is natural. Watch for your combined blind spot: ${shared.shadow.toLowerCase()}`,
      bridge: `Your overlap moves fast in this dimension. Actively seek outside input to catch what you both miss. Two ${shared.name.toLowerCase()} people in the same room will agree and be equally wrong.`
    };
  }
  const key = [zA, zB]
    .map(z => z === 'initiate' ? 'I' : z === 'counteract' ? 'C' : 'A')
    .sort()
    .join('');
  const entry = TENSION_DATA[dim][key] || TENSION_DATA[dim][[...key].reverse().join('')];
  const isHigh = (zA === 'initiate' && zB === 'counteract') || (zA === 'counteract' && zB === 'initiate');
  return { tension: isHigh ? 'high' : 'moderate', ...entry };
}

export default function ConflictDecoder({ results, onBack }) {
  const { zones } = results;
  const isMobile = useIsMobile();
  const myCode = ['FF', 'FT', 'QS', 'IMP'].map(m => zones[m] === 'initiate' ? 'I' : zones[m] === 'counteract' ? 'C' : 'A').join('');
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const decode = () => {
    const clean = input.trim().toUpperCase().replace(/[^ICA]/g, '');
    if (clean.length !== 4) {
      setError('Enter a 4-character code using I, C, and A only (e.g. ICAI)');
      return;
    }
    setError('');
    const theirZones = { FF: ZONE_MAP[clean[0]], FT: ZONE_MAP[clean[1]], QS: ZONE_MAP[clean[2]], IMP: ZONE_MAP[clean[3]] };
    const insights = MODES.map(m => ({ dim: m, yourZone: zones[m], theirZone: theirZones[m], ...getInsight(m, zones[m], theirZones[m]) }));
    const highCount = insights.filter(i => i.tension === 'high').length;
    const overallTension = highCount >= 2 ? 'high' : insights.some(i => i.tension !== 'low') ? 'moderate' : 'low';
    setAnalysis({ theirMo: clean, theirZones, insights, overallTension });
  };

  const tColor = t => t === 'high' ? '#8b1a1a' : t === 'moderate' ? '#5a5040' : '#1a3a2a';
  const tText = t => t === 'high' ? '#e05555' : t === 'moderate' ? '#a09070' : '#55b88a';
  const tLabel = t => t === 'high' ? 'FRICTION' : t === 'moderate' ? 'MODERATE' : 'ALIGNED';

  return (
    <div style={{ minHeight: '100vh', background: S.black }}>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #1a1a1a' }}>
        <button onClick={onBack} style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.1em', background: 'transparent', border: '1px solid #2a2a2a', color: S.mid, padding: '10px 14px', cursor: 'pointer' }}>← DASHBOARD</button>
        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.2em', color: S.onDarkDim }}>CONFLICT DECODER</div>
      </div>

      {/* Header + Input */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: isMobile ? '32px 16px 24px' : '48px 24px 32px' }}>
        <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.3em', color: S.onDarkDim, marginBottom: 16 }}>CONFLICT DECODER</div>
        <h2 style={{ fontFamily: S.bebas, fontSize: 'clamp(36px, 8vw, 64px)', color: S.white, margin: '0 0 16px', lineHeight: 0.9 }}>DECODE THE<br/>FRICTION</h2>
        <p style={{ fontFamily: S.cormorant, fontSize: 16, color: S.white, fontStyle: 'italic', margin: '0 0 40px' }}>
          Enter another person's MO code to see exactly where you'll click and where you'll clash.
        </p>

        <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.15em', color: S.onDarkDim, marginBottom: 8 }}>YOUR CODE: {myCode}</div>
        <div style={{ display: 'flex' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && decode()}
            placeholder="THEIR CODE"
            maxLength={4}
            style={{ flex: 1, background: '#0f0f0f', border: '1px solid #2a2a2a', borderRight: 'none', color: S.white, fontFamily: S.bebas, fontSize: 32, padding: '12px 16px', outline: 'none', letterSpacing: '0.1em' }}
          />
          <button onClick={decode} style={{ fontFamily: S.bebas, fontSize: 16, letterSpacing: '0.08em', background: S.white, color: S.black, border: 'none', padding: '0 28px', cursor: 'pointer', flexShrink: 0 }}>DECODE</button>
        </div>
        {error && <div style={{ fontFamily: S.mono, fontSize: 10, color: '#e05555', letterSpacing: '0.08em', marginTop: 8 }}>{error}</div>}
        <div style={{ fontFamily: S.mono, fontSize: 9, color: '#2a2a2a', marginTop: 10, letterSpacing: '0.1em' }}>I = INITIATE · C = COUNTERACT · A = ACCOMMODATE</div>
      </div>

      {/* Analysis */}
      {analysis && (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: isMobile ? '0 16px 48px' : '0 24px 64px' }}>

          {/* Overall */}
          <div style={{ border: '1px solid #1a1a1a', padding: '24px 28px', marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: tColor(analysis.overallTension) + '22' }}>
            <div>
              <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.15em', color: S.onDarkDim, marginBottom: 8 }}>PAIRING</div>
              <div style={{ fontFamily: S.bebas, fontSize: 36, color: S.white, letterSpacing: 3 }}>{myCode} + {analysis.theirMo}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.15em', color: S.onDarkDim, marginBottom: 8 }}>OVERALL</div>
              <div style={{ fontFamily: S.bebas, fontSize: 22, color: tText(analysis.overallTension), letterSpacing: 2 }}>{tLabel(analysis.overallTension)}</div>
            </div>
          </div>

          {/* Per dimension */}
          {analysis.insights.map(ins => (
            <div key={ins.dim} style={{ borderTop: '1px solid #1a1a1a', padding: '28px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.15em', color: S.onDarkDim, marginBottom: 6 }}>{MODE_LABELS[ins.dim].toUpperCase()}</div>
                  <div style={{ fontFamily: S.bebas, fontSize: 20, color: S.white, letterSpacing: '0.04em' }}>
                    {STRENGTH_DATA[ins.dim][ins.yourZone].name} vs. {STRENGTH_DATA[ins.dim][ins.theirZone].name}
                  </div>
                </div>
                <div style={{ fontFamily: S.mono, fontSize: 9, color: tText(ins.tension), letterSpacing: '0.1em', flexShrink: 0, paddingTop: 22 }}>{tLabel(ins.tension)}</div>
              </div>
              <div style={{ fontFamily: S.cormorant, fontSize: 15, color: S.white, lineHeight: 1.75, marginBottom: 16 }}>{ins.friction}</div>
              <div style={{ background: '#0c0c0c', padding: '16px 18px', borderLeft: '2px solid #2a2a2a' }}>
                <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.15em', color: S.onDarkDim, marginBottom: 6 }}>BRIDGE</div>
                <div style={{ fontFamily: S.cormorant, fontSize: 14, color: S.white, lineHeight: 1.7 }}>{ins.bridge}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
