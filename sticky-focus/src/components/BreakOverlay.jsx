import { useState, useEffect } from 'react'
import { useFocusStore } from '../store/useFocusStore'
import { useAudio } from '../hooks/useAudio'
import { getP } from '../utils/constants'

export function BreakOverlay() {
  const [countdown, setCountdown] = useState(60)
  const breakMsg   = useFocusStore(s => s.breakMsg)
  const flatList   = useFocusStore(s => s.flatList)
  const focusIdx   = useFocusStore(s => s.focusIdx)
  const prevTaskIdx = useFocusStore(s => s.prevTaskIdx)
  const setOverlay = useFocusStore(s => s.setOverlay)
  const soundOn    = useFocusStore(s => s.soundOn)
  const audio      = useAudio(soundOn)

  const nextTask = flatList[focusIdx]
  const p = getP(prevTaskIdx ?? 0)

  useEffect(() => {
    audio.breakBell()
    const iv = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(iv); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  const continueNow = () => setOverlay(null)

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      background:'rgba(15,12,41,.92)',
      backdropFilter:'blur(16px)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      padding:32, gap:24,
      animation:'fadeIn .3s ease',
    }}>
      <div style={{fontSize:48, animation:'bounce .8s ease'}}>☕</div>

      <div style={{textAlign:'center', maxWidth:340}}>
        <h2 style={{color:'#fff', fontSize:22, fontWeight:800, margin:'0 0 10px'}}>
          Task complete!
        </h2>
        <p style={{color:'rgba(255,255,255,.55)', fontSize:15, lineHeight:1.6, margin:0}}>
          {breakMsg}
        </p>
      </div>

      {/* Break timer */}
      <div style={{
        width:80, height:80, borderRadius:'50%',
        background:'rgba(255,255,255,.06)',
        border:'2px solid rgba(255,255,255,.12)',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
      }}>
        <span style={{color:'#fff', fontSize:22, fontWeight:800}}>{countdown}</span>
        <span style={{color:'rgba(255,255,255,.3)', fontSize:10}}>sec</span>
      </div>

      {/* Next task preview */}
      {nextTask && (
        <div style={{
          background:'rgba(255,255,255,.06)', borderRadius:14,
          padding:'12px 16px', maxWidth:340, width:'100%',
          border:'1px solid rgba(255,255,255,.1)',
        }}>
          <p style={{color:'rgba(255,255,255,.35)', fontSize:11, fontWeight:700,
            letterSpacing:.5, textTransform:'uppercase', margin:'0 0 6px'}}>
            Up next
          </p>
          <p style={{color:'#fff', fontSize:14, fontWeight:700, margin:0}}>
            {nextTask.taskTitle}
          </p>
          <p style={{color:'rgba(255,255,255,.4)', fontSize:12, margin:'4px 0 0'}}>
            {nextTask.label}
          </p>
        </div>
      )}

      <button
        onClick={continueNow}
        style={{
          padding:'13px 32px', borderRadius:14, border:'none',
          background:'linear-gradient(135deg,#FECA57,#FF9F43)',
          color:'#1a0f00', fontSize:15, fontWeight:800, cursor:'pointer',
          boxShadow:'0 6px 20px rgba(254,202,87,.3)',
        }}
      >I'm ready → {countdown > 0 ? `(${countdown}s)` : ''}</button>
    </div>
  )
}
