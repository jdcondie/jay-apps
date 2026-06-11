import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { S } from '../styles/theme.js';

const MODES = ['FF', 'FT', 'QS', 'IMP'];
const LABELS = { FF: 'Information', FT: 'Organization', QS: 'Change', IMP: 'Execution' };
const SAMPLE_ENERGY = { FF: 38, FT: 18, QS: 72, IMP: 25 };
const SAMPLE_NAMES  = { FF: 'Explain', FT: 'Adapt', QS: 'Innovate', IMP: 'Envision' };
const SAMPLE_DOM    = 'QS';
const SAMPLE_RES    = 'FT';

const SECTIONS = [
  { num: '01', group: 'WIRING',  label: 'What This Means',  reveals: 'Your behavioral profile in plain language — no jargon.', sample: '"Your brain runs on novelty. Starting things is where your energy lives."' },
  { num: '02', group: 'WIRING',  label: 'Your Scores',      reveals: 'Your exact position on all four behavioral dimensions.', sample: 'Change 72%  ·  Info 38%  ·  Execution 25%  ·  Org 18%' },
  { num: '03', group: 'WIRING',  label: 'Your Game',        reveals: 'The specific environment you\'re wired to win in.', sample: '"You win in markets moving fast enough that speed beats polish."' },
  { num: '04', group: 'WIRING',  label: 'Your Strengths',   reveals: 'What you naturally do better than most people.', sample: 'Four dimensions. Four distinct strengths — each with a shadow side.' },
  { num: '05', group: 'WIRING',  label: 'Top Strengths',    reveals: 'Your two highest-energy abilities, fully expanded.', sample: 'Innovate + Explain — the combination that makes your output hard to replicate.' },
  { num: '06', group: 'WIRING',  label: 'Unique Ability',   reveals: 'A one-sentence statement of your professional superpower.', sample: '[Top wiring] + [second wiring] applied to [your specific domain].' },
  { num: '07', group: 'WIRING',  label: 'Watch For',        reveals: 'Where your strengths flip into liabilities.', sample: '"You start 10 things and finish 3. The other 7 drain the people around you."' },
  { num: '08', group: 'OPERATE', label: 'Friction Points',  reveals: 'The conditions that quietly drain your energy.', sample: '"Being forced to maintain something you\'ve already solved in your head."' },
  { num: '09', group: 'OPERATE', label: 'Your Success',     reveals: 'What your wiring is actually built to optimize for.', sample: '"You are wired to launch, iterate, and improve — not to maintain."' },
  { num: '10', group: 'OPERATE', label: 'Procrastination',  reveals: 'Why you really stall — and what breaks it.', sample: '"You\'re not lazy. You\'re bored. The task is already solved in your head."' },
  { num: '11', group: 'OPERATE', label: 'Reset Protocol',   reveals: 'A 5-step sequence personalized to your dominant mode.', sample: 'Not generic advice. Built specifically for how your brain restarts.' },
  { num: '12', group: 'OPERATE', label: 'Daily Rules',      reveals: 'Baseline conditions that keep you consistently at your best.', sample: 'Three rules for morning, mid-day, and wind-down.' },
  { num: '13', group: 'CAREER',  label: 'Communication',    reveals: 'What people who work with you need to know.', sample: '"Give me the problem, not the process. I\'ll figure out the path."' },
  { num: '14', group: 'CAREER',  label: 'Under Stress',     reveals: 'How your behavior shifts when your tank is empty.', sample: '"You scatter. Seven new ideas surface and none of them get finished."' },
  { num: '15', group: 'CAREER',  label: 'Career Map',       reveals: '78 roles scored and ranked by wiring alignment.', sample: 'Startup Founder 94%  ·  Project Manager 31%  ·  Researcher 48%' },
  { num: '16', group: 'CAREER',  label: 'Money Patterns',   reveals: 'How your wiring shapes financial decisions and risk tolerance.', sample: '"Wired for risk. Early mover. Watch: over-concentration in speculative bets."' },
];

const GROUP_LABELS = {
  WIRING:  'YOUR WIRING',
  OPERATE: 'HOW YOU OPERATE',
  CAREER:  'WORKING WITH OTHERS / CAREER',
};

