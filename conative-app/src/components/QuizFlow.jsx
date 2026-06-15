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

  // Row tap: progressive — first pick = most, next = least; re-tap clears
  const handleRowClick = (optId) => {
    const cur = getState(optId);
    if (cur === 'most')  { onSelect(question.id, { most: null, least }); return; }
    if (cur === 'least') { onSelect(question.id, { most, least: null }); return; }
    if (!most)  { onSelect(question.id, { most: optId, least }); return; }
    if (!least) { onSelect(question.id, { most, least: optId }); return; }
  };

  // Dot tap: force-assign a specific role to this row
  const handleMostDot = (e, optId) => {
    e.stopPropagation();
    if (most === optId) { onSelect(question.id, { most: null, least }); return; }
    onSelect(question.id, { most: optId, least: least === optId ? null : least });
  };
  const handleLeastDot = (e, optId) => {
    e.stopPropagation();
    if (least === optId) { onSelect(question.id, { most, least: null }); return; }
    onSelect(question.id, { most: most === optId ? null : most, least: optId });
  };

  // Keyboard: 1-4 progressive pick, Enter/→ advance, ←/Backspace back
  useEffect(() => {
    if (showBreak) return;
    const onKey = (e) => {
      if (e.key >= '1' && e.key <= '4') {
        const opt = question.options[Number(e.key) - 1];
        if (opt) { e.preventDefault(); handleRowClick(opt.id); }
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
        background: S.white, textAlign: 'center', padding: 24,
      }}>
        <div style={{
          fontFamily: S.bebas, fontSize: 'clamp(60px, 14vw, 120px)',
          color: S.black, lineHeight: 0.88, letterSpacing: '0.01em', whiteSpace: 'pre-line',
          animation: 'qIn 0.4s ease both',
        }}>{msg.headline}</div>
        <div style={{ fontFamily: S.mono, fontSize: 11, color: S.mid, letterSpacing: '0.25em', marginTop: 28 }}>
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
          fontFamily: S.mono, fontSize: 11, letterSpacing: '0.1em',
          background: 'transparent', border: 'none', padding: 0,
          color: index === 0 ? 'transparent' : S.mid,
          cursor: index === 0 ? 'default' : 'pointer',
          pointerEvents: index === 0 ? 'none' : 'auto',
        }}>← BACK</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: S.mono, fontSize: 11, letterSpacing: '0.15em', color: S.mid }}>
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

        <div style={{ fontFamily: S.cormorant, fontSize: 16, fontStyle: 'italic', color: S.mid, marginBottom: 20 }}>
          Mark the one most like you, and the one least like you.
        </div>

        {/* Column headers above M/L dots */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ flex: 1 }} />
          <div style={{ width: 48, textAlign: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.04em', color: most ? S.black : '#bbb', lineHeight: 1.5, display: 'block', transition: 'color 0.15s' }}>MOST<br/>LIKELY</span>
          </div>
          <div style={{ width: 48, textAlign: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.04em', color: least ? S.black : '#bbb', lineHeight: 1.5, display: 'block', transition: 'color 0.15s' }}>LEAST<br/>LIKELY</span>
          </div>
        </div>

        {/* Options */}
        <div style={{ border: `1px solid ${S.rule}` }}>
          {question.options.map((opt) => {
            const state = getState(opt.id);
            const onBlack = state === 'most';
            const rowBg   = state === 'most' ? S.black : state === 'least' ? '#e8e4dc' : 'transparent';
            const rowColor = onBlack ? S.white : S.black;

            const mSelected = state === 'most';
            const mDotBg     = mSelected ? S.white : 'transparent';
            const mDotBorder = mSelected ? S.white : onBlack ? 'rgba(255,255,255,0.25)' : '#ccc';
            const mLetterCol = mSelected ? S.black : onBlack ? 'rgba(255,255,255,0.3)' : '#bbb';

            const lSelected  = state === 'least';
            const lDotBg     = lSelected ? '#444' : 'transparent';
            const lDotBorder = lSelected ? '#444' : onBlack ? 'rgba(255,255,255,0.25)' : '#ccc';
            const lLetterCol = lSelected ? S.white : onBlack ? 'rgba(255,255,255,0.3)' : '#bbb';

            return (
              <div
                key={opt.id}
                onClick={() => handleRowClick(opt.id)}
                style={{
                  display: 'flex', alignItems: 'center',
                  background: rowBg, color: rowColor,
                  borderBottom: `1px solid ${onBlack ? '#333' : S.rule}`,
                  transition: 'all 0.15s', cursor: 'pointer',
                }}
              >
                <div style={{
                  flex: 1, padding: '18px 16px 18px 20px',
                  fontFamily: S.cormorant, fontSize: 19, lineHeight: 1.4,
                }}>
                  {opt.text}
                </div>

                {/* M dot */}
                <div
                  onClick={(e) => handleMostDot(e, opt.id)}
                  title="Most likely"
                  style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: mDotBg, border: `1.5px solid ${mDotBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    <span style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: 0, color: mLetterCol, lineHeight: 1 }}>M</span>
                  </div>
                </div>

                {/* L dot */}
                <div
                  onClick={(e) => handleLeastDot(e, opt.id)}
                  title="Least likely"
                  style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 8, cursor: 'pointer' }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: lDotBg, border: `1.5px solid ${lDotBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    <span style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: 0, color: lLetterCol, lineHeight: 1 }}>L</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue — fades in when ready */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={handleManualNext} disabled={!canProceed} style={{
            fontFamily: S.mono, fontSize: 11, letterSpacing: '0.15em',
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
