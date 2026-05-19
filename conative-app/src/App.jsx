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

// ── App ────────────────────────────────────────────────────────
export default function App() {
  // auth
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);

  // app phase: 'dashboard' | 'intro' | 'quiz' | 'processing' | 'results' | 'collab-card' | 'role-fit' | 'conflict' | 'chat'
  const [phase, setPhase] = useState('intro');
  const [savedResults, setSavedResults] = useState(null); // from DB
  const [currentResults, setCurrentResults] = useState(null); // just scored

  // quiz state
  const [qIndex, setQIndex] = useState(0);
  const [responses, setResponses] = useState({});

  // ── Auth listener ──────────────────────────────────────────
  useEffect(() => {
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
    if (user) await saveResults(user.id, r);
  }, [responses, user]);

  const handleRetake = () => {
    setResponses({});
    setQIndex(0);
    setCurrentResults(null);
    clearSession();
    setPhase('intro');
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
        {phase === 'intro' && <IntroScreen onStart={() => setPhase('quiz')} onSignIn={() => setPhase('auth')} />}
        {phase === 'quiz' && (
          <QuizFlow
            question={QUESTIONS[qIndex]}
            index={qIndex}
            total={QUESTIONS.length}
            response={responses[QUESTIONS[qIndex].id]}
            onSelect={handleSelect}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {phase === 'processing' && <ProcessingScreen onDone={handleProcessingDone} />}
        {phase === 'results' && currentResults && (
          <ResultsManual results={currentResults} onBack={null} onTool={setPhase} />
        )}
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
        {phase === 'intro' && <IntroScreen onStart={() => setPhase('quiz')} />}
        {phase === 'quiz' && (
          <QuizFlow
            question={QUESTIONS[qIndex]}
            index={qIndex}
            total={QUESTIONS.length}
            response={responses[QUESTIONS[qIndex].id]}
            onSelect={handleSelect}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {phase === 'processing' && <ProcessingScreen onDone={handleProcessingDone} />}
        {phase === 'results' && activeResults && (
          <ResultsManual
            results={activeResults}
            onBack={savedResults ? () => setPhase('dashboard') : null}
            onTool={setPhase}
          />
        )}
      </div>
    </>
  );
}
