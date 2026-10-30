'use client'
import { Search, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ACTIVITY_TYPES } from '../../lib/constants'
import { longDate, request, timeText } from '../../lib/format'
import ConfirmDialog from '../ui/ConfirmDialog'
import DatePicker from '../ui/DatePicker'
import Select from '../ui/Select'
import { useToast } from '../ui/Toast'

const STATUS_LABEL = { pending: 'Pending', confirmed: 'Approved', rejected: 'Rejected' }
const STATUS_FILTER = [{ value: '', label: 'All statuses' }, ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))]
const TYPE_FILTER = [{ value: '', label: 'All types' }, ...ACTIVITY_TYPES.map(t => ({ value: t, label: t }))]

export default function EventsManager({ events, filters }) {
  const router = useRouter()
  const notify = useToast()
  const allBox = useRef(null)
  const [selected, setSelected] = useState(() => new Set())
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [query, setQuery] = useState(filters.q)

  const hasFilters = Object.values(filters).some(Boolean)
  const count = selected.size
  const allSelected = events.length > 0 && count === events.length
  useEffect(() => { if (allBox.current) allBox.current.indeterminate = count > 0 && !allSelected }, [count, allSelected])

  function filter(next) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries({ ...filters, ...next })) if (value) params.set(key, value)
    router.push(`/dashboard/events${params.size ? `?${params}` : ''}`)
  }

  const toggle = id => setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(events.map(e => e.id)))

  async function remove() {
    setBusy(true)
    try {
      const { deleted } = await request('/api/dashboard/events', { method: 'DELETE', body: JSON.stringify({ ids: [...selected] }) })
      notify(`Deleted ${deleted} event${deleted === 1 ? '' : 's'}.`)
      setSelected(new Set())
      setConfirming(false)
      router.refresh()
    } catch (e) { notify(e.message) } finally { setBusy(false) }
  }

  return <>
    <div className="page-head"><div><h1>Events</h1><p>Filter bookings, select the ones you no longer need and delete them.</p></div></div>
    <section className="panel">
      <div className="filters">
        <form className="search-box" role="search" onSubmit={e => { e.preventDefault(); filter({ q: query.trim() }) }}>
          <Search size={15} /><input type="search" aria-label="Search by title or name" placeholder="Search title or name" value={query} onChange={e => setQuery(e.target.value)} />
        </form>
        <Select ariaLabel="Filter by status" value={filters.status} onChange={status => filter({ status })} options={STATUS_FILTER} />
        <Select ariaLabel="Filter by type" value={filters.type} onChange={type => filter({ type })} options={TYPE_FILTER} />
        <div className="date-range">
          <span>From</span><DatePicker ariaLabel="Events from" value={filters.from || undefined} placeholder="Any date" onChange={from => filter({ from, to: filters.to && filters.to < from ? from : filters.to })} />
          <span>to</span><DatePicker ariaLabel="Events until" value={filters.to || undefined} placeholder="Any date" min={filters.from || undefined} onChange={to => filter({ to })} />
        </div>
        {hasFilters && <button className="outline-button" onClick={() => router.push('/dashboard/events')}>Clear filters</button>}
      </div>

      <div className="bulk-bar">
        <span>{count ? `${count} selected` : `${events.length} event${events.length === 1 ? '' : 's'}${hasFilters ? ' match the filters' : ''}${events.length === 500 ? ' (showing the first 500)' : ''}`}</span>
        <button className="danger-button" disabled={!count} onClick={() => setConfirming(true)}><Trash2 size={15} />{`Delete selected${count ? ` (${count})` : ''}`}</button>
      </div>

      {events.length ? <div className="table-wrap"><table>
        <thead><tr>
          <th className="check"><input ref={allBox} type="checkbox" aria-label="Select all listed events" checked={allSelected} onChange={toggleAll} /></th>
          <th>Event</th><th>When</th><th>Type</th><th>Status</th>
        </tr></thead>
        <tbody>{events.map(e => <tr key={e.id} className={selected.has(e.id) ? 'selected' : undefined}>
          <td className="check"><input type="checkbox" aria-label={`Select ${e.title}`} checked={selected.has(e.id)} onChange={() => toggle(e.id)} /></td>
          <td><span className="tx-name">{e.title}<small>{e.person}</small></span></td>
          <td>{longDate(e.start_at)}<br /><small className="muted">{timeText(e.start_at)} – {timeText(e.end_at)}</small></td>
          <td>{e.activity_type}{e.report_scope && <><br /><small className="muted">{e.report_scope}</small></>}</td>
          <td><span className={`badge ${e.status}`}>{STATUS_LABEL[e.status]}</span></td>
        </tr>)}</tbody>
      </table></div> : <p className="empty">No events found.</p>}
    </section>
    {confirming && <ConfirmDialog title={`Delete ${count} event${count === 1 ? '' : 's'}?`} message="The selected events will be permanently deleted from the calendar and the database. This cannot be undone." confirmLabel={`Delete ${count}`} busy={busy} onConfirm={remove} onClose={() => !busy && setConfirming(false)} />}
  </>
}
