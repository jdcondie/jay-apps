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
  { num: '04', group: 'WIRING',  label: 'Your Strengths',   reveals: 'What you naturally do better than most.', sample: 'Four dimensions. Four distinct strengths — each with a shadow side.' },
  { num: '05', group: 'WIRING',  label: 'Top Strengths',    reveals: 'Your two highest-energy abilities, expanded.', sample: 'Innovate + Explain — the combination that makes your output hard to replicate.' },
  { num: '06', group: 'WIRING',  label: 'Unique Ability',   reveals: 'A one-sentence statement of your superpower.', sample: '[Top wiring] + [second wiring] applied to [your specific domain].' },
  { num: '07', group: 'WIRING',  label: 'Watch For',        reveals: 'Where your strengths flip into liabilities.', sample: '"You start 10 things and finish 3. The other 7 drain the people around you."' },
  { num: '08', group: 'OPERATE', label: 'Friction Points',  reveals: 'The conditions that quietly drain your energy.', sample: '"Being forced to maintain something you\'ve already solved in your head."' },
  { num: '09', group: 'OPERATE', label: 'Your Success',     reveals: 'What your wiring is actually built to optimize.', sample: '"You are wired to launch, iterate, and improve — not to maintain."' },
  { num: '10', group: 'OPERATE', label: 'Procrastination',  reveals: 'Why you really stall — and what breaks it.', sample: '"You\'re not lazy. You\'re bored. The task is already solved in your head."' },
  { num: '11', group: 'OPERATE', label: 'Reset Protocol',   reveals: 'A 5-step sequence for your dominant mode.', sample: 'Not generic advice. Built for how your brain specifically restarts.' },
  { num: '12', group: 'OPERATE', label: 'Daily Rules',      reveals: 'Baseline conditions to stay consistently sharp.', sample: 'Three rules for morning, mid-day, and wind-down.' },
  { num: '13', group: 'CAREER',  label: 'Communication',    reveals: 'What people who work with you need to know.', sample: '"Give me the problem, not the process. I\'ll figure out the path."' },
  { num: '14', group: 'CAREER',  label: 'Under Stress',     reveals: 'How your behavior shifts when your tank is empty.', sample: '"You scatter. Seven new ideas surface and none of them get finished."' },
  { num: '15', group: 'CAREER',  label: 'Career Map',       reveals: '78 roles scored and ranked by wiring alignment.', sample: 'Startup Founder 94%  ·  Project Manager 31%  ·  Researcher 48%' },
  { num: '16', group: 'CAREER',  label: 'Money Patterns',   reveals: 'How your wiring shapes financial decisions.', sample: '"Wired for risk. Early mover. Watch: over-concentration in speculative bets."' },
];

// Head & shoulders profile silhouette, facing right (viewBox 0 0 380 480)
const HEAD_PATH = "M165 64 C120 64 90 100 88 148 C87 176 99 196 103 214 C107 232 101 246 84 258 C58 277 34 302 20 342 C12 366 9 384 8 414 L8 480 L372 480 L372 392 C372 348 344 318 305 304 C277 294 261 286 258 262 C256 250 257 242 262 234 C268 230 277 230 284 224 C289 220 287 216 291 211 C297 207 301 209 303 204 C305 200 301 197 303 193 C309 189 320 191 322 183 C323 177 314 175 308 173 C303 171 301 167 300 161 C299 155 305 153 306 147 C307 141 300 139 298 133 C297 125 300 114 296 104 C290 84 205 64 165 64 Z";

// Synapse nodes that sit on the brain network and pulse
const NODES = [
  { x: 74, y: 26 }, { x: 58, y: 95 }, { x: 50, y: 136 }, { x: 95, y: 86 },
  { x: 78, y: 174 }, { x: 44, y: 172 }, { x: 120, y: 163 }, { x: 86, y: 200 },
  { x: 206, y: 26 }, { x: 222, y: 95 }, { x: 230, y: 136 }, { x: 185, y: 86 },
  { x: 202, y: 174 }, { x: 236, y: 172 }, { x: 160, y: 163 }, { x: 194, y: 200 },
  { x: 140, y: 30 }, { x: 140, y: 118 }, { x: 140, y: 190 },
];

