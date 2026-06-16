import { useEffect } from 'react';
import { S } from '../styles/theme.js';
import { useIsMobile } from '../hooks/useIsMobile.js';

export const INTENTS = [
  { id: 'career',       label: 'My career & work',     sub: 'Find work that fits how I think' },
  { id: 'self',         label: 'Understanding myself', sub: 'Make sense of how I operate' },
  { id: 'relationship', label: 'A relationship',       sub: 'How I work with people I care about' },
  { id: 'curious',      label: 'Just curious',         sub: "Let's see what it says" },
];

export default function IntentScreen({ onPick, onBack }) {
  const isMobile = useIsMobile();

  // Keyboard: 1-4 picks, advances
  useEffect(() => {
    const onKey = (e) => {
      if (e.key >= '1' && e.key <= '4') {
        const it = INTENTS[Number(e.key) - 1];
        if (it) { e.preventDefault(); onPick(it.id); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onPick]);

  return (
    <div style={{ minHeight: '100vh', background: S.white, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 20px 0' }}>
        {onBack && (
          <button onClick={onBack} style={{ fontFamily: S.mono, fontSize: 11, letterSpacing: '0.1em', background: 'transparent', border: 'none', padding: 0, color: S.mid, cursor: 'pointer' }}>← BACK</button>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px', maxWidth: 640, margin: '0 auto', width: '100%' }}>
        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.2em', color: S.mid, marginBottom: 12 }}>BEFORE WE START</div>
        <h2 style={{ fontFamily: S.cormorant, fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 500, lineHeight: 1.3, color: S.black, margin: '0 0 8px' }}>What brought you here?</h2>
        <div style={{ fontFamily: S.cormorant, fontSize: 16, fontStyle: 'italic', color: S.mid, marginBottom: 24 }}>One tap. It just helps us point you to what matters most.</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {INTENTS.map((it, i) => (
            <button
              key={it.id}
              onClick={() => onPick(it.id)}
              style={{ textAlign: 'left', cursor: 'pointer', width: '100%', background: S.white, border: `1.5px solid ${S.rule}`, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#bbb'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = S.rule; }}
            >
              <span style={{ fontFamily: S.mono, fontSize: 10, color: '#c2bdb3', width: 12, flexShrink: 0, textAlign: 'center' }}>{i + 1}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontFamily: S.bebas, fontSize: 19, color: S.black, letterSpacing: '0.02em', lineHeight: 1.1 }}>{it.label}</span>
                <span style={{ display: 'block', fontFamily: S.cormorant, fontSize: 15, color: S.mid, marginTop: 2 }}>{it.sub}</span>
              </span>
              <span style={{ fontFamily: S.mono, fontSize: 14, color: '#c2bdb3', flexShrink: 0 }}>→</span>
            </button>
          ))}
        </div>

        <button onClick={() => onPick(null)} style={{ alignSelf: 'center', marginTop: 22, fontFamily: S.mono, fontSize: 10, letterSpacing: '0.12em', background: 'transparent', border: 'none', color: S.mid, cursor: 'pointer' }}>SKIP →</button>
      </div>
    </div>
  );
}
