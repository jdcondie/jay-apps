import { create } from 'zustand'

export const useFocusStore = create((set, get) => ({
  // ── Screen ──────────────────────────────────────────────────────────────
  screen: 'input',
  setScreen: screen => set({ screen }),

  // ── Goal ────────────────────────────────────────────────────────────────
  goal:    '',
  goalWhy: '',
  setGoal:    goal    => set({ goal }),
  setGoalWhy: goalWhy => set({ goalWhy }),

  // ── Tasks ────────────────────────────────────────────────────────────────
  tasks: [],
  setTasks: tasks => set({ tasks }),
  updateTaskTitle: (ti, val) => set(s => ({
    tasks: s.tasks.map((t,i) => i===ti ? {...t,title:val} : t)
  })),
  updateSub: (ti, si, field, val) => set(s => ({
    tasks: s.tasks.map((t,i) => i!==ti ? t : {
      ...t, subs: t.subs.map((sub,j) => j===si ? {...sub,[field]:val} : sub)
    })
  })),
  moveSub: (ti, si, dir) => set(s => ({
    tasks: s.tasks.map((t,i) => {
      if (i!==ti) return t
      const subs=[...t.subs], j=si+dir
      if (j<0||j>=subs.length) return t
      ;[subs[si],subs[j]]=[subs[j],subs[si]]
      return {...t,subs}
    })
  })),
  addSub: ti => set(s => ({
    tasks: s.tasks.map((t,i) => i!==ti ? t : {
      ...t, subs:[...t.subs,{text:'New step',minutes:10,done:false}]
    })
  })),
  deleteSub: (ti, si) => set(s => ({
    tasks: s.tasks.map((t,i) => i!==ti ? t : {
      ...t, subs:t.subs.filter((_,j)=>j!==si)
    })
  })),
  moveTask: (ti, dir) => set(s => {
    const a=[...s.tasks], j=ti+dir
    if (j<0||j>=a.length) return s
    ;[a[ti],a[j]]=[a[j],a[ti]]
    return { tasks:a }
  }),
  deleteTask: ti => set(s => ({ tasks:s.tasks.filter((_,i)=>i!==ti) })),
  addTask: () => set(s => ({
    tasks:[...s.tasks,{title:'New Task',done:false,subs:[{text:'Step 1',minutes:10,done:false}]}]
  })),
  markSubDone: (taskIdx, subIdx) => set(s => ({
    tasks: s.tasks.map((t,ti) => {
      if (ti!==taskIdx) return t
      const subs = t.subs.map((sub,si)=>si===subIdx?{...sub,done:true}:sub)
      return {...t, subs, done:subs.every(s=>s.done)}
    })
  })),

  // ── Flat list ────────────────────────────────────────────────────────────
  flatList: [],
  setFlatList: flatList => set({ flatList }),
  buildFlatList: () => {
    const { tasks } = get()
    const list = []
    tasks.forEach((t,ti) => t.subs.forEach((s,si) =>
      list.push({ label:s.text, minutes:s.minutes, taskIdx:ti, subIdx:si, taskTitle:t.title })
    ))
    set({ flatList:list })
    return list
  },

  // ── Focus progress ───────────────────────────────────────────────────────
  focusIdx:   0,
  setFocusIdx: focusIdx => set({ focusIdx }),

  stepTimes: [],
  addStepTime: entry => set(s => ({ stepTimes:[...s.stepTimes, entry] })),

  flowStreak:    0,
  bumpFlowStreak: () => set(s => ({ flowStreak:s.flowStreak+1 })),
  resetFlowStreak: () => set({ flowStreak:0 }),

  // ── Overlays ─────────────────────────────────────────────────────────────
  overlay:      null,
  setOverlay:   overlay => set({ overlay }),

  readyPrompt:  '',
  setReadyPrompt: readyPrompt => set({ readyPrompt }),

  driftMsg:     '',
  setDriftMsg:  driftMsg => set({ driftMsg }),

  breakMsg:     '',
  setBreakMsg:  breakMsg => set({ breakMsg }),

  hyperfocusShown:    false,
  setHyperfocusShown: v => set({ hyperfocusShown:v }),

  prevTaskIdx:    null,
  setPrevTaskIdx: prevTaskIdx => set({ prevTaskIdx }),

  // ── ADHD features ─────────────────────────────────────────────────────────
  bodyDouble:     null,
  setBodyDouble:  bodyDouble => set({ bodyDouble }),

  needsTab:       false,
  toggleNeedsTab: () => set(s => ({ needsTab:!s.needsTab })),

  stuckActions:   null,
  setStuckActions: stuckActions => set({ stuckActions }),
  stuckLoading:   false,
  setStuckLoading: stuckLoading => set({ stuckLoading }),

  // ── UI state ──────────────────────────────────────────────────────────────
  soundOn:       true,
  toggleSound:   () => set(s => ({ soundOn:!s.soundOn })),

  fullscreen:    false,
  toggleFullscreen: () => {
    const isFs = !!document.fullscreenElement
    isFs ? document.exitFullscreen?.() : document.documentElement.requestFullscreen?.()
    set({ fullscreen:!isFs })
  },

  showEOD:       false,
  setShowEOD:    v => set({ showEOD:v }),

  showTemplates: false,
  setShowTemplates: v => set({ showTemplates:v }),

  showConfetti:  false,
  setShowConfetti: v => set({ showConfetti:v }),

  winMsg:        '',
  setWinMsg:     winMsg => set({ winMsg }),

  activePreset:  null,
  setActivePreset: activePreset => set({ activePreset }),
  applyPreset: mins => set(s => ({
    activePreset: mins,
    tasks: s.tasks.map(t => ({ ...t, subs:t.subs.map(sub=>({...sub,minutes:mins})) }))
  })),

  isListening:   false,
  setIsListening: v => set({ isListening:v }),

  // ── Reset ─────────────────────────────────────────────────────────────────
  resetSession: () => set({
    screen:'input', goal:'', goalWhy:'', tasks:[], flatList:[],
    focusIdx:0, stepTimes:[], flowStreak:0, overlay:null,
    bodyDouble:null, needsTab:false, stuckActions:null,
    stuckLoading:false, showConfetti:false, winMsg:'',
    activePreset:null, hyperfocusShown:false, prevTaskIdx:null,
  }),
}))
