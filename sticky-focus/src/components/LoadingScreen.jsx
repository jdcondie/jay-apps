export function LoadingScreen({ goal }) {
  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
      gap:24, padding:32,
    }}>
      <div style={{
        width:64, height:64, borderRadius:20,
        background:'linear-gradient(135deg,#FECA57,#FF6B6B)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:32, boxShadow:'0 8px 32px rgba(254,202,87,.4)',
        animation:'bounce 1.2s ease infinite',
      }}>📌</div>

      <div style={{textAlign:'center', maxWidth:360}}>
        <p style={{
          color:'rgba(255,255,255,.5)', fontSize:13, marginBottom:8, letterSpacing:.5,
          textTransform:'uppercase', fontWeight:600,
        }}>Breaking it down...</p>
        <p style={{
          color:'#fff', fontSize:17, fontWeight:600, lineHeight:1.5,
          opacity:.85,
        }}>"{goal}"</p>
      </div>

      <div style={{display:'flex', gap:8}}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width:8, height:8, borderRadius:'50%',
            background:'rgba(255,255,255,.4)',
            animation:`pulse 1.2s ease ${i*.2}s infinite`,
          }}/>
        ))}
      </div>

      <p style={{
        color:'rgba(255,255,255,.25)', fontSize:12, maxWidth:280,
        textAlign:'center', lineHeight:1.6,
      }}>
        Claude is building your ADHD-friendly plan. Just a few seconds.
      </p>
    </div>
  )
}
