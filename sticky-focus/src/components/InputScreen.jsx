import { useState, useRef } from 'react'
import { useFocusStore } from '../store/useFocusStore'
import { useVoiceInput } from '../hooks/useVoiceInput'
import { useUserStorage } from '../hooks/useUserStorage'
import { useAudio } from '../hooks/useAudio'
import { useUser } from '@clerk/clerk-react'
import { loadStreak } from '../utils/streak'

export function InputScreen({ onGenerate }) {
  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const textareaRef           = useRef(null)

  const { user }    = useUser()
  const store       = useUserStorage(user?.id)
  const soundOn     = useFocusStore(s => s.soundOn)
  const showTemplates = useFocusStore(s => s.showTemplates)
  const setShowTemplates = useFocusStore(s => s.setShowTemplates)
  const audio       = useAudio(soundOn)

  const streak = loadStreak(store)

  const voice = useVoiceInput(t => {
    setText(prev => prev ? prev + ' ' + t : t)
    audio.voice()
  })

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    setError('')
    setLoading(true)
    try {
      await onGenerate(trimmed)
    } catch (e) {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  const handleKey = e => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
      padding:24,
    }}>
      <div style={{width:'100%', maxWidth:520, animation:'fadeIn .5s ease'}}>
        {/* Header */}
        <div style={{textAlign:'center', marginBottom:32}}>
          <div style={{
            width:64, height:64, borderRadius:18, margin:'0 auto 14px',
            background:'linear-gradient(135deg,#FECA57,#FF6B6B)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:30, boxShadow:'0 8px 32px rgba(254,202,87,.4)',
          }}>📌</div>
          <h1 style={{
            fontSize:30, fontWeight:900, color:'#fff',
            letterSpacing:-1, margin:'0 0 6px',
          }}>
            Sticky<span style={{color:'#FECA57'}}>Focus</span>
          </h1>
          <p style={{color:'rgba(255,255,255,.4)', fontSize:14, margin:0}}>
            What do you need to get done today?
          </p>
        </div>

        {/* Streak badge */}
        {streak.count > 0 && (
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'center',
            gap:8, marginBottom:20,
          }}>
            <div style={{
              background:'rgba(254,202,87,.15)', border:'1px solid rgba(254,202,87,.3)',
              borderRadius:20, padding:'6px 14px', display:'flex', alignItems:'center', gap:6,
            }}>
              <span style={{fontSize:14}}>🔥</span>
              <span style={{color:'#FECA57', fontSize:13, fontWeight:700}}>
                {streak.count} day streak
              </span>
              {streak.best > 1 && (
                <span style={{color:'rgba(254,202,87,.5)', fontSize:11}}>
                  · best {streak.best}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Input card */}
        <div style={{
          background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)',
          borderRadius:20, padding:20, backdropFilter:'blur(20px)',
          boxShadow:'0 24px 64px rgba(0,0,0,.4)', marginBottom:16,
        }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="e.g. Finish the client proposal and send it before 5pm..."
            rows={4}
            style={{
              width:'100%', background:'transparent', border:'none', outline:'none',
              color:'#fff', fontSize:16, lineHeight:1.6, resize:'none',
              placeholder:'rgba(255,255,255,.3)',
            }}
          />
          <div style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            marginTop:12, paddingTop:12, borderTop:'1px solid rgba(255,255,255,.08)',
          }}>
            <div style={{display:'flex', gap:8}}>
              {/* Voice button */}
              {voice.supported && (
                <button
                  onClick={() => { voice.listening ? voice.stop() : voice.start() }}
                  style={{
                    width:36, height:36, borderRadius:10, border:'none',
                    background:voice.listening?'rgba(255,107,107,.25)':'rgba(255,255,255,.08)',
                    color:voice.listening?'#FF6B6B':'rgba(255,255,255,.5)',
                    cursor:'pointer', fontSize:16, display:'flex',
                    alignItems:'center', justifyContent:'center',
                    transition:'all .2s',
                    animation:voice.listening?'pulse 1s ease infinite':undefined,
                  }}
                  title="Voice input"
                >🎤</button>
              )}
              {/* Templates button */}
              <button
                onClick={() => setShowTemplates(true)}
                style={{
                  height:36, borderRadius:10, border:'none', padding:'0 12px',
                  background:'rgba(255,255,255,.08)',
                  color:'rgba(255,255,255,.5)',
                  cursor:'pointer', fontSize:12, fontWeight:600,
                  transition:'all .2s',
                }}
              >Templates</button>
            </div>
            <span style={{color:'rgba(255,255,255,.2)', fontSize:11}}>
              ⌘+Enter to go
            </span>
          </div>
        </div>

        {error && (
          <p style={{color:'#FF6B6B', fontSize:13, textAlign:'center', marginBottom:12}}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!text.trim() || loading}
          style={{
            width:'100%', padding:'16px 24px', borderRadius:16, border:'none',
            background: text.trim() && !loading
              ? 'linear-gradient(135deg,#FECA57,#FF9F43)'
              : 'rgba(255,255,255,.08)',
            color: text.trim() && !loading ? '#1a0f00' : 'rgba(255,255,255,.3)',
            fontSize:16, fontWeight:800, cursor: text.trim() && !loading ? 'pointer' : 'default',
            transition:'all .3s',
            boxShadow: text.trim() && !loading ? '0 8px 24px rgba(254,202,87,.35)' : 'none',
          }}
        >
          {loading ? 'Building your plan...' : 'Break it down →'}
        </button>

        {streak.totalGoals > 0 && (
          <p style={{
            color:'rgba(255,255,255,.2)', fontSize:12, textAlign:'center', marginTop:14,
          }}>
            {streak.totalGoals} goal{streak.totalGoals !== 1 ? 's' : ''} completed all-time
          </p>
        )}
      </div>
    </div>
  )
}
