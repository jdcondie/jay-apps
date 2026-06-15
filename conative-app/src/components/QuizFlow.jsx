import { useState, useEffect, useRef } from 'react';
import { S } from '../styles/theme.js';

const BREAK_MESSAGES = {
  8:  { headline: 'NICE WORK.\nKEEP GOING.', sub: 'A QUARTER DOWN' },
  17: { headline: 'HALFWAY\nTHERE.', sub: 'EIGHTEEN TO GO' },
  26: { headline: 'ALMOST\nTHERE.', sub: 'NINE LEFT' },
};

export default function QuizFlow({ question, index, total, response, onSelect, onNext, onBack, onPause }) {
  const { most, least } = response || {};
  const canProceed = !!(most && least);

  const [showBreak, setShowBreak] = useState(false);
  const timeoutRef  = useRef(null);
  const breakRef    = useRef(null);
  const advancedRef = useRef(false);

  // Reset guards when question changes
  useEffect(() => {
    advancedRef.current = false;
    setShowBreak(false);
    return () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(breakRef.current);
    };
  }, [question.id]);

  // Auto-advance when both selections made
  useEffect(() => {
    if (!canProceed) { clearTimeout(timeoutRef.current); return; }
    timeoutRef.current = setTimeout(() => {
      if (advancedRef.current) return;
      advancedRef.current = true;
      if (BREAK_MESSAGES[index]) {
        setShowBreak(true);
        breakRef.current = setTimeout(() => { setShowBreak(false); onNext(); }, 1300);
      } else {
        onNext();
      }
    }, 500);
    return () => clearTimeout(timeoutRef.current);
  }, [canProceed]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleManualNext = () => {
    if (!canProceed || advancedRef.current) return;
    clearTimeout(timeoutRef.current);
    advancedRef.current = true;
    onNext();
  };

  const getState = (optId) => {
    if (most === optId) return 'most';
    if (least === optId) return 'least';
    return 'none';
  };

  // Unified tap: none → most → least → clear (per card), single most/least enforced
  const tap = (optId) => {
    const st = getState(optId);
    if (st === 'most')  { onSelect(question.id, { most: null, least: optId }); return; }
    if (st === 'least') { onSelect(question.id, { most, least: null }); return; }
    if (!most)  { onSelect(question.id, { most: optId, least }); return; }
    if (!least) { onSelect(question.id, { most, least: optId }); return; }
    onSelect(question.id, { most: optId, least }); // both taken → re-pick most
  };

  // Keyboard: 1-4 pick, Enter/→ advance, ←/Backspace back
  useEffect(() => {
    if (showBreak) return;
    const onKey = (e) => {
      if (e.key >= '1' && e.key <= '4') {
        const opt = question.options[Number(e.key) - 1];
        if (opt) { e.preventDefault(); tap(opt.id); }
      } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
        if (canProceed) { e.preventDefault(); handleManualNext(); }
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        if (index > 0) { e.preventDefault(); onBack(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [question.id, most, least, canProceed, showBreak, index]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Break screen ────────────────────────────────────────────────────────
  if (showBreak) {
    const msg = BREAK_MESSAGES[index];
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: S.black, textAlign: 'center', padding: 24,
      }}>
        <div style={{
          fontFamily: S.bebas, fontSize: 'clamp(60px, 14vw, 120px)',
          color: S.white, lineHeight: 0.88, letterSpacing: '0.01em', whiteSpace: 'pre-line',
          animation: 'qIn 0.4s ease both',
        }}>{msg.headline}</div>
        <div style={{ fontFamily: S.mono, fontSize: 10, color: S.onDarkDim, letterSpacing: '0.25em', marginTop: 28 }}>
          {msg.sub}
        </div>
        <style>{`@keyframes qIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }`}</style>
      </div>
    );
  }

  // ── Quiz screen ─────────────────────────────────────────────────────────
  const progress = Math.round((index / total) * 100);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: S.white }}>

      {/* Header */}
      <div style={{ padding: '14px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} disabled={index === 0} style={{
          fontFamily: S.mono, fontSize: 10, letterSpacing: '0.1em',
          background: 'transparent', border: 'none', padding: 0,
          color: index === 0 ? 'transparent' : S.mid,
          cursor: index === 0 ? 'default' : 'pointer',
          pointerEvents: index === 0 ? 'none' : 'auto',
        }}>← BACK</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.15em', color: S.mid }}>
            {index + 1} OF {total}
          </div>
          {onPause && (
            <button onClick={onPause} style={{
              fontFamily: S.mono, fontSize: 9, letterSpacing: '0.1em',
              background: 'transparent', border: 'none', padding: 0,
              color: '#888', cursor: 'pointer',
            }}>SAVE & EXIT</button>
          )}
        </div>
      </div>

      {/* Single continuous progress bar */}
      <div style={{ padding: '10px 20px 0' }}>
        <div style={{ height: 2, background: S.rule }}>
          <div style={{ height: '100%', background: S.black, width: `${progress}%`, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Question (re-mounts per question for the enter animation) */}
      <div key={question.id} style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '32px 24px', maxWidth: 640, margin: '0 auto', width: '100%',
        animation: 'qIn 0.28s ease both',
      }}>
        <h2 style={{
          fontFamily: S.cormorant, fontSize: 'clamp(22px, 4vw, 30px)',
          fontWeight: 500, lineHeight: 1.35, color: S.black, margin: '0 0 10px',
        }}>{question.stem}</h2>

        <div style={{ fontFamily: S.cormorant, fontSize: 15, fontStyle: 'italic', color: S.mid, marginBottom: 22 }}>
          Tap the one most like you, then the one least like you.
        </div>

        {/* Option cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {question.options.map((opt, i) => {
            const st = getState(opt.id);
            const isMost = st === 'most', isLeast = st === 'least';
            const bg     = isMost ? S.black : isLeast ? '#e8e4dc' : S.white;
            const color  = isMost ? S.white : isLeast ? '#5a564e' : S.black;
            const border = isMost ? S.black : isLeast ? '#d6cfc3' : S.rule;
            return (
              <button
                key={opt.id}
                onClick={() => tap(opt.id)}
                style={{
                  position: 'relative', textAlign: 'left', cursor: 'pointer', width: '100%',
                  background: bg, color, border: `1.5px solid ${border}`,
                  padding: '17px 16px 17px 18px', minHeight: 62,
                  display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'background 0.15s, border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { if (st === 'none') e.currentTarget.style.borderColor = '#bbb'; }}
                onMouseLeave={e => { if (st === 'none') e.currentTarget.style.borderColor = S.rule; }}
              >
                <span style={{ fontFamily: S.mono, fontSize: 10, flexShrink: 0, width: 12, textAlign: 'center', color: isMost ? 'rgba(255,255,255,0.45)' : '#c2bdb3' }}>{i + 1}</span>
                <span style={{ flex: 1, fontFamily: S.cormorant, fontSize: 18, lineHeight: 1.4 }}>{opt.text}</span>
                {(isMost || isLeast) && (
                  <span style={{ flexShrink: 0, fontFamily: S.mono, fontSize: 7, letterSpacing: '0.12em', color: isMost ? 'rgba(255,255,255,0.65)' : '#8a8275' }}>
                    {isMost ? 'MOST' : 'LEAST'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Continue — fades in when ready */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={handleManualNext} disabled={!canProceed} style={{
            fontFamily: S.mono, fontSize: 10, letterSpacing: '0.15em',
            background: 'transparent', border: 'none', padding: '8px 0',
            color: canProceed ? S.black : 'transparent',
            cursor: canProceed ? 'pointer' : 'default',
            transition: 'color 0.2s',
          }}>{index === total - 1 ? 'SEE MY RESULTS →' : 'CONTINUE →'}</button>
        </div>
      </div>

      <style>{`@keyframes qIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}
