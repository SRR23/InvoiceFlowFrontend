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
    invoice_number: '',
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

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiGet(`/api/invoices/${id}/`)
      setInvoice(data)
      setForm({
        client: String(data.client),
        invoice_number: data.invoice_number,
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
        invoice_number: form.invoice_number.trim(),
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

  async function payStripe() {
    setError('')
    try {
      const data = await apiPost('/api/payments/stripe/create/', {
        invoice_id: Number(id),
      })
      if (data.checkout_url) window.location.href = data.checkout_url
    } catch (e) {
      setError(e.message)
    }
  }

  async function paySsl() {
    setError('')
    try {
      const data = await apiPost('/api/payments/sslcommerz/create/', {
        invoice_id: Number(id),
      })
      if (data.redirect_url) window.location.href = data.redirect_url
    } catch (e) {
      setError(e.message)
    }
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
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyPublicLink}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
          >
            Copy public link
          </button>
          <button
            type="button"
            onClick={() => postAction('send_email/', null)}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
          >
            Queue email
          </button>
          <button
            type="button"
            onClick={() => postAction('mark_sent/', 'Marked as sent.')}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
          >
            Mark sent
          </button>
          {canCancel ? (
            <button
              type="button"
              onClick={() => postAction('cancel/', 'Invoice cancelled.')}
              className="rounded-xl border border-amber-800/80 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-950/30"
            >
              Cancel invoice
            </button>
          ) : null}
          <button
            type="button"
            onClick={deleteInvoice}
            className="rounded-xl border border-rose-800/80 px-4 py-2 text-sm font-medium text-rose-300 hover:bg-rose-950/30"
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
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-4 border-b border-slate-800/80 py-2">
                <dt className="text-slate-500">Subtotal</dt>
                <dd>{formatMoney(invoice.subtotal, invoice.currency)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-800/80 py-2">
                <dt className="text-slate-500">Tax</dt>
                <dd>{formatMoney(invoice.tax, invoice.currency)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-800/80 py-2">
                <dt className="text-slate-500">Discount</dt>
                <dd>{formatMoney(invoice.discount, invoice.currency)}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2 text-lg font-semibold text-white">
                <dt>Total</dt>
                <dd>{formatMoney(invoice.total_amount, invoice.currency)}</dd>
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
              <p className="mt-1 text-xs text-slate-500">
                Opens your configured Stripe Checkout or SSLCommerz session. Requires gateway keys in
                settings.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={payStripe}
                  className="rounded-xl bg-[#635BFF] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#544ccd]"
                >
                  Pay with Stripe
                </button>
                <button
                  type="button"
                  onClick={paySsl}
                  className="rounded-xl border border-emerald-700/80 bg-emerald-950/40 px-4 py-2.5 text-sm font-semibold text-emerald-200 hover:bg-emerald-950/60"
                >
                  Pay with SSLCommerz
                </button>
              </div>
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
            <FormField id="inv-num" label="Invoice number">
              <TextInput id="inv-num" value={form.invoice_number} onChange={updateForm('invoice_number')} />
            </FormField>
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
