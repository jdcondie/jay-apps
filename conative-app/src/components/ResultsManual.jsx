import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile.js';
import { STRENGTH_DATA, MODE_LABELS, DOMINANT_NARRATIVES, RESISTANCE_NARRATIVES, DANGER_ZONES, GAME_TYPE, LOOP_DESCRIPTION } from '../data/strengthData.js';
import SpectrumBar, { BEHAVIORAL_LINES } from './SpectrumBar.jsx';
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
];

const REPORT_GROUPS = [
  { label: 'YOUR WIRING',                 keys: ['explain','scores','game','strengths','superpowers','ability','shadows'] },
  { label: 'HOW YOU OPERATE',             keys: ['danger','success','procrastination','reset','daily'] },
  { label: 'WORKING WITH OTHERS / CAREER',keys: ['comms','stress','careers'] },
];

export default function ResultsManual({ results, onBack, onTool }) {
  const { scores, energy, zones, strengths, dominant, resistance, mo } = results;
  const domData = DOMINANT_NARRATIVES[dominant];
  const resData = RESISTANCE_NARRATIVES[resistance];
  const modes = ['FF', 'FT', 'QS', 'IMP'];
  const isMobile = useIsMobile();

  const [activeSection, setActiveSection] = useState(null);
  const [careerFilter, setCareerFilter] = useState('all');
  const [stressSymptoms, setStressSymptoms] = useState([]);
  const [decisionAnswers, setDecisionAnswers] = useState({});
  const [partnerZones, setPartnerZones] = useState({ FF: null, FT: null, QS: null, IMP: null });
  const [compatResult, setCompatResult] = useState(null);
  const [weeklyRatings, setWeeklyRatings] = useState({ FF: 3, FT: 3, QS: 3, IMP: 3 });
  const [weeklySubmitted, setWeeklySubmitted] = useState(false);
  const [dailyDismissed, setDailyDismissed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [abilityDomain, setAbilityDomain] = useState('');

  const toggleSection = (key) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  const goBack = () => { setActiveSection(null); window.scrollTo(0, 0); };

  // ── Light-mode sub-components ────────────────────────────────────

  const P = ({ children, style: sx }) => (
    <p style={{ fontFamily: S.cormorant, fontSize: 18, lineHeight: 1.75, color: '#333', marginBottom: 16, maxWidth: 540, ...sx }}>{children}</p>
  );
  const Pull = ({ children }) => (
    <div style={{ fontFamily: S.cormorant, fontSize: 'clamp(20px, 3vw, 26px)', fontStyle: 'italic', fontWeight: 500, lineHeight: 1.35, color: S.black, borderLeft: `3px solid ${S.black}`, paddingLeft: 24, margin: '24px 0', maxWidth: 480 }}>{children}</div>
  );
  const Label = ({ children }) => (
    <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: S.mid, margin: '28px 0 10px', paddingBottom: 8, borderBottom: `1px solid ${S.rule}` }}>{children}</div>
  );
  const Item = ({ children }) => (
    <div style={{ padding: '12px 0', borderBottom: `1px solid ${S.rule}`, fontFamily: S.cormorant, fontSize: 16, lineHeight: 1.65, color: '#333', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
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
          <span style={{ fontFamily: S.bebas, fontSize: 18, color: S.mid }}>{isOpen ? '−' : '+'}</span>
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

  // ── Section page shell (always light) ───────────────────────────

  const SectionPage = ({ sectionKey, label, children }) => {
    const idx = REPORT_CARDS.findIndex(c => c.key === sectionKey);
    const prev = idx > 0 ? REPORT_CARDS[idx - 1] : null;
    const next = idx < REPORT_CARDS.length - 1 ? REPORT_CARDS[idx + 1] : null;
    const btnStyle = { fontFamily: S.mono, fontSize: 10, letterSpacing: '0.1em', background: 'transparent', border: `1px solid ${S.rule}`, color: S.mid, padding: '10px 14px', cursor: 'pointer', whiteSpace: 'nowrap' };
    return (
      <div style={{ minHeight: '100vh', background: S.white }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: `1px solid ${S.rule}`, position: 'sticky', top: 0, background: S.white, zIndex: 10, gap: 8 }}>
          <button onClick={goBack} style={btnStyle}>← REPORT</button>
          <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.2em', color: S.mid, textAlign: 'center', flex: 1 }}>{label.toUpperCase()}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {prev && <button onClick={() => { setActiveSection(prev.key); window.scrollTo(0,0); }} style={btnStyle}>← {isMobile ? prev.num : prev.label.toUpperCase()}</button>}
            {next && <button onClick={() => { setActiveSection(next.key); window.scrollTo(0,0); }} style={{ ...btnStyle, background: '#f0ede8' }}>{isMobile ? next.num : next.label.toUpperCase()} →</button>}
          </div>
        </div>
        {children}
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
    const Eye = (text) => <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.3em', color: S.mid, marginBottom: 14 }}>{text}</div>;

    switch (key) {

      case 'explain': return W('What This Means', <>
        {Eye('IN PLAIN LANGUAGE')}{H('HOW YOU OPERATE')}
        <p style={{ fontFamily: S.cormorant, fontSize: 'clamp(19px, 2.5vw, 24px)', lineHeight: 1.65, color: '#222', marginBottom: 20 }}>{domData.how}</p>
        <p style={{ fontFamily: S.cormorant, fontSize: 16, lineHeight: 1.7, color: '#555', marginBottom: 20 }}>Your strongest instinct is <strong style={{ color: S.black }}>{MODE_LABELS[dominant]}</strong> ({strengths[dominant].name}). {strengths[dominant].superpower}</p>
        <p style={{ fontFamily: S.cormorant, fontSize: 16, lineHeight: 1.7, color: '#555', marginBottom: 20 }}>Your lowest-energy dimension is <strong style={{ color: S.black }}>{MODE_LABELS[resistance]}</strong>. {resData}</p>
        <div style={{ borderLeft: `3px solid ${S.rule}`, paddingLeft: 20, marginTop: 8 }}>
          <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.2em', color: S.mid, marginBottom: 6 }}>YOUR GAME</div>
          <p style={{ fontFamily: S.cormorant, fontSize: 16, lineHeight: 1.7, color: '#333', margin: 0 }}><strong>{GAME_TYPE[dominant][zones[dominant]].title}.</strong> {GAME_TYPE[dominant][zones[dominant]].wins}</p>
        </div>
      </>);

      case 'game': return W('Your Game', <>
        {Eye('WHAT YOU\'RE WIRED TO WIN AT')}{H('KNOW WHAT GAME YOU\'RE PLAYING')}
        <P>Your wiring predisposes you to thrive in certain environments and grind against others. This isn't about what you can do. It's about where you're set up to win.</P>
        <Pull>{GAME_TYPE[dominant][zones[dominant]].wins}</Pull>
        <Label>Your Game Type</Label>
        <P style={{ fontSize: 15 }}>{GAME_TYPE[dominant][zones[dominant]].title}</P>
        <Label>Your Loop</Label>
        <P style={{ fontSize: 15, fontFamily: S.mono, letterSpacing: '0.04em' }}>{LOOP_DESCRIPTION[dominant][zones[dominant]]}</P>
        <Label>Fatal Game</Label>
        <P style={{ fontSize: 15 }}>{GAME_TYPE[dominant][zones[dominant]].fatal}</P>
        <Label>All Four Dimensions</Label>
        {modes.map(m => (
          <div key={m} style={{ borderLeft: `4px solid ${S.rule}`, padding: '12px 20px', margin: '10px 0' }}>
            <div style={{ fontFamily: S.bebas, fontSize: 16, color: S.black, marginBottom: 4 }}>{MODE_LABELS[m]}: {GAME_TYPE[m][zones[m]].title}</div>
            <p style={{ fontFamily: S.cormorant, fontSize: 14, color: '#666', margin: 0, lineHeight: 1.6 }}>{GAME_TYPE[m][zones[m]].wins}</p>
          </div>
        ))}
      </>);

      case 'scores': return W('Your Scores', <>
        {Eye('YOUR SCORES')}{H('FOUR DIMENSIONS OF ACTION')}
        <P>These four dimensions describe how you instinctively approach information, organization, change, and physical work. Position matters more than direction.</P>
        <div style={{ marginTop: 8 }}>
          {modes.map(m => <SpectrumBar key={m} mode={m} score={scores[m]} energy={energy[m]} name={strengths[m].name} />)}
        </div>
        <Pull>When someone forces you into a pattern that violates your wiring, the friction you feel isn't you being difficult. It's real stress caused by working against your instincts.</Pull>
      </>);

      case 'strengths': return W('Your Strengths', <>
        {Eye('YOUR STRENGTHS')}{H('WHAT YOU NATURALLY DO BETTER THAN MOST')}
        {modes.map(m => (
          <div key={m} style={{ border: `1px solid ${S.rule}`, padding: 24, marginBottom: -1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.2em', color: S.mid, marginBottom: 4 }}>{MODE_LABELS[m]} — {energy[m]}% energy</div>
                <div style={{ fontFamily: S.bebas, fontSize: 24 }}>{strengths[m].name}: {strengths[m].title}</div>
              </div>
            </div>
            <p style={{ fontFamily: S.cormorant, fontSize: 16, lineHeight: 1.7, color: '#333', margin: '12px 0 0' }}>{strengths[m].desc}</p>
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
            <P style={{ fontSize: 15 }}>{strengths[m].atBest}</P>
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
          <P>Template: <span style={{ color: S.black, fontFamily: S.mono, fontSize: 13 }}>[Wiring 1] + [Wiring 2] applied to [your domain/audience]</span></P>
          <Label>Your Two Strongest Wirings</Label>
          <div style={{ display: 'flex', gap: 12, margin: '4px 0 24px' }}>
            {topTwo.map(name => (
              <div key={name} style={{ padding: '10px 20px', border: `1px solid ${S.black}`, fontFamily: S.bebas, fontSize: 20, color: S.black, letterSpacing: '0.05em' }}>{name}</div>
            ))}
          </div>
          <Label>All Four Wirings</Label>
          {modes.map(m => (
            <div key={m} style={{ padding: '8px 0', borderBottom: `1px solid ${S.rule}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: S.mono, fontSize: 10, color: S.mid, letterSpacing: '0.15em' }}>{MODE_LABELS[m]}</span>
              <span style={{ fontFamily: S.bebas, fontSize: 18, color: energy[m] >= 50 ? S.black : S.mid, letterSpacing: '0.05em' }}>{STRENGTH_DATA[m][zones[m]].name}</span>
            </div>
          ))}
          <Label>Your Domain / Audience</Label>
          <P style={{ fontSize: 14, marginBottom: 8 }}>What field, industry, or type of person does your wiring run best in service of?</P>
          <input
            value={abilityDomain}
            onChange={e => setAbilityDomain(e.target.value)}
            placeholder="e.g. early-stage founders, DTC brands, product teams..."
            style={{
              width: '100%', padding: '14px 16px', background: S.white, border: `1px solid ${S.rule}`,
              color: S.black, fontFamily: S.cormorant, fontSize: 16, outline: 'none',
              boxSizing: 'border-box', letterSpacing: '0.02em',
            }}
          />
          {assembled && (
            <>
              <Label>Your Unique Ability</Label>
              <Pull>{assembled}</Pull>
              <P style={{ fontSize: 13, color: S.mid }}>If it sounds generic, the domain is too broad. Sharpen the audience until the sentence has teeth.</P>
            </>
          )}
        </>);
      }

      case 'shadows': return W('Watch For', <>
        {Eye('WATCH FOR')}{H('WHERE YOUR WIRING CAN WORK AGAINST YOU')}
        {modes.map(m => (
          <div key={m} style={{ borderLeft: `4px solid ${S.rule}`, padding: '14px 20px', margin: '12px 0' }}>
            <div style={{ fontFamily: S.bebas, fontSize: 18, marginBottom: 6 }}>{MODE_LABELS[m]}: {strengths[m].name}</div>
            <p style={{ fontFamily: S.cormorant, fontSize: 15, lineHeight: 1.65, color: '#444', margin: 0 }}>{strengths[m].shadow}</p>
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
              <div style={{ fontFamily: S.bebas, fontSize: 18, color: S.black, marginBottom: 6 }}>{MODE_LABELS[m]}: {strengths[m].name}</div>
              <p style={{ fontFamily: S.cormorant, fontSize: 15, color: '#555', margin: 0, lineHeight: 1.65 }}>{isHigh ? DANGER_ZONES[m].high : DANGER_ZONES[m].low}</p>
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
          <div style={{ background: S.black, color: S.white, padding: '12px 20px', fontFamily: S.mono, fontSize: 10, letterSpacing: '0.2em' }}>60-SECOND RESET</div>
          {['Stop everything completely.', 'One slow breath. Nose in, mouth out.', 'Notice: body tight? Scattered? Heavy?', domData.reset, 'Do just that one thing.'].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 20px', borderBottom: `1px solid ${S.rule}`, fontFamily: S.cormorant, fontSize: 15, lineHeight: 1.65, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: S.bebas, fontSize: 20, color: S.mid, flexShrink: 0 }}>{i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </>);

      case 'daily': return W('Daily Rules', <>
        {Eye('DAILY OPERATING RULES')}{H('BASELINE CONDITIONS')}
        <P>Treat these like maintenance, not motivation.</P>
        <Label>Morning</Label>
        <Item>Move before you open the phone. Even 10 minutes.</Item>
        <Item>One clear intention. Not a list. One thing.</Item>
        <Item>First 2 hours: deep creative or strategic work only.</Item>
        <Label>During the Day</Label>
        <Item>45-90 minute timed blocks. Real break after.</Item>
        <Item>Stuck? Move your body. Walk. Stretch. It resets the chemistry.</Item>
        <Item>Create something. Even small. Creation is fuel.</Item>
        <Label>End of Day</Label>
        <Item>What gave you energy? Do more of that.</Item>
        <Item>What drained you? Reduce or eliminate tomorrow.</Item>
      </>);

      case 'comms': return W('Communication', <>
        {Eye('COMMUNICATION GUIDE')}{H('WHAT OTHERS SHOULD KNOW ABOUT YOU')}
        {modes.map(m => (
          <div key={m} style={{ padding: '16px 0', borderBottom: `1px solid ${S.rule}` }}>
            <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.15em', color: S.mid, marginBottom: 6 }}>{MODE_LABELS[m]} ({strengths[m].name})</div>
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
            <P style={{ fontSize: 15 }}>{strengths[m].underStress}</P>
          </div>
        ))}
      </>);

      case 'careers': {
        const scored = CAREER_ARCHETYPES.map(c => ({ ...c, ...scoreCareerFit(c, zones, energy, dominant) })).sort((a, b) => b.alignment - a.alignment);
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
          <SectionPage label="Career Map">
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
              {[{key:'t1',label:'Strong Fit Careers',items:filtered.filter(c=>c.fit===1)},{key:'t2',label:'Possible Fit Careers',items:filtered.filter(c=>c.fit===2)},{key:'t3',label:'Poor Fit / Caution',items:filtered.filter(c=>c.fit===3)}].filter(g=>g.items.length>0).map(group => (
                <Collapsible key={group.key} sectionKey={`career-${group.key}`} label={`${group.label} (${group.items.length})`} defaultOpen={group.key === 't1'}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14, marginTop: 8 }}>
                    {group.items.map(c => (
                      <div key={c.id} style={{ background: S.white, border: `1.5px solid ${S.rule}`, borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 9, fontFamily: S.mono, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: fitBg(c.fit), color: fitColor(c.fit) }}>{fitLabel(c.fit)}</div>
                        <div style={{ fontSize: 20, marginBottom: 10 }}>{c.icon}</div>
                        <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: S.mid, marginBottom: 3 }}>{c.category}</div>
                        <div style={{ fontFamily: S.bebas, fontSize: 18, color: S.black, lineHeight: 1.15, marginBottom: 3, paddingRight: 56 }}>{c.title}</div>
                        <div style={{ fontFamily: S.cormorant, fontSize: 12, fontStyle: 'italic', color: S.mid, marginBottom: 10 }}>{c.subtitle}</div>
                        <p style={{ fontFamily: S.cormorant, fontSize: 13, color: '#3d3d3d', lineHeight: 1.65, marginBottom: 14, flex: 1, maxWidth: 'none' }}>{c.desc}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
                          <Metric label="Freedom" value={c.freedom} /><Metric label="Energy Fit" value={c.energyFit} />
                          <Metric label="Creation" value={c.creation} /><Metric label="Income" value={c.income} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: `1px solid ${S.rule}`, marginTop: 'auto' }}>
                          <span style={{ fontFamily: S.mono, fontSize: 10, color: S.mid }}>Alignment</span>
                          <span style={{ fontFamily: S.bebas, fontSize: 20, color: scoreColor(c.alignment) }}>{Math.round(c.alignment * 10)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Collapsible>
              ))}
              {deadZones.length > 0 && (
                <Collapsible sectionKey="dead-zones" label={`Careers to Avoid (${deadZones.length})`}>
                  {deadZones.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: `1px solid ${S.rule}`, alignItems: 'flex-start' }}>
                      <span style={{ fontFamily: S.mono, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: '#fee2e2', color: '#dc2626', flexShrink: 0 }}>AVOID</span>
                      <div><div style={{ fontFamily: S.mono, fontSize: 11, fontWeight: 600, color: S.black }}>{c.title}</div><p style={{ fontFamily: S.cormorant, fontSize: 13, color: '#555', margin: '4px 0 0', maxWidth: 'none' }}>{c.deadIf}</p></div>
                    </div>
                  ))}
                </Collapsible>
              )}
            </div>
          </SectionPage>
        );
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
              <button key={s.id} onClick={() => setStressSymptoms(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px', background: stressSymptoms.includes(s.id) ? '#fee2e2' : 'transparent', border: 'none', borderBottom: `1px solid ${S.rule}`, cursor: 'pointer', textAlign: 'left', fontFamily: S.cormorant, fontSize: 15, color: S.black }}>
                <span style={{ width: 18, height: 18, borderRadius: 3, border: `2px solid ${stressSymptoms.includes(s.id) ? '#dc2626' : S.rule}`, background: stressSymptoms.includes(s.id) ? '#dc2626' : 'transparent', color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{stressSymptoms.includes(s.id) ? '✓' : ''}</span>
                {s.label}
              </button>
            ))}
          </div>
          {topViolated.length > 0 && (
            <div style={{ marginTop: 24, padding: 20, background: '#f0ede8', border: `1px solid ${S.rule}` }}>
              <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 8 }}>DIAGNOSIS</div>
              <div style={{ fontFamily: S.bebas, fontSize: 22, marginBottom: 10 }}>{MODE_LABELS[topViolated[0][0]]} Stress</div>
              <p style={{ fontFamily: S.cormorant, fontSize: 14, color: '#333', lineHeight: 1.65, marginBottom: 12, maxWidth: 'none' }}>{stressNarratives[topViolated[0][0]].cause}</p>
              <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 6 }}>YOUR FIX</div>
              <p style={{ fontFamily: S.cormorant, fontSize: 14, color: '#333', lineHeight: 1.65, maxWidth: 'none' }}>{stressNarratives[topViolated[0][0]].fix}</p>
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
              <div style={{ fontFamily: S.mono, fontSize: 10, color: S.mid, marginBottom: 6 }}>{q.label}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {q.options.map((opt, oi) => (
                  <button key={oi} onClick={() => setDecisionAnswers(prev => ({ ...prev, [q.id]: oi }))} style={{ flex: 1, padding: '8px 6px', borderRadius: 6, fontFamily: S.cormorant, fontSize: 13, border: `1.5px solid ${decisionAnswers[q.id] === oi ? S.black : S.rule}`, background: decisionAnswers[q.id] === oi ? S.black : S.white, color: decisionAnswers[q.id] === oi ? S.white : S.black, cursor: 'pointer' }}>{opt}</button>
                ))}
              </div>
            </div>
          ))}
          {sc !== null && (() => {
            const cl = sc >= 7.5 ? '#16a34a' : sc >= 5 ? '#ca8a04' : '#dc2626';
            return (
              <div style={{ marginTop: 24, padding: 20, border: `2px solid ${cl}`, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontFamily: S.bebas, fontSize: 44, color: cl }}>{Math.round(sc * 10)}%</div>
                <p style={{ fontFamily: S.cormorant, fontSize: 14, color: '#444', marginTop: 6, maxWidth: 'none' }}>{sc >= 7.5 ? 'Strong alignment with your wiring.' : sc >= 5 ? 'Partial fit. Some elements match, others will cost energy.' : 'Significant misalignment. Proceed with extreme caution.'}</p>
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
                <div style={{ fontFamily: S.mono, fontSize: 10, color: S.mid, marginBottom: 8 }}>{MODE_LABELS[m]}</div>
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
          <button onClick={runCompat} disabled={!allSelected} style={{ width: '100%', padding: 10, fontFamily: S.bebas, fontSize: 16, background: allSelected ? S.black : '#eee', color: allSelected ? S.white : '#aaa', border: 'none', borderRadius: 6, cursor: allSelected ? 'pointer' : 'default' }}>ANALYZE</button>
          {compatResult && (
            <div style={{ marginTop: 20 }}>
              {modes.map(m => { const r = compatResult[m]; return (
                <div key={m} style={{ padding: '12px 0', borderBottom: `1px solid ${S.rule}`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: S.mono, fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: typeBgs[r.type], color: typeColors[r.type], flexShrink: 0, marginTop: 2 }}>{typeLabels[r.type]}</span>
                  <div><div style={{ fontFamily: S.mono, fontSize: 10, fontWeight: 600 }}>{MODE_LABELS[m]}</div><p style={{ fontFamily: S.cormorant, fontSize: 13, color: '#444', margin: '2px 0 0', maxWidth: 'none' }}>{r.msg}</p></div>
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
            <div style={{ fontFamily: S.mono, fontSize: 10, color: '#999', marginTop: 4 }}>Profile: {mo}</div>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 10 }}>MY STRENGTHS</div>
            {modes.map(m => <div key={m} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${S.rule}`, fontFamily: S.cormorant, fontSize: 14 }}><span style={{ fontWeight: 500 }}>{MODE_LABELS[m]}</span><span style={{ color: S.mid }}>{strengths[m].name} · {energy[m]}%</span></div>)}
            <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginTop: 16, marginBottom: 10 }}>WHAT I NEED FROM YOU</div>
            {modes.map(m => <div key={m} style={{ padding: '8px 0', borderBottom: `1px solid ${S.rule}` }}><p style={{ fontFamily: S.cormorant, fontSize: 13, fontStyle: 'italic', color: '#333', margin: 0, maxWidth: 'none' }}>"{strengths[m].othersKnow}"</p></div>)}
          </div>
        </div>
      </>);

      case 'checkin': return W('Weekly Check-In', <>
        {Eye('WEEKLY CHECK-IN')}{H('HOW ALIGNED WAS YOUR WEEK?')}
        {!weeklySubmitted ? (<>
          {modes.map(m => (
            <div key={m} style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: S.mono, fontSize: 10, fontWeight: 600 }}>{MODE_LABELS[m]}: {strengths[m].name}</span>
                <span style={{ fontFamily: S.bebas, fontSize: 20 }}>{weeklyRatings[m]}/5</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1,2,3,4,5].map(v => <button key={v} onClick={() => setWeeklyRatings(prev => ({ ...prev, [m]: v }))} style={{ flex: 1, padding: '8px 0', borderRadius: 4, fontFamily: S.bebas, fontSize: 16, border: `1.5px solid ${weeklyRatings[m] === v ? S.black : S.rule}`, background: weeklyRatings[m] === v ? S.black : S.white, color: weeklyRatings[m] === v ? S.white : S.black, cursor: 'pointer' }}>{v}</button>)}
              </div>
            </div>
          ))}
          <button onClick={() => setWeeklySubmitted(true)} style={{ marginTop: 20, width: '100%', padding: 12, fontFamily: S.bebas, fontSize: 16, background: S.black, color: S.white, border: 'none', borderRadius: 6, cursor: 'pointer' }}>SUBMIT</button>
        </>) : (() => {
          const avg = Object.values(weeklyRatings).reduce((a, b) => a + b, 0) / 4;
          const lowest = Object.entries(weeklyRatings).sort((a, b) => a[1] - b[1])[0];
          const cl = avg >= 4 ? '#16a34a' : avg >= 2.5 ? '#ca8a04' : '#dc2626';
          return (
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <div style={{ fontFamily: S.bebas, fontSize: 48, color: cl }}>{avg.toFixed(1)}/5</div>
              <p style={{ fontFamily: S.cormorant, fontSize: 14, color: '#444', marginTop: 8, maxWidth: 'none' }}>{avg >= 4 ? 'Strong week. Protect what\'s working.' : avg >= 2.5 ? 'Mixed week. Look at what drained you.' : 'Rough week. Something needs to change.'}</p>
              <div style={{ marginTop: 12, padding: 12, background: '#fff3ee', borderRadius: 6, textAlign: 'left' }}>
                <div style={{ fontFamily: S.mono, fontSize: 9, color: '#E8541A' }}>BIGGEST GAP: {MODE_LABELS[lowest[0]]}</div>
                <p style={{ fontFamily: S.cormorant, fontSize: 13, color: '#444', margin: '4px 0 0', maxWidth: 'none' }}>{DOMINANT_NARRATIVES[lowest[0]].reset}</p>
              </div>
              <button onClick={() => { setWeeklySubmitted(false); setWeeklyRatings({ FF:3, FT:3, QS:3, IMP:3 }); }} style={{ marginTop: 12, padding: '6px 16px', fontFamily: S.mono, fontSize: 10, background: 'transparent', border: `1px solid ${S.rule}`, borderRadius: 4, cursor: 'pointer' }}>RESET</button>
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
            <button onClick={() => setDailyDismissed(true)} style={{ marginTop: 16, padding: '6px 20px', fontFamily: S.mono, fontSize: 10, background: 'transparent', border: `1px solid ${S.rule}`, color: S.mid, borderRadius: 4, cursor: 'pointer' }}>GOT IT</button>
          </div>
        ) : (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <p style={{ fontFamily: S.cormorant, fontSize: 15, color: S.mid }}>Prompt acknowledged.</p>
            <button onClick={() => setDailyDismissed(false)} style={{ marginTop: 8, padding: '6px 16px', fontFamily: S.mono, fontSize: 10, background: 'transparent', border: `1px solid ${S.rule}`, borderRadius: 4, cursor: 'pointer' }}>SHOW AGAIN</button>
          </div>
        )}
      </>);

      case 'career-detail': {
        const scored = CAREER_ARCHETYPES.map(c => ({ ...c, ...scoreCareerFit(c, zones, energy, dominant) })).sort((a, b) => b.alignment - a.alignment);
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
                  <p style={{ fontFamily: S.cormorant, fontSize: 14, color: '#333', lineHeight: 1.65, marginBottom: 14, maxWidth: 'none' }}>{c.desc}</p>
                  {modeMatches.length > 0 && <><div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 6 }}>STRENGTHS ACTIVATED</div><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>{modeMatches.map(m => <span key={m} style={{ fontFamily: S.mono, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 3, background: '#dcfce7', color: '#16a34a' }}>{strengths[m].name}</span>)}</div></>}
                  {modeClashes.length > 0 && <><div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 6 }}>WATCH FOR</div><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>{modeClashes.map(m => <span key={m} style={{ fontFamily: S.mono, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 3, background: '#fef9c3', color: '#ca8a04' }}>{MODE_LABELS[m]} friction</span>)}</div></>}
                  <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 4 }}>FIRST STEPS</div>
                  <p style={{ fontFamily: S.cormorant, fontSize: 13, color: '#444', lineHeight: 1.6, margin: 0, maxWidth: 'none' }}>
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
            <div style={{ fontFamily: S.bebas, fontSize: 18, marginBottom: 6 }}>IN PLAIN LANGUAGE</div>
            <p style={{ fontFamily: S.cormorant, fontSize: 14, color: '#333', lineHeight: 1.7, marginBottom: 16, maxWidth: 'none' }}>This person has been assessed on how they instinctively take action. Not personality. Not intelligence. Their natural "doing" pattern when free to be themselves.</p>
            <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 6 }}>HOW THEY OPERATE</div>
            <p style={{ fontFamily: S.cormorant, fontSize: 14, color: '#333', lineHeight: 1.7, marginBottom: 16, maxWidth: 'none' }}>{domData.how}</p>
            <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mid, marginBottom: 6 }}>THEIR STRENGTHS</div>
            {modes.map(m => <div key={m} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${S.rule}`, fontFamily: S.cormorant, fontSize: 14 }}><span>{MODE_LABELS[m]}</span><span style={{ color: S.mid }}>{strengths[m].name} · {energy[m]}%</span></div>)}
          </div>
        </div>
      </>);

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
      style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', padding: '16px 0', background: 'transparent', border: 'none', borderBottom: `1px solid ${S.rule}`, cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#f0ede8'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {card.num && (
        <span style={{ fontFamily: S.mono, fontSize: 10, color: S.mid, width: 28, textAlign: 'right', flexShrink: 0 }}>{card.num}</span>
      )}
      {!card.num && <span style={{ width: 28, flexShrink: 0 }} />}
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: S.bebas, fontSize: 17, color: S.black, letterSpacing: '0.03em', lineHeight: 1.1, marginBottom: 2 }}>{card.label}</div>
        <div style={{ fontFamily: S.cormorant, fontSize: 13, color: S.mid, fontStyle: 'italic' }}>{card.desc}</div>
      </div>
      <span style={{ fontFamily: S.mono, fontSize: 12, color: S.mid, flexShrink: 0 }}>{card.external ? '↗' : '→'}</span>
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', background: S.white }}>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: `1px solid ${S.rule}` }}>
        {onBack
          ? <button onClick={onBack} style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.1em', background: 'transparent', border: `1px solid ${S.rule}`, color: S.mid, padding: '10px 14px', cursor: 'pointer' }}>← DASHBOARD</button>
          : <div />}
        <div style={{ fontFamily: S.mono, fontSize: 10, letterSpacing: '0.2em', color: S.mid }}>PERSONAL OPERATING MANUAL</div>
        <div style={{ width: 80 }} />
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 680, margin: '0 auto', width: '100%', padding: isMobile ? '32px 24px 32px' : '56px 24px 48px', borderBottom: `1px solid ${S.rule}` }}>
        <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.3em', color: S.mid, marginBottom: 16 }}>YOUR BRAIN RUNS ON</div>
        <div style={{ fontFamily: S.bebas, fontSize: 'clamp(44px, 9vw, 80px)', color: S.black, lineHeight: 0.9, marginBottom: 24 }}>{MODE_LABELS[dominant].toUpperCase()}</div>
        <p style={{ fontFamily: S.cormorant, fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.7, color: '#333', maxWidth: 520, marginBottom: 0 }}>{domData.how}</p>

        <div style={{ height: 1, background: S.rule, margin: '36px 0' }} />

        <div>
          {modes.map(m => (
            <div key={m} style={{ display: 'flex', gap: 20, padding: '14px 0', borderBottom: `1px solid ${S.rule}`, alignItems: 'flex-start' }}>
              <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.2em', color: S.mid, width: 88, flexShrink: 0, paddingTop: 3 }}>{MODE_LABELS[m].toUpperCase()}</div>
              <div style={{ fontFamily: S.cormorant, fontSize: 16, lineHeight: 1.65, color: '#333' }}>{BEHAVIORAL_LINES[m][zones[m]]}</div>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: S.rule, margin: '32px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>
          <div>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.2em', color: S.mid, marginBottom: 10 }}>STRONGEST SIGNAL</div>
            <div style={{ fontFamily: S.bebas, fontSize: 26, color: S.black, letterSpacing: '0.02em' }}>{MODE_LABELS[dominant]}</div>
            <div style={{ fontFamily: S.cormorant, fontSize: 14, fontStyle: 'italic', color: '#555', marginTop: 4 }}>{strengths[dominant].name}</div>
          </div>
          <div>
            <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.2em', color: S.mid, marginBottom: 10 }}>BIGGEST FRICTION</div>
            <div style={{ fontFamily: S.bebas, fontSize: 26, color: S.black, letterSpacing: '0.02em' }}>{MODE_LABELS[resistance]}</div>
            <div style={{ fontFamily: S.cormorant, fontSize: 14, fontStyle: 'italic', color: '#555', marginTop: 4 }}>{strengths[resistance].name} · {RESISTANCE_NARRATIVES[resistance].split('.')[0]}.</div>
          </div>
        </div>
      </div>

      {/* Report navigation — grouped list rows */}
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {REPORT_GROUPS.map(group => {
          const cards = REPORT_CARDS.filter(c => group.keys.includes(c.key));
          return (
            <div key={group.label} style={{ padding: isMobile ? '0 24px' : '0 24px' }}>
              <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.25em', color: S.mid, padding: '28px 0 12px', borderBottom: `1px solid ${S.rule}` }}>
                {group.label}
              </div>
              {cards.map(card => <NavRow key={card.key} card={card} />)}
            </div>
          );
        })}

        {/* Tools */}
        <div style={{ padding: isMobile ? '0 24px 64px' : '0 24px 80px' }}>
          <div style={{ fontFamily: S.mono, fontSize: 9, letterSpacing: '0.25em', color: S.mid, padding: '28px 0 12px', borderBottom: `1px solid ${S.rule}` }}>
            TOOLS
          </div>
          {TOOL_CARDS.map(card => <NavRow key={card.key} card={card} />)}
        </div>
      </div>
    </div>
  );
}
