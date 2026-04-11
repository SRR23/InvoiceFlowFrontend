import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function HomePage() {
  const { isAuthenticated, ready } = useAuth()

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400"
          aria-label="Loading"
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div
        className="pointer-events-none absolute left-1/2 top-24 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm font-medium text-emerald-400/90">InvoiceFlow</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Invoicing, without the clutter
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
          Clients, invoices, payments, and analytics — wired to your InvoiceFlow API.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="inline-flex rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-cyan-500"
              >
                Open dashboard
              </Link>
              <Link
                to="/account"
                className="inline-flex rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
              >
                Account
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-cyan-500"
              >
                Get started
              </Link>
              <Link
                to="/login"
                className="inline-flex rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
