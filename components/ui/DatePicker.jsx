'use client'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { addDays, dayISO, txDate } from '../../lib/format'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const parse = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d) }
const monthTitle = d => new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(d)

// Custom date picker (replaces <input type="date">). value, min and onChange use "YYYY-MM-DD".
export default function DatePicker({ value, onChange, min, ariaLabel }) {
  const popId = useId()
  const root = useRef(null)
  const [open, setOpen] = useState(false)
  const [focus, setFocus] = useState(value) // the day that can be reached with the keyboard
  const today = dayISO(new Date())
  const view = parse(focus)
  const first = new Date(view.getFullYear(), view.getMonth(), 1)
  const gridStart = addDays(first, -((first.getDay() + 6) % 7)) // weeks start on Monday
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
  const allowed = iso => !min || iso >= min

  useEffect(() => {
    if (!open) return
    const onDown = e => root.current && !root.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  useEffect(() => { if (open) root.current?.querySelector(`[data-day="${focus}"]`)?.focus() }, [open, focus])

  const show = () => { setFocus(value); setOpen(true) }
  const pick = iso => { if (allowed(iso)) { onChange(iso); setOpen(false); root.current?.querySelector('.select-button')?.focus() } }
  const moveMonth = n => { const iso = dayISO(new Date(view.getFullYear(), view.getMonth() + n, 1)); setFocus(allowed(iso) ? iso : min) }

  function onKeyDown(e) {
    if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); root.current?.querySelector('.select-button')?.focus(); return }
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key]
    if (!step || !e.target.dataset.day) return
    e.preventDefault()
    const next = dayISO(addDays(parse(focus), step))
    if (allowed(next)) setFocus(next)
  }

  return <div className="select date-picker" ref={root} onKeyDown={onKeyDown}>
    <button type="button" className="select-button" aria-label={ariaLabel} aria-haspopup="dialog" aria-expanded={open} aria-controls={popId} onClick={() => open ? setOpen(false) : show()}>
      <span>{txDate(value)}</span><CalendarDays size={16} />
    </button>
    {open && <div className="select-menu date-pop" id={popId} role="dialog" aria-label="Choose a date">
      <div className="date-nav">
        <button type="button" className="icon-button" aria-label="Previous month" onClick={() => moveMonth(-1)}><ChevronLeft size={16} /></button>
        <strong aria-live="polite">{monthTitle(view)}</strong>
        <button type="button" className="icon-button" aria-label="Next month" onClick={() => moveMonth(1)}><ChevronRight size={16} /></button>
      </div>
      <div className="date-grid">
        {WEEKDAYS.map(w => <span key={w} className="date-weekday">{w}</span>)}
        {days.map(d => {
          const iso = dayISO(d)
          return <button key={iso} type="button" data-day={iso} tabIndex={iso === focus ? 0 : -1} disabled={!allowed(iso)} aria-pressed={iso === value} aria-label={txDate(iso)}
            className={`date-day${d.getMonth() !== view.getMonth() ? ' outside' : ''}${iso === today ? ' today' : ''}${iso === value ? ' selected' : ''}`} onClick={() => pick(iso)}>{d.getDate()}</button>
        })}
      </div>
    </div>}
  </div>
}
