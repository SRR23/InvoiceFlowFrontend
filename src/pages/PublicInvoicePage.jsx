import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { publicGet } from '../lib/http'
import { formatDate, formatMoney } from '../lib/format'
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge'

export function PublicInvoicePage() {
  const { publicId } = useParams()
  const [inv, setInv] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    publicGet(`/api/public/invoice/${publicId}/`)
      .then((data) => {
        if (!cancelled) setInv(data)
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
  }, [publicId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
      </div>
    )
  }

  if (error || !inv) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-16 text-center">
        <p className="text-rose-300">{error || 'Invoice not found.'}</p>
        <Link to="/" className="mt-4 inline-block text-emerald-400 hover:text-emerald-300">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-emerald-400/90">{inv.business_name || 'Invoice'}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white font-mono">
            {inv.invoice_number}
          </h1>
          <div className="mt-3 flex justify-center">
            <InvoiceStatusBadge status={inv.status} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
          <div className="grid gap-6 border-b border-slate-800 pb-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Bill to</p>
              <p className="mt-1 text-lg font-medium text-white">{inv.client_name}</p>
              {inv.client_email ? (
                <p className="text-sm text-slate-400">{inv.client_email}</p>
              ) : null}
            </div>
            <div className="space-y-2 text-sm text-slate-400">
              <p>
                <span className="text-slate-500">Issue date:</span>{' '}
                {formatDate(inv.issue_date)}
              </p>
              <p>
                <span className="text-slate-500">Due date:</span> {formatDate(inv.due_date)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto py-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="pb-3 font-medium">Item</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {(inv.items || []).map((it, idx) => (
                  <tr key={it.id ?? `${it.title}-${idx}`}>
                    <td className="py-3 pr-4">
                      <span className="font-medium text-white">{it.title}</span>
                      {it.description ? (
                        <p className="text-xs text-slate-500">{it.description}</p>
                      ) : null}
                      <p className="text-xs text-slate-600">
                        {it.quantity} × {formatMoney(it.unit_price, inv.currency)}
                        {Number(it.tax_rate) > 0 ? ` · ${it.tax_rate}% tax` : ''}
                      </p>
                    </td>
                    <td className="py-3 text-right text-slate-200">
                      {formatMoney(it.total_price, inv.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="space-y-2 border-t border-slate-800 pt-6 text-sm">
            <div className="flex justify-between text-slate-400">
              <dt>Subtotal</dt>
              <dd>{formatMoney(inv.subtotal, inv.currency)}</dd>
            </div>
            <div className="flex justify-between text-slate-400">
              <dt>Tax</dt>
              <dd>{formatMoney(inv.tax, inv.currency)}</dd>
            </div>
            <div className="flex justify-between text-slate-400">
              <dt>Discount</dt>
              <dd>{formatMoney(inv.discount, inv.currency)}</dd>
            </div>
            <div className="flex justify-between text-lg font-semibold text-white">
              <dt>Total</dt>
              <dd>{formatMoney(inv.total_amount, inv.currency)}</dd>
            </div>
          </dl>

          {inv.notes ? (
            <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 text-sm text-slate-400">
              <p className="text-xs font-medium uppercase text-slate-500">Notes</p>
              <p className="mt-2 whitespace-pre-wrap">{inv.notes}</p>
            </div>
          ) : null}
        </div>

        <p className="mt-8 text-center text-xs text-slate-600">
          This is a read-only share link. Amounts are calculated by the issuer.
        </p>
      </div>
    </div>
  )
}
