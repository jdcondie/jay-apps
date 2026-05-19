import { S } from '../styles/theme.js';
import { MODE_LABELS } from '../data/strengthData.js';
import { supabase } from '../lib/supabase.js';
import SpectrumBar, { BEHAVIORAL_LINES } from './SpectrumBar.jsx';
import { DOMINANT_NARRATIVES, RESISTANCE_NARRATIVES } from '../data/strengthData.js';
import { useIsMobile } from '../hooks/useIsMobile.js';

export default function Dashboard({ results, user, onViewReport, onRetake, onTool }) {
  const { mo, scores, energy, zones, strengths, dominant, resistance } = results;
  const modes = ['FF', 'FT', 'QS', 'IMP'];

  const isMobile = useIsMobile();
  const topTwo = [...modes].sort((a, b) => energy[b] - energy[a]).slice(0, 2);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ minHeight: '100vh', background: S.white, display: 'flex', flexDirection: 'column' }}>

      {/* Top nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: `1px solid ${S.rule}` }}>
        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.2em', color: S.mid }}>
          PERSONAL OPERATING MANUAL
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {!isMobile && <span style={{ fontFamily: S.mono, fontSize: 10, color: S.mid, letterSpacing: '0.1em' }}>{user?.email}</span>}
          <button onClick={handleSignOut} style={{
            fontFamily: S.mono, fontSize: 10, letterSpacing: '0.1em', background: 'transparent',
            border: `1px solid ${S.rule}`, color: S.mid, padding: '10px 14px', cursor: 'pointer'
          }}>SIGN OUT</button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 600, margin: '0 auto', width: '100%', padding: '48px 24px 40px', borderBottom: `1px solid ${S.rule}` }}>

        <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.3em', color: S.mid, marginBottom: 12 }}>YOUR BRAIN RUNS ON</div>
        <div style={{ fontFamily: S.bebas, fontSize: 'clamp(40px, 8vw, 64px)', color: S.black, lineHeight: 0.9, marginBottom: 16 }}>{MODE_LABELS[dominant].toUpperCase()}</div>
        <p style={{ fontFamily: S.cormorant, fontSize: 16, lineHeight: 1.7, color: '#333', maxWidth: 480, marginBottom: 0 }}>{DOMINANT_NARRATIVES[dominant].how}</p>

        <div style={{ height: 1, background: S.rule, margin: '28px 0' }} />

        {modes.map(m => (
          <div key={m} style={{ display: 'flex', gap: 16, padding: '11px 0', borderBottom: `1px solid ${S.rule}`, alignItems: 'flex-start' }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.18em', color: S.mid, width: 84, flexShrink: 0, paddingTop: 2 }}>{MODE_LABELS[m].toUpperCase()}</div>
            <div style={{ fontFamily: S.cormorant, fontSize: 15, lineHeight: 1.6, color: '#333' }}>{BEHAVIORAL_LINES[m][zones[m]]}</div>
          </div>
        ))}

        <div style={{ height: 1, background: S.rule, margin: '24px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.2em', color: S.mid, marginBottom: 8 }}>STRONGEST SIGNAL</div>
            <div style={{ fontFamily: S.bebas, fontSize: 22, color: S.black }}>{MODE_LABELS[dominant]}</div>
            <div style={{ fontFamily: S.cormorant, fontSize: 13, fontStyle: 'italic', color: '#555', marginTop: 3 }}>{strengths[dominant].name}</div>
          </div>
          <div>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.2em', color: S.mid, marginBottom: 8 }}>BIGGEST FRICTION</div>
            <div style={{ fontFamily: S.bebas, fontSize: 22, color: S.black }}>{MODE_LABELS[resistance]}</div>
            <div style={{ fontFamily: S.cormorant, fontSize: 13, fontStyle: 'italic', color: '#555', marginTop: 3 }}>{strengths[resistance].name}</div>
          </div>
        </div>

      </div>

      {/* Top strengths */}
      <div style={{ maxWidth: 600, margin: '0 auto', width: '100%', padding: '32px 24px' }}>
        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.2em', color: S.mid, marginBottom: 16 }}>TOP STRENGTHS</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
          {topTwo.map(m => (
            <div key={m} style={{ border: `1px solid ${S.rule}`, padding: 20 }}>
              <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.15em', color: S.mid, marginBottom: 8 }}>{MODE_LABELS[m]}</div>
              <div style={{ fontFamily: S.bebas, fontSize: 22, color: S.black, marginBottom: 8 }}>{strengths[m].name}</div>
              <div style={{ fontFamily: S.cormorant, fontSize: 13, color: '#555', lineHeight: 1.6 }}>{strengths[m].superpower}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ maxWidth: 600, margin: '0 auto', width: '100%', padding: '0 24px 40px', display: 'flex', gap: 12 }}>
        <button onClick={onViewReport} style={{
          flex: 1, padding: '16px', fontFamily: S.bebas, fontSize: 18, letterSpacing: '0.06em',
          background: S.black, color: S.white, border: 'none', cursor: 'pointer', transition: 'all 0.15s'
        }}>VIEW FULL REPORT</button>
        <button onClick={onRetake} style={{
          flex: 1, padding: '16px', fontFamily: S.bebas, fontSize: 18, letterSpacing: '0.06em',
          background: 'transparent', color: S.mid, border: `1px solid ${S.rule}`, cursor: 'pointer'
        }}>RETAKE</button>
      </div>

      {/* Tools */}
      <div style={{ maxWidth: 600, margin: '0 auto', width: '100%', padding: '0 24px 64px' }}>
        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.2em', color: S.mid, marginBottom: 16 }}>TOOLS</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
          {[
            { label: 'COLLABORATION CARD', desc: 'Share how to work with you', phase: 'collab-card' },
            { label: 'ROLE FIT CHECKER', desc: 'Find roles that fit your wiring', phase: 'role-fit' },
            { label: 'CONFLICT DECODER', desc: 'Decode friction with any MO code', phase: 'conflict' },
            { label: 'CHAT WITH YOUR MO', desc: 'Ask anything about your wiring', phase: 'chat' },
          ].map(t => (
            <button key={t.phase} onClick={() => onTool(t.phase)} style={{
              background: 'transparent', border: `1px solid ${S.rule}`, padding: '20px', textAlign: 'left',
              cursor: 'pointer', transition: 'background 0.12s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0ede8'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontFamily: S.bebas, fontSize: 16, color: S.black, letterSpacing: '0.04em', marginBottom: 6 }}>{t.label}</div>
              <div style={{ fontFamily: S.cormorant, fontSize: 13, color: S.mid, fontStyle: 'italic' }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
