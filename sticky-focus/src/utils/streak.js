import { todayStr } from './formatters'

export const loadStreak = store =>
  store.get('streak') || { count:0, lastDate:null, best:0, totalGoals:0 }

export const bumpStreak = (store, streak) => {
  const t = todayStr()
  const y = new Date(Date.now() - 86400000).toDateString()
  const count = streak.lastDate === t ? streak.count
    : streak.lastDate === y ? streak.count + 1 : 1
  const updated = { count, lastDate:t, best:Math.max(streak.best,count), totalGoals:streak.totalGoals+1 }
  store.set('streak', updated)
  return updated
}

export const saveHistory = (store, goal, stepTimes, flatList, totalElapsed, totalEst) => {
  const hist = store.get('history') || []
  store.set('history', [{
    id: Date.now(), date: todayStr(), goal,
    steps: stepTimes.length, totalElapsed, totalEst,
    tasks: [...new Set(flatList.map(f => f.taskTitle))]
  }, ...hist].slice(0, 50))
}
