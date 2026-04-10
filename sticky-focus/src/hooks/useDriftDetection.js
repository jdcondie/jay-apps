import { useEffect, useRef } from 'react'

export function useDriftDetection({ enabled, onDrift, delayMs = 180000 }) {
  const timerRef = useRef(null)

  useEffect(() => {
    if (!enabled) return

    const reset = () => {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(onDrift, delayMs)
    }

    const events = ['mousemove','keydown','touchstart','click','scroll']
    events.forEach(e => window.addEventListener(e, reset, { passive:true }))
    reset()

    return () => {
      clearTimeout(timerRef.current)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [enabled, onDrift, delayMs])
}
