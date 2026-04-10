import { S } from '../styles/theme.js';
import { MODE_LABELS, STRENGTH_DATA } from '../data/strengthData.js';
import { useIsMobile } from '../hooks/useIsMobile.js';

const MODES = ['FF', 'FT', 'QS', 'IMP'];

export default function CollaborationCard({ results, onBack }) {
  const { zones, strengths, dominant } = results;
  const isMobile = useIsMobile();

  return (
    <div style={{ minHeight: '100vh', background: S.black }}>
      <style>{`@media print { .no-print { display: none !important; } body { background: #0a0a0a; } }`}</style>

      {/* Nav */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #1a1a1a' }}>
        <button onClick={onBack} style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.1em', background: 'transparent', border: '1px solid #2a2a2a', color: S.mid, padding: '10px 14px', cursor: 'pointer' }}>← DASHBOARD</button>
        <button onClick={() => window.print()} style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.1em', background: S.white, border: 'none', color: S.black, padding: '10px 14px', cursor: 'pointer' }}>PRINT / SAVE AS PDF</button>
      </div>

      {/* Label */}
      <div className="no-print" style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px 0' }}>
        <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.3em', color: S.onDarkDim }}>SHARE THIS WITH ANYONE YOU WORK WITH</div>
      </div>

      {/* Card */}
      <div style={{ maxWidth: 600, margin: '24px auto 64px', padding: isMobile ? '0 16px' : '0 24px' }}>
        <div style={{ border: '1px solid #1a1a1a', padding: isMobile ? '28px 20px' : '48px 40px' }}>

          {/* Header */}
          <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.3em', color: S.onDarkDim, marginBottom: 32 }}>HOW TO WORK WITH ME</div>

          {/* Brain profile */}
          <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.3em', color: S.onDarkDim, marginBottom: 10 }}>MY BRAIN RUNS ON</div>
          <div style={{ fontFamily: S.bebas, fontSize: 'clamp(48px, 12vw, 80px)', lineHeight: 0.85, color: S.white, marginBottom: 10 }}>{MODE_LABELS[dominant].toUpperCase()}</div>
          <div style={{ fontFamily: S.cormorant, fontSize: 15, fontStyle: 'italic', color: S.white, marginBottom: 48 }}>
            {strengths[dominant].name}
          </div>

          {/* Superpower */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.2em', color: S.onDarkDim, marginBottom: 12 }}>MY SUPERPOWER</div>
            <div style={{ fontFamily: S.cormorant, fontSize: 17, color: S.white, lineHeight: 1.65, fontStyle: 'italic' }}>
              "{strengths[dominant].superpower}"
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1a1a1a', marginBottom: 40 }} />

          {/* What others should know */}
          <div>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.2em', color: S.onDarkDim, marginBottom: 24 }}>WHAT YOU SHOULD KNOW</div>
            {MODES.map(m => (
              <div key={m} style={{ display: 'flex', gap: 20, marginBottom: 20, alignItems: 'flex-start' }}>
                <div style={{ fontFamily: S.mono, fontSize: 9, color: S.onDarkDim, letterSpacing: '0.1em', width: isMobile ? 68 : 90, flexShrink: 0, paddingTop: 2 }}>{MODE_LABELS[m].toUpperCase()}</div>
                <div style={{ fontFamily: S.cormorant, fontSize: 15, color: S.white, lineHeight: 1.65 }}>
                  {STRENGTH_DATA[m][zones[m]].othersKnow}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #1a1a1a', marginTop: 32, paddingTop: 20 }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, color: S.onDarkDim, letterSpacing: '0.15em' }}>CONATIVE ASSESSMENT · PERSONAL OPERATING MANUAL</div>
          </div>
        </div>
      </div>
    </div>
  );
}
