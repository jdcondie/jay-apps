import { useFocusStore } from '../store/useFocusStore'
import { useUserStorage } from '../hooks/useUserStorage'
import { useUser } from '@clerk/clerk-react'
import { fmtMin } from '../utils/formatters'
import { loadStreak } from '../utils/streak'
import { getP } from '../utils/constants'

export function EODReview() {
  const setShowEOD = useFocusStore(s => s.setShowEOD)
  const { user }   = useUser()
  const store      = useUserStorage(user?.id)
  const streak     = loadStreak(store)
  const history    = store.get('history') || []

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:300,
      background:'rgba(15,12,41,.96)',
      backdropFilter:'blur(20px)',
      overflowY:'auto', padding:24,
      animation:'fadeIn .3s ease',
    }}>
      <div style={{maxWidth:500, margin:'0 auto'}}>
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          marginBottom:24,
        }}>
          <h2 style={{color:'#fff', fontSize:22, fontWeight:800, margin:0}}>
            Day Review 📊
          </h2>
          <button
            onClick={() => setShowEOD(false)}
            style={{
              background:'rgba(255,255,255,.08)', border:'none',
              color:'rgba(255,255,255,.6)', width:32, height:32,
              borderRadius:8, cursor:'pointer', fontSize:16,
            }}
          >✕</button>
        </div>

        {/* Streak summary */}
        <div style={{
          background:'rgba(254,202,87,.1)', border:'1px solid rgba(254,202,87,.2)',
          borderRadius:16, padding:'16px 20px', marginBottom:20,
          display:'flex', gap:20,
        }}>
          {[
            { label:'Current streak', val:`🔥 ${streak.count}d` },
            { label:'Best streak', val:`⭐ ${streak.best}d` },
            { label:'Total goals', val:`✅ ${streak.totalGoals}` },
          ].map(s => (
            <div key={s.label} style={{flex:1, textAlign:'center'}}>
              <div style={{color:'#FECA57', fontSize:18, fontWeight:800}}>{s.val}</div>
              <div style={{color:'rgba(255,255,255,.35)', fontSize:11}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* History */}
        <p style={{
          color:'rgba(255,255,255,.4)', fontSize:11, fontWeight:700,
          letterSpacing:.5, textTransform:'uppercase', marginBottom:12,
        }}>Recent goals</p>

        {history.length === 0 ? (
          <p style={{color:'rgba(255,255,255,.25)', fontSize:14, textAlign:'center', padding:32}}>
            No history yet. Complete your first goal to see it here.
          </p>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {history.map((h, i) => {
              const p = getP(i)
              return (
                <div key={h.id} style={{
                  background:'rgba(255,255,255,.05)', borderRadius:14,
                  padding:'14px 16px', border:`1px solid ${p.bg}22`,
                }}>
                  <div style={{
                    display:'flex', justifyContent:'space-between',
                    alignItems:'flex-start', marginBottom:6,
                  }}>
                    <p style={{
                      color:'#fff', fontSize:14, fontWeight:700,
                      margin:0, flex:1, paddingRight:10,
                    }}>{h.goal}</p>
                    <span style={{
                      color:'rgba(255,255,255,.3)', fontSize:11, flexShrink:0,
                    }}>{h.date}</span>
                  </div>
                  <div style={{display:'flex', gap:12}}>
                    <span style={{color:'rgba(255,255,255,.4)', fontSize:12}}>
                      {h.steps} steps
                    </span>
                    <span style={{color:'rgba(255,255,255,.4)', fontSize:12}}>
                      {fmtMin(h.totalElapsed)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
