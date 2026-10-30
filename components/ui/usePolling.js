'use client'
import { useEffect, useRef } from 'react'

// Calls `callback` every `ms` while the tab is visible, and once more when the tab becomes visible again.
// (Serverless hosting cannot hold a live connection open, so views stay current by polling.)
export function usePolling(callback, ms) {
  const latest = useRef(callback)
  useEffect(() => { latest.current = callback })
  useEffect(() => {
    const tick = () => { if (document.visibilityState === 'visible') latest.current() }
    const id = setInterval(tick, ms)
    document.addEventListener('visibilitychange', tick)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick) }
  }, [ms])
}
