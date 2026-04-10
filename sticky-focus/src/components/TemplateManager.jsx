import { useState } from 'react'
import { useFocusStore } from '../store/useFocusStore'
import { useUserStorage } from '../hooks/useUserStorage'
import { useUser } from '@clerk/clerk-react'
import { getP } from '../utils/constants'

const DEFAULT_TEMPLATES = [
  {
    id:'morning', name:'Morning Routine', emoji:'☀️',
    goal:'Start the day right',
    tasks:[
      { title:'Wake up', subs:[{text:'Drink a glass of water',minutes:2},{text:'Quick stretch or movement',minutes:5}]},
      { title:'Plan the day', subs:[{text:'Review top 3 priorities',minutes:5},{text:'Block time on calendar',minutes:10}]},
    ]
  },
  {
    id:'deep-work', name:'Deep Work Block', emoji:'🧠',
    goal:'Focused work session',
    tasks:[
      { title:'Prep', subs:[{text:'Close all notifications',minutes:2},{text:'Write the one thing to finish',minutes:3}]},
      { title:'Execute', subs:[{text:'Work on task 1',minutes:25},{text:'Quick break — walk/water',minutes:5},{text:'Work on task 2',minutes:25}]},
    ]
  },
  {
    id:'email', name:'Email Inbox Zero', emoji:'📧',
    goal:'Clear the inbox',
    tasks:[
      { title:'Triage', subs:[{text:'Archive anything older than 7 days',minutes:5},{text:'Flag things that need replies',minutes:5}]},
      { title:'Respond', subs:[{text:'Reply to flagged emails — 2 min each',minutes:15},{text:'Send any pending follow-ups',minutes:10}]},
    ]
  },
]

export function TemplateManager() {
  const setShowTemplates = useFocusStore(s => s.setShowTemplates)
  const setGoal          = useFocusStore(s => s.setGoal)
  const setTasks         = useFocusStore(s => s.setTasks)

  const { user } = useUser()
  const store    = useUserStorage(user?.id)
  const saved    = store.get('templates') || []
  const all      = [...DEFAULT_TEMPLATES, ...saved]

  const applyTemplate = t => {
    setGoal(t.goal)
    setTasks(t.tasks.map(task => ({
      ...task,
      done: false,
      subs: task.subs.map(s => ({ ...s, done: false })),
    })))
    setShowTemplates(false)
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:300,
      background:'rgba(15,12,41,.96)',
      backdropFilter:'blur(20px)',
      overflowY:'auto', padding:24,
      animation:'fadeIn .3s ease',
    }}>
      <div style={{maxWidth:480, margin:'0 auto'}}>
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          marginBottom:24,
        }}>
          <h2 style={{color:'#fff', fontSize:20, fontWeight:800, margin:0}}>
            Templates
          </h2>
          <button
            onClick={() => setShowTemplates(false)}
            style={{
              background:'rgba(255,255,255,.08)', border:'none',
              color:'rgba(255,255,255,.6)', width:32, height:32,
              borderRadius:8, cursor:'pointer', fontSize:16,
            }}
          >✕</button>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          {all.map((t, i) => {
            const p = getP(i)
            return (
              <button
                key={t.id}
                onClick={() => applyTemplate(t)}
                style={{
                  background:'rgba(255,255,255,.05)', border:`1px solid ${p.bg}33`,
                  borderRadius:14, padding:'16px', cursor:'pointer',
                  textAlign:'left', transition:'all .2s',
                }}
              >
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:6}}>
                  <span style={{fontSize:20}}>{t.emoji}</span>
                  <span style={{color:'#fff', fontSize:15, fontWeight:700}}>{t.name}</span>
                </div>
                <p style={{color:'rgba(255,255,255,.4)', fontSize:13, margin:0}}>
                  {t.goal} · {t.tasks.length} tasks · {t.tasks.reduce((a,tk)=>a+tk.subs.length,0)} steps
                </p>
              </button>
            )
          })}
        </div>

        <p style={{
          color:'rgba(255,255,255,.2)', fontSize:12,
          textAlign:'center', marginTop:20,
        }}>
          Templates pre-fill your goal and tasks. You can edit before starting.
        </p>
      </div>
    </div>
  )
}
