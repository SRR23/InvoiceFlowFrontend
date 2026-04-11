/**
 * API base URL for InvoiceFlow Django backend.
 * Override with VITE_API_URL (e.g. http://localhost:8000).
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8000'

/** Build absolute API URL. Example: apiPath('/api/clients/') */
export function apiPath(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${p}`
}

export const AUTH_PREFIX = `${API_BASE_URL}/api/auth`

/** Google OAuth Web client ID — must match backend GOOGLE_CLIENT_ID for token verification. */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
