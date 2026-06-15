import { useState, useEffect, useCallback } from 'react';
import { fonts, S } from './styles/theme.js';
import { QUESTIONS } from './data/questions.js';
import { scoreAssessment } from './scoring/scoringEngine.js';
import { supabase } from './lib/supabase.js';
import AuthScreen from './components/AuthScreen.jsx';
import Dashboard from './components/Dashboard.jsx';
import IntroScreen from './components/IntroScreen.jsx';
import QuizFlow from './components/QuizFlow.jsx';
import ProcessingScreen from './components/ProcessingScreen.jsx';
import ResultsManual from './components/ResultsManual.jsx';
import CollaborationCard from './components/CollaborationCard.jsx';
import RoleFitChecker from './components/RoleFitChecker.jsx';
import ConflictDecoder from './components/ConflictDecoder.jsx';
import MoChat from './components/MoChat.jsx';

// ── localStorage helpers (fallback cache) ──────────────────────
const LS_KEY = 'conative_session';
function loadSession() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)); } catch { return null; }
}
function saveSession(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
}
function clearSession() {
  try { localStorage.removeItem(LS_KEY); } catch {}
}

// ── Supabase helpers ───────────────────────────────────────────
async function fetchSavedResults(userId) {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error || !data) return null;
  return {
    mo: data.mo,
    scores: data.scores,
    energy: data.energy,
    zones: data.zones,
    strengths: data.strengths,
    dominant: data.dominant,
    resistance: data.resistance,
    rawScores: data.raw_scores,
  };
}

async function saveResults(userId, results) {
  const { error } = await supabase.from('results').insert({
    user_id: userId,
    mo: results.mo,
    scores: results.scores,
    energy: results.energy,
    zones: results.zones,
    strengths: results.strengths,
    dominant: results.dominant,
    resistance: results.resistance,
    raw_scores: results.rawScores,
  });
  return !error;
}

// ── Test helpers ───────────────────────────────────────────────
// Build a random results object. If forceDominant is a mode, that mode is
// picked "most" on every question so it comes out dominant (for reviewing
// each archetype's report); otherwise fully random.
function randomResults(forceDominant) {
  const testResponses = {};
  QUESTIONS.forEach(q => {
    const ids = q.options.map(o => o.id);
    const domOpt = forceDominant ? q.options.find(o => o.mode === forceDominant) : null;
    if (domOpt) {
      const others = ids.filter(id => id !== domOpt.id).sort(() => Math.random() - 0.5);
      testResponses[q.id] = { most: domOpt.id, least: others[0] };
    } else {
      const sh = [...ids].sort(() => Math.random() - 0.5);
      testResponses[q.id] = { most: sh[0], least: sh[1] };
    }
  });
  return scoreAssessment(testResponses);
}

