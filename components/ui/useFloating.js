'use client'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// For a panel rendered in a portal (mark it with `data-floating`): places it under `anchor`, or above when
// there is no room, so it floats over dialogs instead of stretching them. Closes on outside click, scroll or resize.
export function useFloating(open, anchor, close) {
  const panel = useRef(null)
  const [pos, setPos] = useState(null)

  useEffect(() => {
    if (!open) return
    const outside = e => !anchor.current?.contains(e.target) && !e.target.closest?.('[data-floating]')
    const onEvent = e => { if (outside(e)) close() }
    document.addEventListener('mousedown', onEvent)
    document.addEventListener('scroll', onEvent, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', onEvent)
      document.removeEventListener('scroll', onEvent, true)
      window.removeEventListener('resize', close)
    }
  }, [open, anchor, close])

  useLayoutEffect(() => {
    if (!open || !panel.current) { setPos(null); return }
    const a = anchor.current.getBoundingClientRect(), { offsetWidth: w, offsetHeight: h } = panel.current
    const below = a.bottom + 4, above = a.top - 4 - h
    setPos({ top: below + h <= window.innerHeight - 8 || above < 8 ? below : above, left: Math.max(8, Math.min(a.left, window.innerWidth - w - 8)), width: a.width })
  }, [open, anchor])

  return { panel, style: pos ? { top: pos.top, left: pos.left, minWidth: pos.width } : { visibility: 'hidden' } }
}
