'use client'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { monthLabel, pad } from '../../lib/format'
import Select from './Select'
import { useFloating } from './useFloating'

const SHORT = Array.from({ length: 12 }, (_, i) => new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(new Date(2000, i, 1)))

// Custom month picker (replaces <input type="month">). value and onChange use "YYYY-MM"; value may be empty.
export default function MonthPicker({ value, onChange, ariaLabel, placeholder = 'All months' }) {
  const popId = useId()
  const root = useRef(null)
  const now = new Date()
  const thisYear = now.getFullYear(), thisMonth = `${thisYear}-${pad(now.getMonth() + 1)}`
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState(Number((value ?? thisMonth).slice(0, 4)))
  const firstYear = Math.min(thisYear - 10, year), lastYear = Math.max(thisYear + 5, year)
  const yearOptions = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => ({ value: firstYear + i, label: String(firstYear + i) }))

  const close = useCallback(() => setOpen(false), [])
  const floating = useFloating(open, root, close)

  const show = () => { setYear(Number((value ?? thisMonth).slice(0, 4))); setOpen(true) }
  const pick = month => { onChange(`${year}-${pad(month + 1)}`); close() }
  const onKeyDown = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); root.current?.querySelector('.select-button')?.focus() } }

  return <div className="select date-picker" ref={root}>
    <button type="button" className="select-button" aria-label={ariaLabel} aria-haspopup="dialog" aria-expanded={open} aria-controls={popId} onClick={() => open ? close() : show()}>
      <span className={value ? undefined : 'placeholder'}>{value ? monthLabel(value) : placeholder}</span><CalendarDays size={16} />
    </button>
    {open && createPortal(<div className="date-pop" ref={floating.panel} id={popId} role="dialog" aria-label="Choose a month" onKeyDown={onKeyDown} data-floating style={floating.style}>
      <div className="date-nav year-only">
        <button type="button" className="icon-button" aria-label="Previous year" onClick={() => setYear(year - 1)}><ChevronLeft size={16} /></button>
        <Select ariaLabel="Year" value={year} onChange={setYear} options={yearOptions} />
        <button type="button" className="icon-button" aria-label="Next year" onClick={() => setYear(year + 1)}><ChevronRight size={16} /></button>
      </div>
      <div className="date-grid months">
        {SHORT.map((name, i) => {
          const key = `${year}-${pad(i + 1)}`
          return <button key={key} type="button" autoFocus={key === (value ?? thisMonth)} aria-pressed={key === value} aria-label={monthLabel(key)}
            className={`date-day${key === thisMonth ? ' today' : ''}${key === value ? ' selected' : ''}`} onClick={() => pick(i)}>{name}</button>
        })}
      </div>
    </div>, document.body)}
  </div>
}
