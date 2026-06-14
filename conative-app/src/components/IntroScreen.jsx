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
  { num: '01', group: 'WIRING',  label: 'What This Means',  reveals: 'Your behavioral profile in plain language.', sample: '"Your brain runs on novelty. Starting things is where your energy lives."' },
  { num: '02', group: 'WIRING',  label: 'Your Scores',      reveals: 'Your exact position on all four dimensions.', sample: 'Change 72%  ·  Info 38%  ·  Execution 25%  ·  Org 18%' },
  { num: '03', group: 'WIRING',  label: 'Your Game',        reveals: 'The environment you\'re wired to win in.', sample: '"You win in markets moving fast enough that speed beats polish."' },
  { num: '04', group: 'WIRING',  label: 'Your Strengths',   reveals: 'What you naturally do better than most.', sample: 'Four dimensions. Four distinct strengths · each with a shadow side.' },
  { num: '05', group: 'WIRING',  label: 'Top Strengths',    reveals: 'Your two highest-energy abilities, expanded.', sample: 'Innovate + Explain · the combination that makes your output hard to replicate.' },
  { num: '06', group: 'WIRING',  label: 'Unique Ability',   reveals: 'A one-sentence statement of your superpower.', sample: '[Top wiring] + [second wiring] applied to [your specific domain].' },
  { num: '07', group: 'WIRING',  label: 'Watch For',        reveals: 'Where your strengths flip into liabilities.', sample: '"You start 10 things and finish 3. The other 7 drain the people around you."' },
  { num: '08', group: 'OPERATE', label: 'Friction Points',  reveals: 'The conditions that quietly drain your energy.', sample: '"Being forced to maintain something you\'ve already solved in your head."' },
  { num: '09', group: 'OPERATE', label: 'Your Success',     reveals: 'What your wiring is actually built to optimize.', sample: '"You are wired to launch, iterate, and improve · not to maintain."' },
  { num: '10', group: 'OPERATE', label: 'Procrastination',  reveals: 'Why you really stall · and what breaks it.', sample: '"You\'re not lazy. You\'re bored. The task is already solved in your head."' },
  { num: '11', group: 'OPERATE', label: 'Reset Protocol',   reveals: 'A 5-step sequence for your dominant mode.', sample: 'Not generic advice. Built for how your brain specifically restarts.' },
  { num: '12', group: 'OPERATE', label: 'Daily Rules',      reveals: 'Baseline conditions to stay consistently sharp.', sample: 'Three rules for morning, mid-day, and wind-down.' },
  { num: '13', group: 'CAREER',  label: 'Communication',    reveals: 'What people who work with you need to know.', sample: '"Give me the problem, not the process. I\'ll figure out the path."' },
  { num: '14', group: 'CAREER',  label: 'Under Stress',     reveals: 'How your behavior shifts when your tank is empty.', sample: '"You scatter. Seven new ideas surface and none of them get finished."' },
  { num: '15', group: 'CAREER',  label: 'Career Map',       reveals: '78 roles scored and ranked by wiring alignment.', sample: 'Startup Founder 94%  ·  Project Manager 31%  ·  Researcher 48%' },
  { num: '16', group: 'CAREER',  label: 'Money Patterns',   reveals: 'How your wiring shapes financial decisions.', sample: '"Wired for risk. Early mover. Watch: over-concentration in speculative bets."' },
];

// Hero benefit callouts (point to the brain)
const CALLOUTS = [
  { label: 'ENERGY SOURCES',    icon: 'bolt',   desc: 'Discover what naturally drives and recharges you.' },
  { label: 'PEAK CONDITIONS',   icon: 'target', desc: 'Identify the conditions that make you sharpest.' },
  { label: 'NATURAL STRENGTHS', icon: 'star',   desc: 'Understand your innate advantages and how to leverage them.' },
  { label: 'WORK ALIGNMENT',    icon: 'trophy', desc: "See the work you're built to excel at, and enjoy doing." },
];

function CalloutIcon({ name, size = 18, color = '#f5f3ef' }) {
  const p = { fill: 'none', stroke: color, strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'bolt'   && <path d="M13 2 L4 14 h6 l-1 8 9-12 h-6 z" {...p} />}
      {name === 'target' && <><circle cx="12" cy="12" r="9" {...p} /><circle cx="12" cy="12" r="4" {...p} /><circle cx="12" cy="12" r="0.7" fill={color} stroke="none" /></>}
      {name === 'star'   && <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" {...p} />}
      {name === 'trophy' && <><path d="M8 4 h8 v4 a4 4 0 0 1 -8 0 z" {...p} /><path d="M8 6 H5 v1.2 a3 3 0 0 0 3 2.8" {...p} /><path d="M16 6 h3 v1.2 a3 3 0 0 1 -3 2.8" {...p} /><path d="M12 12 v4 M9 20 h6 M10.2 20 l0.8-4 M13.8 20 l-0.8-4" {...p} /></>}
    </svg>
  );
}

