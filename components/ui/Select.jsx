'use client'
import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

// Custom dropdown (replaces the native <select>). options: [{ value, label }].
export default function Select({ value, onChange, options, ariaLabel }) {
  const listId = useId()
  const root = useRef(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const selected = Math.max(0, options.findIndex(o => o.value === value))

  useEffect(() => {
    if (!open) return
    const onDown = e => root.current && !root.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const show = () => { setActive(selected); setOpen(true) }
  const choose = i => { onChange(options[i].value); setOpen(false) }

  function onKeyDown(e) {
    const last = options.length - 1
    if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false) } // keep a parent dialog open
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) show()
      else setActive(i => e.key === 'ArrowDown' ? Math.min(last, i + 1) : Math.max(0, i - 1))
    } else if (e.key === 'Home' || e.key === 'End') {
      if (open) { e.preventDefault(); setActive(e.key === 'Home' ? 0 : last) }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      open ? choose(active) : show()
    } else if (e.key === 'Tab') setOpen(false)
  }

  return <div className="select" ref={root}>
    <button type="button" className="select-button" role="combobox" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open}
      aria-controls={listId} aria-activedescendant={open ? `${listId}-${active}` : undefined}
      onClick={() => open ? setOpen(false) : show()} onKeyDown={onKeyDown}>
      <span>{options[selected]?.label}</span><ChevronDown size={16} />
    </button>
    {open && <ul className="select-menu" id={listId} role="listbox">
      {options.map((o, i) => <li key={o.value} id={`${listId}-${i}`} role="option" aria-selected={i === selected}
        className={`select-option${i === active ? ' active' : ''}`} onMouseEnter={() => setActive(i)} onMouseDown={e => e.preventDefault()} onClick={() => choose(i)}>
        <span>{o.label}</span>{i === selected && <Check size={15} />}
      </li>)}
    </ul>}
  </div>
}
