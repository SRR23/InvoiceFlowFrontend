import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { GoogleSignInButton } from '../components/GoogleSignInButton'
import { FormField, TextInput } from '../components/FormField'
import { useAuth } from '../context/useAuth'
import { GOOGLE_CLIENT_ID } from '../lib/config'

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage invoices, clients, and payments."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-200"
          >
            {error}
          </div>
        ) : null}

        <FormField id="email" label="Email">
          <TextInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </FormField>

        <FormField id="password" label="Password">
          <TextInput
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </FormField>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        {GOOGLE_CLIENT_ID ? (
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/80" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="bg-slate-900/80 px-2 text-slate-500">Or continue with</span>
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
                navigate(from, { replace: true })
              } catch (err) {
                setError(err.message || 'Google sign-in failed')
              } finally {
                setLoading(false)
              }
            }}
          />
        ) : (
          <p className="text-center text-xs text-slate-500">
            Set <code className="text-slate-400">VITE_GOOGLE_CLIENT_ID</code> to enable Google
            sign-in.
          </p>
        )}

        <p className="text-center text-sm text-slate-400">
          No account?{' '}
          <Link
            to="/register"
            className="font-medium text-emerald-400 hover:text-emerald-300"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
