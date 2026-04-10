import { useFocusStore } from '../store/useFocusStore'
import { getP, TIMER_PRESETS } from '../utils/constants'
import { fmtMin } from '../utils/formatters'

export function ReviewScreen({ onStart, onBack }) {
  const tasks        = useFocusStore(s => s.tasks)
  const goal         = useFocusStore(s => s.goal)
  const goalWhy      = useFocusStore(s => s.goalWhy)
  const activePreset = useFocusStore(s => s.activePreset)
  const applyPreset  = useFocusStore(s => s.applyPreset)
  const updateTaskTitle = useFocusStore(s => s.updateTaskTitle)
  const updateSub    = useFocusStore(s => s.updateSub)
  const moveSub      = useFocusStore(s => s.moveSub)
  const addSub       = useFocusStore(s => s.addSub)
  const deleteSub    = useFocusStore(s => s.deleteSub)
  const moveTask     = useFocusStore(s => s.moveTask)
  const deleteTask   = useFocusStore(s => s.deleteTask)
  const addTask      = useFocusStore(s => s.addTask)

  const totalMins = tasks.reduce((a,t) => a + t.subs.reduce((b,s) => b+s.minutes, 0), 0)
  const totalSteps = tasks.reduce((a,t) => a + t.subs.length, 0)

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
      padding:'24px 16px 40px',
      overflowY:'auto',
    }}>
      <div style={{maxWidth:560, margin:'0 auto', animation:'fadeIn .4s ease'}}>

        {/* Header */}
        <div style={{marginBottom:20}}>
          <button
            onClick={onBack}
            style={{
              background:'none', border:'none', color:'rgba(255,255,255,.4)',
              fontSize:13, cursor:'pointer', padding:'4px 0', marginBottom:12,
            }}
          >← Back</button>
          <h2 style={{color:'#fff', fontSize:22, fontWeight:800, margin:'0 0 6px', letterSpacing:-.5}}>
            Your Plan
          </h2>
          <p style={{color:'rgba(255,255,255,.45)', fontSize:13, margin:0, lineHeight:1.5}}>
            {goal}
          </p>
          {goalWhy && (
            <p style={{
              color:'#FECA57', fontSize:13, marginTop:8, lineHeight:1.5,
              fontStyle:'italic', opacity:.8,
            }}>
              "{goalWhy}"
            </p>
          )}
        </div>

        {/* Stats */}
        <div style={{
          display:'flex', gap:10, marginBottom:20,
        }}>
          {[
            { label:'Tasks', val:tasks.length },
            { label:'Steps', val:totalSteps },
            { label:'Est. time', val:fmtMin(totalMins*60) },
          ].map(s => (
            <div key={s.label} style={{
              flex:1, background:'rgba(255,255,255,.06)', borderRadius:12,
              padding:'10px 8px', textAlign:'center',
              border:'1px solid rgba(255,255,255,.08)',
            }}>
              <div style={{color:'#fff', fontSize:18, fontWeight:800}}>{s.val}</div>
              <div style={{color:'rgba(255,255,255,.35)', fontSize:11}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Timer presets */}
        <div style={{marginBottom:20}}>
          <p style={{color:'rgba(255,255,255,.4)', fontSize:11, fontWeight:700,
            letterSpacing:.5, textTransform:'uppercase', marginBottom:8}}>
            Apply time preset
          </p>
          <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
            {TIMER_PRESETS.map(p => (
              <button
                key={p.mins}
                onClick={() => applyPreset(p.mins)}
                style={{
                  padding:'6px 12px', borderRadius:10, border:'none',
                  background: activePreset===p.mins ? '#FECA57' : 'rgba(255,255,255,.08)',
                  color: activePreset===p.mins ? '#1a0f00' : 'rgba(255,255,255,.6)',
                  fontSize:12, fontWeight:700, cursor:'pointer', transition:'all .2s',
                }}
              >{p.icon} {p.label} {p.mins}m</button>
            ))}
          </div>
        </div>

        {/* Task list */}
        <div style={{display:'flex', flexDirection:'column', gap:12, marginBottom:20}}>
          {tasks.map((task, ti) => {
            const p = getP(ti)
            return (
              <div key={ti} style={{
                background:'rgba(255,255,255,.06)', borderRadius:16,
                border:`1px solid ${p.bg}33`,
                overflow:'hidden',
              }}>
                {/* Task header */}
                <div style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'12px 14px 10px',
                  borderBottom:'1px solid rgba(255,255,255,.06)',
                }}>
                  <div style={{
                    width:10, height:10, borderRadius:'50%',
                    background:p.bg, flexShrink:0,
                  }}/>
                  <input
                    value={task.title}
                    onChange={e => updateTaskTitle(ti, e.target.value)}
                    style={{
                      flex:1, background:'transparent', border:'none', outline:'none',
                      color:'#fff', fontSize:14, fontWeight:700,
                    }}
                  />
                  <div style={{display:'flex', gap:4}}>
                    <button onClick={() => moveTask(ti,-1)} style={iconBtn}>↑</button>
                    <button onClick={() => moveTask(ti,1)} style={iconBtn}>↓</button>
                    <button onClick={() => deleteTask(ti)} style={{...iconBtn, color:'#FF6B6B'}}>✕</button>
                  </div>
                </div>

                {/* Subtasks */}
                <div style={{padding:'8px 14px'}}>
                  {task.subs.map((sub, si) => (
                    <div key={si} style={{
                      display:'flex', alignItems:'center', gap:8,
                      padding:'6px 0',
                      borderBottom: si < task.subs.length-1 ? '1px solid rgba(255,255,255,.04)' : 'none',
                    }}>
                      <span style={{color:p.bg, fontSize:12, flexShrink:0}}>●</span>
                      <input
                        value={sub.text}
                        onChange={e => updateSub(ti,si,'text',e.target.value)}
                        style={{
                          flex:1, background:'transparent', border:'none', outline:'none',
                          color:'rgba(255,255,255,.8)', fontSize:13,
                        }}
                      />
                      <input
                        type="number"
                        min={1} max={60}
                        value={sub.minutes}
                        onChange={e => updateSub(ti,si,'minutes',Math.max(1,parseInt(e.target.value)||10))}
                        style={{
                          width:40, background:'rgba(255,255,255,.08)', border:'none',
                          outline:'none', color:'rgba(255,255,255,.5)',
                          fontSize:12, borderRadius:6, padding:'2px 6px', textAlign:'center',
                        }}
                      />
                      <span style={{color:'rgba(255,255,255,.25)', fontSize:10, flexShrink:0}}>m</span>
                      <div style={{display:'flex', gap:2}}>
                        <button onClick={() => moveSub(ti,si,-1)} style={iconBtn}>↑</button>
                        <button onClick={() => moveSub(ti,si,1)} style={iconBtn}>↓</button>
                        <button onClick={() => deleteSub(ti,si)} style={{...iconBtn,color:'#FF6B6B'}}>✕</button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => addSub(ti)}
                    style={{
                      marginTop:6, background:'none', border:'none',
                      color:p.bg, fontSize:12, cursor:'pointer', padding:'4px 0',
                      opacity:.7,
                    }}
                  >+ Add step</button>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={addTask}
          style={{
            width:'100%', padding:'12px', borderRadius:12, marginBottom:20,
            background:'rgba(255,255,255,.05)', border:'1px dashed rgba(255,255,255,.15)',
            color:'rgba(255,255,255,.4)', fontSize:13, cursor:'pointer',
          }}
        >+ Add task</button>

        <button
          onClick={onStart}
          style={{
            width:'100%', padding:'16px 24px', borderRadius:16, border:'none',
            background:'linear-gradient(135deg,#FECA57,#FF9F43)',
            color:'#1a0f00', fontSize:16, fontWeight:800, cursor:'pointer',
            boxShadow:'0 8px 24px rgba(254,202,87,.35)',
            transition:'all .2s',
          }}
        >
          Start focusing →
        </button>
      </div>
    </div>
  )
}

const iconBtn = {
  background:'none', border:'none', color:'rgba(255,255,255,.3)',
  fontSize:13, cursor:'pointer', padding:'2px 4px', lineHeight:1,
}