function BrainDiagram({ color = '#0a0a0a', size = 360, glow = false }) {
  const h = Math.round(size * 220 / 280);
  const line = glow ? '#f5f3ef' : color;
  const node = glow ? '#ffffff' : color;
  return (
    <svg width={size} height={h} viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      {glow && (
        <defs>
          <radialGradient id="brainGlow" cx="50%" cy="48%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id="nodeBlur" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>
      )}
      {glow && <ellipse cx="140" cy="112" rx="150" ry="120" fill="url(#brainGlow)" />}

      {/* LEFT HEMISPHERE outer */}
      <path
        d="M140 30 C125 24,98 20,74 26 C50 32,28 50,20 76 C12 102,16 132,28 156 C40 178,62 192,86 200 C108 207,128 208,140 206"
        stroke={line} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* LEFT gyri */}
      <path d="M68 46 C56 60,50 78,58 95" stroke={line} strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M44 88 C38 104,40 122,50 136" stroke={line} strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M98 36 C88 52,86 70,95 86" stroke={line} strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M72 140 C66 152,68 166,78 174" stroke={line} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M32 140 C30 152,34 164,44 172" stroke={line} strokeWidth="0.85" strokeLinecap="round" fill="none" opacity="0.45"/>
      <path d="M114 132 C108 144,110 156,120 163" stroke={line} strokeWidth="0.85" strokeLinecap="round" fill="none" opacity="0.45"/>

      {/* RIGHT HEMISPHERE outer */}
      <path
        d="M140 30 C155 24,182 20,206 26 C230 32,252 50,260 76 C268 102,264 132,252 156 C240 178,218 192,194 200 C172 207,152 208,140 206"
        stroke={line} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* RIGHT gyri */}
      <path d="M212 46 C224 60,230 78,222 95" stroke={line} strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M236 88 C242 104,240 122,230 136" stroke={line} strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M182 36 C192 52,194 70,185 86" stroke={line} strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M208 140 C214 152,212 166,202 174" stroke={line} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M248 140 C250 152,246 164,236 172" stroke={line} strokeWidth="0.85" strokeLinecap="round" fill="none" opacity="0.45"/>
      <path d="M166 132 C172 144,170 156,160 163" stroke={line} strokeWidth="0.85" strokeLinecap="round" fill="none" opacity="0.45"/>

      {/* Center divide */}
      <line x1="140" y1="10" x2="140" y2="30" stroke={line} strokeWidth="1.0" opacity="0.4"/>
      <line x1="140" y1="30" x2="140" y2="206" stroke={line} strokeWidth="0.75" strokeDasharray="4 3" opacity="0.35"/>

      {/* Synapse nodes — only when glowing */}
      {glow && NODES.map((n, i) => (
        <g key={i} style={{ animation: `synapse 3.2s ease-in-out ${(i % 7) * 0.45}s infinite` }}>
          <circle cx={n.x} cy={n.y} r="4.5" fill={node} filter="url(#nodeBlur)" opacity="0.7" />
          <circle cx={n.x} cy={n.y} r="1.7" fill={node} />
        </g>
      ))}

      {glow && (
        <style>{`
          @keyframes synapse {
            0%, 100% { opacity: 0.25; }
            50%      { opacity: 1; }
          }
        `}</style>
      )}
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

      {/* ── HERO (silhouette against the sun) ────────────────── */}
      <div style={{
        minHeight: '100vh',
        background: S.black,
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '120px 24px 90px' : '80px 8% 60px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* SUN — radial amber glow */}
        <div style={{
          position: 'absolute', top: isMobile ? '16%' : '50%',
          right: isMobile ? '50%' : '24%',
          transform: isMobile ? 'translate(50%,-30%)' : 'translate(50%,-50%)',
          width: isMobile ? 380 : 720, height: isMobile ? 380 : 720, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,206,138,0.60) 0%, rgba(255,158,72,0.34) 30%, rgba(255,120,44,0.12) 50%, rgba(255,100,40,0) 70%)',
          zIndex: 1, pointerEvents: 'none',
        }} />
        {/* SUN bright core */}
        <div style={{
          position: 'absolute', top: isMobile ? '16%' : '50%',
          right: isMobile ? '50%' : '24%',
          transform: isMobile ? 'translate(50%,-30%)' : 'translate(50%,-50%)',
          width: isMobile ? 150 : 300, height: isMobile ? 150 : 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,232,196,0.85) 0%, rgba(255,196,128,0.4) 45%, rgba(255,170,90,0) 75%)',
          zIndex: 1, pointerEvents: 'none',
        }} />

        {/* SILHOUETTE — head & shoulders profile (desktop) */}
        {!isMobile && (
          <div style={{ position: 'absolute', top: '50%', right: '17%', transform: 'translateY(-26%)', zIndex: 2, pointerEvents: 'none' }}>
            <svg width="440" height="566" viewBox="0 0 380 480" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d={HEAD_PATH} fill="#050403" />
              {/* warm rim light — face side only */}
              <path d={HEAD_PATH} fill="none" stroke="rgba(255,190,120,0.5)" strokeWidth="1.5" strokeDasharray="640 460" strokeDashoffset="20" />
              {/* faint synapse glints inside the head */}
              {[[150,150],[178,196],[132,170],[200,150],[164,224]].map(([x,y],i)=>(
                <circle key={i} cx={x} cy={y} r="2.4" fill="rgba(255,210,150,0.5)" style={{ animation:`synapse 3.4s ease-in-out ${i*0.5}s infinite` }} />
              ))}
            </svg>
          </div>
        )}

        {/* dark scrim for text legibility */}
        <div style={{ position: 'absolute', inset: 0, background: isMobile ? 'linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.75) 60%, #0a0a0a 100%)' : 'linear-gradient(90deg, #0a0a0a 0%, rgba(10,10,10,0.85) 28%, rgba(10,10,10,0.1) 55%, rgba(10,10,10,0) 70%)', zIndex: 2, pointerEvents: 'none' }} />

        {/* grain overlay */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.09, mixBlendMode: 'overlay', zIndex: 3, pointerEvents: 'none' }}>
          <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" /></filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

        {/* Content */}
        <div style={{ flex: '0 0 auto', maxWidth: isMobile ? '100%' : 560, textAlign: isMobile ? 'center' : 'left', position: 'relative', zIndex: 4 }}>
          <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.3em', color: '#999', marginBottom: 28 }}>
            BEHAVIORAL ASSESSMENT / PERSONAL OPERATING MANUAL
          </div>
          <h1 style={{ fontFamily: S.bebas, fontSize: 'clamp(64px, 9vw, 120px)', lineHeight: 0.86, color: S.white, letterSpacing: -1, margin: '0 0 24px' }}>
            HOW ARE<br />YOU WIRED?
          </h1>
          <p style={{ fontFamily: S.cormorant, fontSize: 'clamp(19px, 2.2vw, 25px)', fontStyle: 'italic', color: S.white, lineHeight: 1.5, margin: '0 0 16px', maxWidth: 460 }}>
            The instruction manual you were never handed for your own mind.
          </p>
          <p style={{ fontFamily: S.cormorant, fontSize: 'clamp(16px, 1.8vw, 18px)', color: S.onDarkBody, lineHeight: 1.65, margin: '0 0 40px', maxWidth: 420 }}>
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
                  QUESTION {resumeData.qIndex + 1} OF {total} — {pct}% COMPLETE
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

        {/* Scroll indicator */}
        <button
          onClick={scrollToProfile}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 5, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: scrolled ? 0 : 1, transition: 'opacity 0.4s' }}
        >
          <span style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.18em', color: '#999' }}>SEE WHAT YOU'LL DISCOVER</span>
          <span style={{ display: 'block', width: 1, height: 32, background: '#3a3a3a', position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', top: 0, left: 0, width: '100%', background: '#aaa', animation: 'scrollLine 1.6s ease-in-out infinite' }} />
          </span>
        </button>
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
            <h2 style={{ fontFamily: S.bebas, fontSize: 'clamp(36px, 5vw, 58px)', color: S.white, lineHeight: 0.92, margin: '0 0 20px' }}>
              FOUR NUMBERS.<br />ONE COMPLETE<br />PICTURE.
            </h2>
            <p style={{ fontFamily: S.cormorant, fontSize: 18, fontStyle: 'italic', color: S.onDarkBody, lineHeight: 1.65, maxWidth: 340 }}>
              Each dimension reveals a different way your mind works under pressure. Together, they explain why you thrive in some environments and drain fast in others.
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
              SAMPLE PROFILE — QUICK START DOMINANT
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURE 1: Wiring (light) ─────────────────────────── */}
      <div style={{ background: S.white, padding: pad, borderTop: `1px solid ${S.rule}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: isMobile ? 'block' : 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          {/* Mock report card */}
          <div style={{ border: `1px solid ${S.rule}`, padding: isMobile ? '24px 20px' : '32px 36px', marginBottom: isMobile ? 40 : 0 }}>
            <div style={{ fontFamily: S.mono, fontSize: 8, letterSpacing: '0.2em', color: S.mid, marginBottom: 6 }}>01 — WHAT THIS MEANS</div>
            <div style={{ height: 1, background: S.rule, marginBottom: 20 }} />
            <div style={{ fontFamily: S.bebas, fontSize: 22, color: S.black, letterSpacing: '0.03em', marginBottom: 14, lineHeight: 1.05 }}>QUICK START — DOMINANT</div>
            <p style={{ fontFamily: S.cormorant, fontSize: 16, fontStyle: 'italic', color: '#444', lineHeight: 1.75, margin: '0 0 18px' }}>
              "Your brain runs on novelty. Starting things is where your energy lives. You don't avoid finishing because you're lazy — you avoid it because your brain has already moved to the next problem."
            </p>
            <div style={{ borderTop: `1px solid ${S.rule}`, paddingTop: 14, display: 'flex', gap: 16 }}>
              {['QS — Innovate', 'FF — Explain'].map(tag => (
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
            <p style={{ fontFamily: S.cormorant, fontSize: 18, fontStyle: 'italic', color: '#555', lineHeight: 1.65, maxWidth: 340 }}>
              Not a personality type. Not a horoscope. A plain-language breakdown of how your brain actually works — and why certain environments bring out your best.
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
              78 ROLES.<br />RANKED BY<br />YOUR WIRING.
            </h2>
            <p style={{ fontFamily: S.cormorant, fontSize: 18, fontStyle: 'italic', color: S.onDarkBody, lineHeight: 1.65, maxWidth: 340 }}>
              Every role scored against your exact behavioral profile. See which careers are built for how you work — and which ones will quietly drain you by Wednesday.
            </p>
          </div>
          {/* Mock career card */}
          <div style={{ border: '1px solid #1e1e1e', padding: isMobile ? '24px 20px' : '32px 36px', background: '#111' }}>
            <div style={{ fontFamily: S.mono, fontSize: 8, letterSpacing: '0.2em', color: '#444', marginBottom: 6 }}>15 — CAREER MAP</div>
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
            <div style={{ fontFamily: S.mono, fontSize: 8, letterSpacing: '0.2em', color: S.mid, marginBottom: 6 }}>11 — RESET PROTOCOL</div>
            <div style={{ height: 1, background: S.rule, marginBottom: 20 }} />
            <div style={{ fontFamily: S.bebas, fontSize: 18, color: S.black, marginBottom: 18, lineHeight: 1.1 }}>WHEN YOU'RE STUCK, DO THIS.</div>
            {[
              'Stop adding inputs. You have enough information.',
              'Pick one decision — not the biggest, just the next.',
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
            <h2 style={{ fontFamily: S.bebas, fontSize: 'clamp(32px, 4vw, 50px)', color: S.black, lineHeight: 0.92, margin: '0 0 20px' }}>
              BUILT FOR HOW<br />YOUR BRAIN<br />RESTARTS.
            </h2>
            <p style={{ fontFamily: S.cormorant, fontSize: 18, fontStyle: 'italic', color: '#555', lineHeight: 1.65, maxWidth: 340 }}>
              Generic productivity advice doesn't account for wiring. Your reset protocol is built specifically for your dominant mode — steps that actually work for the way your mind moves.
            </p>
          </div>
        </div>
      </div>

      {/* ── ALL 16 SECTIONS overview (dark) ───────────────────── */}
      <div style={{ background: S.black, padding: pad, borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 48 : 64 }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.25em', color: '#444', marginBottom: 14 }}>THE COMPLETE REPORT</div>
            <h2 style={{ fontFamily: S.bebas, fontSize: 'clamp(28px, 5vw, 52px)', color: S.white, lineHeight: 1, margin: 0 }}>16 SECTIONS. ALL PERSONALIZED.</h2>
          </div>

          {['WIRING', 'OPERATE', 'CAREER'].map(group => {
            const groupSections = SECTIONS.filter(s => s.group === group);
            const groupLabel = { WIRING: 'YOUR WIRING', OPERATE: 'HOW YOU OPERATE', CAREER: 'WORKING WITH OTHERS / CAREER' }[group];
            return (
              <div key={group} style={{ marginBottom: 40 }}>
                <div style={{ fontFamily: S.mono, fontSize: 8, letterSpacing: '0.25em', color: '#333', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #1a1a1a' }}>
                  {groupLabel}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 0 }}>
                  {groupSections.map((section, i) => {
                    const globalIndex = SECTIONS.indexOf(section);
                    const visible = globalIndex < cardsVisible;
                    return (
                      <div
                        key={section.num}
                        style={{
                          padding: '14px 0',
                          borderBottom: '1px solid #1a1a1a',
                          paddingRight: (!isMobile && i % 2 === 0) ? 32 : 0,
                          paddingLeft: (!isMobile && i % 2 === 1) ? 32 : 0,
                          borderRight: (!isMobile && i % 2 === 0) ? '1px solid #1a1a1a' : 'none',
                          opacity: visible ? 1 : 0,
                          transform: visible ? 'translateY(0)' : 'translateY(10px)',
                          transition: 'opacity 0.4s ease, transform 0.4s ease',
                        }}
                      >
                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                          <div style={{ fontFamily: S.mono, fontSize: 9, color: '#2e2e2e', flexShrink: 0, minWidth: 22, textAlign: 'right', paddingTop: 2 }}>{section.num}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: S.bebas, fontSize: 15, color: S.white, letterSpacing: '0.03em', marginBottom: 3 }}>{section.label}</div>
                            <div style={{ fontFamily: S.mono, fontSize: 7, letterSpacing: '0.12em', color: '#3a3a3a' }}>{section.reveals}</div>
                          </div>
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

      {/* ── BOTTOM CTA ──────────────────────────────────────── */}
      <div style={{ background: S.white, borderTop: `1px solid ${S.rule}`, padding: isMobile ? '72px 24px 96px' : '96px 40px 120px', textAlign: 'center' }}>
        <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.2em', color: S.mid, marginBottom: 20 }}>READY TO SEE YOURS?</div>
        <h3 style={{ fontFamily: S.bebas, fontSize: 'clamp(40px, 6vw, 68px)', color: S.black, margin: '0 0 20px', lineHeight: 0.92 }}>
          FIND OUT HOW<br />YOU'RE WIRED
        </h3>
        <p style={{ fontFamily: S.cormorant, fontSize: 18, fontStyle: 'italic', color: '#555', maxWidth: 400, margin: '0 auto 40px', lineHeight: 1.65 }}>
          Eight minutes. 36 questions. A complete behavioral profile you'll actually use.
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
      `}</style>

      {onTestFill && (
        <button onClick={onTestFill} style={{ position: 'fixed', bottom: 20, right: 24, fontFamily: S.mono, fontSize: 9, letterSpacing: '0.12em', background: 'transparent', border: 'none', color: S.rule, cursor: 'pointer', padding: '8px 12px' }}>
          FILL RANDOM + SKIP TO RESULTS
        </button>
      )}
    </div>
  );
}
