'use client'
import { ArrowDownToLine, ArrowDownLeft, ArrowUpRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { TRANSACTION_KINDS } from '../../lib/constants'
import { money, monthLabel, request, txDate } from '../../lib/format'
import ConfirmDialog from '../ui/ConfirmDialog'
import MonthPicker from '../ui/MonthPicker'
import Select from '../ui/Select'
import { useToast } from '../ui/Toast'
import TransactionForm from './TransactionForm'

const KIND_FILTER = [{ value: '', label: 'All types' }, ...TRANSACTION_KINDS.map(k => ({ value: k, label: k }))]
const csvCell = x => `"${String(x).replaceAll('"', '""')}"`

function exportCsv(transactions, filename) {
  const rows = [['Title', 'Description', 'Date', 'Type', 'Amount'], ...transactions.map(t => [t.name, t.description || '', t.occurred_on, t.kind, t.amount])]
  const url = URL.createObjectURL(new Blob(['﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function FinanceView({ transactions, summary, month, kind }) {
  const router = useRouter()
  const notify = useToast()
  const [form, setForm] = useState(null) // null = closed, {} = new, {…transaction} = edit
  const [busy, setBusy] = useState(false)
  const [deleting, setDeleting] = useState(null) // transaction awaiting delete confirmation
  const summaryMonth = monthLabel(month || new Date().toISOString().slice(0, 7))

  function filter(next) {
    const params = new URLSearchParams()
    const values = { month, kind, ...next }
    if (values.month) params.set('month', values.month)
    if (values.kind) params.set('kind', values.kind)
    router.push(`/dashboard/finance${params.size ? `?${params}` : ''}`)
  }

  async function save(body) {
    setBusy(true)
    try {
      await request(form.id ? `/api/dashboard/finance/${form.id}` : '/api/dashboard/finance', { method: form.id ? 'PATCH' : 'POST', body: JSON.stringify(body) })
      notify(form.id ? 'Transaction updated.' : 'Transaction saved.')
      setForm(null)
      router.refresh()
    } catch (e) { notify(e.message) } finally { setBusy(false) }
  }

  async function remove() {
    setBusy(true)
    try {
      await request(`/api/dashboard/finance/${deleting.id}`, { method: 'DELETE' })
      notify('Transaction deleted.')
      setDeleting(null)
      router.refresh()
    } catch (e) { notify(e.message) } finally { setBusy(false) }
  }

  return <>
    <div className="page-head"><div><h1>Finance</h1><p>Track the lab's income and expenses.</p></div><button className="primary-button" onClick={() => setForm({})}><Plus size={16} />New transaction</button></div>
    <section className="stats three">
      <div><small>Balance</small><strong>{money(summary.balance)}</strong><span>{summary.total} transactions</span></div>
      <div><small>Income · {summaryMonth}</small><strong className="income">{money(summary.income)}</strong><span>{summary.incomeCount} entries</span></div>
      <div><small>Expenses · {summaryMonth}</small><strong>{money(summary.expense)}</strong><span>{summary.expenseCount} entries</span></div>
    </section>
    <section className="panel">
      <div className="panel-head">
        <h2>Transactions <small>{transactions.length}</small></h2>
        <div className="calendar-tools">
          <MonthPicker ariaLabel="Filter by month" value={month || undefined} onChange={m => filter({ month: m })} />
          <Select ariaLabel="Filter by type" value={kind} onChange={v => filter({ kind: v })} options={KIND_FILTER} />
          {(month || kind) && <button className="outline-button" onClick={() => router.push('/dashboard/finance')}>Clear</button>}
          <button className="outline-button" onClick={() => exportCsv(transactions, `lab-finance${month ? `-${month}` : ''}.csv`)} disabled={!transactions.length}><ArrowDownToLine size={15} />Export CSV</button>
        </div>
      </div>
      {transactions.length ? <div className="table-wrap"><table>
        <thead><tr><th>Transaction</th><th>Date</th><th>Type</th><th className="num">Amount</th><th><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>{transactions.map(t => {
          const income = t.kind === 'Income'
          return <tr key={t.id}>
            <td><span className={`tx-icon ${income ? 'income' : 'expense'}`}>{income ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}</span><span className="tx-name">{t.name}<small>{t.description || '—'}</small></span></td>
            <td>{txDate(t.occurred_on)}</td>
            <td><span className={`badge ${income ? 'confirmed' : 'rejected'}`}>{t.kind}</span></td>
            <td className={`num${income ? ' income' : ''}`}>{income ? '+' : '−'}{money(t.amount)}</td>
            <td className="row-actions"><button className="icon-button" aria-label={`Edit ${t.name}`} onClick={() => setForm(t)}><Pencil size={15} /></button><button className="icon-button" aria-label={`Delete ${t.name}`} onClick={() => setDeleting(t)}><Trash2 size={15} /></button></td>
          </tr>
        })}</tbody>
      </table></div> : <p className="empty">No matching transactions.</p>}
    </section>
    {deleting && <ConfirmDialog title="Delete transaction?" message={`"${deleting.name}" will be permanently deleted. This cannot be undone.`} busy={busy} onConfirm={remove} onClose={() => !busy && setDeleting(null)} />}
    {form && <TransactionForm transaction={form.id ? form : null} onClose={() => setForm(null)} onSubmit={save} busy={busy} />}
  </>
}
