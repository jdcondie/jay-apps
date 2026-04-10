export const PALETTE = [
  { bg:'#FF6B6B', light:'#FFE5E5', text:'#7A0000' },
  { bg:'#FF9F43', light:'#FFF3E0', text:'#7A3B00' },
  { bg:'#FECA57', light:'#FFFDE7', text:'#7A5C00' },
  { bg:'#48DBFB', light:'#E0F7FA', text:'#00546A' },
  { bg:'#1DD1A1', light:'#E0F8F1', text:'#00503D' },
  { bg:'#A29BFE', light:'#EDE7FF', text:'#2D0080' },
  { bg:'#FD79A8', light:'#FFE4F0', text:'#7A0040' },
  { bg:'#74B9FF', light:'#E3F2FD', text:'#003D7A' },
]
export const getP = i => PALETTE[i % PALETTE.length]

export const TIMER_PRESETS = [
  { label:'Micro', mins:5,  icon:'⚡' },
  { label:'Quick', mins:15, icon:'🎯' },
  { label:'Focus', mins:25, icon:'🍅' },
  { label:'Deep',  mins:45, icon:'🌊' },
  { label:'Block', mins:60, icon:'🏔' },
]

export const DRIFT_MESSAGES = [
  'Hey! Eyes back here 👀',
  'Still with us? This step needs you 🧠',
  'The task misses you 😅',
  'One thing at a time — this one! 👇',
  'Psst. Come back 👋',
  'You wandered off, no shame — refocus here ✨',
]

export const READY_PROMPTS = [
  'Take one breath. Then we go. 🫁',
  "You've got this one. Ready?",
  'Small step. Big progress. Let\'s do it.',
  'Brain, meet task. Task, meet brain. 🤝',
  'Just this one thing. Nothing else exists right now.',
]

export const STEP_WINS = [
  'Nailed it! 🎯','That\'s the one! ✅','Brain = working 🧠','Boom! 💥',
  'Step crushed 🔥','You legend 👑','Keep rolling! ⚡','YES. Next! 🚀',
]

export const BREAK_MESSAGES = [
  'Task complete! Your brain deserves a reset. 🧠',
  'You just finished a whole task. Stand up. Breathe. 🌬️',
  'That task is DONE. Take 60 seconds — you earned it. ⭐',
  'One task down! Water, stretch, breathe. Then back at it. 💧',
]

export const BODY_DOUBLE_NAMES = ['Alex','Jordan','Sam','Riley','Morgan','Casey','Drew','Avery']
