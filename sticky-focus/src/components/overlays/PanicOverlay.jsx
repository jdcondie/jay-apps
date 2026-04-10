import { useFocusStore } from '../../store/useFocusStore'
import { getP } from '../../utils/constants'

export function PanicOverlay({ timer }) {
  const stuckActions  = useFocusStore(s => s.stuckActions)
  const stuckLoading  = useFocusStore(s => s.stuckLoading)
  const flatList      = useFocusStore(s => s.flatList)
  const focusIdx      = useFocusStore(s => s.focusIdx)
  const setOverlay    = useFocusStore(s => s.setOverlay)
  const setStuckActions = useFocusStore(s => s.setStuckActions)

  const current = flatList[focusIdx]
  const p       = current ? getP(current.taskIdx) : getP(0)

  const handleClose = () => {
    timer?.start()
    setStuckActions(null)
    setOverlay(null)
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      background:'rgba(15,12,41,.94)',
      backdropFilter:'blur(20px)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      padding:32, gap:20,
      animation:'fadeIn .3s ease',
    }}>
      <div style={{fontSize:40, animation:stuckLoading?'spin 1s linear infinite':undefined}}>
        {stuckLoading ? '⚙️' : '🆘'}
      </div>

      <div style={{textAlign:'center', maxWidth:360}}>
        <h2 style={{color:'#fff', fontSize:20, fontWeight:800, margin:'0 0 6px'}}>
          {stuckLoading ? 'Getting you unstuck...' : 'Here are 3 ways to start'}
        </h2>
        {current && (
          <p style={{color:'rgba(255,255,255,.4)', fontSize:13, margin:0}}>
            on: {current.label}
          </p>
        )}
      </div>

      {stuckLoading && (
        <div style={{display:'flex', gap:6}}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width:8, height:8, borderRadius:'50%',
              background:'rgba(255,255,255,.4)',
              animation:`pulse 1.2s ease ${i*.2}s infinite`,
            }}/>
          ))}
        </div>
      )}

      {stuckActions && (
        <div style={{
          display:'flex', flexDirection:'column', gap:10,
          width:'100%', maxWidth:380,
        }}>
          {stuckActions.map((action, i) => (
            <div key={i} style={{
              background:'rgba(255,255,255,.06)', border:`1px solid ${p.bg}33`,
              borderRadius:12, padding:'14px 16px',
              display:'flex', gap:12, alignItems:'flex-start',
            }}>
              <span style={{
                width:22, height:22, borderRadius:'50%',
                background:p.bg, color:p.text,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:11, fontWeight:800, flexShrink:0,
              }}>{i+1}</span>
              <p style={{color:'rgba(255,255,255,.85)', fontSize:14, lineHeight:1.5, margin:0}}>
                {action}
              </p>
            </div>
          ))}
        </div>
      )}

      {!stuckLoading && (
        <button
          onClick={handleClose}
          style={{
            padding:'13px 32px', borderRadius:14, border:'none',
            background:`linear-gradient(135deg,${p.bg},${p.bg}cc)`,
            color:p.text, fontSize:15, fontWeight:800, cursor:'pointer',
            boxShadow:`0 6px 20px ${p.bg}44`,
          }}
        >Got it, let's go →</button>
      )}
    </div>
  )
}
