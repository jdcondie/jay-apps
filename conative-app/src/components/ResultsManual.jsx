import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { STRENGTH_DATA, MODE_LABELS, DOMINANT_NARRATIVES, RESISTANCE_NARRATIVES, DANGER_ZONES, GAME_TYPE, LOOP_DESCRIPTION, DAILY_RULES, scorePercentile } from '../data/strengthData.js';
import SpectrumBar, { BEHAVIORAL_LINES, SPECTRUM_PAIRS } from './SpectrumBar.jsx';

// "More X than Y% of people" — non-judgmental, leans toward whichever pole they sit on
function percentileLine(mode, score) {
  const pct = scorePercentile(score); // 0-100 toward the high pole
  const pair = SPECTRUM_PAIRS[mode];
  if (pct >= 55) return `More ${pair.high.toLowerCase()}-driven than ${Math.min(99, pct)}% of people`;
  if (pct <= 45) return `More ${pair.low.toLowerCase()}-driven than ${Math.min(99, 100 - pct)}% of people`;
  return 'More balanced here than most people';
}

// Personalized intro line based on why they took the assessment (soft-start intent)
const INTENT_INTROS = {
  career: 'You came here about work. Your Career Map below is scored to this exact wiring.',
  self: 'You came here to understand yourself. Start with What This Means, then how you operate.',
  relationship: "You came here about working with others. Don't skip Communication and Under Stress.",
  curious: 'You came here curious. Fair warning: this tends to explain more than people expect.',
};
import { CAREER_ARCHETYPES } from '../data/careerData.js';
import { scoreCareerFit } from '../scoring/careerScoring.js';
import { S } from '../styles/theme.js';

const REPORT_CARDS = [
  { key: 'explain',        num: '01', label: 'What This Means',  desc: 'Your wiring in plain language' },
  { key: 'scores',         num: '02', label: 'Your Scores',       desc: 'Four dimensions and energy' },
  { key: 'game',           num: '03', label: 'Your Game',         desc: 'What you\'re wired to win at' },
  { key: 'strengths',      num: '04', label: 'Your Strengths',    desc: 'What you naturally do better' },
  { key: 'superpowers',    num: '05', label: 'Top Strengths',     desc: 'Where you have the most energy' },
  { key: 'ability',        num: '06', label: 'Unique Ability',    desc: 'Your one-sentence professional superpower' },
  { key: 'shadows',        num: '07', label: 'Watch For',         desc: 'Where your wiring works against you' },
  { key: 'danger',         num: '08', label: 'Friction Points',   desc: 'Conditions that drain you' },
  { key: 'success',        num: '09', label: 'Your Success',      desc: 'What your wiring optimizes for' },
  { key: 'procrastination',num: '10', label: 'Procrastination',   desc: 'Why you stall and how to unstick' },
  { key: 'reset',          num: '11', label: 'Reset Protocol',    desc: 'How to get back online fast' },
  { key: 'daily',          num: '12', label: 'Daily Rules',       desc: 'Baseline operating conditions' },
  { key: 'comms',          num: '13', label: 'Communication',     desc: 'What others should know' },
  { key: 'stress',         num: '14', label: 'Under Stress',      desc: 'What happens when your tank is low' },
  { key: 'careers',        num: '15', label: 'Career Map',        desc: '78 roles ranked by wiring fit' },
  { key: 'money',          num: '16', label: 'Money Patterns',    desc: 'How your wiring shapes financial decisions' },
];

const TOOL_CARDS = [
  { key: 'collab-card',    label: 'Collaboration Card',  desc: 'Share how to work with you',              external: true },
  { key: 'role-fit',       label: 'Role Fit Checker',    desc: 'Search 78 roles by energy fit',           external: true },
  { key: 'conflict',       label: 'Conflict Decoder',    desc: 'Decode friction with any MO code',        external: true },
  { key: 'chat',           label: 'Chat With Your MO',   desc: 'Ask anything about your wiring',          external: true },
  { key: 'stress-check',   label: 'Stress Detector',     desc: 'Identify what\'s draining you' },
  { key: 'decision',       label: 'Decision Filter',     desc: 'Score any opportunity against your wiring' },
  { key: 'compat',         label: 'Compatibility',       desc: 'Compare wiring with anyone' },
  { key: 'share',          label: 'Share Card',          desc: 'Send your profile to your team' },
  { key: 'checkin',        label: 'Weekly Check-In',     desc: 'How aligned was your week?' },
  { key: 'prompt',         label: 'Daily Prompt',        desc: 'Your wiring applied today' },
  { key: 'career-detail',  label: 'Career Deep-Dive',    desc: 'Your top 5 roles expanded' },
  { key: 'explain-results',label: 'Explain My Results',  desc: 'For someone who hasn\'t taken the test' },
  { key: 'role-check',     label: 'Role Strain Check',   desc: 'See where your job fights your wiring' },
];

const REPORT_GROUPS = [
  { id: 'wiring',  label: 'YOUR WIRING',                 keys: ['explain','scores','game','strengths','superpowers','ability','shadows'] },
  { id: 'operate', label: 'HOW YOU OPERATE',             keys: ['danger','success','procrastination','reset','daily'] },
  { id: 'career',  label: 'WORKING WITH OTHERS / CAREER',keys: ['comms','stress','careers','money'] },
];

