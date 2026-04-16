import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '../lib/http'
import { formatMoney } from '../lib/format'

function StatCard({ title, value, hint, to }) {
  const inner = (
    <>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </>
  )
  if (to) {
    return (
      <Link
        to={to}
        className="block rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg shadow-black/20 transition hover:border-slate-700 hover:bg-slate-900/80"
      >
        {inner}
      </Link>
    )
  }
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg shadow-black/20">
      {inner}
    </div>
  )
}

export function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    apiGet('/api/analytics/dashboard/')
      .then((data) => {
        if (!cancelled) setStats(data)
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
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-rose-200">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Overview of your invoices and revenue.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total invoices" value={stats?.total_invoices ?? '—'} to="/invoices" />
        <StatCard
          title="Total revenue"
          value={formatMoney(stats?.total_revenue, 'USD')}
          hint="From completed payments"
          to="/payments"
        />
        <StatCard title="Paid invoices" value={stats?.paid_invoices ?? '—'} />
        <StatCard
          title="Pending (draft + sent)"
          value={stats?.pending_invoices ?? '—'}
          to="/invoices"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatCard title="Overdue" value={stats?.overdue_invoices ?? '—'} hint="Sent & past due date" />
        <div className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/30 p-5">
          <p className="text-sm font-medium text-slate-400">Last updated</p>
          <p className="mt-2 text-lg text-slate-200">
            {stats?.last_updated
              ? new Date(stats.last_updated).toLocaleString()
              : '—'}
          </p>
          <Link
            to="/analytics/revenue"
            className="mt-4 inline-flex text-sm font-medium text-emerald-400 hover:text-emerald-300"
          >
            View revenue report →
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/invoices/new"
          className="inline-flex rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20"
        >
          New invoice
        </Link>
        <Link
          to="/clients/new"
          className="inline-flex rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-900"
        >
          Add client
        </Link>
      </div>
    </div>
  )
}
