import { AUTH_PREFIX } from './config'
import { getStoredTokens, setStoredTokens, clearStoredAuth } from './tokenStorage'

let refreshPromise = null

async function refreshAccessToken() {
  const { refresh } = getStoredTokens()
  if (!refresh) {
    clearStoredAuth()
    return null
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${AUTH_PREFIX}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    }).then(async (res) => {
      refreshPromise = null
      if (!res.ok) {
        clearStoredAuth()
        return null
      }
      const data = await res.json()
      const access = data.access
      const nextRefresh = data.refresh ?? refresh
      if (!access) {
        clearStoredAuth()
        return null
      }
      setStoredTokens({ access, refresh: nextRefresh })
      return access
    })
  }

  return refreshPromise
}

/**
 * Authenticated JSON request with automatic access-token refresh on 401.
 * @param {string} path - Path relative to API root or full URL under same origin usage
 * @param {RequestInit} options
 */
export async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {})

  if (
    options.body &&
    typeof options.body === 'string' &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json')
  }

  const { access } = getStoredTokens()
  if (access && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${access}`)
  }

  const exec = async (token) => {
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return fetch(url, { ...options, headers })
  }

  let res = await exec(access)

  if (res.status === 401 && access) {
    const newAccess = await refreshAccessToken()
    if (newAccess) {
      res = await exec(newAccess)
    }
  }

  return res
}

/** POST JSON to auth API (no Bearer unless options.skipAuth is false — login/register omit token). */
export async function authPost(endpoint, body, { skipAuth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (!skipAuth) {
    const { access } = getStoredTokens()
    if (access) {
      headers.Authorization = `Bearer ${access}`
    }
  }
  return fetch(`${AUTH_PREFIX}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}
