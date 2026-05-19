import { useState, useEffect, useRef } from 'react';
import { S } from '../styles/theme.js';

const BREAK_MESSAGES = {
  11: { headline: 'ONE THIRD\nDONE.', sub: 'KEEP GOING' },
  23: { headline: 'FINAL\nSTRETCH.', sub: 'TWELVE MORE' },
};

export default function QuizFlow({ question, index, total, response, onSelect, onNext, onBack }) {
  const { most, least } = response || {};
  const canProceed = !!(most && least);

  const [showBreak, setShowBreak] = useState(false);
  const timeoutRef    = useRef(null);
  const breakRef      = useRef(null);
  const advancedRef   = useRef(false);

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
    if (!canProceed) {
      clearTimeout(timeoutRef.current);
      return;
    }
    timeoutRef.current = setTimeout(() => {
      if (advancedRef.current) return;
      advancedRef.current = true;
      if (BREAK_MESSAGES[index]) {
        setShowBreak(true);
        breakRef.current = setTimeout(() => {
          setShowBreak(false);
          onNext();
        }, 1600);
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

  const handleClick = (optId) => {
    const current = getState(optId);
    if (current === 'most')  { onSelect(question.id, { most: null, least }); return; }
    if (current === 'least') { onSelect(question.id, { most, least: null }); return; }
    if (!most)  { onSelect(question.id, { most: optId, least }); return; }
    if (!least) { onSelect(question.id, { most, least: optId }); return; }
  };

  // Segmented progress — 3 segments of 12
  const seg     = Math.floor(index / 12);           // 0 | 1 | 2
  const segPct  = Math.round(((index - seg * 12) / 12) * 100);

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
          color: S.white, lineHeight: 0.88, letterSpacing: '0.01em',
          whiteSpace: 'pre-line',
        }}>{msg.headline}</div>
        <div style={{
          fontFamily: S.mono, fontSize: 10, color: S.onDarkDim,
          letterSpacing: '0.25em', marginTop: 28,
        }}>{msg.sub}</div>
      </div>
    );
  }

  // ── Quiz screen ─────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: S.white }}>

      {/* Header — back link + counter */}
      <div style={{ padding: '14px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onBack}
          disabled={index === 0}
          style={{
            fontFamily: S.mono, fontSize: 10, letterSpacing: '0.1em',
            background: 'transparent', border: 'none', padding: 0,
            color: index === 0 ? 'transparent' : S.mid,
            cursor: index === 0 ? 'default' : 'pointer',
            pointerEvents: index === 0 ? 'none' : 'auto',
          }}
        >← BACK</button>
        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.15em', color: S.mid }}>
          {index + 1} / {total}
        </div>
      </div>

      {/* Segmented progress bar */}
      <div style={{ display: 'flex', gap: 4, padding: '8px 20px 0' }}>
        {[0, 1, 2].map(s => {
          const fill = s < seg ? 100 : s === seg ? segPct : 0;
          return (
            <div key={s} style={{ flex: 1, height: 2, background: S.rule }}>
              <div style={{ height: '100%', background: S.black, width: `${fill}%`, transition: 'width 0.4s ease' }} />
            </div>
          );
        })}
      </div>

      {/* Question */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '32px 24px', maxWidth: 640, margin: '0 auto', width: '100%',
      }}>
        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.2em', color: S.mid, marginBottom: 12 }}>
          WHEN FREE TO BE MYSELF...
        </div>
        <h2 style={{
          fontFamily: S.cormorant, fontSize: 'clamp(22px, 4vw, 30px)',
          fontWeight: 500, lineHeight: 1.35, color: S.black, margin: '0 0 20px',
        }}>{question.stem}</h2>

        {/* Slot indicators — replaces instruction text */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
          {[{ label: 'MOST', filled: !!most }, { label: 'LEAST', filled: !!least }].map(({ label, filled }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: filled ? S.black : 'transparent',
                border: `1.5px solid ${filled ? S.black : '#bbb'}`,
                transition: 'all 0.15s',
              }} />
              <span style={{
                fontFamily: S.mono, fontSize: 9, letterSpacing: '0.15em',
                color: filled ? S.black : '#bbb', transition: 'color 0.15s',
              }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: `1px solid ${S.rule}` }}>
          {question.options.map((opt) => {
            const state = getState(opt.id);
            const bg    = state === 'most' ? S.black : state === 'least' ? '#e8e4dc' : 'transparent';
            const color = state === 'most' ? S.white : S.black;
            const label = state === 'most' ? 'MOST' : state === 'least' ? 'LEAST' : '';
            return (
              <button key={opt.id} onClick={() => handleClick(opt.id)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '18px 20px', background: bg, color, border: 'none',
                borderBottom: `1px solid ${state === 'most' ? '#333' : S.rule}`,
                fontFamily: S.cormorant, fontSize: 18, fontWeight: 400, cursor: 'pointer',
                textAlign: 'left', transition: 'all 0.15s', lineHeight: 1.4,
              }}>
                <span>{opt.text}</span>
                {label && (
                  <span style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.2em', opacity: 0.7, flexShrink: 0, marginLeft: 12 }}>
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Continue — text-style, right-aligned, manual fallback */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button
            onClick={handleManualNext}
            disabled={!canProceed}
            style={{
              fontFamily: S.mono, fontSize: 10, letterSpacing: '0.15em',
              background: 'transparent', border: 'none', padding: '8px 0',
              color: canProceed ? S.black : 'transparent',
              cursor: canProceed ? 'pointer' : 'default',
              transition: 'color 0.2s',
            }}
          >{index === total - 1 ? 'SEE MY RESULTS →' : 'CONTINUE →'}</button>
        </div>
      </div>
    </div>
  );
}
