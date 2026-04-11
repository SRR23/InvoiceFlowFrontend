import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '../lib/http'
import { formatMoney } from '../lib/format'

function defaultRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

export function RevenueAnalyticsPage() {
  const [{ start, end }, setRange] = useState(defaultRange)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams()
    if (start) params.set('start_date', start)
    if (end) params.set('end_date', end)
    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true)
    })
    apiGet(`/api/analytics/revenue/?${params.toString()}`)
      .then((data) => {
        if (!cancelled) setReport(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [start, end])

  const daily = report?.daily_revenue ?? []

  return (
    <div className="space-y-6">
      <div>
        <Link to="/dashboard" className="text-sm text-emerald-400 hover:text-emerald-300">
          ← Dashboard
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">Revenue report</h1>
        <p className="mt-1 text-sm text-slate-400">
          Completed payments in the selected range (from payment timestamps).
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <div>
          <label htmlFor="rs" className="block text-xs font-medium text-slate-500">
            Start
          </label>
          <input
            id="rs"
            type="date"
            value={start}
            onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))}
            className="mt-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          />
        </div>
        <div>
          <label htmlFor="re" className="block text-xs font-medium text-slate-500">
            End
          </label>
          <input
            id="re"
            type="date"
            value={end}
            onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
            className="mt-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-rose-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
        </div>
      ) : report ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <p className="text-sm text-slate-500">Total revenue</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {formatMoney(report.total_revenue, 'USD')}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <p className="text-sm text-slate-500">Payments</p>
              <p className="mt-1 text-2xl font-semibold text-white">{report.payment_count}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
            <div className="border-b border-slate-800 px-4 py-3 text-sm font-medium text-slate-300">
              Daily breakdown
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                    <th className="px-4 py-3 font-medium text-right">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {daily.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                        No payments in this range.
                      </td>
                    </tr>
                  ) : (
                    daily.map((row, i) => (
                      <tr key={i} className="text-slate-300">
                        <td className="px-4 py-3">
                          {row.paid_at__date != null ? String(row.paid_at__date) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-white">
                          {formatMoney(row.daily_total, 'USD')}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500">{row.count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
