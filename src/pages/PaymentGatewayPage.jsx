import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, apiPatch } from '../lib/http'
import { FormField, TextInput } from '../components/FormField'

export function PaymentGatewayPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    stripe_enabled: false,
    stripe_publishable_key: '',
    stripe_secret_key: '',
    stripe_webhook_secret: '',
    sslcommerz_enabled: false,
    sslcommerz_store_id: '',
    sslcommerz_store_password: '',
    sslcommerz_is_live: false,
  })

  useEffect(() => {
    let cancelled = false
    apiGet('/api/payments/gateway-settings/')
      .then((d) => {
        if (cancelled) return
        setData(d)
        setForm((f) => ({
          ...f,
          stripe_enabled: Boolean(d.stripe_enabled),
          stripe_publishable_key: d.stripe_publishable_key || '',
          stripe_secret_key: '',
          stripe_webhook_secret: '',
          sslcommerz_enabled: Boolean(d.sslcommerz_enabled),
          sslcommerz_store_id: d.sslcommerz_store_id || '',
          sslcommerz_store_password: '',
          sslcommerz_is_live: Boolean(d.sslcommerz_is_live),
        }))
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

  function update(key) {
    return (e) => {
      const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
      setForm((prev) => ({ ...prev, [key]: v }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      const payload = {
        stripe_enabled: form.stripe_enabled,
        stripe_publishable_key: form.stripe_publishable_key,
        sslcommerz_enabled: form.sslcommerz_enabled,
        sslcommerz_store_id: form.sslcommerz_store_id,
        sslcommerz_is_live: form.sslcommerz_is_live,
      }
      if (form.stripe_secret_key.trim()) payload.stripe_secret_key = form.stripe_secret_key
      if (form.stripe_webhook_secret.trim()) payload.stripe_webhook_secret = form.stripe_webhook_secret
      if (form.sslcommerz_store_password.trim())
        payload.sslcommerz_store_password = form.sslcommerz_store_password

      const d = await apiPatch('/api/payments/gateway-settings/', payload)
      setData(d)
      setForm((f) => ({
        ...f,
        stripe_secret_key: '',
        stripe_webhook_secret: '',
        sslcommerz_store_password: '',
      }))
      setMessage('Settings saved.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage('Copied to clipboard.')
      setTimeout(() => setMessage(''), 2000)
    } catch {
      setError('Could not copy.')
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/payments" className="text-sm text-emerald-400 hover:text-emerald-300">
          ← Payments
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          Payment gateway settings
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Connect Stripe and SSLCommerz.
        </p>
      </div>

      {data ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-400 space-y-2">
          <p>
            <span className="text-slate-500">Stripe webhook URL (register in Stripe Dashboard):</span>
            <br />
            <button
              type="button"
              onClick={() => copyText(data.stripe_webhook_url)}
              className="mt-1 break-all text-left text-emerald-400/90 hover:underline"
            >
              {data.stripe_webhook_url || '—'}
            </button>
          </p>
          <p>
            <span className="text-slate-500">SSLCommerz IPN URL:</span>
            <br />
            <button
              type="button"
              onClick={() => copyText(data.sslcommerz_ipn_url)}
              className="mt-1 break-all text-left text-emerald-400/90 hover:underline"
            >
              {data.sslcommerz_ipn_url || '—'}
            </button>
          </p>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl"
      >
        {error ? (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200">
            {message}
          </div>
        ) : null}

        <section className="space-y-4">
          <h2 className="text-lg font-medium text-white">Stripe</h2>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.stripe_enabled}
              onChange={update('stripe_enabled')}
              className="rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500/30"
            />
            Enable Stripe
          </label>
          {data ? (
            <p className="text-xs text-slate-500">
              Secret key configured: {data.stripe_secret_configured ? 'yes' : 'no'} · Webhook secret:{' '}
              {data.stripe_webhook_secret_configured ? 'yes' : 'no'}
            </p>
          ) : null}
          <FormField id="pk" label="Publishable key">
            <TextInput id="pk" value={form.stripe_publishable_key} onChange={update('stripe_publishable_key')} />
          </FormField>
          <FormField
            id="sk"
            label="Secret key (sk_…)"
            hint="Leave blank to keep the current secret unchanged."
          >
            <TextInput
              id="sk"
              type="password"
              autoComplete="off"
              value={form.stripe_secret_key}
              onChange={update('stripe_secret_key')}
              placeholder="••••••••"
            />
          </FormField>
          <FormField id="wh" label="Webhook signing secret (whsec_…)" hint="Leave blank to keep unchanged.">
            <TextInput
              id="wh"
              type="password"
              value={form.stripe_webhook_secret}
              onChange={update('stripe_webhook_secret')}
              placeholder="••••••••"
            />
          </FormField>
        </section>

        <section className="space-y-4 border-t border-slate-800 pt-6">
          <h2 className="text-lg font-medium text-white">SSLCommerz</h2>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.sslcommerz_enabled}
              onChange={update('sslcommerz_enabled')}
              className="rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500/30"
            />
            Enable SSLCommerz
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.sslcommerz_is_live}
              onChange={update('sslcommerz_is_live')}
              className="rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500/30"
            />
            Live mode (not sandbox)
          </label>
          {data ? (
            <p className="text-xs text-slate-500">
              Store password configured: {data.sslcommerz_store_password_configured ? 'yes' : 'no'}
            </p>
          ) : null}
          <FormField id="sid" label="Store ID">
            <TextInput id="sid" value={form.sslcommerz_store_id} onChange={update('sslcommerz_store_id')} />
          </FormField>
          <FormField id="spw" label="Store password" hint="Leave blank to keep unchanged.">
            <TextInput
              id="spw"
              type="password"
              value={form.sslcommerz_store_password}
              onChange={update('sslcommerz_store_password')}
              placeholder="••••••••"
            />
          </FormField>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </form>
    </div>
  )
}
