export function TimerRing({ elapsed, limit, color, size=108 }) {
  const r    = size/2 - 8
  const circ = 2 * Math.PI * r
  const pct  = limit ? Math.min(elapsed/limit, 1) : 0
  const over = limit > 0 && elapsed > limit

  return (
    <svg width={size} height={size} style={{filter:'drop-shadow(0 2px 10px rgba(0,0,0,.2))'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,.08)" strokeWidth={7}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={over ? '#FF6B6B' : color} strokeWidth={7}
        strokeLinecap="round" strokeDasharray={circ}
        strokeDashoffset={circ * (1-pct)}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{transition:'stroke-dashoffset .5s linear, stroke .3s'}}
      />
      <text x="50%" y="44%" textAnchor="middle" dominantBaseline="central"
        fill={over ? '#FF6B6B' : 'rgba(0,0,0,.72)'}
        fontSize={14} fontWeight="800" fontFamily="monospace">
        {over
          ? '+' + String(Math.floor((elapsed-limit)/60)).padStart(2,'0') + ':' + String((elapsed-limit)%60).padStart(2,'0')
          : String(Math.floor((limit?limit-elapsed:elapsed)/60)).padStart(2,'0') + ':' + String((limit?limit-elapsed:elapsed)%60).padStart(2,'0')
        }
      </text>
      <text x="50%" y="64%" textAnchor="middle" dominantBaseline="central"
        fill="rgba(0,0,0,.38)" fontSize={9} fontFamily="sans-serif" letterSpacing={.5}>
        {over ? 'OVER' : limit ? 'LEFT' : 'ELAPSED'}
      </text>
    </svg>
  )
}
