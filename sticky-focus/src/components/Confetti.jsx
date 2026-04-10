import { PALETTE } from '../utils/constants'

export function Confetti() {
  const pieces = Array.from({length:90}, (_,i) => ({
    id:i, x:Math.random()*100, delay:Math.random()*2.5,
    dur:2.5+Math.random()*2, color:PALETTE[i%PALETTE.length].bg,
    size:6+Math.random()*9, shape:Math.random()>.5?'circle':'rect',
  }))

  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:500,overflow:'hidden'}}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position:'absolute', top:-20, left:`${p.x}%`,
          width:p.size, height:p.shape==='circle'?p.size:p.size*.6,
          borderRadius:p.shape==='circle'?'50%':2,
          background:p.color, opacity:0,
          animation:`confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
        }}/>
      ))}
    </div>
  )
}
