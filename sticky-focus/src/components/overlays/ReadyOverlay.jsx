import { useFocusStore } from '../../store/useFocusStore'
import { useTimer } from '../../hooks/useTimer'
import { useAudio } from '../../hooks/useAudio'
import { getP } from '../../utils/constants'

export function ReadyOverlay({ timer }) {
  const readyPrompt = useFocusStore(s => s.readyPrompt)
  const flatList    = useFocusStore(s => s.flatList)
  const focusIdx    = useFocusStore(s => s.focusIdx)
  const setOverlay  = useFocusStore(s => s.setOverlay)
  const soundOn     = useFocusStore(s => s.soundOn)
  const audio       = useAudio(soundOn)

  const current = flatList[focusIdx]
  const p       = current ? getP(current.taskIdx) : getP(0)

  const handleGo = () => {
    audio.ready()
    timer?.start()
    setOverlay(null)
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      background:'rgba(15,12,41,.88)',
      backdropFilter:'blur(16px)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      padding:32, gap:20,
      animation:'fadeIn .3s ease',
    }}>
      <div style={{
        width:70, height:70, borderRadius:20,
        background:`linear-gradient(135deg,${p.bg},${p.bg}cc)`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:32, boxShadow:`0 8px 32px ${p.bg}55`,
      }}>📌</div>

      <div style={{textAlign:'center', maxWidth:320}}>
        <p style={{
          color:'rgba(255,255,255,.4)', fontSize:12, fontWeight:700,
          letterSpacing:.6, textTransform:'uppercase', margin:'0 0 10px',
        }}>
          {current ? `${current.taskTitle}` : 'Next step'}
        </p>
        {current && (
          <p style={{
            color:'#fff', fontSize:20, fontWeight:800,
            lineHeight:1.35, margin:'0 0 16px',
          }}>
            {current.label}
          </p>
        )}
        <p style={{
          color:'rgba(255,255,255,.45)', fontSize:15,
          lineHeight:1.6, margin:0,
        }}>
          {readyPrompt}
        </p>
      </div>

      <button
        onClick={handleGo}
        style={{
          padding:'14px 40px', borderRadius:14, border:'none',
          background:`linear-gradient(135deg,${p.bg},${p.bg}cc)`,
          color:p.text, fontSize:16, fontWeight:800, cursor:'pointer',
          boxShadow:`0 8px 24px ${p.bg}44`,
          marginTop:8,
        }}
      >
        Let's go →
      </button>

      {current && (
        <p style={{color:'rgba(255,255,255,.2)', fontSize:12}}>
          Est. {current.minutes}m
        </p>
      )}
    </div>
  )
}
