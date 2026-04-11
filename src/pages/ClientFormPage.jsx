import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/http'
import { FormField, TextInput } from '../components/FormField'

const empty = {
  name: '',
  email: '',
  phone: '',
  company: '',
  address: '',
}

export function ClientFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    apiGet(`/api/clients/${id}/`)
      .then((data) => {
        if (!cancelled) {
          setForm({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            company: data.company || '',
            address: data.address || '',
          })
        }
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
  }, [id, isEdit])

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim(),
        company: form.company.trim(),
        address: form.address.trim(),
      }
      if (isEdit) {
        await apiPatch(`/api/clients/${id}/`, payload)
      } else {
        await apiPost('/api/clients/', payload)
      }
      navigate('/clients')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!isEdit) return
    if (!window.confirm('Delete this client? Invoices linked to them may be affected.')) return
    setDeleting(true)
    setError('')
    try {
      await apiDelete(`/api/clients/${id}/`)
      navigate('/clients')
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link to="/clients" className="text-sm text-emerald-400 hover:text-emerald-300">
          ← Back to clients
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          {isEdit ? 'Edit client' : 'New client'}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl"
      >
        {error ? (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <FormField id="name" label="Name" hint="Required — shown on invoices.">
          <TextInput id="name" required value={form.name} onChange={update('name')} />
        </FormField>
        <FormField id="email" label="Email">
          <TextInput id="email" type="email" value={form.email} onChange={update('email')} />
        </FormField>
        <FormField id="phone" label="Phone">
          <TextInput id="phone" type="tel" value={form.phone} onChange={update('phone')} />
        </FormField>
        <FormField id="company" label="Company">
          <TextInput id="company" value={form.company} onChange={update('company')} />
        </FormField>
        <FormField id="address" label="Address">
          <textarea
            id="address"
            value={form.address}
            onChange={update('address')}
            rows={3}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </FormField>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 disabled:opacity-60"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create client'}
          </button>
          {isEdit ? (
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="rounded-xl border border-rose-800/80 px-5 py-2.5 text-sm font-medium text-rose-300 hover:bg-rose-950/40 disabled:opacity-60"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  )
}
