import { useFocusStore } from '../../store/useFocusStore'
import { fmt } from '../../utils/formatters'

export function HyperfocusOverlay({ timer }) {
  const setOverlay     = useFocusStore(s => s.setOverlay)
  const setHyperfocusShown = useFocusStore(s => s.setHyperfocusShown)

  const elapsed = timer?.sessionElapsed || 0

  const handleKeepGoing = () => {
    setHyperfocusShown(false)
    setOverlay(null)
  }

  const handleBreak = () => {
    timer?.pause()
    setHyperfocusShown(false)
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
      <div style={{fontSize:48}}>🌊</div>

      <div style={{textAlign:'center', maxWidth:340}}>
        <h2 style={{color:'#fff', fontSize:22, fontWeight:800, margin:'0 0 10px'}}>
          You've been at it for {fmt(elapsed)}
        </h2>
        <p style={{color:'rgba(255,255,255,.5)', fontSize:15, lineHeight:1.6, margin:0}}>
          That's a solid flow state. Your brain might benefit from a short break — even just 5 minutes.
        </p>
      </div>

      <div style={{display:'flex', gap:12}}>
        <button
          onClick={handleBreak}
          style={{
            padding:'12px 24px', borderRadius:12,
            background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)',
            color:'rgba(255,255,255,.7)', fontSize:14, fontWeight:700, cursor:'pointer',
          }}
        >Take a break 🧘</button>

        <button
          onClick={handleKeepGoing}
          style={{
            padding:'12px 24px', borderRadius:12, border:'none',
            background:'linear-gradient(135deg,#48DBFB,#1DD1A1)',
            color:'#003D3A', fontSize:14, fontWeight:800, cursor:'pointer',
            boxShadow:'0 6px 20px rgba(72,219,251,.3)',
          }}
        >Keep the flow 🌊</button>
      </div>
    </div>
  )
}
