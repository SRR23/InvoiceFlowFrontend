import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/http'
import { formatDateTime, formatMoney } from '../lib/format'
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge'
import { FormField, SelectInput, TextInput } from '../components/FormField'
import { CURRENCY_OPTIONS } from '../constants/currencies'

function defaultNewItem() {
  return {
    title: '',
    description: '',
    quantity: '1',
    unit_price: '0',
    tax_rate: '0',
  }
}

/** Short preview only; full URL is still used for copy, open, and the native tooltip. */
function formatPaymentLinkPreview(url, maxChars = 40) {
  if (!url) return '—'
  const trimmed = url.trim()
  if (trimmed.length <= maxChars) return trimmed
  return `${trimmed.slice(0, maxChars)}…`
}

/** Invoice `due_date` is YYYY-MM-DD; true when that day is before today (local calendar). */
function isInvoicePastDue(dueDateStr) {
  if (!dueDateStr) return false
  const today = new Date().toISOString().slice(0, 10)
  return dueDateStr < today
}

export function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [metaError, setMetaError] = useState('')
  const [savingMeta, setSavingMeta] = useState(false)

  const [form, setForm] = useState({
    client: '',
    issue_date: '',
    due_date: '',
    status: 'DRAFT',
    discount: '0',
    currency: 'USD',
    notes: '',
  })

  const [newItem, setNewItem] = useState(defaultNewItem)
  const [addingItem, setAddingItem] = useState(false)
  const [actionMsg, setActionMsg] = useState('')
  /** 'stripe' | 'ssl' | null while creating a hosted session */
  const [generatingPayment, setGeneratingPayment] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiGet(`/api/invoices/${id}/`)
      setInvoice(data)
      setForm({
        client: String(data.client),
        issue_date: data.issue_date,
        due_date: data.due_date,
        status: data.status,
        discount: String(data.discount),
        currency: data.currency,
        notes: data.notes || '',
      })
    } catch (e) {
      setError(e.message)
      setInvoice(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  function updateForm(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function saveMeta(e) {
    e.preventDefault()
    setMetaError('')
    setSavingMeta(true)
    try {
      const updated = await apiPatch(`/api/invoices/${id}/`, {
        client: Number(form.client),
        issue_date: form.issue_date,
        due_date: form.due_date,
        status: form.status,
        discount: form.discount,
        currency: form.currency,
        notes: form.notes.trim(),
      })
      setInvoice(updated)
      setActionMsg('Invoice updated.')
      setTimeout(() => setActionMsg(''), 3000)
    } catch (e) {
      setMetaError(e.message)
    } finally {
      setSavingMeta(false)
    }
  }

  async function deleteInvoice() {
    if (!window.confirm('Delete this invoice permanently?')) return
    try {
      await apiDelete(`/api/invoices/${id}/`)
      navigate('/invoices')
    } catch (e) {
      setError(e.message)
    }
  }

  async function postAction(path, successText) {
    setError('')
    setActionMsg('')
    try {
      const data = await apiPost(`/api/invoices/${id}/${path}`, {})
      setActionMsg(data?.message || successText || 'Done.')
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function addLineItem(e) {
    e.preventDefault()
    if (!newItem.title.trim()) return
    setAddingItem(true)
    try {
      await apiPost('/api/invoices/items/', {
        invoice: Number(id),
        title: newItem.title.trim(),
        description: newItem.description.trim(),
        quantity: newItem.quantity,
        unit_price: newItem.unit_price,
        tax_rate: newItem.tax_rate,
      })
      setNewItem(defaultNewItem())
      await load()
      setActionMsg('Line item added.')
      setTimeout(() => setActionMsg(''), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setAddingItem(false)
    }
  }

  async function deleteLineItem(itemId) {
    if (!window.confirm('Remove this line item?')) return
    try {
      await apiDelete(`/api/invoices/items/${itemId}/`)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function createStripePaymentLink() {
    setError('')
    setActionMsg('')
    setGeneratingPayment('stripe')
    try {
      await apiPost('/api/payments/stripe/create/', {
        invoice_id: Number(id),
      })
      await load()
      setActionMsg('Stripe payment link created. Copy a link below and send it to your client.')
      setTimeout(() => setActionMsg(''), 5000)
    } catch (e) {
      setError(e.message)
    } finally {
      setGeneratingPayment(null)
    }
  }

  async function createSslPaymentLink() {
    setError('')
    setActionMsg('')
    setGeneratingPayment('ssl')
    try {
      await apiPost('/api/payments/sslcommerz/create/', {
        invoice_id: Number(id),
      })
      await load()
      setActionMsg('SSLCommerz payment link created. Copy a link below and send it to your client.')
      setTimeout(() => setActionMsg(''), 5000)
    } catch (e) {
      setError(e.message)
    } finally {
      setGeneratingPayment(null)
    }
  }

  function copyPaymentUrl(url) {
    void navigator.clipboard.writeText(url)
    setActionMsg('Payment link copied to clipboard.')
    setTimeout(() => setActionMsg(''), 3000)
  }

  function copyPublicLink() {
    if (!invoice?.public_id) return
    const url = `${window.location.origin}/invoice/p/${invoice.public_id}`
    void navigator.clipboard.writeText(url)
    setActionMsg('Public link copied to clipboard.')
    setTimeout(() => setActionMsg(''), 3000)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
      </div>
    )
  }

  if (error && !invoice) {
    return (
      <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-rose-200">
        {error}
      </div>
    )
  }

  if (!invoice) return null

  const canPay = invoice.status !== 'PAID' && invoice.status !== 'CANCELLED'
  const canCancel = invoice.status !== 'PAID' && invoice.status !== 'CANCELLED'
  const pastDue = isInvoicePastDue(invoice.due_date)
  const canCreatePaymentLinks = canPay && !pastDue
  const pendingPaymentLinks = Array.isArray(invoice.pending_payment_links) ? invoice.pending_payment_links : []

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link to="/invoices" className="text-sm text-emerald-400 hover:text-emerald-300">
            ← Invoices
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-white font-mono">
              {invoice.invoice_number}
            </h1>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {invoice.client_name}
            {invoice.client_email ? ` · ${invoice.client_email}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copyPublicLink}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/80"
          >
            Copy public link
          </button>
          <button
            type="button"
            onClick={() => postAction('send_email/', null)}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-900/40 hover:bg-emerald-500"
            title="Queues email to the client and sets status to Sent when the message is sent."
          >
            Email to client
          </button>
          <span className="hidden h-6 w-px bg-slate-700 sm:inline-block" aria-hidden />
          {canCancel ? (
            <button
              type="button"
              onClick={() => postAction('cancel/', 'Invoice cancelled.')}
              className="rounded-xl border border-amber-800/80 px-4 py-2 text-sm font-medium text-amber-200 transition duration-150 ease-out hover:border-amber-500/70 hover:bg-amber-950/50 hover:text-amber-100 hover:shadow-md hover:shadow-amber-950/30 active:scale-[0.98]"
            >
              Cancel
            </button>
          ) : null}
          <button
            type="button"
            onClick={deleteInvoice}
            className="rounded-xl border border-rose-800/80 px-4 py-2 text-sm font-medium text-rose-300 transition duration-150 ease-out hover:border-rose-500/70 hover:bg-rose-950/45 hover:text-rose-200 hover:shadow-md hover:shadow-rose-950/30 active:scale-[0.98]"
          >
            Delete
          </button>
        </div>
      </div>

      {actionMsg ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-2 text-sm text-emerald-200">
          {actionMsg}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-2 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <h2 className="text-lg font-medium text-white">Totals</h2>
            <dl className="mt-4 text-sm">
              <div className="flex min-h-[2.75rem] items-center justify-between gap-8 border-b border-slate-800/80 py-2.5">
                <dt className="shrink-0 text-slate-500">Subtotal</dt>
                <dd className="tabular-nums text-right text-white">{formatMoney(invoice.subtotal, invoice.currency)}</dd>
              </div>
              <div className="flex min-h-[2.75rem] items-center justify-between gap-8 border-b border-slate-800/80 py-2.5">
                <dt className="shrink-0 text-slate-500">Tax</dt>
                <dd className="tabular-nums text-right text-white">{formatMoney(invoice.tax, invoice.currency)}</dd>
              </div>
              <div className="flex min-h-[2.75rem] items-center justify-between gap-8 border-b border-slate-800/80 py-2.5">
                <dt className="shrink-0 text-slate-500">Discount</dt>
                <dd className="tabular-nums text-right text-white">{formatMoney(invoice.discount, invoice.currency)}</dd>
              </div>
              <div className="mt-3 flex items-center justify-between gap-8 border-t border-slate-600/50 pt-4">
                <dt className="text-base font-semibold text-white">Total</dt>
                <dd className="tabular-nums text-right text-lg font-semibold text-white">
                  {formatMoney(invoice.total_amount, invoice.currency)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <h2 className="text-lg font-medium text-white">Line items</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-2 pr-4 font-medium">Title</th>
                    <th className="py-2 pr-4 font-medium">Qty</th>
                    <th className="py-2 pr-4 font-medium">Unit</th>
                    <th className="py-2 pr-4 font-medium">Tax %</th>
                    <th className="py-2 pr-4 font-medium text-right">Line total</th>
                    <th className="py-2 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {(invoice.items || []).map((it) => (
                    <tr key={it.id}>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-white">{it.title}</div>
                        {it.description ? (
                          <div className="text-xs text-slate-500">{it.description}</div>
                        ) : null}
                      </td>
                      <td className="py-3 pr-4">{it.quantity}</td>
                      <td className="py-3 pr-4">{formatMoney(it.unit_price, invoice.currency)}</td>
                      <td className="py-3 pr-4">{it.tax_rate}%</td>
                      <td className="py-3 pr-4 text-right font-medium">
                        {formatMoney(it.total_price, invoice.currency)}
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => deleteLineItem(it.id)}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form onSubmit={addLineItem} className="mt-6 space-y-3 rounded-xl border border-dashed border-slate-700 p-4">
              <p className="text-sm font-medium text-slate-300">Add line item</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField id="ni-title" label="Title">
                  <TextInput
                    id="ni-title"
                    value={newItem.title}
                    onChange={(e) => setNewItem((n) => ({ ...n, title: e.target.value }))}
                  />
                </FormField>
                <FormField id="ni-desc" label="Description">
                  <TextInput
                    id="ni-desc"
                    value={newItem.description}
                    onChange={(e) => setNewItem((n) => ({ ...n, description: e.target.value }))}
                  />
                </FormField>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <FormField id="ni-q" label="Qty">
                  <TextInput
                    id="ni-q"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem((n) => ({ ...n, quantity: e.target.value }))}
                  />
                </FormField>
                <FormField id="ni-up" label="Unit price">
                  <TextInput
                    id="ni-up"
                    value={newItem.unit_price}
                    onChange={(e) => setNewItem((n) => ({ ...n, unit_price: e.target.value }))}
                  />
                </FormField>
                <FormField id="ni-tax" label="Tax %">
                  <TextInput
                    id="ni-tax"
                    value={newItem.tax_rate}
                    onChange={(e) => setNewItem((n) => ({ ...n, tax_rate: e.target.value }))}
                  />
                </FormField>
              </div>
              <button
                type="submit"
                disabled={addingItem}
                className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
              >
                {addingItem ? 'Adding…' : 'Add item'}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          {canPay ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <h2 className="text-lg font-medium text-white">Collect payment</h2>
              <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2.5 text-xs leading-relaxed text-slate-400">
                <ul className="list-inside list-disc space-y-2 marker:text-slate-600">
                  <li>
                    <span className="font-medium text-slate-200">Stripe</span> — Checkout links expire after about{' '}
                    <strong className="text-slate-100">24 hours</strong>. If a link stops working, click{' '}
                    <span className="text-slate-300">Generate Stripe payment link</span> again to create a new one.
                  </li>
                  <li>
                    <span className="font-medium text-slate-200">SSLCommerz</span> — If the hosted page expired or
                    errors, generate a new link with the button below.
                  </li>
                </ul>
                <p className="mt-2 border-t border-slate-800/80 pt-2 text-[11px] text-slate-500">
                  Add gateway keys under{' '}
                  <Link to="/settings/payments" className="text-emerald-400/90 hover:text-emerald-300">
                    Settings → Gateway
                  </Link>
                  . Saved links disappear when this invoice is paid.
                </p>
              </div>
              {canCreatePaymentLinks ? (
                <>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={createStripePaymentLink}
                      disabled={generatingPayment !== null}
                      className="rounded-xl bg-[#635BFF] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#544ccd] disabled:opacity-60"
                    >
                      {generatingPayment === 'stripe' ? 'Creating link…' : 'Generate Stripe payment link'}
                    </button>
                    <button
                      type="button"
                      onClick={createSslPaymentLink}
                      disabled={generatingPayment !== null}
                      className="rounded-xl border border-emerald-700/80 bg-emerald-950/40 px-4 py-2.5 text-sm font-semibold text-emerald-200 hover:bg-emerald-950/60 disabled:opacity-60"
                    >
                      {generatingPayment === 'ssl' ? 'Creating link…' : 'Generate SSLCommerz payment link'}
                    </button>
                  </div>
                  {pendingPaymentLinks.length > 0 ? (
                    <div className="mt-6 border-t border-slate-800 pt-4">
                      <h3 className="text-sm font-medium text-slate-300">Saved payment links</h3>
                      <ul className="mt-3 space-y-2">
                        {pendingPaymentLinks.map((row) => (
                          <li
                            key={row.id}
                            className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2.5 text-sm"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                                {row.gateway === 'stripe' ? 'Stripe' : 'SSLCommerz'}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {row.created_at ? formatDateTime(row.created_at) : ''}
                              </span>
                            </div>
                            {row.valid_until ? (
                              <p className="mt-1 text-[11px] text-slate-500">
                                Valid until {row.valid_until} (due date)
                              </p>
                            ) : null}
                            <p
                              className="mt-1.5 font-mono text-[11px] leading-relaxed text-slate-400"
                              title={row.payment_url}
                            >
                              {formatPaymentLinkPreview(row.payment_url)}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => copyPaymentUrl(row.payment_url)}
                                className="rounded-md border border-slate-600 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-800"
                              >
                                Copy full link
                              </button>
                              <a
                                href={row.payment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-md border border-slate-600 px-2.5 py-1 text-[11px] font-medium text-emerald-400 hover:bg-slate-800"
                              >
                                Open
                              </a>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-xs text-amber-200/90">
                  Payment links are not available after the due date ({invoice.due_date}).
                </p>
              )}
            </div>
          ) : null}

          <form
            onSubmit={saveMeta}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4"
          >
            <h2 className="text-lg font-medium text-white">Details</h2>
            {metaError ? (
              <div className="rounded-lg border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-200">
                {metaError}
              </div>
            ) : null}
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Invoice number</p>
              <p className="mt-1 font-mono text-sm text-white">{invoice.invoice_number}</p>
              <p className="mt-1 text-xs text-slate-500">Assigned when this invoice was created; it cannot be changed.</p>
            </div>
            <FormField id="inv-st" label="Status">
              <SelectInput id="inv-st" value={form.status} onChange={updateForm('status')}>
                {['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <FormField id="issue" label="Issue date">
              <TextInput id="issue" type="date" value={form.issue_date} onChange={updateForm('issue_date')} />
            </FormField>
            <FormField id="due" label="Due date">
              <TextInput id="due" type="date" value={form.due_date} onChange={updateForm('due_date')} />
            </FormField>
            <FormField id="disc" label="Discount">
              <TextInput id="disc" value={form.discount} onChange={updateForm('discount')} />
            </FormField>
            <FormField id="cur" label="Currency">
              <SelectInput id="cur" value={form.currency} onChange={updateForm('currency')}>
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <FormField id="notes" label="Notes">
              <textarea
                id="notes"
                value={form.notes}
                onChange={updateForm('notes')}
                rows={4}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2.5 text-sm text-white focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </FormField>
            <p className="text-xs text-slate-500">
              Client is fixed to ID {invoice.client}. To bill someone else, create a new invoice.
            </p>
            <button
              type="submit"
              disabled={savingMeta}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              {savingMeta ? 'Saving…' : 'Save details'}
            </button>
          </form>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 text-xs text-slate-500">
            <p>Created {formatDateTime(invoice.created_at)}</p>
            <p className="mt-1">Updated {formatDateTime(invoice.updated_at)}</p>
            <p className="mt-1 font-mono text-[10px] text-slate-600 break-all">Public ID: {invoice.public_id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
