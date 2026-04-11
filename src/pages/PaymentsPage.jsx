import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '../lib/http'
import { formatDateTime, formatMoney } from '../lib/format'
import { PaginationBar } from '../components/PaginationBar'

const PAGE_SIZE = 20

export function PaymentsPage() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await apiGet(`/api/payments/?page=${page}`)
      setData(res)
    } catch (e) {
      setError(e.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  const results = data?.results ?? []
  const count = data?.count ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Payments</h1>
          <p className="mt-1 text-sm text-slate-400">
            History of gateway charges linked to your invoices.
          </p>
        </div>
        <Link
          to="/settings/payments"
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          Payment gateway settings →
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-xl">
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
                    <th className="px-4 py-3 font-medium">Invoice</th>
                    <th className="px-4 py-3 font-medium">Gateway</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                    <th className="px-4 py-3 font-medium">Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                        No payments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    results.map((p) => (
                      <tr key={p.id} className="text-slate-300">
                        <td className="px-4 py-3">
                          <Link
                            to={`/invoices/${p.invoice}`}
                            className="font-mono text-emerald-400 hover:text-emerald-300"
                          >
                            {p.invoice_number || `#${p.invoice}`}
                          </Link>
                        </td>
                        <td className="px-4 py-3 capitalize">{p.gateway}</td>
                        <td className="px-4 py-3 capitalize text-slate-200">{p.status}</td>
                        <td className="px-4 py-3 text-right font-medium text-white">
                          {formatMoney(p.amount, p.currency)}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {p.paid_at ? formatDateTime(p.paid_at) : '—'}
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
