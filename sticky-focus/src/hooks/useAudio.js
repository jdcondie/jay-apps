import { useRef } from 'react'

export function useAudio(on) {
  const ctxRef = useRef(null)

  const ac = () => {
    if (!ctxRef.current)
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    return ctxRef.current
  }

  const tone = (f, f2, dur, vol, wave='sine', delay=0) => {
    if (!on) return
    try {
      const a=ac(), o=a.createOscillator(), g=a.createGain()
      o.connect(g); g.connect(a.destination)
      o.type = wave
      o.frequency.setValueAtTime(f, a.currentTime+delay)
      if (f2 !== f) o.frequency.linearRampToValueAtTime(f2, a.currentTime+delay+dur)
      g.gain.setValueAtTime(0, a.currentTime+delay)
      g.gain.linearRampToValueAtTime(vol, a.currentTime+delay+0.01)
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime+delay+dur)
      o.start(a.currentTime+delay)
      o.stop(a.currentTime+delay+dur+0.05)
    } catch {}
  }

  return {
    ready:     () => { tone(528,528,.06,.15); tone(660,660,.1,.2,'sine',.08) },
    stepDone:  () => { tone(523,523,.08,.18); tone(784,784,.14,.22,'sine',.1) },
    taskDone:  () => [523,659,784].forEach((f,i) => tone(f,f,.15,.22,'sine',i*.1)),
    breakBell: () => { tone(880,880,.3,.15); tone(660,660,.3,.12,'sine',.35) },
    drift:     () => tone(440,330,.3,.18,'triangle'),
    panic:     () => tone(220,220,.2,.12,'sine'),
    complete:  () => [[523,0],[659,.1],[784,.2],[1047,.32],[1319,.46]].forEach(([f,d])=>tone(f,f,.28,.2,'sine',d)),
    bodyIn:    () => tone(660,880,.15,.12),
    stuck:     () => tone(330,440,.2,.12),
    voice:     () => tone(880,1047,.1,.15),
    tick:      () => tone(880,880,.08,.12),
    warning:   () => { tone(440,440,.15,.2); tone(330,330,.15,.2,'sine',.2) },
  }
}
