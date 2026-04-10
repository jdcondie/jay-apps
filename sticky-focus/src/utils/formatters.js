export const fmt = s =>
  `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

export const fmtMin = s => {
  const m = Math.floor(s/60)
  return m < 60 ? `${m}m` : `${Math.floor(m/60)}h ${m%60}m`
}

export const todayStr = () => new Date().toDateString()

export const rand = arr => arr[Math.floor(Math.random() * arr.length)]
