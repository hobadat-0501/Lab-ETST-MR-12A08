'use client'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { addDays, dayISO, txDate } from '../../lib/format'
import Select from './Select'
import { useFloating } from './useFloating'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const parse = iso => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d) }
const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i, label: new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(new Date(2000, i, 1)) }))

// Custom date picker (replaces <input type="date">): pick the day, month and year. value, min and onChange use "YYYY-MM-DD".
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
  const thisYear = new Date().getFullYear()
  const firstYear = Math.min(min ? parse(min).getFullYear() : thisYear - 10, view.getFullYear())
  const lastYear = Math.max(thisYear + 5, view.getFullYear())
  const yearOptions = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => ({ value: firstYear + i, label: String(firstYear + i) }))

  const close = useCallback(() => setOpen(false), [])
  const floating = useFloating(open, root, close)

  useEffect(() => { if (open) root.current?.querySelector(`[data-day="${focus}"]`)?.focus() }, [open, focus])

  const show = () => { setFocus(value); setOpen(true) }
  const pick = iso => { if (allowed(iso)) { onChange(iso); setOpen(false); root.current?.querySelector('.select-button')?.focus() } }
  // Jump to a month/year, keeping the day of month where possible and never landing before `min`.
  const goTo = (year, month) => {
    const day = Math.min(view.getDate(), new Date(year, month + 1, 0).getDate())
    const iso = dayISO(new Date(year, month, day))
    setFocus(allowed(iso) ? iso : min)
  }
  const moveMonth = n => { const d = new Date(view.getFullYear(), view.getMonth() + n, 1); goTo(d.getFullYear(), d.getMonth()) }

  function onKeyDown(e) {
    if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); root.current?.querySelector('.select-button')?.focus(); return }
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key]
    if (!step || !e.target.dataset.day) return
    e.preventDefault()
    const next = dayISO(addDays(parse(focus), step))
    if (allowed(next)) setFocus(next)
  }

  return <div className="select date-picker" ref={root}>
    <button type="button" className="select-button" aria-label={ariaLabel} aria-haspopup="dialog" aria-expanded={open} aria-controls={popId} onClick={() => open ? setOpen(false) : show()}>
      <span>{txDate(value)}</span><CalendarDays size={16} />
    </button>
    {open && createPortal(<div className="date-pop" ref={floating.panel} id={popId} role="dialog" aria-label="Choose a date" onKeyDown={onKeyDown} data-floating style={floating.style}>
      <div className="date-nav">
        <button type="button" className="icon-button" aria-label="Previous month" onClick={() => moveMonth(-1)}><ChevronLeft size={16} /></button>
        <Select ariaLabel="Month" value={view.getMonth()} onChange={m => goTo(view.getFullYear(), m)} options={MONTHS} />
        <Select ariaLabel="Year" value={view.getFullYear()} onChange={y => goTo(y, view.getMonth())} options={yearOptions} />
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
    </div>, document.body)}
  </div>
}
