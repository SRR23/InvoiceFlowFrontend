import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

/** Sends authenticated users away from login/register screens. */
export function GuestRoute({ children }) {
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

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
