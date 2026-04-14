import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function FeatureCard({ icon, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-lg shadow-black/20 transition hover:border-slate-700/80 hover:bg-slate-900/60">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  )
}

function Step({ n, title, body }) {
  return (
    <div className="relative flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-sm font-bold text-emerald-300 ring-1 ring-emerald-500/30">
        {n}
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-400">{body}</p>
      </div>
    </div>
  )
}

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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-slate-950 shadow-md shadow-emerald-500/25">
              IF
            </span>
            InvoiceFlow
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  to="/invoices"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white sm:inline"
                >
                  Invoices
                </Link>
                <Link
                  to="/account"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/20"
                >
                  Account
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/20"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800/40">
        <div
          className="pointer-events-none absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-emerald-500/12 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-32 top-32 h-[22rem] w-[22rem] rounded-full bg-cyan-500/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-300/95">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
              Billing &amp; payments for modern businesses
            </p>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl sm:leading-tight lg:text-6xl">
              Run invoices and get paid—
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {' '}
                without the spreadsheet chaos
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
              InvoiceFlow helps you organize clients, issue professional invoices, collect payments through
              Stripe or SSLCommerz, and see revenue at a glance—so you spend less time on admin and more on
              your business.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex min-h-[48px] min-w-[160px] items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-8 py-3 text-base font-semibold text-slate-950 shadow-xl shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-cyan-500"
                  >
                    Go to dashboard
                  </Link>
                  <Link
                    to="/invoices/new"
                    className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-600 bg-slate-900/50 px-8 py-3 text-base font-medium text-white transition hover:border-slate-500 hover:bg-slate-800"
                  >
                    New invoice
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex min-h-[48px] min-w-[160px] items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-8 py-3 text-base font-semibold text-slate-950 shadow-xl shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-cyan-500"
                  >
                    Create free account
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-600 bg-transparent px-8 py-3 text-base font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/50"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
            <p className="mt-8 text-sm text-slate-500">
              Secure sign-in · Encrypted gateway credentials · Shareable invoice links for your customers
            </p>
          </div>
        </div>
      </section>

      {/* Why InvoiceFlow */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to bill with confidence
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Built as a full workflow: from client records to paid invoices—aligned with how freelancers and
            small teams actually work.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Client management"
            description="Keep contact details, company, and billing context in one place so every invoice goes to the right customer."
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
          />
          <FeatureCard
            title="Invoices & line items"
            description="Create detailed invoices with quantities, tax rates, discounts, and notes. Totals are calculated automatically."
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          />
          <FeatureCard
            title="Payments that fit you"
            description="Connect Stripe Checkout or SSLCommerz with your own merchant credentials—ideal for global cards or local wallets."
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            }
          />
          <FeatureCard
            title="Analytics & revenue"
            description="Dashboard stats and revenue reports help you see what is paid, pending, and overdue—without exporting to Excel."
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
          />
          <FeatureCard
            title="Shareable invoice links"
            description="Send customers a clean, read-only view of their invoice—perfect for email or messaging—without exposing your whole account."
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            }
          />
          <FeatureCard
            title="Secure access"
            description="Email and password or Google sign-in, with JWT sessions—so your data stays tied to your account."
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
          />
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-slate-800/60 bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                How it works
              </h2>
              <p className="mt-4 text-lg text-slate-400">
                Three steps from setup to money in the bank—whether you are billing hourly, by project, or
                on retainer.
              </p>
            </div>
            <div className="space-y-8">
              <Step
                n="1"
                title="Add your clients"
                body="Store who you bill—names, emails, companies, and addresses—so every document looks professional."
              />
              <Step
                n="2"
                title="Create and send invoices"
                body="Build line items with tax and discounts, set due dates, queue email, and share a public link when you need to."
              />
              <Step
                n="3"
                title="Get paid & review revenue"
                body="Offer Stripe or SSLCommerz checkout, track payment status, and use analytics to see performance over time."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-950 p-8 sm:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Who InvoiceFlow helps</h2>
            <p className="mt-4 text-slate-400">
              Freelancers, consultants, agencies, and small businesses that outgrow ad-hoc PDFs and payment
              requests—but do not need enterprise complexity. If you invoice real clients and want one place
              to manage billing and payouts, this is for you.
            </p>
          </div>
          <ul className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-3 text-sm">
            {['Consultants', 'Creative studios', 'IT contractors', 'Local services', 'B2B suppliers'].map(
              (tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-slate-700 bg-slate-800/50 px-4 py-2 text-slate-300"
                >
                  {tag}
                </li>
              ),
            )}
          </ul>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 px-6 py-14 text-center sm:px-12">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to simplify your billing?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Join and start issuing invoices in minutes. Your dashboard, clients, and payment tools are one
            click away.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-8 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/20"
              >
                Open dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-8 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/20"
                >
                  Create your account
                </Link>
                <Link
                  to="/login"
                  className="inline-flex rounded-xl border border-slate-600 px-8 py-3 text-base font-medium text-white hover:bg-slate-800/50"
                >
                  I already have an account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-400">InvoiceFlow</span>
            <span aria-hidden>·</span>
            <span>Invoicing &amp; payments</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-slate-400 hover:text-white">
                  Dashboard
                </Link>
                <Link to="/invoices" className="text-slate-400 hover:text-white">
                  Invoices
                </Link>
                <Link to="/account" className="text-slate-400 hover:text-white">
                  Account
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-400 hover:text-white">
                  Sign in
                </Link>
                <Link to="/register" className="text-slate-400 hover:text-white">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
