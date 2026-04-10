import { useEffect, useCallback, useRef } from 'react'
import { useFocusStore } from '../store/useFocusStore'
import { useTimer } from '../hooks/useTimer'
import { useAudio } from '../hooks/useAudio'
import { useDriftDetection } from '../hooks/useDriftDetection'
import { useUserStorage } from '../hooks/useUserStorage'
import { useUser } from '@clerk/clerk-react'
import { TimerRing } from './TimerRing'
import { TaskBreadcrumbs } from './TaskBreadcrumbs'
import { getP, DRIFT_MESSAGES, READY_PROMPTS, BREAK_MESSAGES, STEP_WINS, BODY_DOUBLE_NAMES } from '../utils/constants'
import { rand, fmt, fmtMin } from '../utils/formatters'
import { bumpStreak, saveHistory, loadStreak } from '../utils/streak'

export function FocusScreen() {
  const {
    tasks, flatList, focusIdx, setFocusIdx, markSubDone,
    goal, goalWhy, stepTimes, addStepTime, flowStreak, bumpFlowStreak, resetFlowStreak,
    overlay, setOverlay, readyPrompt, setReadyPrompt, driftMsg, setDriftMsg,
    breakMsg, setBreakMsg, hyperfocusShown, setHyperfocusShown, prevTaskIdx, setPrevTaskIdx,
    bodyDouble, setBodyDouble, needsTab, toggleNeedsTab,
    stuckActions, setStuckActions, stuckLoading, setStuckLoading,
    soundOn, toggleSound, fullscreen, toggleFullscreen,
    showConfetti, setShowConfetti, winMsg, setWinMsg,
    setScreen, resetSession,
  } = useFocusStore()

  const { user }  = useUser()
  const store     = useUserStorage(user?.id)
  const audio     = useAudio(soundOn)
  const timer     = useTimer()
  const startedRef = useRef(false)

  const current = flatList[focusIdx]
  const p       = current ? getP(current.taskIdx) : getP(0)
  const limitSec = current ? current.minutes * 60 : 0

  // ── Start first step on mount ──────────────────────────────────────────
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    const prompt = rand(READY_PROMPTS)
    setReadyPrompt(prompt)
    setOverlay('ready')
  }, [])

  // ── Hyperfocus warning at 45min session ────────────────────────────────
  useEffect(() => {
    if (!hyperfocusShown && timer.sessionElapsed > 0 && timer.sessionElapsed % 2700 === 0) {
      setHyperfocusShown(true)
      audio.warning()
      setOverlay('hyperfocus')
    }
  }, [timer.sessionElapsed])

  // ── Drift detection ────────────────────────────────────────────────────
  const handleDrift = useCallback(() => {
    if (overlay) return
    audio.drift()
    setDriftMsg(rand(DRIFT_MESSAGES))
    setOverlay('drift')
  }, [overlay])

  useDriftDetection({ enabled: timer.running && !overlay, onDrift: handleDrift, delayMs: 180000 })

  // ── Done with a step ───────────────────────────────────────────────────
  const completeStep = () => {
    if (!current) return
    audio.stepDone()

    addStepTime({
      label: current.label,
      taskTitle: current.taskTitle,
      elapsed: timer.stepElapsed,
      est: limitSec,
    })

    const onTime = timer.stepElapsed <= limitSec * 1.2
    if (onTime) bumpFlowStreak()
    else resetFlowStreak()

    markSubDone(current.taskIdx, current.subIdx)

    const nextIdx = focusIdx + 1

    // Check if we just completed a task
    const updatedTasks = useFocusStore.getState().tasks
    const justFinishedTask = updatedTasks[current.taskIdx]?.done
    const hasMore = nextIdx < flatList.length

    timer.pause()
    timer.resetStep()

    if (!hasMore) {
      // All done
      const streak = loadStreak(store)
      const newStreak = bumpStreak(store, streak)
      saveHistory(store, goal, stepTimes, flatList, timer.sessionElapsed, flatList.reduce((a,f)=>a+f.minutes*60,0))
      audio.complete()
      setShowConfetti(true)
      setScreen('done')
      return
    }

    if (justFinishedTask) {
      audio.taskDone()
      setBreakMsg(rand(BREAK_MESSAGES))
      setPrevTaskIdx(current.taskIdx)
      setFocusIdx(nextIdx)
      timer.resetStep()
      setOverlay('break')
      return
    }

    setFocusIdx(nextIdx)
    timer.resetStep()
    const prompt = rand(READY_PROMPTS)
    setReadyPrompt(prompt)
    setOverlay('ready')
  }

  // ── Get unstuck ────────────────────────────────────────────────────────
  const getUnstuck = async () => {
    if (!current) return
    audio.stuck()
    setStuckLoading(true)
    setStuckActions(null)
    setOverlay('panic')
    try {
      const res = await fetch('/api/unstuck', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ step: current.label, goal }),
      })
      const data = await res.json()
      setStuckActions(data.actions || [])
    } catch {
      setStuckActions([
        'Open a blank doc and write the first word about this task',
        'Set a 2-minute timer and do the very first physical action',
        'Read the task out loud and write what is blocking you',
      ])
    } finally {
      setStuckLoading(false)
    }
  }

  // ── Body double ────────────────────────────────────────────────────────
  const toggleBodyDouble = () => {
    if (bodyDouble) {
      setBodyDouble(null)
    } else {
      audio.bodyIn()
      setBodyDouble(rand(BODY_DOUBLE_NAMES))
    }
  }

  if (!current) return null

  const progressPct = Math.round(((focusIdx) / flatList.length) * 100)

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      background:`linear-gradient(160deg, ${p.light}ee 0%, ${p.light}88 100%)`,
      padding:'16px 16px 32px',
      transition:'background .6s ease',
    }}>
      {/* Top bar */}
      <div style={{
        position:'fixed', top:0, left:0, right:0, zIndex:10,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'10px 16px',
        background:p.light + 'cc',
        backdropFilter:'blur(12px)',
        borderBottom:`1px solid ${p.bg}22`,
      }}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <span style={{fontSize:13, fontWeight:700, color:p.text, opacity:.6}}>
            {focusIdx + 1} / {flatList.length}
          </span>
          {flowStreak >= 3 && (
            <span style={{
              background:p.bg+'33', color:p.text, fontSize:11, fontWeight:800,
              padding:'2px 8px', borderRadius:20,
            }}>🔥 {flowStreak} flow</span>
          )}
        </div>

        <div style={{
          flex:1, height:4, borderRadius:4, margin:'0 12px',
          background:`${p.bg}22`,
        }}>
          <div style={{
            height:'100%', borderRadius:4, background:p.bg,
            width:`${progressPct}%`, transition:'width .5s ease',
          }}/>
        </div>

        <div style={{display:'flex', gap:6}}>
          {bodyDouble && (
            <span style={{
              background:p.bg+'33', color:p.text, fontSize:11, fontWeight:700,
              padding:'3px 8px', borderRadius:12,
            }}>👤 {bodyDouble}</span>
          )}
          <button onClick={toggleSound} style={{...topBtn(p), fontSize:15}}>
            {soundOn ? '🔊' : '🔇'}
          </button>
          <button onClick={toggleFullscreen} style={{...topBtn(p), fontSize:14}}>
            {fullscreen ? '⤓' : '⤢'}
          </button>
        </div>
      </div>

      {/* Main sticky */}
      <div style={{
        width:'100%', maxWidth:420, marginTop:56,
        display:'flex', flexDirection:'column', alignItems:'center',
        gap:20, animation:'fadeInScale .4s ease',
      }}>
        {/* Goal reminder */}
        <p style={{
          fontSize:12, color:p.text, opacity:.5, textAlign:'center',
          maxWidth:360, fontWeight:600, letterSpacing:.3,
        }}>
          {goal}
        </p>

        {/* Sticky note */}
        <div style={{
          width:'100%', background:p.bg,
          borderRadius:4, padding:'28px 24px 32px',
          boxShadow:`0 12px 40px ${p.bg}55, 0 2px 8px rgba(0,0,0,.12)`,
          animation:'float 4s ease-in-out infinite',
          position:'relative', cursor:'default',
          minHeight:180,
        }}>
          {/* Tape strip */}
          <div style={{
            position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)',
            width:60, height:20, background:'rgba(255,255,255,.6)',
            borderRadius:3, boxShadow:'0 1px 4px rgba(0,0,0,.12)',
          }}/>

          <p style={{
            fontSize:22, fontWeight:800, color:p.text, lineHeight:1.35,
            margin:0, textAlign:'center',
          }}>
            {current.label}
          </p>

          <p style={{
            fontSize:12, color:p.text, opacity:.55, textAlign:'center',
            marginTop:10, fontWeight:600,
          }}>
            {current.taskTitle}
          </p>
        </div>

        {/* Timer */}
        <TimerRing
          elapsed={timer.stepElapsed}
          limit={limitSec}
          color={p.bg}
          size={112}
        />

        {/* Controls */}
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <button
            onClick={timer.running ? timer.pause : timer.start}
            style={{
              width:56, height:56, borderRadius:'50%', border:'none',
              background:p.bg, color:p.text,
              fontSize:22, cursor:'pointer', fontWeight:800,
              boxShadow:`0 4px 16px ${p.bg}66`,
              transition:'transform .15s',
            }}
          >{timer.running ? '⏸' : '▶'}</button>

          <button
            onClick={completeStep}
            style={{
              flex:1, padding:'14px 20px', borderRadius:14, border:'none',
              background:p.text, color:p.light,
              fontSize:15, fontWeight:800, cursor:'pointer',
              boxShadow:`0 4px 16px ${p.bg}44`,
              transition:'transform .15s',
            }}
          >Done ✓</button>
        </div>

        {/* Secondary actions */}
        <div style={{display:'flex', gap:10, width:'100%'}}>
          <button onClick={getUnstuck} style={secBtn(p)}>🆘 Stuck</button>
          <button onClick={toggleBodyDouble} style={secBtn(p)}>
            {bodyDouble ? `👤 ${bodyDouble}` : '👤 Body double'}
          </button>
          <button onClick={toggleNeedsTab} style={{
            ...secBtn(p),
            background: needsTab ? p.bg+'55' : undefined,
          }}>📋 Notes</button>
        </div>

        {/* Breadcrumbs */}
        <TaskBreadcrumbs tasks={tasks} flatList={flatList} focusIdx={focusIdx} />

        {/* Session time */}
        <p style={{color:p.text, opacity:.35, fontSize:11, fontWeight:600}}>
          Session: {fmt(timer.sessionElapsed)}
        </p>
      </div>
    </div>
  )
}

const topBtn = p => ({
  width:30, height:30, borderRadius:8, border:'none',
  background:p.bg+'22', color:p.text, cursor:'pointer',
  display:'flex', alignItems:'center', justifyContent:'center',
})

const secBtn = p => ({
  flex:1, padding:'9px 6px', borderRadius:10, border:'none',
  background:p.bg+'22', color:p.text, fontSize:12, fontWeight:700,
  cursor:'pointer', transition:'all .2s',
})