export default function IntroScreen({ onStart, onSignIn, resumeData, onResume, onStartFresh, onTestFill }) {
  const isMobile = useIsMobile();
  const total = 36;
  const pct = resumeData ? Math.round((resumeData.qIndex / total) * 100) : 0;

  const profileRef  = useRef(null);
  const [profileVisible, setProfileVisible] = useState(false);
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
      ([entry]) => { if (entry.isIntersecting) setProfileVisible(true); },
      { threshold: 0.05 }
    );
    if (profileRef.current) observer.observe(profileRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!profileVisible) return;
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
  }, [profileVisible]);

  useEffect(() => {
    if (!profileVisible) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setCardsVisible(i);
      if (i >= SECTIONS.length) clearInterval(interval);
    }, 55);
    return () => clearInterval(interval);
  }, [profileVisible]);

  const scrollToProfile = () => profileRef.current?.scrollIntoView({ behavior: 'smooth' });

  const pad = isMobile ? '72px 24px' : '96px 8%';

  return (
    <div style={{ background: S.white, minHeight: '100vh' }}>

      {onSignIn && (
        <button onClick={onSignIn} style={{ position: 'fixed', top: 20, right: 24, zIndex: 100, fontFamily: S.mono, fontSize: 10, letterSpacing: '0.1em', background: 'transparent', border: '1px solid #2a2a2a', color: '#888', padding: '10px 14px', cursor: 'pointer' }}>
          SIGN IN
        </button>
      )}

      {/* ── HERO (3D brain scene + benefit callouts) ─────────── */}
      <div style={{
        minHeight: '100vh',
        background: S.black,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: isMobile ? 'flex-start' : 'flex-start',
        padding: isMobile ? '110px 24px 64px' : '80px 6% 60px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Full-bleed brain scene */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'url(/brain.png)',
          backgroundSize: 'cover',
          backgroundPosition: isMobile ? 'center 8%' : 'center center',
          backgroundRepeat: 'no-repeat',
        }} />

        {/* Scrim · dark left for headline, slightly dark right for callouts */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: isMobile
            ? 'linear-gradient(180deg, rgba(10,10,10,0.45) 0%, rgba(10,10,10,0.1) 28%, rgba(10,10,10,0.7) 62%, #0a0a0a 100%)'
            : 'linear-gradient(90deg, #0a0a0a 0%, rgba(10,10,10,0.9) 22%, rgba(10,10,10,0.3) 42%, rgba(10,10,10,0.15) 60%, rgba(10,10,10,0.5) 86%, rgba(10,10,10,0.62) 100%)',
        }} />

        {/* Content (headline + CTA) */}
        <div style={{ flex: '0 0 auto', maxWidth: isMobile ? '100%' : 460, textAlign: isMobile ? 'center' : 'left', position: 'relative', zIndex: 3 }}>
          <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.3em', color: '#999', marginBottom: 28 }}>
            BEHAVIORAL ASSESSMENT / PERSONAL OPERATING MANUAL
          </div>
          <h1 style={{ fontFamily: S.bebas, fontSize: 'clamp(60px, 8.5vw, 112px)', lineHeight: 0.86, color: S.white, letterSpacing: -1, margin: '0 0 24px' }}>
            YOUR MIND,<br />DECODED.
          </h1>
          <p style={{ fontFamily: S.cormorant, fontSize: 'clamp(19px, 2.2vw, 24px)', fontStyle: 'italic', color: S.white, lineHeight: 1.5, margin: '0 0 16px', maxWidth: 420 }}>
            The instruction manual you were never handed for your own mind.
          </p>
          <p style={{ fontFamily: S.cormorant, fontSize: 'clamp(16px, 1.8vw, 18px)', color: S.onDarkBody, lineHeight: 1.65, margin: '0 0 36px', maxWidth: 400 }}>
            See where your energy comes from, the conditions that make you sharp, and the work you're built to win at. Then build your life around how you actually operate.
          </p>

          {resumeData ? (
            <div style={{ maxWidth: 340, margin: isMobile ? '0 auto' : 0 }}>
              <div style={{ border: '1px solid #2a2a2a', padding: '20px 24px', marginBottom: 12, background: 'rgba(10,10,10,0.6)' }}>
                <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.2em', color: '#999', marginBottom: 10 }}>ASSESSMENT IN PROGRESS</div>
                <div style={{ height: 2, background: '#2a2a2a', marginBottom: 10 }}>
                  <div style={{ height: '100%', background: S.white, width: `${pct}%` }} />
                </div>
                <div style={{ fontFamily: S.mono, fontSize: 10, color: '#999', marginBottom: 16 }}>
                  QUESTION {resumeData.qIndex + 1} OF {total} · {pct}% COMPLETE
                </div>
                <button onClick={onResume} style={{ width: '100%', fontFamily: S.bebas, fontSize: 20, letterSpacing: '0.08em', background: S.white, color: S.black, border: 'none', padding: '14px', cursor: 'pointer' }}>
                  RESUME
                </button>
              </div>
              <button onClick={onStartFresh} style={{ width: '100%', fontFamily: S.mono, fontSize: 10, letterSpacing: '0.1em', background: 'transparent', border: '1px solid #2a2a2a', color: '#999', padding: '12px', cursor: 'pointer' }}>
                START OVER INSTEAD
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start', gap: 12 }}>
              <button
                onClick={onStart}
                style={{ fontFamily: S.bebas, fontSize: 22, letterSpacing: '0.08em', background: S.white, color: S.black, border: 'none', padding: '16px 56px', cursor: 'pointer', transition: 'transform 0.15s' }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              >
                BEGIN ASSESSMENT
              </button>
              <div style={{ fontFamily: S.mono, fontSize: 10, color: '#999', letterSpacing: '0.15em' }}>~8 MINUTES · FREE · NO SIGNUP TO START</div>
            </div>
          )}
        </div>

        {/* Callouts · desktop: absolute right with leader lines */}
        {!isMobile && (
          <div style={{ position: 'absolute', zIndex: 3, right: '6%', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 30, width: 256 }}>
            {CALLOUTS.map(c => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ flexShrink: 0, width: 44, height: 1, background: 'linear-gradient(90deg, rgba(245,243,239,0) 0%, rgba(245,243,239,0.45) 100%)' }} />
                <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: '50%', border: '1px solid #4a4744', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalloutIcon name={c.icon} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: S.mono, fontSize: 11, letterSpacing: '0.12em', color: S.white, marginBottom: 5 }}>{c.label}</div>
                  <div style={{ fontFamily: S.cormorant, fontSize: 14, color: '#b0aca4', lineHeight: 1.4 }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Callouts · mobile: stacked list below content */}
        {isMobile && (
          <div style={{ position: 'relative', zIndex: 3, width: 'calc(100% + 48px)', marginLeft: -24, marginTop: 44, padding: '28px 24px 4px', borderTop: '1px solid #1f1f1f', background: S.black, display: 'flex', flexDirection: 'column', gap: 22 }}>
            {CALLOUTS.map(c => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flexShrink: 0, width: 42, height: 42, borderRadius: '50%', border: '1px solid #4a4744', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalloutIcon name={c.icon} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: S.mono, fontSize: 11, letterSpacing: '0.12em', color: S.white, marginBottom: 4 }}>{c.label}</div>
                  <div style={{ fontFamily: S.cormorant, fontSize: 15, color: '#b0aca4', lineHeight: 1.4 }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scroll indicator (desktop) */}
        {!isMobile && (
          <button
            onClick={scrollToProfile}
            style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 5, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: scrolled ? 0 : 1, transition: 'opacity 0.4s' }}
          >
            <span style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.18em', color: '#999' }}>SEE WHAT YOU'LL DISCOVER</span>
            <span style={{ display: 'block', width: 1, height: 32, background: '#3a3a3a', position: 'relative', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', top: 0, left: 0, width: '100%', background: '#aaa', animation: 'scrollLine 1.6s ease-in-out infinite' }} />
            </span>
          </button>
        )}
      </div>

      {/* ── PROBLEM NARRATIVE (light) ─────────────────────────── */}
      <div style={{ background: S.white, padding: pad, borderTop: `1px solid ${S.rule}` }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.25em', color: S.mid, marginBottom: 24 }}>WHY THE USUAL ADVICE FAILS</div>
          <p style={{ fontFamily: S.cormorant, fontSize: 'clamp(20px, 2.4vw, 26px)', color: '#2a2a2a', lineHeight: 1.55, margin: '0 0 24px' }}>
            Most people spend years trying to improve themselves. They read the productivity books, download the new systems, try to white-knuckle their way to more discipline.
          </p>
          <p style={{ fontFamily: S.cormorant, fontSize: 'clamp(18px, 2vw, 21px)', color: '#555', lineHeight: 1.7, margin: '0 0 28px' }}>
            The same patterns keep showing up anyway. You procrastinate on the things you care about. You're sharp in some environments and flat in others. Some work feels effortless, some feels impossible, and you can't always say why.
          </p>
          <p style={{ fontFamily: S.cormorant, fontSize: 'clamp(22px, 2.8vw, 32px)', fontStyle: 'italic', color: S.black, lineHeight: 1.4, margin: '0 0 28px' }}>
            Maybe the problem was never effort. Maybe you've been following instructions written for someone else's brain.
          </p>
          <p style={{ fontFamily: S.cormorant, fontSize: 'clamp(16px, 1.8vw, 18px)', color: '#555', lineHeight: 1.7, margin: 0 }}>
            This assessment shows how your mind actually creates energy, handles change, processes information, and performs at its best. So you can stop fighting your wiring and start building around it.
          </p>
        </div>
      </div>

      {/* ── OBJECTIONS (dark) ─────────────────────────────────── */}
      <div style={{ background: S.black, padding: pad, borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 48 }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.25em', color: '#444', marginBottom: 14 }}>SOUND FAMILIAR?</div>
            <h2 style={{ fontFamily: S.bebas, fontSize: 'clamp(30px, 5vw, 52px)', color: S.white, lineHeight: 1, margin: 0 }}>YOU'VE PROBABLY SAID THESE THINGS</h2>
          </div>
          <div>
            {[
              "I know exactly what I need to do. I just can't make myself do it.",
              "I do incredible work when I'm interested, and struggle when I'm not.",
              "I start a lot of things and lose momentum.",
              "I've tried every productivity system.",
              "I feel like I'm capable of more.",
              "I don't get why some things come easy for other people.",
            ].map((q, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'baseline', padding: '18px 0', borderBottom: '1px solid #1a1a1a' }}>
                <span style={{ fontFamily: S.mono, fontSize: 10, color: '#3a3a3a', flexShrink: 0 }}>0{i + 1}</span>
                <p style={{ fontFamily: S.cormorant, fontSize: 'clamp(17px, 2vw, 21px)', fontStyle: 'italic', color: S.onDarkBody, lineHeight: 1.5, margin: 0 }}>"{q}"</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: S.cormorant, fontSize: 18, color: '#999', lineHeight: 1.65, margin: '28px 0 0', textAlign: 'center' }}>
            Every one of these is a clue. The assessment surfaces the pattern underneath.
          </p>
        </div>
      </div>

      {/* ── WHAT YOU'LL DISCOVER (light) ──────────────────────── */}
      <div style={{ background: S.white, padding: pad, borderTop: `1px solid ${S.rule}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ marginBottom: isMobile ? 32 : 52 }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.25em', color: S.mid, marginBottom: 14 }}>WHAT YOU'LL DISCOVER</div>
            <h2 style={{ fontFamily: S.bebas, fontSize: 'clamp(32px, 5vw, 56px)', color: S.black, lineHeight: 0.95, margin: 0 }}>FOUR THINGS YOU'LL FINALLY SEE CLEARLY</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 0 : 1, background: isMobile ? 'transparent' : S.rule, border: isMobile ? 'none' : `1px solid ${S.rule}` }}>
            {[
              { t: 'What Drains You', d: 'The environments, expectations, and situations that quietly burn your energy.' },
              { t: 'What Unlocks You', d: 'The conditions where focus, momentum, and clarity show up on their own.' },
              { t: "What You're Built For", d: "The work, roles, and challenges that fit how you're wired." },
              { t: 'Why You Get Stuck', d: 'The hidden patterns behind procrastination, overwhelm, and inconsistency.' },
            ].map(({ t, d }) => (
              <div key={t} style={{ background: S.white, padding: isMobile ? '22px 0' : '32px 36px', borderBottom: isMobile ? `1px solid ${S.rule}` : 'none' }}>
                <div style={{ fontFamily: S.bebas, fontSize: 24, color: S.black, letterSpacing: '0.02em', marginBottom: 10, lineHeight: 1.05 }}>{t}</div>
                <p style={{ fontFamily: S.cormorant, fontSize: 17, color: '#555', lineHeight: 1.6, margin: 0 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS STRIP ─────────────────────────────────────── */}
      <div style={{ background: S.black, padding: '28px 8%', borderTop: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: isMobile ? 'space-between' : 'space-around', gap: 0, flexWrap: 'wrap' }}>
          {[
            { num: '36', label: 'QUESTIONS' },
            { num: '16', label: 'REPORT SECTIONS' },
            { num: '4', label: 'DIMENSIONS' },
            { num: '~8', label: 'MINUTES' },
          ].map(({ num, label }) => (
            <div key={label} style={{ textAlign: 'center', padding: '4px 12px' }}>
              <div style={{ fontFamily: S.bebas, fontSize: isMobile ? 28 : 38, color: S.white, lineHeight: 1 }}>{num}</div>
              <div style={{ fontFamily: S.mono, fontSize: 7, letterSpacing: '0.22em', color: '#555' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DARK: Animated profile visualization ─────────────── */}
      <div ref={profileRef} style={{ background: S.black, padding: pad, borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
          <div style={{ marginBottom: isMobile ? 48 : 0 }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.25em', color: '#444', marginBottom: 16 }}>YOUR BEHAVIORAL FINGERPRINT</div>
            <h2 style={{ fontFamily: S.bebas, fontSize: 'clamp(34px, 4.6vw, 54px)', color: S.white, lineHeight: 0.95, margin: '0 0 20px' }}>
              WHY SOME THINGS<br />FEEL EFFORTLESS,<br />AND OTHERS NEVER DO.
            </h2>
            <p style={{ fontFamily: S.cormorant, fontSize: 18, fontStyle: 'italic', color: S.onDarkBody, lineHeight: 1.65, maxWidth: 360 }}>
              Most advice assumes everyone works the same way. Your results are built on four behavioral dimensions that show how your mind operates under pressure, uncertainty, structure, and change. Together they explain why some environments light you up and others wear you down.
            </p>
          </div>
          <div>
            {MODES.map(m => {
              const isDom = m === SAMPLE_DOM;
              return (
                <div key={m} style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                      <span style={{ fontFamily: S.bebas, fontSize: 17, color: isDom ? S.white : S.onDarkDim, letterSpacing: '0.04em' }}>{LABELS[m]}</span>
                      {isDom && <span style={{ fontFamily: S.mono, fontSize: 7, letterSpacing: '0.16em', color: '#555' }}>DOMINANT</span>}
                    </div>
                    <span style={{ fontFamily: S.bebas, fontSize: 26, color: isDom ? S.white : '#555', lineHeight: 1 }}>{displayEnergy[m]}%</span>
                  </div>
                  <div style={{ height: 2, background: '#1a1a1a', borderRadius: 1 }}>
                    <div style={{
                      height: '100%', borderRadius: 1,
                      background: isDom ? S.white : '#3a3a3a',
                      width: profileVisible ? `${SAMPLE_ENERGY[m]}%` : '0%',
                      transition: 'width 1.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }} />
                  </div>
                </div>
              );
            })}
            <div style={{ fontFamily: S.mono, fontSize: 7, letterSpacing: '0.2em', color: '#333', marginTop: 20, borderTop: '1px solid #1a1a1a', paddingTop: 14 }}>
              SAMPLE PROFILE · QUICK START DOMINANT
            </div>
          </div>
        </div>
      </div>

      {/* ── THE SCIENCE (dark) ────────────────────────────────── */}
      <div style={{ background: '#0f0f0f', padding: pad, borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          {/* Text */}
          <div style={{ marginBottom: isMobile ? 44 : 0 }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.25em', color: '#444', marginBottom: 16 }}>THE SCIENCE</div>
            <h2 style={{ fontFamily: S.bebas, fontSize: 'clamp(32px, 4vw, 50px)', color: S.white, lineHeight: 0.92, margin: '0 0 20px' }}>
              THE SCIENCE OF<br />HOW YOU ACT.
            </h2>
            <p style={{ fontFamily: S.cormorant, fontSize: 18, color: S.onDarkBody, lineHeight: 1.7, margin: '0 0 16px', maxWidth: 380 }}>
              Your mind works in three parts: what you know, how you feel, and how you instinctively take action. Most tools measure the first two. Personality types, IQ, strengths quizzes, they all describe how you think and feel.
            </p>
            <p style={{ fontFamily: S.cormorant, fontSize: 18, color: S.onDarkBody, lineHeight: 1.7, margin: 0, maxWidth: 380 }}>
              This measures the third part, the doing. Conative psychology has been studied for more than 40 years. It maps how you naturally gather information, create order, handle risk, and turn ideas into something real, the part that predicts where you'll thrive, where you'll stall, and where you'll burn out.
            </p>
          </div>
          {/* Three parts of the mind */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#1e1e1e', border: '1px solid #1e1e1e' }}>
            {[
              { k: 'COGNITIVE', d: 'What you know. How you think.', on: false },
              { k: 'AFFECTIVE', d: 'How you feel. What you prefer.', on: false },
              { k: 'CONATIVE',  d: 'How you instinctively take action.', on: true },
            ].map(({ k, d, on }) => (
              <div key={k} style={{ background: on ? '#181818' : '#111', padding: isMobile ? '20px 22px' : '24px 28px', borderLeft: on ? `2px solid ${S.white}` : '2px solid transparent', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontFamily: S.bebas, fontSize: 22, letterSpacing: '0.04em', color: on ? S.white : '#555' }}>{k}</span>
                  {on && <span style={{ fontFamily: S.mono, fontSize: 7, letterSpacing: '0.16em', color: '#888' }}>WHAT WE MEASURE</span>}
                </div>
                <div style={{ fontFamily: S.cormorant, fontSize: 15, fontStyle: 'italic', color: on ? S.onDarkBody : '#555', lineHeight: 1.4 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURE 1: Wiring (light) ─────────────────────────── */}
      <div style={{ background: S.white, padding: pad, borderTop: `1px solid ${S.rule}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          {/* Mock report card */}
          <div style={{ border: `1px solid ${S.rule}`, padding: isMobile ? '24px 20px' : '32px 36px', marginBottom: isMobile ? 40 : 0 }}>
            <div style={{ fontFamily: S.mono, fontSize: 8, letterSpacing: '0.2em', color: S.mid, marginBottom: 6 }}>01 · WHAT THIS MEANS</div>
            <div style={{ height: 1, background: S.rule, marginBottom: 20 }} />
            <div style={{ fontFamily: S.bebas, fontSize: 22, color: S.black, letterSpacing: '0.03em', marginBottom: 14, lineHeight: 1.05 }}>QUICK START · DOMINANT</div>
            <p style={{ fontFamily: S.cormorant, fontSize: 16, fontStyle: 'italic', color: '#444', lineHeight: 1.75, margin: '0 0 18px' }}>
              "Your brain runs on novelty. Starting things is where your energy lives. You don't stall because you're lazy. You stall because your brain already moved to the next problem."
            </p>
            <div style={{ borderTop: `1px solid ${S.rule}`, paddingTop: 14, display: 'flex', gap: 16 }}>
              {['QS · Innovate', 'FF · Explain'].map(tag => (
                <div key={tag} style={{ fontFamily: S.mono, fontSize: 7, letterSpacing: '0.14em', color: S.mid, background: '#f0ede8', padding: '5px 9px' }}>{tag}</div>
              ))}
            </div>
          </div>
          {/* Text */}
          <div>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.25em', color: S.mid, marginBottom: 16 }}>SECTION 01</div>
            <h2 style={{ fontFamily: S.bebas, fontSize: 'clamp(32px, 4vw, 50px)', color: S.black, lineHeight: 0.92, margin: '0 0 20px' }}>
              FINALLY, AN<br />EXPLANATION<br />THAT FITS.
            </h2>
            <p style={{ fontFamily: S.cormorant, fontSize: 18, fontStyle: 'italic', color: '#555', lineHeight: 1.65, maxWidth: 360 }}>
              You've called yourself lazy. Inconsistent. Undisciplined. Maybe you were just operating outside the conditions your brain was built for. The point is simple: understand who you already are, then work with it.
            </p>
          </div>
        </div>
      </div>

      {/* ── FEATURE 2: Career Map (dark) ──────────────────────── */}
      <div style={{ background: '#0f0f0f', padding: pad, borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          {/* Text */}
          <div style={{ marginBottom: isMobile ? 48 : 0 }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.25em', color: '#444', marginBottom: 16 }}>SECTION 15</div>
            <h2 style={{ fontFamily: S.bebas, fontSize: 'clamp(32px, 4vw, 50px)', color: S.white, lineHeight: 0.92, margin: '0 0 20px' }}>
              FIND WORK THAT<br />FEELS LIKE<br />CHEATING.
            </h2>
            <p style={{ fontFamily: S.cormorant, fontSize: 18, fontStyle: 'italic', color: S.onDarkBody, lineHeight: 1.65, maxWidth: 360 }}>
              Skills tell you what you can do. Wiring tells you what you'll actually enjoy doing. Every role is scored against your behavioral profile, so you can see which careers fit how you operate and which ones cost you energy just to stay engaged.
            </p>
          </div>
          {/* Mock career card */}
          <div style={{ border: '1px solid #1e1e1e', padding: isMobile ? '24px 20px' : '32px 36px', background: '#111' }}>
            <div style={{ fontFamily: S.mono, fontSize: 8, letterSpacing: '0.2em', color: '#444', marginBottom: 6 }}>15 · CAREER MAP</div>
            <div style={{ height: 1, background: '#1e1e1e', marginBottom: 20 }} />
            {[
              { role: 'Startup Founder', pct: 94, hot: true },
              { role: 'Creative Director', pct: 82, hot: true },
              { role: 'Product Manager', pct: 71, hot: false },
              { role: 'Researcher', pct: 48, hot: false },
              { role: 'Project Manager', pct: 31, hot: false },
              { role: 'Accountant', pct: 18, hot: false },
            ].map(({ role, pct: p, hot }) => (
              <div key={role} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontFamily: S.bebas, fontSize: 15, color: hot ? S.white : '#555', letterSpacing: '0.04em' }}>{role}</span>
                  <span style={{ fontFamily: S.mono, fontSize: 9, color: hot ? S.onDarkBody : '#333' }}>{p}%</span>
                </div>
                <div style={{ height: 2, background: '#1e1e1e' }}>
                  <div style={{ height: '100%', background: hot ? '#f5f3ef' : '#2a2a2a', width: `${p}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURE 3: Reset Protocol (light) ────────────────── */}
      <div style={{ background: S.white, padding: pad, borderTop: `1px solid ${S.rule}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          {/* Mock protocol card */}
          <div style={{ border: `1px solid ${S.rule}`, padding: isMobile ? '24px 20px' : '32px 36px', marginBottom: isMobile ? 40 : 0 }}>
            <div style={{ fontFamily: S.mono, fontSize: 8, letterSpacing: '0.2em', color: S.mid, marginBottom: 6 }}>11 · RESET PROTOCOL</div>
            <div style={{ height: 1, background: S.rule, marginBottom: 20 }} />
            <div style={{ fontFamily: S.bebas, fontSize: 18, color: S.black, marginBottom: 18, lineHeight: 1.1 }}>WHEN YOU'RE STUCK, DO THIS.</div>
            {[
              'Stop adding inputs. You have enough information.',
              'Pick one decision. Not the biggest, just the next.',
              'Set a 25-minute window. Ship something small inside it.',
              'Capture the 3 ideas that surfaced while you were stuck.',
              'Move the body for 10 minutes. Your brain resets on motion.',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 13, alignItems: 'flex-start' }}>
                <div style={{ fontFamily: S.mono, fontSize: 9, color: S.rule, flexShrink: 0, paddingTop: 1, minWidth: 16 }}>0{i + 1}</div>
                <div style={{ fontFamily: S.cormorant, fontSize: 15, color: '#444', lineHeight: 1.55 }}>{step}</div>
              </div>
            ))}
          </div>
          {/* Text */}
          <div>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.25em', color: S.mid, marginBottom: 16 }}>SECTION 11</div>
            <h2 style={{ fontFamily: S.bebas, fontSize: 'clamp(30px, 3.8vw, 46px)', color: S.black, lineHeight: 0.92, margin: '0 0 20px' }}>
              WHEN YOUR BRAIN<br />STALLS, THIS IS<br />THE WAY OUT.
            </h2>
            <p style={{ fontFamily: S.cormorant, fontSize: 18, fontStyle: 'italic', color: '#555', lineHeight: 1.65, maxWidth: 360 }}>
              Your report includes a reset protocol built around your dominant mode, made for how your brain actually restarts. A specific sequence that gets you moving when you're stuck.
            </p>
          </div>
        </div>
      </div>

      {/* ── ALL 16 SECTIONS overview (dark) ───────────────────── */}
      <div style={{ background: S.black, padding: pad, borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 48 : 64 }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.25em', color: '#444', marginBottom: 14 }}>THE COMPLETE REPORT</div>
            <h2 style={{ fontFamily: S.bebas, fontSize: 'clamp(28px, 5vw, 52px)', color: S.white, lineHeight: 1, margin: 0 }}>YOUR PERSONAL OPERATING MANUAL</h2>
            <p style={{ fontFamily: S.cormorant, fontSize: 17, fontStyle: 'italic', color: '#888', lineHeight: 1.6, margin: '14px auto 0', maxWidth: 440 }}>16 sections. All personalized. Every one generated from your profile and built to use today.</p>
          </div>

          {['WIRING', 'OPERATE', 'CAREER'].map(group => {
            const groupSections = SECTIONS.filter(s => s.group === group);
            const groupLabel = { WIRING: 'YOUR WIRING', OPERATE: 'HOW YOU OPERATE', CAREER: 'WORK & RELATIONSHIPS' }[group];
            return (
              <div key={group} style={{ marginBottom: 30 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                  <span style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.22em', color: '#9a958c', whiteSpace: 'nowrap' }}>{groupLabel}</span>
                  <span style={{ flex: 1, height: 1, background: '#1c1c1c' }} />
                  <span style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.18em', color: '#444', whiteSpace: 'nowrap' }}>{groupSections.length} SECTIONS</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
                  {groupSections.map((section) => {
                    const globalIndex = SECTIONS.indexOf(section);
                    const visible = globalIndex < cardsVisible;
                    return (
                      <div
                        key={section.num}
                        className="opm-card"
                        style={{
                          position: 'relative', overflow: 'hidden',
                          background: '#0d0d0d', border: '1px solid #1d1d1d',
                          padding: '18px 18px 20px',
                          opacity: visible ? 1 : 0,
                          transform: visible ? 'translateY(0)' : 'translateY(10px)',
                          transition: 'opacity 0.4s ease, transform 0.4s ease, border-color 0.25s ease, background 0.25s ease',
                        }}
                      >
                        <span style={{ position: 'absolute', top: 6, right: 12, fontFamily: S.bebas, fontSize: 46, lineHeight: 1, color: '#171717', pointerEvents: 'none' }}>{section.num}</span>
                        <div style={{ position: 'relative' }}>
                          <div style={{ fontFamily: S.bebas, fontSize: 19, color: S.white, letterSpacing: '0.02em', marginBottom: 8, lineHeight: 1.05 }}>{section.label}</div>
                          <div style={{ fontFamily: S.cormorant, fontSize: 15, color: '#9b968d', lineHeight: 1.5 }}>{section.reveals}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── THE REAL GOAL (dark) ──────────────────────────────── */}
      <div style={{ background: '#0f0f0f', padding: pad, borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.25em', color: '#444', marginBottom: 20 }}>THE REAL GOAL</div>
          <p style={{ fontFamily: S.cormorant, fontSize: 'clamp(24px, 3vw, 34px)', fontStyle: 'italic', color: S.white, lineHeight: 1.4, margin: '0 0 24px' }}>
            Self-awareness is just the start. Alignment is the point.
          </p>
          <p style={{ fontFamily: S.cormorant, fontSize: 'clamp(16px, 1.9vw, 19px)', color: S.onDarkBody, lineHeight: 1.7, margin: 0 }}>
            Understanding why you've felt on fire in some seasons and burned out in others. Why certain jobs fit and others grind. Why a system that works for your friend never worked for you. And what changes when you stop fighting your wiring and start building around it.
          </p>
        </div>
      </div>

      {/* ── BOTTOM CTA ──────────────────────────────────────── */}
      <div style={{ background: S.white, borderTop: `1px solid ${S.rule}`, padding: isMobile ? '72px 24px 96px' : '96px 40px 120px', textAlign: 'center' }}>
        <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.2em', color: S.mid, marginBottom: 20 }}>READY TO SEE YOURS?</div>
        <h3 style={{ fontFamily: S.bebas, fontSize: 'clamp(38px, 5.5vw, 64px)', color: S.black, margin: '0 0 20px', lineHeight: 0.92 }}>
          DISCOVER HOW YOUR<br />MIND ACTUALLY WORKS
        </h3>
        <p style={{ fontFamily: S.cormorant, fontSize: 18, fontStyle: 'italic', color: '#555', maxWidth: 420, margin: '0 auto 40px', lineHeight: 1.65 }}>
          Eight minutes. Thirty-six questions. One complete behavioral fingerprint, and the operating manual that comes with it.
        </p>
        <button
          onClick={onStart}
          style={{ fontFamily: S.bebas, fontSize: 22, letterSpacing: '0.08em', background: S.black, color: S.white, border: 'none', padding: '18px 64px', cursor: 'pointer', transition: 'transform 0.15s' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        >
          BEGIN ASSESSMENT
        </button>
        <div style={{ fontFamily: S.mono, fontSize: 10, color: S.mid, marginTop: 16, letterSpacing: '0.15em' }}>~8 MINUTES · FREE</div>
      </div>

      <style>{`
        @keyframes scrollLine {
          0%   { height: 0; top: 0; }
          50%  { height: 100%; top: 0; }
          100% { height: 0; top: 100%; }
        }
        .opm-card:hover { border-color: #3a3a3a !important; background: #141414 !important; }
      `}</style>

      {onTestFill && (
        <button onClick={onTestFill} style={{ position: 'fixed', bottom: 20, right: 24, fontFamily: S.mono, fontSize: 9, letterSpacing: '0.12em', background: 'transparent', border: 'none', color: S.rule, cursor: 'pointer', padding: '8px 12px' }}>
          FILL RANDOM + SKIP TO RESULTS
        </button>
      )}
    </div>
  );
}
