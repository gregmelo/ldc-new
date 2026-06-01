import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store'

const TIMEOUT = 2 * 60 * 60 * 1000 // 2 heures en ms

export function useSessionTimeout() {
  const logout = useAuthStore((s) => s.logout)
  const timer  = useRef(null)

  function resetTimer() {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      logout()
    }, TIMEOUT)
  }

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer))
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])
}