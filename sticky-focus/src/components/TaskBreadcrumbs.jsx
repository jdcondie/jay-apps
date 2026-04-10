import { getP } from '../utils/constants'

export function TaskBreadcrumbs({ tasks, flatList, focusIdx }) {
  return (
    <div style={{width:'100%',maxWidth:480,padding:'0 4px',marginTop:16}}>
      {tasks.map((task, ti) => {
        const tp         = getP(ti)
        const total      = task.subs.length
        const done       = task.subs.filter(s => s.done).length
        const isCurrent  = flatList[focusIdx]?.taskIdx === ti
        const isComplete = done === total

        return (
          <div key={ti} style={{marginBottom:8}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
              <div style={{
                width:8,height:8,borderRadius:'50%',flexShrink:0,
                background:isComplete||isCurrent?tp.bg:'rgba(0,0,0,.18)',
                boxShadow:isCurrent?`0 0 0 3px ${tp.bg}44`:'none',
                transition:'all .3s',
              }}/>
              <span style={{
                fontSize:11,fontWeight:isCurrent?800:600,flex:1,
                color:isComplete?'rgba(0,0,0,.5)':isCurrent?'rgba(0,0,0,.75)':'rgba(0,0,0,.32)',
                overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                textDecoration:isComplete?'line-through':'none',transition:'all .3s',
              }}>{task.title}</span>
              <span style={{
                fontSize:10,fontWeight:700,flexShrink:0,
                color:isComplete?tp.text:isCurrent?'rgba(0,0,0,.5)':'rgba(0,0,0,.22)',
              }}>{done}/{total}</span>
            </div>
            <div style={{display:'flex',gap:3,paddingLeft:14}}>
              {task.subs.map((sub, si) => {
                const gIdx     = flatList.findIndex(f => f.taskIdx===ti && f.subIdx===si)
                const isActive = gIdx === focusIdx
                return (
                  <div key={si} style={{
                    flex:1,height:isActive?8:5,borderRadius:4,position:'relative',overflow:'hidden',
                    background:sub.done?tp.bg:isActive?tp.bg+'99':'rgba(0,0,0,.1)',
                    boxShadow:isActive?`0 0 8px ${tp.bg}88`:'none',
                    transition:'all .4s cubic-bezier(.4,0,.2,1)',
                  }}>
                    {isActive && (
                      <div style={{
                        position:'absolute',inset:0,
                        background:'linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent)',
                        animation:'shimmer 1.5s ease infinite',backgroundSize:'200% 100%',
                      }}/>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
