import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '../lib/http'
import { formatDate, formatMoney } from '../lib/format'
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge'
import { PaginationBar } from '../components/PaginationBar'

const PAGE_SIZE = 20

const STATUSES = ['', 'DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']

export function InvoicesPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ page: String(page), ordering: '-created_at' })
    if (status) params.set('status', status)
    try {
      const res = await apiGet(`/api/invoices/?${params.toString()}`)
      setData(res)
    } catch (e) {
      setError(e.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => {
    load()
  }, [load])

  const results = data?.results ?? []
  const count = data?.count ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Invoices</h1>
          <p className="mt-1 text-sm text-slate-400">
            Create, track, and collect payment on invoices.
          </p>
        </div>
        <Link
          to="/invoices/new"
          className="inline-flex justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20"
        >
          New invoice
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-500">Status</label>
        <select
          value={status}
          onChange={(e) => {
            setPage(1)
            setStatus(e.target.value)
          }}
          className="rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {STATUSES.map((s) => (
            <option key={s || 'all'} value={s}>
              {s || 'All statuses'}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-xl shadow-black/20">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="px-4 py-3 font-medium">Number</th>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Due</th>
                    <th className="px-4 py-3 font-medium text-right">Total</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        No invoices match. Try another status or create one.
                      </td>
                    </tr>
                  ) : (
                    results.map((inv) => (
                      <tr key={inv.id} className="text-slate-300 hover:bg-slate-800/30">
                        <td className="px-4 py-3 font-mono text-white">{inv.invoice_number}</td>
                        <td className="px-4 py-3">{inv.client_name || '—'}</td>
                        <td className="px-4 py-3">
                          <InvoiceStatusBadge status={inv.status} />
                        </td>
                        <td className="px-4 py-3 text-slate-400">{formatDate(inv.due_date)}</td>
                        <td className="px-4 py-3 text-right font-medium text-white">
                          {formatMoney(inv.total_amount, inv.currency)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/invoices/${inv.id}`}
                            className="font-medium text-emerald-400 hover:text-emerald-300"
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <PaginationBar
              count={count}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  )
}