export default function ResultsManual({ results, onBack, onTool }) {
  const { scores, energy: rawEnergy, zones: rawZones, mo, intent } = results;
  const modes = ['FF', 'FT', 'QS', 'IMP'];
  const isMobile = useIsMobile();

  const [activeSection, setActiveSection] = useState(null);
  const [homeFilter, setHomeFilter] = useState(null);
  const [careerFilter, setCareerFilter] = useState('all');
  const [expandedCareer, setExpandedCareer] = useState(null);
  const [stressSymptoms, setStressSymptoms] = useState([]);
  const [decisionAnswers, setDecisionAnswers] = useState({});
  const [partnerZones, setPartnerZones] = useState({ FF: null, FT: null, QS: null, IMP: null });
  const [compatResult, setCompatResult] = useState(null);
  const [weeklyRatings, setWeeklyRatings] = useState({ FF: 3, FT: 3, QS: 3, IMP: 3 });
  const [weeklySubmitted, setWeeklySubmitted] = useState(false);
  const [dailyDismissed, setDailyDismissed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [abilityDomain, setAbilityDomain] = useState('');
  const [roleSliders, setRoleSliders] = useState({ FF: null, FT: null, QS: null, IMP: null });
  const [zoneOverrides, setZoneOverrides] = useState({});
  const [feedback, setFeedback] = useState({ open: false, step: 'select', mode: null, answers: {} });

  const zones = { ...rawZones, ...zoneOverrides };
  const energy = { ...rawEnergy, ...Object.fromEntries(Object.entries(zoneOverrides).map(([m, z]) => [m, z === 'initiate' ? 75 : z === 'accommodate' ? 50 : 25])) };
  const dominant = modes.reduce((a, b) => energy[a] >= energy[b] ? a : b);
  const resistance = modes.reduce((a, b) => energy[a] <= energy[b] ? a : b);
  const strengths = Object.fromEntries(modes.map(m => [m, STRENGTH_DATA[m][zones[m]]]));
  const domData = DOMINANT_NARRATIVES[dominant];
  const resData = RESISTANCE_NARRATIVES[resistance];

  const toggleSection = (key) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  const goBack = () => { setActiveSection(null); setFeedback({ open: false, step: 'select', mode: null, answers: {} }); window.scrollTo(0, 0); };

  const RECAL_QS = {
    FF: [
      { id: 'ff1', text: "I need to fully understand something before I can act on it.", toward: 'initiate' },
      { id: 'ff2', text: "I prefer to get the headline and move rather than dig into all the details.", toward: 'counteract' },
      { id: 'ff3', text: "I research topics more deeply than most people think is necessary.", toward: 'initiate' },
      { id: 'ff4', text: "Too much background information before a decision slows me down.", toward: 'counteract' },
    ],
    FT: [
      { id: 'ft1', text: "I naturally build systems and routines for things I do repeatedly.", toward: 'initiate' },
      { id: 'ft2', text: "I adapt my approach easily rather than sticking to one method.", toward: 'counteract' },
      { id: 'ft3', text: "Incomplete or inconsistent workflows bother me more than most people.", toward: 'initiate' },
      { id: 'ft4', text: "I'd rather find my own path to a result than follow a set process.", toward: 'counteract' },
    ],
    QS: [
      { id: 'qs1', text: "Starting new things energizes me, even when old ones aren't finished.", toward: 'initiate' },
      { id: 'qs2', text: "I work best in stable, predictable environments.", toward: 'counteract' },
      { id: 'qs3', text: "I often act before having all the answers.", toward: 'initiate' },
      { id: 'qs4', text: "Too much change or uncertainty drains me more than it energizes me.", toward: 'counteract' },
    ],
    IMP: [
      { id: 'imp1', text: "I think more clearly when I can work with something tangible.", toward: 'initiate' },
      { id: 'imp2', text: "I prefer to work with ideas and concepts rather than physical materials.", toward: 'counteract' },
      { id: 'imp3', text: "I notice physical quality and craftsmanship more than most people do.", toward: 'initiate' },
      { id: 'imp4', text: "I'm more energized by planning and thinking than by hands-on execution.", toward: 'counteract' },
    ],
  };

  const calcNewZone = (mode, answers) => {
    let i = 0, c = 0;
    RECAL_QS[mode].forEach(q => {
      const a = answers[q.id];
      if (!a) return;
      if (q.toward === 'initiate') i += a; else c += a;
    });
    const net = i - c;
    return net >= 4 ? 'initiate' : net <= -4 ? 'counteract' : 'accommodate';
  };

  const TOOL_SECTION_KEYS = new Set(['stress-check', 'decision', 'compat', 'share', 'checkin', 'prompt', 'career-detail', 'explain-results', 'role-check']);

  const FeedbackPanel = ({ sectionKey }) => {
    if (TOOL_SECTION_KEYS.has(sectionKey)) return null;

    if (!feedback.open) {
      return (
        <div style={{ borderTop: `1px solid ${S.rule}`, padding: '28px 0 8px', textAlign: 'center' }}>
          <button
            onClick={() => setFeedback({ open: true, step: 'select', mode: null, answers: {} })}
            style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.12em', color: S.mid, background: 'transparent', border: `1px solid ${S.rule}`, padding: '8px 18px', cursor: 'pointer' }}
          >
            DOESN'T FEEL RIGHT?
          </button>
        </div>
      );
    }

    if (feedback.step === 'select') {
      return (
        <div style={{ borderTop: `1px solid ${S.rule}`, paddingTop: 28 }}>
          <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.18em', color: S.mid, marginBottom: 16 }}>WHICH DIMENSION FEELS OFF?</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {modes.map(m => (
              <button key={m}
                onClick={() => setFeedback(f => ({ ...f, step: 'questions', mode: m }))}
                style={{ padding: '14px', border: `1px solid ${S.rule}`, background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0ede8'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, letterSpacing: '0.12em', marginBottom: 4 }}>{MODE_LABELS[m]}</div>
                <div style={{ fontFamily: S.bebas, fontSize: 17, color: S.black }}>{strengths[m].name}</div>
                {zoneOverrides[m] && <div style={{ fontFamily: S.mono, fontSize: 9, color: '#16a34a', marginTop: 4 }}>RECALIBRATED</div>}
              </button>
            ))}
          </div>
          <button
            onClick={() => setFeedback({ open: false, step: 'select', mode: null, answers: {} })}
            style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, background: 'transparent', border: 'none', cursor: 'pointer', letterSpacing: '0.1em' }}
          >
            CANCEL
          </button>
        </div>
      );
    }

    if (feedback.step === 'questions') {
      const qs = RECAL_QS[feedback.mode];
      const allAnswered = qs.every(q => feedback.answers[q.id] !== undefined);
      return (
        <div style={{ borderTop: `1px solid ${S.rule}`, paddingTop: 28 }}>
          <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.15em', color: S.mid, marginBottom: 4 }}>{MODE_LABELS[feedback.mode]} — RECALIBRATION</div>
          <div style={{ fontFamily: S.bebas, fontSize: 26, color: S.black, marginBottom: 20 }}>4 QUESTIONS</div>
          {qs.map((q, qi) => (
            <div key={q.id} style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: S.cormorant, fontSize: 17, color: '#333', lineHeight: 1.55, marginBottom: 10, maxWidth: 'none' }}>{qi + 1}. {q.text}</p>
              <div style={{ display: 'flex', gap: 4 }}>
                {[{ v: 1, label: 'NOT ME' }, { v: 2, label: '2' }, { v: 3, label: '3' }, { v: 4, label: '4' }, { v: 5, label: 'VERY ME' }].map(({ v, label }) => (
                  <button key={v}
                    onClick={() => setFeedback(f => ({ ...f, answers: { ...f.answers, [q.id]: v } }))}
                    style={{ flex: 1, padding: '8px 4px', fontFamily: S.mono, fontSize: 9, letterSpacing: '0.04em',
                      border: `1.5px solid ${feedback.answers[q.id] === v ? S.black : S.rule}`,
                      background: feedback.answers[q.id] === v ? S.black : 'transparent',
                      color: feedback.answers[q.id] === v ? S.white : S.mid,
                      cursor: 'pointer', textAlign: 'center' }}
                  >{label}</button>
                ))}
              </div>
            </div>
          ))}
          <button
            disabled={!allAnswered}
            onClick={() => {
              const newZone = calcNewZone(feedback.mode, feedback.answers);
              if (newZone !== rawZones[feedback.mode]) {
                setZoneOverrides(prev => ({ ...prev, [feedback.mode]: newZone }));
              }
              setFeedback(f => ({ ...f, step: 'done' }));
            }}
            style={{ width: '100%', padding: 12, fontFamily: S.bebas, fontSize: 17, letterSpacing: '0.05em', marginBottom: 8,
              background: allAnswered ? S.black : '#eee', color: allAnswered ? S.white : '#aaa',
              border: 'none', cursor: allAnswered ? 'pointer' : 'default' }}
          >
            UPDATE MY RESULTS
          </button>
          <button
            onClick={() => setFeedback(f => ({ ...f, step: 'select', mode: null, answers: {} }))}
            style={{ width: '100%', padding: '8px', fontFamily: S.mono, fontSize: 9, color: S.mid, background: 'transparent', border: `1px solid ${S.rule}`, cursor: 'pointer', letterSpacing: '0.1em' }}
          >
            BACK
          </button>
        </div>
      );
    }

    const appliedZone = zoneOverrides[feedback.mode] || rawZones[feedback.mode];
    const changed = zoneOverrides[feedback.mode] !== undefined && zoneOverrides[feedback.mode] !== rawZones[feedback.mode];
    return (
      <div style={{ borderTop: `1px solid ${S.rule}`, paddingTop: 28 }}>
        {changed ? (<>
          <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.15em', color: '#16a34a', marginBottom: 6 }}>UPDATED</div>
          <div style={{ fontFamily: S.bebas, fontSize: 22, color: S.black, marginBottom: 10 }}>
            {STRENGTH_DATA[feedback.mode][rawZones[feedback.mode]].name} → {STRENGTH_DATA[feedback.mode][appliedZone].name}
          </div>
          <p style={{ fontFamily: S.cormorant, fontSize: 16, color: '#555', lineHeight: 1.65, marginBottom: 16, maxWidth: 'none' }}>
            Your {MODE_LABELS[feedback.mode].toLowerCase()} dimension has been recalibrated. Content on this page now reflects your adjusted wiring.
          </p>
        </>) : (<>
          <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.15em', color: S.mid, marginBottom: 6 }}>CONFIRMED</div>
          <p style={{ fontFamily: S.cormorant, fontSize: 16, color: '#555', lineHeight: 1.65, marginBottom: 16, maxWidth: 'none' }}>
            Your answers confirm the original result for {MODE_LABELS[feedback.mode]}. If something still doesn't feel right, the friction may be in a different dimension.
          </p>
        </>)}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setFeedback(f => ({ ...f, step: 'select', mode: null, answers: {} }))}
            style={{ flex: 1, padding: '8px', fontFamily: S.mono, fontSize: 9, color: S.mid, background: 'transparent', border: `1px solid ${S.rule}`, cursor: 'pointer', letterSpacing: '0.1em' }}
          >
            CHECK ANOTHER
          </button>
          <button
            onClick={() => setFeedback({ open: false, step: 'select', mode: null, answers: {} })}
            style={{ flex: 1, padding: '8px', fontFamily: S.bebas, fontSize: 15, background: S.black, color: S.white, border: 'none', cursor: 'pointer' }}
          >
            DONE
          </button>
        </div>
      </div>
    );
  };

  const getGroupId = (key) => {
    for (const g of REPORT_GROUPS) {
      if (g.keys.includes(key)) return g.id;
    }
    return 'tools';
  };

  // ── Light-mode sub-components ────────────────────────────────────

  const P = ({ children, style: sx }) => (
    <p style={{ fontFamily: S.cormorant, fontSize: 19, lineHeight: 1.75, color: '#333', marginBottom: 16, maxWidth: 540, ...sx }}>{children}</p>
  );
  const Pull = ({ children }) => (
    <div style={{ fontFamily: S.cormorant, fontSize: 'clamp(20px, 3vw, 26px)', fontStyle: 'italic', fontWeight: 500, lineHeight: 1.35, color: S.black, borderLeft: `3px solid ${S.black}`, paddingLeft: 24, margin: '24px 0', maxWidth: 480 }}>{children}</div>
  );
  const Label = ({ children }) => (
    <div style={{ fontFamily: S.mono, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: S.mid, margin: '28px 0 10px', paddingBottom: 8, borderBottom: `1px solid ${S.rule}` }}>{children}</div>
  );
  const Item = ({ children }) => (
    <div style={{ padding: '12px 0', borderBottom: `1px solid ${S.rule}`, fontFamily: S.cormorant, fontSize: 17, lineHeight: 1.65, color: '#333', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ fontFamily: S.mono, fontSize: 12, color: S.mid, flexShrink: 0, marginTop: 2 }}>&mdash;</span>
      <span>{children}</span>
    </div>
  );
  const Collapsible = ({ label, sectionKey, children, defaultOpen = false }) => {
    const isOpen = expandedSections[sectionKey] !== undefined ? expandedSections[sectionKey] : defaultOpen;
    return (
      <div style={{ borderBottom: `1px solid ${S.rule}` }}>
        <button onClick={() => toggleSection(sectionKey)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '14px 0', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: S.mono, fontSize: 11, letterSpacing: '0.1em', fontWeight: 600, color: S.black, textAlign: 'left' }}>
          <span>{label}</span>
          <span style={{ fontFamily: S.bebas, fontSize: 19, color: S.mid }}>{isOpen ? '−' : '+'}</span>
        </button>
        {isOpen && <div style={{ paddingBottom: 16 }}>{children}</div>}
      </div>
    );
  };

  const fitLabel = f => f === 1 ? 'Strong Fit' : f === 2 ? 'Possible Fit' : 'Poor Fit';
  const fitColor = f => f === 1 ? '#16a34a' : f === 2 ? '#ca8a04' : '#dc2626';
  const fitBg    = f => f === 1 ? '#dcfce7' : f === 2 ? '#fef9c3' : '#fee2e2';
  const scoreColor = a => a >= 8.5 ? '#16a34a' : a >= 6.5 ? '#ca8a04' : '#dc2626';
  const fillColor  = v => v >= 75 ? '#16a34a' : v >= 50 ? '#ca8a04' : '#dc2626';

  // ── Sidebar (desktop only) ───────────────────────────────────────

  const Sidebar = ({ sectionKey: activeKey }) => (
    <div style={{ width: 220, flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', background: '#fafafa', borderRight: `1px solid ${S.rule}` }}>
      <button onClick={goBack} style={{ display: 'block', width: '100%', padding: '16px 20px', fontFamily: S.mono, fontSize: 9, letterSpacing: '0.12em', color: S.mid, background: 'transparent', border: 'none', borderBottom: `1px solid ${S.rule}`, cursor: 'pointer', textAlign: 'left' }}>
        ← FULL REPORT
      </button>
      {REPORT_GROUPS.map(group => (
        <div key={group.id}>
          <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.18em', color: S.mid, padding: '14px 20px 6px' }}>{group.label}</div>
          {group.keys.map(key => {
            const card = REPORT_CARDS.find(c => c.key === key);
            if (!card) return null;
            const isActive = activeKey === key;
            return (
              <button
                key={key}
                onClick={() => { setActiveSection(key); window.scrollTo(0, 0); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 20px', background: isActive ? '#f0ede8' : 'transparent', border: 'none', borderLeft: isActive ? `2px solid ${S.black}` : '2px solid transparent', borderBottom: `1px solid ${S.rule}`, cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f5f3ef'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, width: 18, flexShrink: 0, textAlign: 'right' }}>{card.num}</span>
                <span style={{ fontFamily: S.mono, fontSize: 9, color: isActive ? S.black : '#666', letterSpacing: '0.05em' }}>{card.label.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  // ── Bottom tab bar (mobile only) ─────────────────────────────────

  const BottomTabs = ({ activeKey }) => {
    const tabs = [
      { id: 'wiring',  label: 'WIRING' },
      { id: 'operate', label: 'OPERATE' },
      { id: 'career',  label: 'CAREER' },
      { id: 'tools',   label: 'TOOLS' },
    ];
    const activeId = activeKey ? getGroupId(activeKey) : homeFilter;
    return (
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(245,243,239,0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: `1px solid ${S.rule}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {tabs.map(tab => {
          const isActive = activeId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveSection(null); setHomeFilter(tab.id); window.scrollTo(0, 0); }}
              style={{ flex: 1, padding: '10px 4px 10px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
            >
              <span style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.08em', color: isActive ? S.black : S.mid, fontWeight: isActive ? 700 : 400 }}>{tab.label}</span>
              <span style={{ width: 16, height: 2, background: isActive ? S.black : 'transparent', borderRadius: 1, display: 'block' }} />
            </button>
          );
        })}
      </div>
    );
  };

  // ── Section page shell (always light) ───────────────────────────

  const SectionPage = ({ sectionKey, label, children }) => {
    const idx = REPORT_CARDS.findIndex(c => c.key === sectionKey);
    const prev = idx > 0 ? REPORT_CARDS[idx - 1] : null;
    const next = idx < REPORT_CARDS.length - 1 ? REPORT_CARDS[idx + 1] : null;
    const btnStyle = { fontFamily: S.mono, fontSize: 11, letterSpacing: '0.1em', background: 'transparent', border: `1px solid ${S.rule}`, color: S.mid, padding: '10px 14px', cursor: 'pointer', whiteSpace: 'nowrap' };
    return (
      <div style={{ minHeight: '100vh', background: S.white, display: 'flex' }}>
        {!isMobile && <Sidebar sectionKey={sectionKey} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: `1px solid ${S.rule}`, position: 'sticky', top: 0, background: S.white, zIndex: 10, gap: 8 }}>
            <button onClick={goBack} style={btnStyle}>← REPORT</button>
            <div style={{ fontFamily: S.mono, fontSize: 11, letterSpacing: '0.2em', color: S.mid, textAlign: 'center', flex: 1 }}>{label.toUpperCase()}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {prev && <button onClick={() => { setActiveSection(prev.key); window.scrollTo(0,0); }} style={btnStyle}>← {isMobile ? prev.num : prev.label.toUpperCase()}</button>}
              {next && <button onClick={() => { setActiveSection(next.key); window.scrollTo(0,0); }} style={{ ...btnStyle, background: '#f0ede8' }}>{isMobile ? next.num : next.label.toUpperCase()} →</button>}
            </div>
          </div>
          <div style={{ paddingBottom: isMobile ? 72 : 0 }}>
            {children}
            <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '0 16px 48px' : '0 24px 64px' }}>
              <FeedbackPanel sectionKey={sectionKey} />
            </div>
          </div>
        </div>
        {isMobile && <BottomTabs activeKey={sectionKey} />}
      </div>
    );
  };

  // ── Section renderer ─────────────────────────────────────────────

  const renderSection = (key) => {
    const W = (label, content) => (
      <SectionPage sectionKey={key} label={label}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '32px 16px 64px' : '56px 24px 80px' }}>
          {content}
        </div>
      </SectionPage>
    );
    const H = (text) => <h2 style={{ fontFamily: S.bebas, fontSize: 'clamp(32px, 5vw, 52px)', color: S.black, margin: '0 0 24px', lineHeight: 1 }}>{text}</h2>;
    const Eye = (text) => <div style={{ fontFamily: S.mono, fontSize: 11, letterSpacing: '0.3em', color: S.mid, marginBottom: 14 }}>{text}</div>;

    switch (key) {

      case 'explain': return W('What This Means', <>
        {Eye('IN PLAIN LANGUAGE')}{H('HOW YOU OPERATE')}
        <p style={{ fontFamily: S.cormorant, fontSize: 'clamp(19px, 2.5vw, 24px)', lineHeight: 1.65, color: '#222', marginBottom: 20 }}>{domData.how}</p>
        <p style={{ fontFamily: S.cormorant, fontSize: 17, lineHeight: 1.7, color: '#555', marginBottom: 20 }}>Your strongest instinct is <strong style={{ color: S.black }}>{MODE_LABELS[dominant]}</strong> ({strengths[dominant].name}). {strengths[dominant].superpower}</p>
        <p style={{ fontFamily: S.cormorant, fontSize: 17, lineHeight: 1.7, color: '#555', marginBottom: 20 }}>Your lowest-energy dimension is <strong style={{ color: S.black }}>{MODE_LABELS[resistance]}</strong>. {resData}</p>
        <div style={{ borderLeft: `3px solid ${S.rule}`, paddingLeft: 20, marginTop: 8 }}>
          <div style={{ fontFamily: S.mono, fontSize: 11, letterSpacing: '0.2em', color: S.mid, marginBottom: 6 }}>YOUR GAME</div>
          <p style={{ fontFamily: S.cormorant, fontSize: 17, lineHeight: 1.7, color: '#333', margin: 0 }}><strong>{GAME_TYPE[dominant][zones[dominant]].title}.</strong> {GAME_TYPE[dominant][zones[dominant]].wins}</p>
        </div>
      </>);

      case 'game': return W('Your Game', <>
        {Eye('WHAT YOU\'RE WIRED TO WIN AT')}{H('KNOW WHAT GAME YOU\'RE PLAYING')}
        <P>Your wiring predisposes you to thrive in certain environments and grind against others. This isn't about what you can do. It's about where you're set up to win.</P>
        <Pull>{GAME_TYPE[dominant][zones[dominant]].wins}</Pull>
        <Label>Your Game Type</Label>
        <P style={{ fontSize: 16 }}>{GAME_TYPE[dominant][zones[dominant]].title}</P>
        <Label>Your Loop</Label>
        <P style={{ fontSize: 16, fontFamily: S.mono, letterSpacing: '0.04em' }}>{LOOP_DESCRIPTION[dominant][zones[dominant]]}</P>
        <Label>Fatal Game</Label>
        <P style={{ fontSize: 16 }}>{GAME_TYPE[dominant][zones[dominant]].fatal}</P>
        <Label>All Four Dimensions</Label>
        {modes.map(m => (
          <div key={m} style={{ borderLeft: `4px solid ${S.rule}`, padding: '12px 20px', margin: '10px 0' }}>
            <div style={{ fontFamily: S.bebas, fontSize: 17, color: S.black, marginBottom: 4 }}>{MODE_LABELS[m]}: {GAME_TYPE[m][zones[m]].title}</div>
            <p style={{ fontFamily: S.cormorant, fontSize: 15, color: '#666', margin: 0, lineHeight: 1.6 }}>{GAME_TYPE[m][zones[m]].wins}</p>
          </div>
        ))}
      </>);

      case 'scores': return W('Your Scores', <>
        {Eye('YOUR SCORES')}{H('FOUR DIMENSIONS OF ACTION')}
        <P>These four dimensions describe how you instinctively approach information, organization, change, and physical work. Position matters more than direction.</P>
        <div style={{ marginTop: 8 }}>
          {modes.map(m => (
            <div key={m}>
              <SpectrumBar mode={m} score={scores[m]} energy={energy[m]} name={strengths[m].name} />
              <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.08em', color: S.mid, marginTop: -14, marginBottom: 28 }}>{percentileLine(m, scores[m])}</div>
            </div>
          ))}
        </div>
        <Pull>When someone forces you into a pattern that violates your wiring, the friction you feel isn't you being difficult. It's real stress caused by working against your instincts.</Pull>
      </>);

      case 'strengths': return W('Your Strengths', <>
        {Eye('YOUR STRENGTHS')}{H('WHAT YOU NATURALLY DO BETTER THAN MOST')}
        {modes.map(m => (
          <div key={m} style={{ border: `1px solid ${S.rule}`, padding: 24, marginBottom: -1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontFamily: S.mono, fontSize: 11, letterSpacing: '0.2em', color: S.mid, marginBottom: 4 }}>{MODE_LABELS[m]} — {energy[m]}% energy</div>
                <div style={{ fontFamily: S.bebas, fontSize: 24 }}>{strengths[m].name}: {strengths[m].title}</div>
              </div>
            </div>
            <p style={{ fontFamily: S.cormorant, fontSize: 17, lineHeight: 1.7, color: '#333', margin: '12px 0 0' }}>{strengths[m].desc}</p>
          </div>
        ))}
      </>);

      case 'superpowers': return W('Top Strengths', <>
        {Eye('TOP STRENGTHS')}{H('WHERE YOU HAVE THE MOST ENERGY')}
        {[...modes].sort((a, b) => energy[b] - energy[a]).slice(0, 2).map(m => (
          <div key={m} style={{ marginBottom: 40 }}>
            <div style={{ fontFamily: S.bebas, fontSize: 22, color: S.black, marginBottom: 8 }}>{strengths[m].name}</div>
            <P>{strengths[m].superpower}</P>
            <Label>You at Your Best</Label>
            <P style={{ fontSize: 16 }}>{strengths[m].atBest}</P>
          </div>
        ))}
      </>);

      case 'ability': {
        const topTwo = [...modes].sort((a, b) => energy[b] - energy[a]).slice(0, 2).map(m => STRENGTH_DATA[m][zones[m]].name);
        const assembled = abilityDomain.trim()
          ? `${topTwo[0]} + ${topTwo[1]} applied to ${abilityDomain.trim()}.`
          : null;
        return W('Unique Ability', <>
          {Eye('YOUR UNIQUE ABILITY')}{H('NAME YOUR PROFESSIONAL SUPERPOWER')}
          <P>Your unique ability is the combination of wirings that produces results others can't easily replicate. The assessment surfaces the raw material. Your job is to compress it into one sentence.</P>
          <P>Template: <span style={{ color: S.black, fontFamily: S.mono, fontSize: 14 }}>[Wiring 1] + [Wiring 2] applied to [your domain/audience]</span></P>
          <Label>Your Two Strongest Wirings</Label>
          <div style={{ display: 'flex', gap: 12, margin: '4px 0 24px' }}>
            {topTwo.map(name => (
              <div key={name} style={{ padding: '10px 20px', border: `1px solid ${S.black}`, fontFamily: S.bebas, fontSize: 20, color: S.black, letterSpacing: '0.05em' }}>{name}</div>
            ))}
          </div>
          <Label>All Four Wirings</Label>
          {modes.map(m => (
            <div key={m} style={{ padding: '8px 0', borderBottom: `1px solid ${S.rule}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: S.mono, fontSize: 11, color: S.mid, letterSpacing: '0.15em' }}>{MODE_LABELS[m]}</span>
              <span style={{ fontFamily: S.bebas, fontSize: 19, color: energy[m] >= 50 ? S.black : S.mid, letterSpacing: '0.05em' }}>{STRENGTH_DATA[m][zones[m]].name}</span>
            </div>
          ))}
          <Label>Your Domain / Audience</Label>
          <P style={{ fontSize: 15, marginBottom: 8 }}>What field, industry, or type of person does your wiring run best in service of?</P>
          <input
            value={abilityDomain}
            onChange={e => setAbilityDomain(e.target.value)}
            placeholder="e.g. early-stage founders, DTC brands, product teams..."
            style={{
              width: '100%', padding: '14px 16px', background: S.white, border: `1px solid ${S.rule}`,
              color: S.black, fontFamily: S.cormorant, fontSize: 17, outline: 'none',
              boxSizing: 'border-box', letterSpacing: '0.02em',
            }}
          />
          {assembled && (
            <>
              <Label>Your Unique Ability</Label>
              <Pull>{assembled}</Pull>
              <P style={{ fontSize: 14, color: S.mid }}>If it sounds generic, the domain is too broad. Sharpen the audience until the sentence has teeth.</P>
            </>
          )}
        </>);
      }

      case 'shadows': return W('Watch For', <>
        {Eye('WATCH FOR')}{H('WHERE YOUR WIRING CAN WORK AGAINST YOU')}
        {modes.map(m => (
          <div key={m} style={{ borderLeft: `4px solid ${S.rule}`, padding: '14px 20px', margin: '12px 0' }}>
            <div style={{ fontFamily: S.bebas, fontSize: 19, marginBottom: 6 }}>{MODE_LABELS[m]}: {strengths[m].name}</div>
            <p style={{ fontFamily: S.cormorant, fontSize: 16, lineHeight: 1.65, color: '#444', margin: 0 }}>{strengths[m].shadow}</p>
          </div>
        ))}
      </>);

      case 'danger': return W('Friction Points', <>
        {Eye('FRICTION POINTS')}{H('CONDITIONS THAT WORK AGAINST YOU')}
        <P>Knowing these is intelligence, not weakness.</P>
        {modes.map(m => {
          const isHigh = zones[m] === 'initiate';
          return (
            <div key={m} style={{ borderLeft: `4px solid ${S.rule}`, padding: '14px 20px', margin: '12px 0' }}>
              <div style={{ fontFamily: S.bebas, fontSize: 19, color: S.black, marginBottom: 6 }}>{MODE_LABELS[m]}: {strengths[m].name}</div>
              <p style={{ fontFamily: S.cormorant, fontSize: 16, color: '#555', margin: 0, lineHeight: 1.65 }}>{isHigh ? DANGER_ZONES[m].high : DANGER_ZONES[m].low}</p>
            </div>
          );
        })}
      </>);

      case 'success': return W('Your Success', <>
        {Eye('WHAT SUCCESS LOOKS LIKE')}{H('YOUR VERSION.')}
        <Pull>{domData.success}</Pull>
        <P>That's what your wiring optimizes for. Build toward it deliberately, not accidentally.</P>
      </>);

      case 'procrastination': return W('Procrastination', <>
        {Eye('WHY YOU PROCRASTINATE')}{H("IT'S NEVER LAZINESS")}
        <P>{domData.procrastination}</P>
        <Pull>Ask: what am I trying to avoid? Name it. Resistance dissolves once you see it clearly.</Pull>
      </>);

      case 'reset': return W('Reset Protocol', <>
        {Eye('RESET PROTOCOL')}{H('HOW TO GET BACK ONLINE')}
        <div style={{ border: `1px solid ${S.rule}`, overflow: 'hidden', margin: '16px 0' }}>
          <div style={{ background: S.black, color: S.white, padding: '12px 20px', fontFamily: S.mono, fontSize: 11, letterSpacing: '0.2em' }}>60-SECOND RESET</div>
          {['Stop everything completely.', 'One slow breath. Nose in, mouth out.', 'Notice: body tight? Scattered? Heavy?', domData.reset, 'Do just that one thing.'].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 20px', borderBottom: `1px solid ${S.rule}`, fontFamily: S.cormorant, fontSize: 16, lineHeight: 1.65, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: S.bebas, fontSize: 20, color: S.mid, flexShrink: 0 }}>{i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </>);

      case 'daily': {
        const dr = DAILY_RULES[dominant];
        return W('Daily Rules', <>
          {Eye('DAILY OPERATING RULES')}{H('BASELINE CONDITIONS')}
          <P>Treat these like maintenance, not motivation. They're tuned to your dominant mode.</P>
          <Label>Morning</Label>
          {dr.morning.map((s, i) => <Item key={i}>{s}</Item>)}
          <Label>During the Day</Label>
          {dr.during.map((s, i) => <Item key={i}>{s}</Item>)}
          <Label>End of Day</Label>
          {dr.end.map((s, i) => <Item key={i}>{s}</Item>)}
        </>);
      }

      case 'comms': return W('Communication', <>
        {Eye('COMMUNICATION GUIDE')}{H('WHAT OTHERS SHOULD KNOW ABOUT YOU')}
        {modes.map(m => (
          <div key={m} style={{ padding: '16px 0', borderBottom: `1px solid ${S.rule}` }}>
            <div style={{ fontFamily: S.mono, fontSize: 11, letterSpacing: '0.15em', color: S.mid, marginBottom: 6 }}>{MODE_LABELS[m]} ({strengths[m].name})</div>
            <p style={{ fontFamily: S.cormorant, fontSize: 17, fontStyle: 'italic', lineHeight: 1.6, color: '#333', margin: 0 }}>"{strengths[m].othersKnow}"</p>
          </div>
        ))}
      </>);

      case 'stress': return W('Under Stress', <>
        {Eye('UNDER STRESS')}{H('WHAT HAPPENS WHEN YOUR TANK IS LOW')}
        <P>When you feel irritable, scattered, or emotionally reactive with no clear reason, check the environment before blaming yourself.</P>
        {[...modes].sort((a, b) => energy[b] - energy[a]).slice(0, 2).map(m => (
          <div key={m} style={{ marginBottom: 20 }}>
            <Label>{MODE_LABELS[m]}: Under Stress</Label>
            <P style={{ fontSize: 16 }}>{strengths[m].underStress}</P>
          </div>
        ))}
      </>);

      case 'careers': {
        const scored = CAREER_ARCHETYPES.map(c => ({ ...c, ...scoreCareerFit(c, zones, energy, dominant, resistance) })).sort((a, b) => b.alignment - a.alignment);
        const fit1 = scored.filter(c => c.fit === 1);
        const fit2 = scored.filter(c => c.fit === 2);
        const fit3 = scored.filter(c => c.fit === 3);
        const deadZones = scored.filter(c => c.deadIf);
        const filtered = careerFilter === 'all' ? scored : careerFilter === 't1' ? fit1 : careerFilter === 't2' ? fit2 : careerFilter === 't3' ? fit3 : scored.filter(c => c.tags.includes(careerFilter));
        const Metric = ({ label, value }) => (
          <div style={{ background: '#f5f5f5', borderRadius: 6, padding: '8px 10px' }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#717171', marginBottom: 3 }}>{label}</div>
            <div style={{ height: 4, background: '#d4d4d4', borderRadius: 2, overflow: 'hidden', marginBottom: 3 }}><div style={{ height: '100%', borderRadius: 2, background: fillColor(value), width: `${value}%` }} /></div>
            <div style={{ fontFamily: S.mono, fontSize: 11, fontWeight: 700, color: S.black }}>{value}%</div>
          </div>
        );
        return (
          <SectionPage sectionKey="careers" label="Career Map">
            <div style={{ background: '#f0ede8', padding: '32px 24px', textAlign: 'center', borderBottom: `1px solid ${S.rule}` }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 28, flexWrap: 'wrap' }}>
                {[['#16a34a', fit1.length, 'STRONG FIT'], ['#ca8a04', fit2.length, 'POSSIBLE FIT'], ['#dc2626', fit3.length, 'POOR FIT']].map(([color, count, label]) => (
                  <div key={label} style={{ textAlign: 'center' }}><div style={{ fontFamily: S.bebas, fontSize: 32, color }}>{count}</div><div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid }}>{label}</div></div>
                ))}
              </div>
            </div>
            <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {[['all','All '+scored.length],['t1','Strong Fit'],['t2','Possible Fit'],['t3','Poor Fit'],['owner','Owner / Founder'],['creative','Creative'],['teaching','Teaching'],['consulting','Consulting'],['analytical','Analytical'],['hands-on','Hands-On']].map(([k, label]) => (
                  <button key={k} onClick={() => setCareerFilter(k)} style={{ padding: '6px 14px', borderRadius: 100, fontFamily: S.mono, fontSize: 12, fontWeight: 600, border: `1.5px solid ${careerFilter === k ? '#E8541A' : S.rule}`, background: careerFilter === k ? '#E8541A' : S.white, color: careerFilter === k ? '#fff' : '#3d3d3d', cursor: 'pointer', transition: 'all 0.15s' }}>{label}</button>
                ))}
              </div>
              <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.1em', color: S.mid, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>ROLE · RANKED BY FIT</span><span>{filtered.length} SHOWN</span>
              </div>
              <div style={{ borderTop: `1px solid ${S.rule}` }}>
                {filtered.map((c, i) => {
                  const open = expandedCareer === c.id;
                  const pct = Math.round(c.alignment * 10);
                  return (
                    <div key={c.id} style={{ borderBottom: `1px solid ${S.rule}` }}>
                      <button
                        onClick={() => setExpandedCareer(open ? null : c.id)}
                        style={{ width: '100%', background: open ? '#faf9f6' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14, padding: '13px 10px', textAlign: 'left' }}
                      >
                        <span style={{ fontFamily: S.mono, fontSize: 11, color: S.mid, width: 24, flexShrink: 0, textAlign: 'right' }}>{i + 1}</span>
                        <span style={{ fontSize: 17, flexShrink: 0, width: 22, textAlign: 'center' }}>{c.icon}</span>
                        <span style={{ flexShrink: 0, width: isMobile ? 124 : 230, minWidth: 0 }}>
                          <span style={{ display: 'block', fontFamily: S.bebas, fontSize: 17, color: S.black, letterSpacing: '0.02em', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</span>
                          {!isMobile && <span style={{ display: 'block', fontFamily: S.mono, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: S.mid, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.category}</span>}
                        </span>
                        <span style={{ flex: 1, minWidth: 30, height: 6, background: '#ececec', borderRadius: 3, overflow: 'hidden' }}>
                          <span style={{ display: 'block', height: '100%', borderRadius: 3, background: fitColor(c.fit), width: `${pct}%` }} />
                        </span>
                        <span style={{ fontFamily: S.bebas, fontSize: 19, color: fitColor(c.fit), width: 44, textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
                        <span style={{ width: 14, flexShrink: 0, color: S.mid, fontFamily: S.mono, fontSize: 14, textAlign: 'center', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
                      </button>
                      {open && (
                        <div style={{ padding: isMobile ? '2px 10px 20px 34px' : '2px 24px 22px 60px' }}>
                          <div style={{ display: 'inline-block', fontSize: 9, fontFamily: S.mono, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: fitBg(c.fit), color: fitColor(c.fit), marginBottom: 10 }}>{fitLabel(c.fit)}</div>
                          <div style={{ fontFamily: S.cormorant, fontSize: 14, fontStyle: 'italic', color: S.mid, marginBottom: 8 }}>{c.subtitle}</div>
                          <p style={{ fontFamily: S.cormorant, fontSize: 15, color: '#3d3d3d', lineHeight: 1.65, margin: '0 0 14px', maxWidth: 560 }}>{c.desc}</p>
                          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 8, maxWidth: 560 }}>
                            <Metric label="Energy Fit" value={c.energyFit} />
                            <Metric label="Strength Fit" value={c.strengthFit} />
                            <Metric label="Freedom" value={c.freedom} />
                            <Metric label="Income" value={c.income} />
                          </div>
                          {c.deadIf && <p style={{ fontFamily: S.cormorant, fontSize: 14, fontStyle: 'italic', color: '#dc2626', margin: '12px 0 0', maxWidth: 560 }}>Watch out: {c.deadIf}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
                {filtered.length === 0 && <p style={{ fontFamily: S.cormorant, fontStyle: 'italic', color: S.mid, padding: '24px 0' }}>No roles match that filter.</p>}
              </div>
              {deadZones.length > 0 && (
                <Collapsible sectionKey="dead-zones" label={`Careers to Avoid (${deadZones.length})`}>
                  {deadZones.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: `1px solid ${S.rule}`, alignItems: 'flex-start' }}>
                      <span style={{ fontFamily: S.mono, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: '#fee2e2', color: '#dc2626', flexShrink: 0 }}>AVOID</span>
                      <div><div style={{ fontFamily: S.mono, fontSize: 11, fontWeight: 600, color: S.black }}>{c.title}</div><p style={{ fontFamily: S.cormorant, fontSize: 14, color: '#555', margin: '4px 0 0', maxWidth: 'none' }}>{c.deadIf}</p></div>
                    </div>
                  ))}
                </Collapsible>
              )}
            </div>
          </SectionPage>
        );
      }

      case 'money': {
        const moneyData = {
          FF: {
            initiate: {
              title: 'The Deep Researcher',
              pattern: "You gather serious information before committing money. Deep due diligence before buying, investing, or starting anything significant.",
              strength: "You rarely get caught off guard. You know what you're buying and why.",
              watch: "Analysis paralysis. You can research yourself out of good opportunities while waiting for perfect information.",
              rule: "Set a research deadline. When it hits, decide with what you have."
            },
            accommodate: {
              title: 'The Balanced Analyst',
              pattern: "You gather enough information to feel confident without over-researching. Reasonable depth, reasonable timing.",
              strength: "Good balance between informed decisions and speed.",
              watch: "You might not dig deep enough when the stakes are genuinely high.",
              rule: "For high-stakes decisions, push your research one layer deeper than feels necessary."
            },
            counteract: {
              title: 'The Fast Mover',
              pattern: "You act on headlines and instinct. You don't need deep data to make a financial decision. You trust your read.",
              strength: "You catch opportunities before others have finished researching.",
              watch: "Underresearching before big bets. A little more digging saves expensive mistakes.",
              rule: "Before any large commitment, force yourself to read one negative case first."
            }
          },
          FT: {
            initiate: {
              title: 'The Systems Builder',
              pattern: "You're a natural budgeter. Automatic transfers, detailed tracking, financial systems. If it isn't structured, it bothers you.",
              strength: "Consistent. Disciplined. Doesn't leak money through inattention.",
              watch: "Your love of systems can make you rigid. You might stick to a financial structure past its usefulness.",
              rule: "Build the system, then audit the system every 90 days. Systems should evolve."
            },
            accommodate: {
              title: 'The Flexible Planner',
              pattern: "You use structure where it helps but adapt when circumstances change. Neither a strict budgeter nor totally improvising.",
              strength: "Adjusts well when conditions shift. Not locked into a plan that no longer fits.",
              watch: "Without intentional structure, things can get fuzzy and money can drift.",
              rule: "A simple monthly review — even 15 minutes — keeps your finances from going sideways."
            },
            counteract: {
              title: 'The Improviser',
              pattern: "You resist tracking, budgets, and financial structure. You work better with simple rules than complex systems.",
              strength: "Flexible. Not constrained by prior financial commitments. Adapts fast.",
              watch: "Financial disorganization. Money leaks quietly when nothing is tracked.",
              rule: "One simple rule beats a budget you'll abandon. Try: save the first 10%, spend the rest without guilt."
            }
          },
          QS: {
            initiate: {
              title: 'The Risk Taker',
              pattern: "Wired for financial risk. Comfortable with volatility, drawdowns, and uncertainty. You're often an early mover on new opportunities.",
              strength: "Can tolerate the variance that produces outsized returns. Sees opportunity where others see chaos.",
              watch: "Moving too fast before validating. Over-concentration in speculative bets that haven't been stress-tested.",
              rule: "For every high-risk bet, define the maximum you can lose before you enter. Then honor it."
            },
            accommodate: {
              title: 'The Calculated Bettor',
              pattern: "You take calculated risks. Not reckless, not timid. You evaluate upside against downside before committing.",
              strength: "Balanced risk/reward thinking. You can move when conditions are right.",
              watch: "Occasional indecision when the risk/reward isn't clean. Analysis can stall momentum.",
              rule: "If you can't explain why an opportunity is worth the risk in one sentence, pass."
            },
            counteract: {
              title: 'The Stability Seeker',
              pattern: "You value certainty in financial decisions. Guaranteed outcomes over potential upside. Volatility costs you sleep.",
              strength: "You avoid speculative losses that wipe out others. Capital preservation is real wealth.",
              watch: "Too conservative. Staying in cash or low-yield assets when compounding is the only path to real long-term wealth.",
              rule: "Automate index fund contributions so you don't have to decide each time. Remove the emotion from the compounding."
            }
          },
          IMP: {
            initiate: {
              title: 'The Tangibles Investor',
              pattern: "You think in physical assets. Real estate, equipment, inventory, things you can touch and evaluate. Abstract financial products feel disconnected.",
              strength: "Understands asset quality in ways abstract investors miss. Tends toward durable, real-world value.",
              watch: "Illiquid assets and concentrated bets. Hard to rebalance when everything is in real estate or physical goods.",
              rule: "Keep a cash reserve completely separate from your tangible assets. Real assets don't pay rent when you need fast liquidity."
            },
            accommodate: {
              title: 'The Mixed Portfolio',
              pattern: "You mix tangible and abstract assets without strong preference either way. Diversification comes naturally.",
              strength: "Natural diversification instinct. Not over-concentrated in any one type.",
              watch: "No strong anchor. Can drift without a clear financial identity or framework.",
              rule: "Define which asset type you understand best and weight toward it intentionally."
            },
            counteract: {
              title: 'The Abstract Investor',
              pattern: "You're comfortable with financial instruments you can't touch. Stocks, funds, digital assets. Physical assets feel like too much overhead.",
              strength: "High liquidity. Easy to diversify. Low friction to invest and rebalance.",
              watch: "No tangible anchor can leave you exposed to correlated systemic risk.",
              rule: "Consider one real-world asset — even a small REIT position — as a portfolio anchor."
            }
          }
        };
        return W('Money Patterns', <>
          {Eye('MONEY PATTERNS')}{H('HOW YOUR WIRING SHAPES FINANCIAL DECISIONS')}
          <P>Your four dimensions predict how you naturally handle money, risk, and financial decisions. These patterns run whether you're aware of them or not.</P>
          {modes.map(m => {
            const data = moneyData[m][zones[m]];
            return (
              <div key={m} style={{ border: `1px solid ${S.rule}`, padding: isMobile ? '16px' : '20px 24px', marginBottom: -1 }}>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.15em', color: S.mid, marginBottom: 4 }}>{MODE_LABELS[m]} — {energy[m]}% energy</div>
                  <div style={{ fontFamily: S.bebas, fontSize: 22, color: S.black }}>{data.title}</div>
                </div>
                <p style={{ fontFamily: S.cormorant, fontSize: 17, lineHeight: 1.7, color: '#333', marginBottom: 14, maxWidth: 'none' }}>{data.pattern}</p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div style={{ padding: '12px 14px', background: '#dcfce7', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.15em', color: '#15803d', marginBottom: 4 }}>STRENGTH</div>
                    <p style={{ fontFamily: S.cormorant, fontSize: 15, color: '#166534', lineHeight: 1.6, margin: 0, maxWidth: 'none' }}>{data.strength}</p>
                  </div>
                  <div style={{ padding: '12px 14px', background: '#fee2e2', border: '1px solid #fecaca' }}>
                    <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.15em', color: '#dc2626', marginBottom: 4 }}>WATCH FOR</div>
                    <p style={{ fontFamily: S.cormorant, fontSize: 15, color: '#991b1b', lineHeight: 1.6, margin: 0, maxWidth: 'none' }}>{data.watch}</p>
                  </div>
                </div>
                <div style={{ padding: '10px 14px', background: '#f0ede8', borderLeft: `3px solid ${S.black}` }}>
                  <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.15em', color: S.mid, marginBottom: 4 }}>YOUR RULE</div>
                  <p style={{ fontFamily: S.cormorant, fontSize: 15, color: S.black, lineHeight: 1.6, margin: 0, maxWidth: 'none' }}>{data.rule}</p>
                </div>
              </div>
            );
          })}
        </>);
      }

      // ── Tools ─────────────────────────────────────────────────────

      case 'stress-check': {
        const symptomMap = [
          { id: 'irritable', label: "Irritable or snappy for no clear reason", modes: ['QS','FT'] },
          { id: 'scattered', label: "Scattered, can't focus on one thing", modes: ['FT','FF'] },
          { id: 'procrastinating', label: "Procrastinating on something important", modes: ['FF','QS'] },
          { id: 'flat', label: "Emotionally flat, no motivation", modes: ['QS','IMP'] },
          { id: 'restless', label: "Restless, need to move or do something", modes: ['IMP','QS'] },
          { id: 'overwhelmed', label: "Overwhelmed by too many open loops", modes: ['FT'] },
          { id: 'bored', label: "Deeply, physically bored", modes: ['QS'] },
          { id: 'perfectionist', label: "Stuck perfecting instead of shipping", modes: ['FF','FT'] },
          { id: 'detached', label: "Detached from physical environment", modes: ['IMP'] },
          { id: 'avoidant', label: "Avoiding a specific task or conversation", modes: ['FF','QS'] },
        ];
        const violatedModes = {};
        stressSymptoms.forEach(sId => { const s = symptomMap.find(x => x.id === sId); if (s) s.modes.forEach(m => { violatedModes[m] = (violatedModes[m] || 0) + 1; }); });
        const topViolated = Object.entries(violatedModes).sort((a, b) => b[1] - a[1]);
        const stressNarratives = {
          FF: { cause: "Your Information dimension is being violated. You're either drowning in unnecessary detail or being denied the information you need.", fix: "If you're a Simplifier: step back, get the headline, move. If you're a Specifier: ask for 30 more minutes of research time." },
          FT: { cause: "Your Organization dimension is being violated. Either too much rigid structure is imposed on you, or there's not enough structure.", fix: "If you're an Adapter: find your own path to the same outcome. If you're a Systematizer: spend 10 minutes creating a sequence for the next 3 steps." },
          QS: { cause: "Your Change dimension is being violated. You're either trapped in too much routine or being forced into too much chaos.", fix: "If you're a Stabilizer: identify one thing you can keep the same. If you're an Innovator: start something new, even tiny." },
          IMP: { cause: "Your Execution dimension is being violated. You're stuck in abstract thinking when you need to build, or forced into physical work when you think best in your head.", fix: "If you're an Envisioner: ask for time to conceptualize. If you're a Builder: go make something with your hands." },
        };
        return W('Stress Detector', <>
          {Eye('STRESS DETECTOR')}{H("WHAT'S DRAINING YOU?")}
          <P>Select symptoms you're experiencing. The tool identifies which dimension is being violated.</P>
          <div style={{ marginTop: 12 }}>
            {symptomMap.map(s => (
              <button key={s.id} onClick={() => setStressSymptoms(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px', background: stressSymptoms.includes(s.id) ? '#fee2e2' : 'transparent', border: 'none', borderBottom: `1px solid ${S.rule}`, cursor: 'pointer', textAlign: 'left', fontFamily: S.cormorant, fontSize: 16, color: S.black }}>
                <span style={{ width: 18, height: 18, borderRadius: 3, border: `2px solid ${stressSymptoms.includes(s.id) ? '#dc2626' : S.rule}`, background: stressSymptoms.includes(s.id) ? '#dc2626' : 'transparent', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{stressSymptoms.includes(s.id) ? '✓' : ''}</span>
                {s.label}
              </button>
            ))}
          </div>
          {topViolated.length > 0 && (
            <div style={{ marginTop: 24, padding: 20, background: '#f0ede8', border: `1px solid ${S.rule}` }}>
              <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 8 }}>DIAGNOSIS</div>
              <div style={{ fontFamily: S.bebas, fontSize: 22, marginBottom: 10 }}>{MODE_LABELS[topViolated[0][0]]} Stress</div>
              <p style={{ fontFamily: S.cormorant, fontSize: 15, color: '#333', lineHeight: 1.65, marginBottom: 12, maxWidth: 'none' }}>{stressNarratives[topViolated[0][0]].cause}</p>
              <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 6 }}>YOUR FIX</div>
              <p style={{ fontFamily: S.cormorant, fontSize: 15, color: '#333', lineHeight: 1.65, maxWidth: 'none' }}>{stressNarratives[topViolated[0][0]].fix}</p>
            </div>
          )}
        </>);
      }

      case 'decision': {
        const dqs = [
          { id: 'research', label: 'How much deep research does this require?', mode: 'FF', options: ['Very little','Some','A lot'] },
          { id: 'structure', label: 'How rigid is the process or structure?', mode: 'FT', options: ['Very flexible','Moderate','Very rigid'] },
          { id: 'novelty', label: 'How much novelty and change is involved?', mode: 'QS', options: ['Very stable','Some variety','Constant change'] },
          { id: 'physical', label: 'How much physical or hands-on work?', mode: 'IMP', options: ['All abstract','Some tangible','Very physical'] },
          { id: 'freedom', label: 'How much schedule control do you have?', options: ['Full control','Some flexibility','No control'] },
          { id: 'creation', label: 'How much creative work is involved?', options: ['Mostly creative','Mixed','Mostly execution'] },
        ];
        const zoneToIndex = { counteract: 0, accommodate: 1, initiate: 2 };
        const calcResult = () => {
          if (Object.keys(decisionAnswers).length < dqs.length) return null;
          let ms = 0, tot = 0;
          ['FF','FT','QS','IMP'].forEach(m => {
            const q = dqs.find(x => x.mode === m);
            if (q && decisionAnswers[q.id] !== undefined) {
              const d = Math.abs(decisionAnswers[q.id] - zoneToIndex[zones[m]]);
              ms += d === 0 ? 10 : d === 1 ? 6 : 2; tot += 10;
            }
          });
          ms += (decisionAnswers.freedom === 0 ? 10 : decisionAnswers.freedom === 1 ? 6 : 2);
          ms += (decisionAnswers.creation === 0 ? 10 : decisionAnswers.creation === 1 ? 6 : 2);
          tot += 20;
          return Math.round((ms / tot) * 100) / 10;
        };
        const sc = calcResult();
        return W('Decision Filter', <>
          {Eye('DECISION FILTER')}{H('SHOULD YOU TAKE THIS?')}
          <P>Evaluating a job, project, or life change? Answer 6 questions to score it against your wiring.</P>
          {dqs.map(q => (
            <div key={q.id} style={{ marginTop: 16 }}>
              <div style={{ fontFamily: S.mono, fontSize: 11, color: S.mid, marginBottom: 6 }}>{q.label}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {q.options.map((opt, oi) => (
                  <button key={oi} onClick={() => setDecisionAnswers(prev => ({ ...prev, [q.id]: oi }))} style={{ flex: 1, padding: '8px 6px', borderRadius: 6, fontFamily: S.cormorant, fontSize: 14, border: `1.5px solid ${decisionAnswers[q.id] === oi ? S.black : S.rule}`, background: decisionAnswers[q.id] === oi ? S.black : S.white, color: decisionAnswers[q.id] === oi ? S.white : S.black, cursor: 'pointer' }}>{opt}</button>
                ))}
              </div>
            </div>
          ))}
          {sc !== null && (() => {
            const cl = sc >= 7.5 ? '#16a34a' : sc >= 5 ? '#ca8a04' : '#dc2626';
            return (
              <div style={{ marginTop: 24, padding: 20, border: `2px solid ${cl}`, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontFamily: S.bebas, fontSize: 44, color: cl }}>{Math.round(sc * 10)}%</div>
                <p style={{ fontFamily: S.cormorant, fontSize: 15, color: '#444', marginTop: 6, maxWidth: 'none' }}>{sc >= 7.5 ? 'Strong alignment with your wiring.' : sc >= 5 ? 'Partial fit. Some elements match, others will cost energy.' : 'Significant misalignment. Proceed with extreme caution.'}</p>
              </div>
            );
          })()}
        </>);
      }

      case 'compat': {
        const ZONE_LABELS = { counteract: 'LEFT', accommodate: 'CENTER', initiate: 'RIGHT' };
        const ZONE_DESCS  = { counteract: 'Low intensity', accommodate: 'Mid range', initiate: 'High intensity' };
        const allSelected = modes.every(m => partnerZones[m] !== null);
        const runCompat = () => {
          if (!allSelected) return;
          const r = {};
          for (const m of modes) {
            const uZ = zones[m]; const pZ = partnerZones[m];
            if (uZ === pZ) r[m] = { type: 'same', msg: `You're both in the same zone. You'll approach ${MODE_LABELS[m].toLowerCase()} the same way.` };
            else if ((uZ === 'counteract' && pZ === 'initiate') || (uZ === 'initiate' && pZ === 'counteract')) r[m] = { type: 'tension', msg: `Opposite zones. You'll approach ${MODE_LABELS[m].toLowerCase()} from completely different instincts. Friction, but covers each other's blind spots.` };
            else r[m] = { type: 'balance', msg: `Adjacent zones. One of you is more intense. Natural balance with minor friction.` };
          }
          setCompatResult(r);
        };
        const typeLabels = { same: 'SAME APPROACH', balance: 'NATURAL BALANCE', tension: 'TENSION POINT' };
        const typeColors = { same: '#16a34a', balance: '#ca8a04', tension: '#dc2626' };
        const typeBgs   = { same: '#dcfce7', balance: '#fef9c3', tension: '#fee2e2' };
        return W('Compatibility', <>
          {Eye('COMPATIBILITY')}{H('HOW DO YOUR WIRINGS INTERACT?')}
          <P>Select where the other person sits on each spectrum to see where you'll sync, balance, or clash.</P>
          <div style={{ marginTop: 16 }}>
            {modes.map(m => (
              <div key={m} style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: S.mono, fontSize: 11, color: S.mid, marginBottom: 8 }}>{MODE_LABELS[m]}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['counteract', 'accommodate', 'initiate']).map(zone => (
                    <button key={zone} onClick={() => setPartnerZones(prev => ({ ...prev, [m]: zone }))} style={{ flex: 1, padding: '10px 6px', borderRadius: 6, cursor: 'pointer', textAlign: 'center', border: `1.5px solid ${partnerZones[m] === zone ? S.black : S.rule}`, background: partnerZones[m] === zone ? S.black : S.white, color: partnerZones[m] === zone ? S.white : S.black }}>
                      <div style={{ fontFamily: S.mono, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 2 }}>{ZONE_LABELS[zone]}</div>
                      <div style={{ fontFamily: S.cormorant, fontSize: 12, fontStyle: 'italic', color: partnerZones[m] === zone ? '#aaa' : S.mid }}>{ZONE_DESCS[zone]}</div>
                    </button>
                  ))}
                </div>
                <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginTop: 4 }}>You: {ZONE_LABELS[zones[m]]}</div>
              </div>
            ))}
          </div>
          <button onClick={runCompat} disabled={!allSelected} style={{ width: '100%', padding: 10, fontFamily: S.bebas, fontSize: 17, background: allSelected ? S.black : '#eee', color: allSelected ? S.white : '#aaa', border: 'none', borderRadius: 6, cursor: allSelected ? 'pointer' : 'default' }}>ANALYZE</button>
          {compatResult && (
            <div style={{ marginTop: 20 }}>
              {modes.map(m => { const r = compatResult[m]; return (
                <div key={m} style={{ padding: '12px 0', borderBottom: `1px solid ${S.rule}`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: S.mono, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: typeBgs[r.type], color: typeColors[r.type], flexShrink: 0, marginTop: 2 }}>{typeLabels[r.type]}</span>
                  <div><div style={{ fontFamily: S.mono, fontSize: 11, fontWeight: 600 }}>{MODE_LABELS[m]}</div><p style={{ fontFamily: S.cormorant, fontSize: 14, color: '#444', margin: '2px 0 0', maxWidth: 'none' }}>{r.msg}</p></div>
                </div>
              ); })}
            </div>
          )}
        </>);
      }

      case 'share': return W('Share Card', <>
        {Eye('HOW TO WORK WITH ME')}{H('SEND THIS TO YOUR TEAM')}
        <div style={{ marginTop: 16, border: `2px solid ${S.black}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ background: S.black, padding: '20px', color: S.white }}>
            <div style={{ fontFamily: S.bebas, fontSize: 24 }}>HOW TO WORK WITH ME</div>
            <div style={{ fontFamily: S.mono, fontSize: 11, color: '#999', marginTop: 4 }}>Profile: {mo}</div>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 10 }}>MY STRENGTHS</div>
            {modes.map(m => <div key={m} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${S.rule}`, fontFamily: S.cormorant, fontSize: 15 }}><span style={{ fontWeight: 500 }}>{MODE_LABELS[m]}</span><span style={{ color: S.mid }}>{strengths[m].name} · {energy[m]}%</span></div>)}
            <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginTop: 16, marginBottom: 10 }}>WHAT I NEED FROM YOU</div>
            {modes.map(m => <div key={m} style={{ padding: '8px 0', borderBottom: `1px solid ${S.rule}` }}><p style={{ fontFamily: S.cormorant, fontSize: 14, fontStyle: 'italic', color: '#333', margin: 0, maxWidth: 'none' }}>"{strengths[m].othersKnow}"</p></div>)}
          </div>
        </div>
      </>);

      case 'checkin': return W('Weekly Check-In', <>
        {Eye('WEEKLY CHECK-IN')}{H('HOW ALIGNED WAS YOUR WEEK?')}
        {!weeklySubmitted ? (<>
          {modes.map(m => (
            <div key={m} style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: S.mono, fontSize: 11, fontWeight: 600 }}>{MODE_LABELS[m]}: {strengths[m].name}</span>
                <span style={{ fontFamily: S.bebas, fontSize: 20 }}>{weeklyRatings[m]}/5</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1,2,3,4,5].map(v => <button key={v} onClick={() => setWeeklyRatings(prev => ({ ...prev, [m]: v }))} style={{ flex: 1, padding: '8px 0', borderRadius: 4, fontFamily: S.bebas, fontSize: 17, border: `1.5px solid ${weeklyRatings[m] === v ? S.black : S.rule}`, background: weeklyRatings[m] === v ? S.black : S.white, color: weeklyRatings[m] === v ? S.white : S.black, cursor: 'pointer' }}>{v}</button>)}
              </div>
            </div>
          ))}
          <button onClick={() => setWeeklySubmitted(true)} style={{ marginTop: 20, width: '100%', padding: 12, fontFamily: S.bebas, fontSize: 17, background: S.black, color: S.white, border: 'none', borderRadius: 6, cursor: 'pointer' }}>SUBMIT</button>
        </>) : (() => {
          const avg = Object.values(weeklyRatings).reduce((a, b) => a + b, 0) / 4;
          const lowest = Object.entries(weeklyRatings).sort((a, b) => a[1] - b[1])[0];
          const cl = avg >= 4 ? '#16a34a' : avg >= 2.5 ? '#ca8a04' : '#dc2626';
          return (
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <div style={{ fontFamily: S.bebas, fontSize: 48, color: cl }}>{avg.toFixed(1)}/5</div>
              <p style={{ fontFamily: S.cormorant, fontSize: 15, color: '#444', marginTop: 8, maxWidth: 'none' }}>{avg >= 4 ? 'Strong week. Protect what\'s working.' : avg >= 2.5 ? 'Mixed week. Look at what drained you.' : 'Rough week. Something needs to change.'}</p>
              <div style={{ marginTop: 12, padding: 12, background: '#fff3ee', borderRadius: 6, textAlign: 'left' }}>
                <div style={{ fontFamily: S.mono, fontSize: 9, color: '#E8541A' }}>BIGGEST GAP: {MODE_LABELS[lowest[0]]}</div>
                <p style={{ fontFamily: S.cormorant, fontSize: 14, color: '#444', margin: '4px 0 0', maxWidth: 'none' }}>{DOMINANT_NARRATIVES[lowest[0]].reset}</p>
              </div>
              <button onClick={() => { setWeeklySubmitted(false); setWeeklyRatings({ FF:3, FT:3, QS:3, IMP:3 }); }} style={{ marginTop: 12, padding: '6px 16px', fontFamily: S.mono, fontSize: 11, background: 'transparent', border: `1px solid ${S.rule}`, borderRadius: 4, cursor: 'pointer' }}>RESET</button>
            </div>
          );
        })()}
      </>);

      case 'prompt': return W('Daily Prompt', <>
        {Eye('DAILY PROMPT')}{H('YOUR WIRING, APPLIED TODAY')}
        {!dailyDismissed ? (
          <div style={{ marginTop: 16, padding: 28, background: '#f0ede8', border: `1px solid ${S.rule}`, textAlign: 'center' }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 12 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            <div style={{ fontFamily: S.cormorant, fontSize: 'clamp(18px, 3vw, 24px)', fontStyle: 'italic', color: S.black, lineHeight: 1.4, maxWidth: 380, margin: '0 auto' }}>
              {dominant === 'FF' ? "Your brain runs on information. What's one thing worth researching today?" : dominant === 'FT' ? "Your brain runs on order. What's one open loop you can close today?" : dominant === 'QS' ? "Your brain runs on novelty. What's one new thing you can start today?" : "Your brain runs on making. What's one thing you can build with your hands today?"}
            </div>
            <button onClick={() => setDailyDismissed(true)} style={{ marginTop: 16, padding: '6px 20px', fontFamily: S.mono, fontSize: 11, background: 'transparent', border: `1px solid ${S.rule}`, color: S.mid, borderRadius: 4, cursor: 'pointer' }}>GOT IT</button>
          </div>
        ) : (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <p style={{ fontFamily: S.cormorant, fontSize: 16, color: S.mid }}>Prompt acknowledged.</p>
            <button onClick={() => setDailyDismissed(false)} style={{ marginTop: 8, padding: '6px 16px', fontFamily: S.mono, fontSize: 11, background: 'transparent', border: `1px solid ${S.rule}`, borderRadius: 4, cursor: 'pointer' }}>SHOW AGAIN</button>
          </div>
        )}
      </>);

      case 'career-detail': {
        const scored = CAREER_ARCHETYPES.map(c => ({ ...c, ...scoreCareerFit(c, zones, energy, dominant, resistance) })).sort((a, b) => b.alignment - a.alignment);
        const top5 = scored.filter(c => !c.deadIf).slice(0, 5);
        return W('Career Deep-Dive', <>
          {Eye('CAREER DEEP-DIVE')}{H('YOUR TOP 5, EXPANDED')}
          {top5.map((c, ci) => {
            const modeMatches = modes.filter(m => c.idealZones[m].includes(zones[m]));
            const modeClashes = modes.filter(m => !c.idealZones[m].includes(zones[m]) && zones[m] !== 'accommodate');
            return (
              <div key={c.id} style={{ marginTop: ci > 0 ? 20 : 12, border: `1.5px solid ${S.rule}`, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ background: '#f0ede8', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${S.rule}` }}>
                  <div><div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid }}>{c.category}</div><div style={{ fontFamily: S.bebas, fontSize: 20, color: S.black, marginTop: 2 }}>{c.icon} {c.title}</div></div>
                  <div style={{ fontFamily: S.bebas, fontSize: 24, color: '#16a34a' }}>{Math.round(c.alignment * 10)}%</div>
                </div>
                <div style={{ padding: 20 }}>
                  <p style={{ fontFamily: S.cormorant, fontSize: 15, color: '#333', lineHeight: 1.65, marginBottom: 14, maxWidth: 'none' }}>{c.desc}</p>
                  {modeMatches.length > 0 && <><div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 6 }}>STRENGTHS ACTIVATED</div><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>{modeMatches.map(m => <span key={m} style={{ fontFamily: S.mono, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 3, background: '#dcfce7', color: '#16a34a' }}>{strengths[m].name}</span>)}</div></>}
                  {modeClashes.length > 0 && <><div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 6 }}>WATCH FOR</div><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>{modeClashes.map(m => <span key={m} style={{ fontFamily: S.mono, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 3, background: '#fef9c3', color: '#ca8a04' }}>{MODE_LABELS[m]} friction</span>)}</div></>}
                  <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 4 }}>FIRST STEPS</div>
                  <p style={{ fontFamily: S.cormorant, fontSize: 14, color: '#444', lineHeight: 1.6, margin: 0, maxWidth: 'none' }}>
                    {c.freedom >= 80 ? 'Start as a side project. Test demand before going full-time. ' : 'Research the field. Talk to 3 people already doing this. '}
                    {c.creation >= 80 ? 'Build a portfolio or sample project. ' : 'Focus on credentials or case studies. '}
                    {c.income >= 85 ? 'High income ceiling, but ramp may take 6-12 months.' : 'Stable income path. Focus on the first client or role.'}
                  </p>
                </div>
              </div>
            );
          })}
        </>);
      }

      case 'explain-results': return W('Explain My Results', <>
        {Eye('EXPLAIN MY RESULTS')}{H('FOR SOMEONE WHO HASN\'T TAKEN THE TEST')}
        <div style={{ marginTop: 16, border: `2px solid ${S.black}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ background: S.black, padding: '24px 20px', color: S.white, textAlign: 'center' }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, color: '#888' }}>BEHAVIORAL PROFILE</div>
            <div style={{ fontFamily: S.bebas, fontSize: 40, marginTop: 6, letterSpacing: 3 }}>{mo}</div>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ fontFamily: S.bebas, fontSize: 19, marginBottom: 6 }}>IN PLAIN LANGUAGE</div>
            <p style={{ fontFamily: S.cormorant, fontSize: 15, color: '#333', lineHeight: 1.7, marginBottom: 16, maxWidth: 'none' }}>This person has been assessed on how they instinctively take action. Not personality. Not intelligence. Their natural "doing" pattern when free to be themselves.</p>
            <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 6 }}>HOW THEY OPERATE</div>
            <p style={{ fontFamily: S.cormorant, fontSize: 15, color: '#333', lineHeight: 1.7, marginBottom: 16, maxWidth: 'none' }}>{domData.how}</p>
            <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 6 }}>THEIR STRENGTHS</div>
            {modes.map(m => <div key={m} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${S.rule}`, fontFamily: S.cormorant, fontSize: 15 }}><span>{MODE_LABELS[m]}</span><span style={{ color: S.mid }}>{strengths[m].name} · {energy[m]}%</span></div>)}
          </div>
        </div>
      </>);

      case 'role-check': {
        const demandMap = [10, 30, 50, 70, 90];
        const options = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];
        const allAnswered = modes.every(m => roleSliders[m] !== null);

        const getGap = (m) => roleSliders[m] === null ? null : Math.abs(energy[m] - demandMap[roleSliders[m]]);
        const getStrainInfo = (gap) => {
          if (gap === null) return null;
          if (gap >= 40) return { label: 'HIGH STRAIN', color: '#dc2626', bg: '#fee2e2' };
          if (gap >= 20) return { label: 'FRICTION', color: '#ca8a04', bg: '#fef9c3' };
          return { label: 'ALIGNED', color: '#16a34a', bg: '#dcfce7' };
        };
        const strainMsg = (m) => {
          if (roleSliders[m] === null) return null;
          const roleEnergy = demandMap[roleSliders[m]];
          const gap = getGap(m);
          if (gap < 20) return "Role demands match your natural energy. No meaningful friction here.";
          const over = roleEnergy > energy[m];
          const msgs = {
            FF: {
              over: "The role needs more research and documentation than you naturally want to do. You'll push through, but it costs energy.",
              under: "You want to dig deeper than the role rewards. You'll feel like you're working with incomplete information."
            },
            FT: {
              over: "The role's structure and process are more rigid than you work best in. You'll feel constrained.",
              under: "The role needs more structure than you're wired to impose. Disorganization will creep in."
            },
            QS: {
              over: "The role demands more change and novelty than your wiring is built for. Constant pivoting drains you.",
              under: "The role is more stable and routine than your instinct for novelty. Boredom will set in."
            },
            IMP: {
              over: "The role requires more physical or hands-on work than your wiring prefers. You'll tire of it faster than peers who are built for it.",
              under: "The role is more abstract than you work best in. You need to build something tangible and the role won't give you that."
            }
          };
          return msgs[m][over ? 'over' : 'under'];
        };

        return W('Role Strain Check', <>
          {Eye('ROLE STRAIN CHECK')}{H('WHERE YOUR JOB FIGHTS YOUR WIRING')}
          <P>Rate how much each dimension your current role demands. The gap between your natural energy and the role's demands is where conative strain lives — the invisible reason you feel drained in a job you're objectively good at.</P>
          {modes.map(m => {
            const gap = getGap(m);
            const strainInfo = getStrainInfo(gap);
            const msg = strainMsg(m);
            return (
              <div key={m} style={{ marginTop: 16, padding: isMobile ? '14px' : '18px 20px', border: `1px solid ${S.rule}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.15em', color: S.mid, marginBottom: 2 }}>{MODE_LABELS[m]}</div>
                    <div style={{ fontFamily: S.bebas, fontSize: 20, color: S.black }}>{strengths[m].name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 2 }}>YOUR ENERGY</div>
                    <div style={{ fontFamily: S.bebas, fontSize: 22, color: S.black }}>{energy[m]}%</div>
                  </div>
                </div>
                <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.1em', color: S.mid, marginBottom: 8 }}>HOW MUCH DOES THIS ROLE DEMAND IT?</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {options.map((opt, oi) => (
                    <button key={oi} onClick={() => setRoleSliders(prev => ({ ...prev, [m]: oi }))}
                      style={{ flex: 1, padding: '8px 4px', fontFamily: S.mono, fontSize: 9, letterSpacing: '0.04em',
                        border: `1.5px solid ${roleSliders[m] === oi ? S.black : S.rule}`,
                        background: roleSliders[m] === oi ? S.black : 'transparent',
                        color: roleSliders[m] === oi ? S.white : S.mid,
                        cursor: 'pointer', textAlign: 'center' }}
                    >{opt}</button>
                  ))}
                </div>
                {strainInfo && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: S.mono, fontSize: 9, fontWeight: 700, padding: '3px 8px', background: strainInfo.bg, color: strainInfo.color, flexShrink: 0, whiteSpace: 'nowrap' }}>{strainInfo.label}</span>
                    <span style={{ fontFamily: S.cormorant, fontSize: 15, fontStyle: 'italic', color: '#555', lineHeight: 1.55 }}>{msg}</span>
                  </div>
                )}
              </div>
            );
          })}
          {allAnswered && (() => {
            const avgGap = modes.reduce((sum, m) => sum + getGap(m), 0) / 4;
            const overallColor = avgGap >= 35 ? '#dc2626' : avgGap >= 20 ? '#ca8a04' : '#16a34a';
            const overallLabel = avgGap >= 35 ? 'HIGH CONATIVE STRAIN' : avgGap >= 20 ? 'MODERATE FRICTION' : 'STRONG ALIGNMENT';
            const overallMsg = avgGap >= 35
              ? "This role is fighting your wiring in multiple dimensions. That's not sustainable. The energy you spend compensating is energy you don't have for actual output."
              : avgGap >= 20
              ? "Some friction. You can manage it, but it's costing you. See if you can negotiate the role to play more to your strengths."
              : "Your wiring fits this role reasonably well. If you feel drained, it's coming from something other than fundamental misalignment.";
            return (
              <div style={{ marginTop: 24, padding: '18px 20px', border: `2px solid ${overallColor}` }}>
                <div style={{ fontFamily: S.mono, fontSize: 9, color: overallColor, marginBottom: 6 }}>OVERALL ASSESSMENT</div>
                <div style={{ fontFamily: S.bebas, fontSize: 28, color: overallColor, marginBottom: 10 }}>{overallLabel}</div>
                <p style={{ fontFamily: S.cormorant, fontSize: 16, lineHeight: 1.65, color: '#333', margin: 0, maxWidth: 'none' }}>{overallMsg}</p>
              </div>
            );
          })()}
        </>);
      }

      default: return <SectionPage label="Not Found"><div style={{ padding: 40 }} /></SectionPage>;
    }
  };

  // ── Card click handler ───────────────────────────────────────────

  const handleCard = (card) => {
    if (card.external && onTool) { onTool(card.key); return; }
    setActiveSection(card.key);
    window.scrollTo(0, 0);
  };

  if (activeSection) return renderSection(activeSection);

  // ── Home dashboard ───────────────────────────────────────────────

  const NavRow = ({ card }) => (
    <button
      onClick={() => handleCard(card)}
      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '18px 16px', background: 'transparent', border: `1px solid ${S.rule}`, cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#f0ede8'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {card.num && (
        <span style={{ fontFamily: S.mono, fontSize: 11, color: S.mid, width: 28, textAlign: 'right', flexShrink: 0 }}>{card.num}</span>
      )}
      {!card.num && <span style={{ width: 28, flexShrink: 0 }} />}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: S.bebas, fontSize: 17, color: S.black, letterSpacing: '0.03em', lineHeight: 1.1, marginBottom: 2 }}>{card.label}</div>
        <div style={{ fontFamily: S.cormorant, fontSize: 14, color: S.mid, fontStyle: 'italic' }}>{card.desc}</div>
      </div>
      <span style={{ fontFamily: S.mono, fontSize: 12, color: S.mid, flexShrink: 0 }}>{card.external ? '↗' : '→'}</span>
    </button>
  );

  const visibleGroups = homeFilter && homeFilter !== 'tools'
    ? REPORT_GROUPS.filter(g => g.id === homeFilter)
    : homeFilter === 'tools'
    ? []
    : REPORT_GROUPS;

  const showTools = !homeFilter || homeFilter === 'tools';

  return (
    <div style={{ minHeight: '100vh', background: S.white }}>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: `1px solid ${S.rule}` }}>
        {onBack
          ? <button onClick={onBack} style={{ fontFamily: S.mono, fontSize: 11, letterSpacing: '0.1em', background: 'transparent', border: `1px solid ${S.rule}`, color: S.mid, padding: '10px 14px', cursor: 'pointer' }}>← DASHBOARD</button>
          : <div />}
        <div style={{ fontFamily: S.mono, fontSize: 11, letterSpacing: '0.2em', color: S.mid }}>PERSONAL OPERATING MANUAL</div>
        <div style={{ width: 80 }} />
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 680, margin: '0 auto', width: '100%', padding: isMobile ? '32px 24px 32px' : '56px 24px 48px', borderBottom: `1px solid ${S.rule}` }}>
        <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.3em', color: S.mid, marginBottom: 16 }}>YOUR BRAIN RUNS ON</div>
        <div style={{ fontFamily: S.bebas, fontSize: 'clamp(44px, 9vw, 80px)', color: S.black, lineHeight: 0.9, marginBottom: 24 }}>{MODE_LABELS[dominant].toUpperCase()}</div>
        <p style={{ fontFamily: S.cormorant, fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.7, color: '#333', maxWidth: 520, marginBottom: 0 }}>{domData.how}</p>
        {intent && INTENT_INTROS[intent] && (
          <p style={{ fontFamily: S.cormorant, fontSize: 16, fontStyle: 'italic', lineHeight: 1.6, color: S.mid, maxWidth: 520, margin: '16px 0 0' }}>{INTENT_INTROS[intent]}</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: S.rule, border: `1px solid ${S.rule}`, marginTop: 40 }}>
          {modes.map(m => (
            <div key={m} style={{ background: m === dominant ? '#f0ede8' : S.white, padding: isMobile ? '18px 16px' : '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.18em', color: S.mid }}>{MODE_LABELS[m].toUpperCase()}</div>
                <div style={{ fontFamily: S.bebas, fontSize: 28, color: energy[m] >= 55 ? S.black : S.mid, lineHeight: 1 }}>{energy[m]}%</div>
              </div>
              <div style={{ fontFamily: S.bebas, fontSize: 17, color: S.black, letterSpacing: '0.03em', marginBottom: 6 }}>{strengths[m].name}</div>
              <div style={{ fontFamily: S.cormorant, fontSize: 15, fontStyle: 'italic', lineHeight: 1.6, color: '#555' }}>{BEHAVIORAL_LINES[m][zones[m]]}</div>
              {m === dominant && <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.14em', color: S.mid, marginTop: 10 }}>DOMINANT</div>}
              {m === resistance && <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.14em', color: S.mid, marginTop: 10 }}>LOWEST ENERGY</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Tab pills */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 24px 4px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { id: null,      label: 'ALL' },
          { id: 'wiring',  label: 'WIRING' },
          { id: 'operate', label: 'OPERATE' },
          { id: 'career',  label: 'CAREER' },
          { id: 'tools',   label: 'TOOLS' },
        ].map(pill => (
          <button
            key={pill.label}
            onClick={() => setHomeFilter(pill.id)}
            style={{
              padding: '6px 14px', borderRadius: 100,
              fontFamily: S.mono, fontSize: 9, letterSpacing: '0.1em',
              border: `1px solid ${homeFilter === pill.id ? S.black : S.rule}`,
              background: homeFilter === pill.id ? S.black : 'transparent',
              color: homeFilter === pill.id ? S.white : S.mid,
              cursor: 'pointer', transition: 'all 0.12s',
            }}
          >{pill.label}</button>
        ))}
      </div>

      {/* Report navigation — grouped list rows */}
      <div style={{ maxWidth: 680, margin: '0 auto', paddingBottom: isMobile ? 72 : 0 }}>
        {visibleGroups.map(group => {
          const cards = REPORT_CARDS.filter(c => group.keys.includes(c.key));
          return (
            <div key={group.label} style={{ padding: '0 24px' }}>
              <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.25em', color: S.mid, padding: '28px 0 14px' }}>
                {group.label}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
                {cards.map(card => <NavRow key={card.key} card={card} />)}
              </div>
            </div>
          );
        })}

        {/* Tools */}
        {showTools && (
          <div style={{ padding: isMobile ? '0 24px 64px' : '0 24px 80px' }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.25em', color: S.mid, padding: '28px 0 14px' }}>
              TOOLS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
              {TOOL_CARDS.map(card => <NavRow key={card.key} card={card} />)}
            </div>
          </div>
        )}
      </div>

      {isMobile && <BottomTabs activeKey={null} />}
    </div>
  );
}
