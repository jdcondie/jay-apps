import { useFocusStore } from '../../store/useFocusStore'
import { getP, READY_PROMPTS } from '../../utils/constants'
import { rand } from '../../utils/formatters'

export function ReentryOverlay({ timer }) {
  const flatList   = useFocusStore(s => s.flatList)
  const focusIdx   = useFocusStore(s => s.focusIdx)
  const setOverlay = useFocusStore(s => s.setOverlay)

  const current = flatList[focusIdx]
  const p       = current ? getP(current.taskIdx) : getP(0)

  const handleResume = () => {
    timer?.start()
    setOverlay(null)
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      background:'rgba(15,12,41,.9)',
      backdropFilter:'blur(16px)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      padding:32, gap:20,
      animation:'fadeIn .3s ease',
    }}>
      <div style={{fontSize:48}}>🔄</div>

      <div style={{textAlign:'center', maxWidth:320}}>
        <h2 style={{color:'#fff', fontSize:22, fontWeight:800, margin:'0 0 10px'}}>
          Welcome back
        </h2>
        {current && (
          <>
            <p style={{color:'rgba(255,255,255,.4)', fontSize:13, margin:'0 0 6px'}}>
              You were working on
            </p>
            <p style={{
              color:p.bg, fontSize:17, fontWeight:800,
              margin:'0 0 12px', lineHeight:1.35,
            }}>
              {current.label}
            </p>
          </>
        )}
        <p style={{color:'rgba(255,255,255,.45)', fontSize:14, lineHeight:1.6, margin:0}}>
          {rand(READY_PROMPTS)}
        </p>
      </div>

      <button
        onClick={handleResume}
        style={{
          padding:'14px 36px', borderRadius:14, border:'none',
          background:`linear-gradient(135deg,${p.bg},${p.bg}cc)`,
          color:p.text, fontSize:15, fontWeight:800, cursor:'pointer',
          boxShadow:`0 6px 20px ${p.bg}44`,
        }}
      >Resume →</button>
    </div>
  )
}
