import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useFocusStore } from './store/useFocusStore'
import { useTimer } from './hooks/useTimer'
import { useUserStorage } from './hooks/useUserStorage'

import { AuthGate } from './components/AuthGate'
import { InputScreen } from './components/InputScreen'
import { LoadingScreen } from './components/LoadingScreen'
import { ReviewScreen } from './components/ReviewScreen'
import { FocusScreen } from './components/FocusScreen'
import { DoneScreen } from './components/DoneScreen'
import { Confetti } from './components/Confetti'
import { BreakOverlay } from './components/BreakOverlay'
import { EODReview } from './components/EODReview'
import { TemplateManager } from './components/TemplateManager'

import { ReadyOverlay }      from './components/overlays/ReadyOverlay'
import { DriftOverlay }      from './components/overlays/DriftOverlay'
import { HyperfocusOverlay } from './components/overlays/HyperfocusOverlay'
import { PanicOverlay }      from './components/overlays/PanicOverlay'
import { ReentryOverlay }    from './components/overlays/ReentryOverlay'

export default function App() {
  return (
    <AuthGate>
      <AppInner />
    </AuthGate>
  )
}

function AppInner() {
  const {
    screen, setScreen,
    goal, setGoal, setGoalWhy,
    tasks, setTasks,
    buildFlatList,
    overlay, setOverlay,
    showConfetti, setShowConfetti,
    showEOD,
    showTemplates,
    resetSession,
  } = useFocusStore()

  const { user } = useUser()
  const timer    = useTimer()

  // Visibility change — show reentry overlay on tab return
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        timer.pause()
      } else if (screen === 'focus' && !useFocusStore.getState().overlay) {
        setOverlay('reentry')
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [screen])

  const handleGenerate = async (text) => {
    setGoal(text)
    setScreen('loading')
    const res  = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal: text }),
    })
    if (!res.ok) throw new Error('Generation failed')
    const data = await res.json()

    setGoalWhy(data.why || '')
    setTasks((data.tasks || []).map(t => ({
      title: t.title,
      done: false,
      subs: (t.subtasks || []).map(s => ({ text: s.text, minutes: s.minutes, done: false })),
    })))
    setScreen('review')
  }

  const handleStart = () => {
    buildFlatList()
    timer.resetSession()
    timer.resetStep()
    setScreen('focus')
  }

  const handleRestart = () => {
    timer.pause()
    timer.resetStep()
    timer.resetSession()
    resetSession()
  }

  const handleBack = () => {
    setScreen('input')
  }

  if (screen === 'loading') return <LoadingScreen goal={goal} />

  if (screen === 'review') return (
    <ReviewScreen onStart={handleStart} onBack={handleBack} />
  )

  if (screen === 'focus') return (
    <>
      <FocusScreen />
      {overlay === 'ready'      && <ReadyOverlay      timer={timer} />}
      {overlay === 'drift'      && <DriftOverlay      timer={timer} />}
      {overlay === 'hyperfocus' && <HyperfocusOverlay timer={timer} />}
      {overlay === 'panic'      && <PanicOverlay      timer={timer} />}
      {overlay === 'reentry'    && <ReentryOverlay    timer={timer} />}
      {overlay === 'break'      && <BreakOverlay />}
      {showEOD      && <EODReview />}
      {showTemplates && <TemplateManager />}
    </>
  )

  if (screen === 'done') return (
    <>
      <DoneScreen onRestart={handleRestart} />
      {showConfetti && <Confetti />}
      {showEOD && <EODReview />}
    </>
  )

  // Default: input
  return (
    <>
      <InputScreen onGenerate={handleGenerate} />
      {showTemplates && <TemplateManager />}
    </>
  )
}
