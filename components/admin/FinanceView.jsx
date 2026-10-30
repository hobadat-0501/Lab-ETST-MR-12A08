'use client'
import { ArrowDownLeft, ArrowUpRight, Banknote, Pencil, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { money, monthLabel, request, txDate } from '../../lib/format'
import { useToast } from '../ui/Toast'
import TransactionForm from './TransactionForm'

const csvCell = x => `"${String(x).replaceAll('"', '""')}"`

function exportCsv(transactions, filename) {
  const rows = [['Nội dung', 'Mô tả', 'Ngày', 'Loại', 'Số tiền'], ...transactions.map(t => [t.name, t.description || '', t.occurred_on, t.kind, t.amount])]
  const url = URL.createObjectURL(new Blob(['﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function FinanceView({ transactions, summary, month, kind }) {
  const router = useRouter()
  const notify = useToast()
  const [form, setForm] = useState(null) // null = đóng, {} = thêm mới, {…tx} = sửa
  const [busy, setBusy] = useState(false)
  const summaryMonth = month || new Date().toISOString().slice(0, 7)

  function filter(next) {
    const params = new URLSearchParams()
    const values = { month, kind, ...next }
    if (values.month) params.set('month', values.month)
    if (values.kind) params.set('kind', values.kind)
    router.push(`/admin/finance${params.size ? `?${params}` : ''}`)
  }

  async function save(body) {
    setBusy(true)
    try {
      await request(form.id ? `/api/finance/${form.id}` : '/api/finance', { method: form.id ? 'PATCH' : 'POST', body: JSON.stringify(body) })
      notify(form.id ? 'Đã cập nhật giao dịch.' : 'Đã lưu giao dịch.')
      setForm(null)
      router.refresh()
    } catch (e) { notify(e.message) } finally { setBusy(false) }
  }

  async function remove(t) {
    if (!confirm(`Xoá giao dịch "${t.name}"?`)) return
    try {
      await request(`/api/finance/${t.id}`, { method: 'DELETE' })
      notify('Đã xoá giao dịch.')
      router.refresh()
    } catch (e) { notify(e.message) }
  }

  return <div className="content finance-content">
    <section className="page-heading"><div><div className="eyebrow">KHU VỰC QUẢN TRỊ <span className="eyebrow-sep">/</span> THU CHI</div><h1>Thu chi phòng lab</h1><p>Theo dõi ngân sách và các khoản thu chi đã ghi nhận.</p></div><button className="primary-button" onClick={() => setForm({})}><Plus size={17} /> Thêm giao dịch</button></section>
    <section className="finance-stats">
      <div><small>SỐ DƯ HIỆN TẠI</small><strong>{money(summary.balance)}</strong><span>{summary.total} giao dịch đã ghi nhận</span></div>
      <div><small>TỔNG THU · {monthLabel(summaryMonth).toLocaleUpperCase('vi-VN')}</small><strong className="income">{money(summary.income)}</strong><span>{summary.incomeCount} khoản thu</span></div>
      <div><small>TỔNG CHI · {monthLabel(summaryMonth).toLocaleUpperCase('vi-VN')}</small><strong>{money(summary.expense)}</strong><span>{summary.expenseCount} khoản chi</span></div>
    </section>
    <section className="transactions">
      <div className="section-title"><div><h3>Giao dịch</h3><p>{transactions.length} giao dịch theo bộ lọc</p></div>
        <div className="filter-bar">
          <input type="month" aria-label="Lọc theo tháng" value={month} onChange={e => filter({ month: e.target.value })} />
          <select aria-label="Lọc theo loại" value={kind} onChange={e => filter({ kind: e.target.value })}><option value="">Thu &amp; Chi</option><option value="Thu">Chỉ thu</option><option value="Chi">Chỉ chi</option></select>
          {(month || kind) && <button className="outline-button" onClick={() => router.push('/admin/finance')}>Xoá lọc</button>}
          <button className="outline-button" onClick={() => exportCsv(transactions, `thu-chi-lab${month ? `-${month}` : ''}.csv`)} disabled={!transactions.length}>Xuất CSV <ArrowDownLeft size={15} /></button>
        </div>
      </div>
      {transactions.length ? <div className="table-wrap"><table>
        <thead><tr><th>GIAO DỊCH</th><th>NGÀY</th><th>LOẠI</th><th className="align-right">SỐ TIỀN</th><th></th></tr></thead>
        <tbody>{transactions.map(t => <tr key={t.id}>
          <td><span className={`tx-icon ${t.kind === 'Thu' ? 'income-icon' : 'expense-icon'}`}>{t.kind === 'Thu' ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span><span className="tx-name">{t.name}<small>{t.description || '—'}</small></span></td>
          <td>{txDate(t.occurred_on)}</td>
          <td><span className={`tx-tag ${t.kind === 'Thu' ? 'tag-income' : 'tag-expense'}`}>{t.kind}</span></td>
          <td className={`align-right ${t.kind === 'Thu' ? 'income' : ''}`}>{t.kind === 'Thu' ? '+' : '−'}{money(t.amount)}</td>
          <td className="row-actions"><button aria-label="Sửa" onClick={() => setForm(t)}><Pencil size={14} /></button><button aria-label="Xoá" onClick={() => remove(t)}><Trash2 size={14} /></button></td>
        </tr>)}</tbody>
      </table></div> : <div className="empty-state"><Banknote size={18} /> Chưa có giao dịch nào phù hợp.</div>}
    </section>
    {form && <TransactionForm transaction={form.id ? form : null} onClose={() => setForm(null)} onSubmit={save} busy={busy} />}
  </div>
}
