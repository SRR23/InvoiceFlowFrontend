import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const navLinkClass = ({ isActive }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
    isActive
      ? 'bg-slate-800 text-white'
      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white',
  ].join(' ')

const mainNav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/clients', label: 'Clients' },
  { to: '/invoices', label: 'Invoices' },
  { to: '/payments', label: 'Payments' },
  { to: '/analytics/revenue', label: 'Revenue' },
  { to: '/settings/payments', label: 'Gateway' },
  { to: '/account', label: 'Account' },
]

export function AppShell() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/dashboard"
              className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/20">
                IF
              </span>
              <span className="hidden sm:inline">InvoiceFlow</span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden max-w-[10rem] truncate text-xs text-slate-500 sm:inline md:max-w-xs">
                {user?.email}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                className="shrink-0 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white sm:px-3 sm:text-sm"
              >
                Sign out
              </button>
            </div>
          </div>

          <nav className="-mx-1 flex gap-0.5 overflow-x-auto pb-1">
            {mainNav.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass} end={item.to === '/dashboard'}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