function DevBar({ onReroll, dominant }) {
  const modes = [['FF', 'Info'], ['FT', 'Org'], ['QS', 'Change'], ['IMP', 'Exec']];
  const btn = { fontFamily: S.mono, fontSize: 10, letterSpacing: '0.06em', padding: '7px 10px', border: '1px solid #333', background: '#141414', color: '#cfcbc3', cursor: 'pointer', borderRadius: 4 };
  return (
    <div style={{ position: 'fixed', bottom: 14, right: 16, zIndex: 9999, display: 'flex', gap: 6, alignItems: 'center', background: 'rgba(10,10,10,0.94)', padding: '8px 10px', borderRadius: 9, border: '1px solid #2a2a2a', boxShadow: '0 8px 28px rgba(0,0,0,0.35)' }}>
      <span style={{ fontFamily: S.mono, fontSize: 8, letterSpacing: '0.16em', color: '#666', marginRight: 2 }}>TEST</span>
      <button style={btn} onClick={() => onReroll()} title="New fully random report">🎲 RE-ROLL</button>
      <span style={{ width: 1, height: 20, background: '#2a2a2a', margin: '0 2px' }} />
      {modes.map(([m, label]) => (
        <button
          key={m}
          style={{ ...btn, background: dominant === m ? '#f5f3ef' : '#141414', color: dominant === m ? '#0a0a0a' : '#cfcbc3', borderColor: dominant === m ? '#f5f3ef' : '#333' }}
          onClick={() => onReroll(m)}
          title={`Generate a ${label}-dominant report`}
        >{label}</button>
      ))}
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────
export default function App() {
  // auth
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);

  // app phase: 'dashboard' | 'intro' | 'quiz' | 'processing' | 'results' | 'collab-card' | 'role-fit' | 'conflict' | 'chat'
  const [phase, setPhase] = useState('intro');
  const [savedResults, setSavedResults] = useState(null); // from DB
  const [currentResults, setCurrentResults] = useState(null); // just scored
  const [reportKey, setReportKey] = useState(0); // bump to remount the report on re-roll

  // quiz state
  const [qIndex, setQIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [resumeData, setResumeData] = useState(null); // { qIndex } if in-progress session found

  // ── Auth listener ──────────────────────────────────────────
  useEffect(() => {
    // Restore any in-progress quiz from localStorage
    const inProgress = loadSession();
    if (inProgress?.phase === 'quiz' && inProgress.responses && Object.keys(inProgress.responses).length > 0) {
      setResponses(inProgress.responses);
      setQIndex(inProgress.qIndex || 0);
      setResumeData({ qIndex: inProgress.qIndex || 0 });
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const r = await fetchSavedResults(session.user.id);
        if (r) { setSavedResults(r); setPhase('dashboard'); }
        else { setPhase('intro'); }
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const r = await fetchSavedResults(session.user.id);
        if (r) { setSavedResults(r); setPhase('dashboard'); }
        else { setPhase('intro'); }
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSavedResults(null);
        setCurrentResults(null);
        setResponses({});
        setQIndex(0);
        clearSession();
        setPhase('intro');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Quiz handlers ──────────────────────────────────────────
  const handleSelect = useCallback((qId, sel) => {
    setResponses(prev => {
      const next = { ...prev, [qId]: { most: sel.most || null, least: sel.least || null } };
      saveSession({ phase: 'quiz', qIndex, responses: next });
      return next;
    });
  }, [qIndex]);

  const handleNext = useCallback(() => {
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(i => { saveSession({ phase: 'quiz', qIndex: i + 1, responses }); return i + 1; });
    } else {
      setPhase('processing');
    }
  }, [qIndex, responses]);

  const handleBack = useCallback(() => {
    if (qIndex > 0) setQIndex(i => i - 1);
  }, [qIndex]);

  const handleProcessingDone = useCallback(async () => {
    const r = scoreAssessment(responses);
    setCurrentResults(r);
    setPhase('results');
    clearSession();
    setResumeData(null);
    if (user) await saveResults(user.id, r);
  }, [responses, user]);

  const handleRetake = () => {
    setResponses({});
    setQIndex(0);
    setCurrentResults(null);
    setResumeData(null);
    clearSession();
    setPhase('intro');
  };

  const handlePause = () => {
    // State is already saved to localStorage on every answer — just navigate away
    setPhase(savedResults ? 'dashboard' : 'intro');
  };

  const handleResume = () => {
    setResumeData(null);
    setPhase('quiz');
  };

  const handleStartFresh = () => {
    setResponses({});
    setQIndex(0);
    setResumeData(null);
    clearSession();
    setPhase('quiz');
  };

  const handleTestFill = () => {
    const testResponses = {};
    QUESTIONS.forEach(q => {
      const ids = q.options.map(o => o.id);
      const shuffled = [...ids].sort(() => Math.random() - 0.5);
      testResponses[q.id] = { most: shuffled[0], least: shuffled[1] };
    });
    setResponses(testResponses);
    setQIndex(QUESTIONS.length - 1);
    setResumeData(null);
    clearSession();
    setPhase('processing');
  };

  // Test: instantly generate a fresh report (optionally forcing a dominant mode)
  const handleReroll = (mode) => {
    setCurrentResults(randomResults(mode));
    setReportKey(k => k + 1);
    setResumeData(null);
    setPhase('results');
    window.scrollTo(0, 0);
  };

  // ── Loading splash ─────────────────────────────────────────
  if (authLoading) {
    return (
      <>
        <style>{fonts}</style>
        <div style={{ minHeight: '100vh', background: S.black, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: S.mono, fontSize: 11, letterSpacing: '0.2em', color: S.onDarkDim }}>LOADING...</div>
        </div>
      </>
    );
  }

  // ── Not authenticated — guest quiz allowed, results just don't save to DB ──
  if (!user) {
    return (
      <>
        <style>{fonts}</style>
        {phase === 'auth' && <AuthScreen />}
        {phase === 'intro' && (
          <IntroScreen
            onStart={() => setPhase('quiz')}
            onSignIn={() => setPhase('auth')}
            resumeData={resumeData}
            onResume={handleResume}
            onStartFresh={handleStartFresh}
            onTestFill={handleTestFill}
          />
        )}
        {phase === 'quiz' && (
          <QuizFlow
            question={QUESTIONS[qIndex]}
            index={qIndex}
            total={QUESTIONS.length}
            response={responses[QUESTIONS[qIndex].id]}
            onSelect={handleSelect}
            onNext={handleNext}
            onBack={handleBack}
            onPause={handlePause}
          />
        )}
        {phase === 'processing' && <ProcessingScreen onDone={handleProcessingDone} />}
        {phase === 'results' && currentResults && (
          <ResultsManual key={reportKey} results={currentResults} onBack={null} onTool={setPhase} />
        )}
        {phase === 'results' && currentResults && <DevBar onReroll={handleReroll} dominant={currentResults.dominant} />}
      </>
    );
  }

  // ── Authenticated ──────────────────────────────────────────
  const activeResults = currentResults || savedResults;

  return (
    <>
      <style>{fonts}</style>
      <div style={{ fontFamily: S.cormorant, cursor: 'crosshair' }}>
        {phase === 'dashboard' && savedResults && (
          <Dashboard
            results={savedResults}
            user={user}
            onViewReport={() => setPhase('results')}
            onRetake={handleRetake}
            onTool={setPhase}
          />
        )}
        {phase === 'collab-card' && activeResults && <CollaborationCard results={activeResults} onBack={() => setPhase('dashboard')} />}
        {phase === 'role-fit' && activeResults && <RoleFitChecker results={activeResults} onBack={() => setPhase('dashboard')} />}
        {phase === 'conflict' && activeResults && <ConflictDecoder results={activeResults} onBack={() => setPhase('dashboard')} />}
        {phase === 'chat' && activeResults && <MoChat results={activeResults} onBack={() => setPhase('dashboard')} />}
        {phase === 'intro' && (
          <IntroScreen
            onStart={() => setPhase('quiz')}
            resumeData={resumeData}
            onResume={handleResume}
            onStartFresh={handleStartFresh}
            onTestFill={handleTestFill}
          />
        )}
        {phase === 'quiz' && (
          <QuizFlow
            question={QUESTIONS[qIndex]}
            index={qIndex}
            total={QUESTIONS.length}
            response={responses[QUESTIONS[qIndex].id]}
            onSelect={handleSelect}
            onNext={handleNext}
            onBack={handleBack}
            onPause={handlePause}
          />
        )}
        {phase === 'processing' && <ProcessingScreen onDone={handleProcessingDone} />}
        {phase === 'results' && activeResults && (
          <ResultsManual
            key={reportKey}
            results={activeResults}
            onBack={savedResults ? () => setPhase('dashboard') : null}
            onTool={setPhase}
          />
        )}
        {(phase === 'results' || phase === 'dashboard') && activeResults && (
          <DevBar onReroll={handleReroll} dominant={activeResults.dominant} />
        )}
      </div>
    </>
  );
}
