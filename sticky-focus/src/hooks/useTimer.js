import { useState, useEffect, useRef } from 'react'

export function useTimer() {
  const [stepElapsed,    setStepElapsed]    = useState(0)
  const [sessionElapsed, setSessionElapsed] = useState(0)
  const [running,        setRunning]        = useState(false)
  const stepRef    = useRef(null)
  const sessionRef = useRef(null)

  useEffect(() => {
    if (running) {
      stepRef.current    = setInterval(() => setStepElapsed(e => e+1), 1000)
      sessionRef.current = setInterval(() => setSessionElapsed(e => e+1), 1000)
    } else {
      clearInterval(stepRef.current)
      clearInterval(sessionRef.current)
    }
    return () => {
      clearInterval(stepRef.current)
      clearInterval(sessionRef.current)
    }
  }, [running])

  const start      = ()      => setRunning(true)
  const pause      = ()      => setRunning(false)
  const resetStep  = (val=0) => setStepElapsed(val)
  const resetSession = (val=0) => setSessionElapsed(val)

  return { stepElapsed, sessionElapsed, running, start, pause, resetStep, resetSession, setRunning }
}
