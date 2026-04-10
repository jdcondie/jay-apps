import { useFocusStore } from '../../store/useFocusStore'
import { getP } from '../../utils/constants'

export function DriftOverlay({ timer }) {
  const driftMsg   = useFocusStore(s => s.driftMsg)
  const flatList   = useFocusStore(s => s.flatList)
  const focusIdx   = useFocusStore(s => s.focusIdx)
  const setOverlay = useFocusStore(s => s.setOverlay)

  const current = flatList[focusIdx]
  const p       = current ? getP(current.taskIdx) : getP(0)

  const handleRefocus = () => {
    timer?.start()
    setOverlay(null)
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      background:'rgba(15,12,41,.92)',
      backdropFilter:'blur(16px)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      padding:32, gap:20,
      animation:'fadeIn .3s ease',
    }}>
      <div style={{fontSize:52, animation:'shake .5s ease'}}>👀</div>

      <div style={{textAlign:'center', maxWidth:300}}>
        <p style={{
          color:'#fff', fontSize:22, fontWeight:800,
          margin:'0 0 10px', letterSpacing:-.5,
        }}>
          {driftMsg}
        </p>
        {current && (
          <p style={{
            color:'rgba(255,255,255,.45)', fontSize:14,
            lineHeight:1.5, margin:0,
          }}>
            You were working on: <strong style={{color:p.bg}}>{current.label}</strong>
          </p>
        )}
      </div>

      <button
        onClick={handleRefocus}
        style={{
          padding:'14px 36px', borderRadius:14, border:'none',
          background:`linear-gradient(135deg,${p.bg},${p.bg}cc)`,
          color:p.text, fontSize:15, fontWeight:800, cursor:'pointer',
          boxShadow:`0 6px 20px ${p.bg}44`,
        }}
      >I'm back 👋</button>
    </div>
  )
}
