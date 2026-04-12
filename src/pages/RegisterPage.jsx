import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { GoogleSignInButton } from '../components/GoogleSignInButton'
import { FormField, SelectInput, TextInput } from '../components/FormField'
import { CURRENCY_OPTIONS } from '../constants/currencies'
import { useAuth } from '../context/useAuth'
import { GOOGLE_CLIENT_ID } from '../lib/config'

export function RegisterPage() {
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    company_name: '',
    phone: '',
    currency: 'USD',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateField(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        email: form.email.trim(),
        password: form.password,
        password2: form.password2,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        company_name: form.company_name.trim(),
        phone: form.phone.trim(),
        currency: form.currency,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start issuing invoices with a profile tailored to your business."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-200"
          >
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="first_name" label="First name" className="sm:col-span-1">
            <TextInput
              id="first_name"
              name="first_name"
              autoComplete="given-name"
              value={form.first_name}
              onChange={updateField('first_name')}
              placeholder="Jane"
            />
          </FormField>
          <FormField id="last_name" label="Last name" className="sm:col-span-1">
            <TextInput
              id="last_name"
              name="last_name"
              autoComplete="family-name"
              value={form.last_name}
              onChange={updateField('last_name')}
              placeholder="Doe"
            />
          </FormField>
        </div>

        <FormField id="email" label="Email" hint="Used as your sign-in username.">
          <TextInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={updateField('email')}
            placeholder="you@company.com"
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="password" label="Password" className="sm:col-span-1">
            <TextInput
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={updateField('password')}
              placeholder="••••••••"
            />
          </FormField>
          <FormField
            id="password2"
            label="Confirm password"
            className="sm:col-span-1"
          >
            <TextInput
              id="password2"
              name="password2"
              type="password"
              autoComplete="new-password"
              required
              value={form.password2}
              onChange={updateField('password2')}
              placeholder="••••••••"
            />
          </FormField>
        </div>

        <FormField id="company_name" label="Company name">
          <TextInput
            id="company_name"
            name="company_name"
            autoComplete="organization"
            value={form.company_name}
            onChange={updateField('company_name')}
            placeholder="Acme Inc."
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="phone" label="Phone" className="sm:col-span-1">
            <TextInput
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={updateField('phone')}
              placeholder="+1 555 0100"
            />
          </FormField>
          <FormField
            id="currency"
            label="Default currency"
            hint="ISO 4217 — used for new invoices."
            className="sm:col-span-1"
          >
            <SelectInput
              id="currency"
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

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        {GOOGLE_CLIENT_ID ? (
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/80" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-slate-900/80 px-2 text-slate-500">Or sign up with</span>
            </div>
          </div>
        ) : null}

        {GOOGLE_CLIENT_ID ? (
          <GoogleSignInButton
            onGoogleUiError={() => setError('Google sign-in was cancelled or failed')}
            onCredential={async (credential) => {
              setError('')
              setLoading(true)
              try {
                await loginWithGoogle(credential)
                navigate('/dashboard', { replace: true })
              } catch (err) {
                setError(err.message || 'Google sign-up failed')
              } finally {
                setLoading(false)
              }
            }}
          />
        ) : null}

        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-emerald-400 hover:text-emerald-300"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
