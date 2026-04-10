import { useFocusStore } from '../store/useFocusStore'
import { useUserStorage } from '../hooks/useUserStorage'
import { useUser } from '@clerk/clerk-react'
import { loadStreak } from '../utils/streak'
import { fmtMin } from '../utils/formatters'

export function DoneScreen({ onRestart }) {
  const goal         = useFocusStore(s => s.goal)
  const stepTimes    = useFocusStore(s => s.stepTimes)
  const flatList     = useFocusStore(s => s.flatList)
  const setShowEOD   = useFocusStore(s => s.setShowEOD)

  const { user } = useUser()
  const store    = useUserStorage(user?.id)
  const streak   = loadStreak(store)

  const totalElapsed = stepTimes.reduce((a,s) => a + s.elapsed, 0)
  const totalEst     = flatList.reduce((a,f) => a + f.minutes*60, 0)
  const onTime       = stepTimes.filter(s => s.elapsed <= s.est * 1.2).length
  const pct          = stepTimes.length ? Math.round((onTime/stepTimes.length)*100) : 0

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
      padding:32, gap:24,
    }}>
      <div style={{
        textAlign:'center', maxWidth:400,
        animation:'slideUp .5s ease',
      }}>
        {/* Trophy */}
        <div style={{
          fontSize:64, marginBottom:16,
          animation:'bounce .6s ease',
        }}>🏆</div>

        <h1 style={{
          color:'#fff', fontSize:28, fontWeight:900,
          margin:'0 0 8px', letterSpacing:-1,
        }}>Goal complete!</h1>

        <p style={{
          color:'rgba(255,255,255,.5)', fontSize:15,
          lineHeight:1.5, margin:'0 0 24px',
        }}>"{goal}"</p>

        {/* Stats row */}
        <div style={{
          display:'flex', gap:10, marginBottom:24,
        }}>
          {[
            { label:'Steps', val:stepTimes.length, emoji:'✅' },
            { label:'Time', val:fmtMin(totalElapsed), emoji:'⏱' },
            { label:'On time', val:`${pct}%`, emoji:'🎯' },
          ].map(s => (
            <div key={s.label} style={{
              flex:1, background:'rgba(255,255,255,.07)', borderRadius:14,
              padding:'14px 8px', border:'1px solid rgba(255,255,255,.1)',
            }}>
              <div style={{fontSize:20, marginBottom:4}}>{s.emoji}</div>
              <div style={{color:'#fff', fontSize:18, fontWeight:800}}>{s.val}</div>
              <div style={{color:'rgba(255,255,255,.35)', fontSize:11}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Streak */}
        {streak.count > 0 && (
          <div style={{
            background:'rgba(254,202,87,.12)', border:'1px solid rgba(254,202,87,.25)',
            borderRadius:14, padding:'12px 20px', marginBottom:24,
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
          }}>
            <span style={{fontSize:20}}>🔥</span>
            <div>
              <p style={{color:'#FECA57', fontWeight:800, fontSize:15, margin:0}}>
                {streak.count} day streak
              </p>
              <p style={{color:'rgba(254,202,87,.5)', fontSize:12, margin:0}}>
                Best: {streak.best} · Total goals: {streak.totalGoals}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          <button
            onClick={onRestart}
            style={{
              padding:'14px 24px', borderRadius:14, border:'none',
              background:'linear-gradient(135deg,#FECA57,#FF9F43)',
              color:'#1a0f00', fontSize:15, fontWeight:800, cursor:'pointer',
              boxShadow:'0 8px 24px rgba(254,202,87,.35)',
            }}
          >Start a new goal →</button>

          <button
            onClick={() => setShowEOD(true)}
            style={{
              padding:'12px 24px', borderRadius:14,
              background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)',
              color:'rgba(255,255,255,.6)', fontSize:14, cursor:'pointer',
            }}
          >📊 Review my day</button>
        </div>
      </div>
    </div>
  )
}
