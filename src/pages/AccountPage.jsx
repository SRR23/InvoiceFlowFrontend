import { useEffect, useState } from 'react'
import { FormField, SelectInput, TextInput } from '../components/FormField'
import { CURRENCY_OPTIONS } from '../constants/currencies'
import { useAuth } from '../context/useAuth'

function formatJoined(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function AccountPage() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
    phone: '',
    currency: 'USD',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      company_name: user.company_name || '',
      phone: user.phone || '',
      currency: user.currency || 'USD',
    })
  }, [user])

  function updateField(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setError('')
    setSaving(true)
    try {
      await updateProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        company_name: form.company_name.trim(),
        phone: form.phone.trim(),
        currency: form.currency,
      })
      setMessage('Profile saved successfully.')
    } catch (err) {
      setError(err.message || 'Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Account
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage how you appear on invoices and your default currency.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl shadow-black/20">
            <h2 className="text-lg font-medium text-white">Profile details</h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {message ? (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200"
                >
                  {message}
                </div>
              ) : null}
              {error ? (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-200"
                >
                  {error}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="acc_first" label="First name">
                  <TextInput
                    id="acc_first"
                    name="first_name"
                    autoComplete="given-name"
                    value={form.first_name}
                    onChange={updateField('first_name')}
                  />
                </FormField>
                <FormField id="acc_last" label="Last name">
                  <TextInput
                    id="acc_last"
                    name="last_name"
                    autoComplete="family-name"
                    value={form.last_name}
                    onChange={updateField('last_name')}
                  />
                </FormField>
              </div>

              <FormField id="acc_company" label="Company name">
                <TextInput
                  id="acc_company"
                  name="company_name"
                  autoComplete="organization"
                  value={form.company_name}
                  onChange={updateField('company_name')}
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="acc_phone" label="Phone">
                  <TextInput
                    id="acc_phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={updateField('phone')}
                  />
                </FormField>
                <FormField
                  id="acc_currency"
                  label="Default currency"
                  hint="ISO 4217 code for invoices and totals."
                >
                  <SelectInput
                    id="acc_currency"
                    name="currency"
                    value={form.currency}
                    onChange={updateField('currency')}
                  >
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </SelectInput>
                </FormField>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-cyan-500 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Account status
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="mt-0.5 font-medium text-slate-200">{user.email}</dd>
              </div>
              <div>
                <dt className="text-slate-500">User ID</dt>
                <dd className="mt-0.5 font-mono text-slate-300">{user.id}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Business user</dt>
                <dd className="mt-0.5 text-slate-200">
                  {user.is_business_user ? 'Yes' : 'No'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Member since</dt>
                <dd className="mt-0.5 text-slate-200">
                  {formatJoined(user.date_joined)}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}
