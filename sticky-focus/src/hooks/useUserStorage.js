import { useMemo } from 'react'

export function useUserStorage(userId = 'guest') {
  return useMemo(() => {
    const k = key => `sf_${userId}_${key}`
    return {
      get: key     => { try { return JSON.parse(localStorage.getItem(k(key))) } catch { return null } },
      set: (key,v) => { try { localStorage.setItem(k(key), JSON.stringify(v)) } catch {} },
      del: key     => { try { localStorage.removeItem(k(key)) } catch {} },
    }
  }, [userId])
}
