import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiPost, fetchAllPages } from '../lib/http'
import { FormField, SelectInput, TextInput } from '../components/FormField'
import { CURRENCY_OPTIONS } from '../constants/currencies'

function defaultLine() {
  return {
    title: '',
    description: '',
    quantity: '1',
    unit_price: '0',
    tax_rate: '0',
  }
}

export function InvoiceCreatePage() {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [clientId, setClientId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState(() => `INV-${Date.now()}`)
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().slice(0, 10)
  })
  const [status, setStatus] = useState('DRAFT')
  const [discount, setDiscount] = useState('0')
  const [currency, setCurrency] = useState('USD')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([defaultLine()])

  useEffect(() => {
    let cancelled = false
    fetchAllPages('/api/clients/')
      .then((list) => {
        if (!cancelled) setClients(list)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load clients.')
      })
      .finally(() => {
        if (!cancelled) setLoadingClients(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function updateItem(index, key, value) {
    setItems((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    )
  }

  function addLine() {
    setItems((rows) => [...rows, defaultLine()])
  }

  function removeLine(index) {
    setItems((rows) => rows.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!clientId) {
      setError('Choose a client.')
      return
    }
    const cleaned = items
      .filter((row) => row.title.trim())
      .map((row) => ({
        title: row.title.trim(),
        description: row.description.trim(),
        quantity: row.quantity,
        unit_price: row.unit_price,
        tax_rate: row.tax_rate,
      }))
    if (cleaned.length === 0) {
      setError('Add at least one line item with a title.')
      return
    }
    setSaving(true)
    try {
      const created = await apiPost('/api/invoices/', {
        client: Number(clientId),
        invoice_number: invoiceNumber.trim(),
        issue_date: issueDate,
        due_date: dueDate,
        status,
        discount: discount,
        currency,
        notes: notes.trim(),
        items: cleaned,
      })
      navigate(`/invoices/${created.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/invoices" className="text-sm text-emerald-400 hover:text-emerald-300">
          ← Back to invoices
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">New invoice</h1>
        <p className="mt-1 text-sm text-slate-400">
          Invoice numbers must be unique. Totals are calculated on the server from line items.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl"
      >
        {error ? (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="client" label="Client">
            <SelectInput
              id="client"
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={loadingClients}
            >
              <option value="">Select a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.company ? ` (${c.company})` : ''}
                </option>
              ))}
            </SelectInput>
          </FormField>
          {clients.length === 0 && !loadingClients ? (
            <p className="self-end text-sm text-amber-400/90">
              No clients yet —{' '}
              <Link to="/clients/new" className="underline">
                create one first
              </Link>
              .
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="invno" label="Invoice number">
            <TextInput
              id="invno"
              required
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </FormField>
          <FormField id="st" label="Status">
            <SelectInput id="st" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="DRAFT">DRAFT</option>
              <option value="SENT">SENT</option>
            </SelectInput>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="issue" label="Issue date">
            <TextInput
              id="issue"
              type="date"
              required
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </FormField>
          <FormField id="due" label="Due date">
            <TextInput
              id="due"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="disc" label="Discount (flat amount)">
            <TextInput
              id="disc"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </FormField>
          <FormField id="cur" label="Currency">
            <SelectInput id="cur" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </SelectInput>
          </FormField>
        </div>

        <FormField id="notes" label="Notes / terms">
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </FormField>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Line items</h2>
            <button
              type="button"
              onClick={addLine}
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
            >
              + Add line
            </button>
          </div>
          <div className="space-y-4">
            {items.map((row, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Line {index + 1}
                  </span>
                  {items.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField id={`t-${index}`} label="Title">
                    <TextInput
                      id={`t-${index}`}
                      value={row.title}
                      onChange={(e) => updateItem(index, 'title', e.target.value)}
                      placeholder="e.g. Consulting hours"
                    />
                  </FormField>
                  <FormField id={`d-${index}`} label="Description">
                    <TextInput
                      id={`d-${index}`}
                      value={row.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                  </FormField>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <FormField id={`q-${index}`} label="Qty">
                    <TextInput
                      id={`q-${index}`}
                      value={row.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    />
                  </FormField>
                  <FormField id={`p-${index}`} label="Unit price">
                    <TextInput
                      id={`p-${index}`}
                      value={row.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                    />
                  </FormField>
                  <FormField id={`tx-${index}`} label="Tax %">
                    <TextInput
                      id={`tx-${index}`}
                      value={row.tax_rate}
                      onChange={(e) => updateItem(index, 'tax_rate', e.target.value)}
                    />
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || loadingClients}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 disabled:opacity-60"
        >
          {saving ? 'Creating…' : 'Create invoice'}
        </button>
      </form>
    </div>
  )
}