export default function IntroScreen({ onStart, onSignIn, resumeData, onResume, onStartFresh, onTestFill }) {
  const isMobile = useIsMobile();
  const total = 36;
  const pct = resumeData ? Math.round((resumeData.qIndex / total) * 100) : 0;

  const previewRef   = useRef(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [displayEnergy, setDisplayEnergy]   = useState({ FF: 0, FT: 0, QS: 0, IMP: 0 });
  const [cardsVisible, setCardsVisible]     = useState(0);
  const [scrolled, setScrolled]             = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setPreviewVisible(true); },
      { threshold: 0.05 }
    );
    if (previewRef.current) observer.observe(previewRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!previewVisible) return;
    const duration = 1400;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplayEnergy({
        FF:  Math.round(SAMPLE_ENERGY.FF  * ease),
        FT:  Math.round(SAMPLE_ENERGY.FT  * ease),
        QS:  Math.round(SAMPLE_ENERGY.QS  * ease),
        IMP: Math.round(SAMPLE_ENERGY.IMP * ease),
      });
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [previewVisible]);

  useEffect(() => {
    if (!previewVisible) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setCardsVisible(i);
      if (i >= SECTIONS.length) clearInterval(interval);
    }, 55);
    return () => clearInterval(interval);
  }, [previewVisible]);

  const scrollToPreview = () => {
    previewRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ background: S.white, minHeight: '100vh' }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 24px', textAlign: 'center', position: 'relative' }}>

        {onSignIn && (
          <button onClick={onSignIn} style={{ position: 'absolute', top: 20, right: 24, fontFamily: S.mono, fontSize: 10, letterSpacing: '0.1em', background: 'transparent', border: `1px solid ${S.rule}`, color: S.mid, padding: '10px 14px', cursor: 'pointer' }}>
            SIGN IN
          </button>
        )}

        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.3em', color: S.mid, marginBottom: 32 }}>
          BEHAVIORAL ASSESSMENT / PERSONAL OPERATING MANUAL
        </div>
        <h1 style={{ fontFamily: S.bebas, fontSize: 'clamp(60px, 14vw, 140px)', lineHeight: 0.9, color: S.black, letterSpacing: -1, margin: 0 }}>
          HOW ARE<br />YOU WIRED?
        </h1>
        <p style={{ fontFamily: S.cormorant, fontSize: 'clamp(17px, 2.5vw, 22px)', fontStyle: 'italic', color: '#333', maxWidth: 480, marginTop: 24, lineHeight: 1.55 }}>
          No right answers. Discover how you instinctively take action, where your energy goes, and how to use your wiring instead of fighting it.
        </p>
        <p style={{ fontFamily: S.cormorant, fontSize: 15, color: S.mid, maxWidth: 420, marginTop: 16, lineHeight: 1.6 }}>
          Four options per question. Pick the one you'd most likely take, then the one you'd least likely take. Go with your gut.
        </p>

        {resumeData ? (
          <div style={{ marginTop: 48, width: '100%', maxWidth: 360 }}>
            <div style={{ border: `1px solid ${S.rule}`, padding: '20px 24px', marginBottom: 12, textAlign: 'left' }}>
              <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.2em', color: S.mid, marginBottom: 10 }}>ASSESSMENT IN PROGRESS</div>
              <div style={{ height: 2, background: S.rule, marginBottom: 10 }}>
                <div style={{ height: '100%', background: S.black, width: `${pct}%` }} />
              </div>
              <div style={{ fontFamily: S.mono, fontSize: 10, color: S.mid, marginBottom: 16 }}>
                QUESTION {resumeData.qIndex + 1} OF {total} — {pct}% COMPLETE
              </div>
              <button onClick={onResume} style={{ width: '100%', fontFamily: S.bebas, fontSize: 20, letterSpacing: '0.08em', background: S.black, color: S.white, border: 'none', padding: '14px', cursor: 'pointer' }}>
                RESUME
              </button>
            </div>
            <button onClick={onStartFresh} style={{ width: '100%', fontFamily: S.mono, fontSize: 10, letterSpacing: '0.1em', background: 'transparent', border: `1px solid ${S.rule}`, color: S.mid, padding: '12px', cursor: 'pointer' }}>
              START OVER INSTEAD
            </button>
          </div>
        ) : (
          <>
            <button onClick={onStart} style={{ marginTop: 48, fontFamily: S.bebas, fontSize: 22, letterSpacing: '0.08em', background: S.black, color: S.white, border: 'none', padding: '16px 56px', cursor: 'pointer', transition: 'transform 0.15s' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              BEGIN ASSESSMENT
            </button>
            <div style={{ fontFamily: S.mono, fontSize: 10, color: S.mid, marginTop: 16, letterSpacing: '0.15em' }}>~8 MINUTES</div>
          </>
        )}

        {/* Scroll prompt */}
        <button
          onClick={scrollToPreview}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: scrolled ? 0 : 1, transition: 'opacity 0.4s' }}
        >
          <span style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.18em', color: S.mid }}>SEE WHAT YOU'LL DISCOVER</span>
          <span style={{ display: 'block', width: 1, height: 32, background: S.rule, animation: 'none', position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', top: 0, left: 0, width: '100%', background: S.mid, animation: 'scrollLine 1.6s ease-in-out infinite' }} />
          </span>
        </button>
        <style>{`
          @keyframes scrollLine {
            0%   { height: 0; top: 0; }
            50%  { height: 100%; top: 0; }
            100% { height: 0; top: 100%; }
          }
        `}</style>
      </div>

      {/* ── Report Preview ──────────────────────────────────────── */}
      <div ref={previewRef} style={{ borderTop: `1px solid ${S.rule}`, background: S.white }}>

        {/* Preview header */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '56px 24px 40px' : '72px 40px 48px' }}>
          <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.25em', color: S.mid, marginBottom: 12 }}>SAMPLE REPORT</div>
          <h2 style={{ fontFamily: S.bebas, fontSize: 'clamp(32px, 5vw, 52px)', color: S.black, margin: '0 0 12px', lineHeight: 1 }}>
            HERE'S WHAT YOU'LL GET
          </h2>
          <p style={{ fontFamily: S.cormorant, fontSize: 17, color: '#555', lineHeight: 1.65, maxWidth: 480, margin: 0, fontStyle: 'italic' }}>
            16 sections built from your four behavioral dimensions. Below is a real example for a Quick Start–dominant profile.
          </p>
        </div>

        {/* Sample dimension grid */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '0 24px 48px' : '0 40px 56px' }}>
          <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.2em', color: S.mid, marginBottom: 20 }}>SAMPLE BEHAVIORAL PROFILE</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: S.rule, border: `1px solid ${S.rule}`, maxWidth: 680 }}>
            {MODES.map(m => {
              const isDom = m === SAMPLE_DOM;
              const isRes = m === SAMPLE_RES;
              return (
                <div key={m} style={{ background: isDom ? '#f0ede8' : S.white, padding: isMobile ? '20px 16px' : '24px 28px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <div style={{ fontFamily: S.mono, fontSize: 8, letterSpacing: '0.18em', color: S.mid }}>{LABELS[m].toUpperCase()}</div>
                    <div style={{ fontFamily: S.bebas, fontSize: 32, color: SAMPLE_ENERGY[m] >= 55 ? S.black : S.mid, lineHeight: 1, transition: 'color 0.3s' }}>
                      {displayEnergy[m]}%
                    </div>
                  </div>
                  <div style={{ fontFamily: S.bebas, fontSize: 18, color: S.black, letterSpacing: '0.02em', marginBottom: 10 }}>{SAMPLE_NAMES[m]}</div>
                  <div style={{ height: 3, background: S.rule, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      background: isDom ? S.black : S.mid,
                      width: previewVisible ? `${SAMPLE_ENERGY[m]}%` : '0%',
                      transition: 'width 1.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }} />
                  </div>
                  {isDom && <div style={{ fontFamily: S.mono, fontSize: 8, letterSpacing: '0.14em', color: S.mid, marginTop: 10 }}>DOMINANT</div>}
                  {isRes && <div style={{ fontFamily: S.mono, fontSize: 8, letterSpacing: '0.14em', color: S.mid, marginTop: 10 }}>LOWEST ENERGY</div>}
                </div>
              );
            })}
          </div>
          <p style={{ fontFamily: S.cormorant, fontSize: 14, fontStyle: 'italic', color: S.mid, marginTop: 16, maxWidth: 500 }}>
            Your four numbers generate everything below. All 16 sections are personalized to your exact profile.
          </p>
        </div>

        {/* Section cards by group */}
        {['WIRING', 'OPERATE', 'CAREER'].map(group => {
          const groupSections = SECTIONS.filter(s => s.group === group);
          return (
            <div key={group} style={{ borderTop: `1px solid ${S.rule}`, padding: isMobile ? '40px 24px' : '48px 40px', maxWidth: 900, margin: '0 auto' }}>
              <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.25em', color: S.mid, marginBottom: 28 }}>
                {GROUP_LABELS[group]}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: isMobile ? 0 : 1, background: isMobile ? 'transparent' : S.rule, border: isMobile ? 'none' : `1px solid ${S.rule}` }}>
                {groupSections.map((section, i) => {
                  const globalIndex = SECTIONS.indexOf(section);
                  const visible = globalIndex < cardsVisible;
                  return (
                    <div
                      key={section.num}
                      style={{
                        background: S.white,
                        padding: isMobile ? '20px 0' : '22px 24px',
                        borderBottom: isMobile ? `1px solid ${S.rule}` : 'none',
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(14px)',
                        transition: 'opacity 0.4s ease, transform 0.4s ease',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <div style={{ fontFamily: S.mono, fontSize: 10, color: S.rule, flexShrink: 0, marginTop: 3, minWidth: 22, textAlign: 'right' }}>{section.num}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: S.bebas, fontSize: 17, color: S.black, letterSpacing: '0.02em', marginBottom: 3, lineHeight: 1.1 }}>{section.label}</div>
                          <div style={{ fontFamily: S.mono, fontSize: 8, letterSpacing: '0.12em', color: S.mid, marginBottom: 8 }}>{section.reveals}</div>
                          <div style={{ fontFamily: S.cormorant, fontSize: 14, fontStyle: 'italic', color: '#666', lineHeight: 1.55 }}>{section.sample}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Bottom CTA */}
        <div style={{ borderTop: `1px solid ${S.rule}`, padding: isMobile ? '56px 24px 80px' : '72px 40px 96px', textAlign: 'center' }}>
          <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.2em', color: S.mid, marginBottom: 20 }}>READY TO SEE YOURS?</div>
          <h3 style={{ fontFamily: S.bebas, fontSize: 'clamp(28px, 4vw, 44px)', color: S.black, margin: '0 0 20px', lineHeight: 1 }}>
            FIND OUT HOW YOU'RE WIRED
          </h3>
          <p style={{ fontFamily: S.cormorant, fontSize: 17, fontStyle: 'italic', color: '#555', maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.6 }}>
            Eight minutes. 36 questions. A complete behavioral profile you'll actually use.
          </p>
          <button
            onClick={onStart}
            style={{ fontFamily: S.bebas, fontSize: 22, letterSpacing: '0.08em', background: S.black, color: S.white, border: 'none', padding: '16px 56px', cursor: 'pointer', transition: 'transform 0.15s' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          >
            BEGIN ASSESSMENT
          </button>
          <div style={{ fontFamily: S.mono, fontSize: 10, color: S.mid, marginTop: 16, letterSpacing: '0.15em' }}>~8 MINUTES · FREE</div>
        </div>

      </div>

      {onTestFill && (
        <button onClick={onTestFill} style={{ position: 'fixed', bottom: 20, right: 24, fontFamily: S.mono, fontSize: 9, letterSpacing: '0.12em', background: 'transparent', border: 'none', color: S.rule, cursor: 'pointer', padding: '8px 12px' }}>
          FILL RANDOM + SKIP TO RESULTS
        </button>
      )}
    </div>
  );
}
