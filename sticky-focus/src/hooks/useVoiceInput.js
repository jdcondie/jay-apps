import { useState, useRef, useEffect } from 'react'

export function useVoiceInput(onResult) {
  const [listening,  setListening]  = useState(false)
  const [supported,  setSupported]  = useState(false)
  const recogRef = useRef(null)

  useEffect(() => {
    setSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition))
  }, [])

  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    recogRef.current = r
    r.continuous = false
    r.interimResults = false
    r.lang = 'en-US'
    r.onresult = e => { onResult(e.results[0][0].transcript); setListening(false) }
    r.onerror  = () => setListening(false)
    r.onend    = () => setListening(false)
    r.start()
    setListening(true)
  }

  const stop = () => { recogRef.current?.stop(); setListening(false) }

  return { supported, listening, start, stop }
}
