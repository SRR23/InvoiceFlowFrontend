import { useCallback, useEffect, useMemo, useState } from 'react'
import { AUTH_PREFIX } from '../lib/config'
import { apiFetch, authPost } from '../lib/api'
import { formatApiError } from '../lib/apiErrors'
import {
  clearStoredAuth,
  getStoredTokens,
  getStoredUser,
  setStoredTokens,
  setStoredUser,
} from '../lib/tokenStorage'
import { AuthContext } from './auth-context'

function applyAuthPayload(data) {
  const tokens = data.tokens
  if (!tokens?.access || !tokens?.refresh) {
    throw new Error('Invalid response: missing tokens')
  }
  setStoredTokens({ access: tokens.access, refresh: tokens.refresh })
  setStoredUser(data.user)
  return data.user
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const { access } = getStoredTokens()
    if (!access) return null
    return getStoredUser()
  })
  // If there is no access token, we can render immediately; otherwise wait for profile fetch.
  const [ready, setReady] = useState(() => !getStoredTokens().access)

  const isAuthenticated = Boolean(user)

  const refreshProfile = useCallback(async () => {
    const { access } = getStoredTokens()
    if (!access) {
      setUser(null)
      return null
    }
    const res = await apiFetch(`${AUTH_PREFIX}/profile/`, { method: 'GET' })
    if (!res.ok) {
      if (res.status === 401) {
        clearStoredAuth()
        setUser(null)
      }
      return null
    }
    const profile = await res.json()
    setStoredUser(profile)
    setUser(profile)
    return profile
  }, [])

  useEffect(() => {
    const onCleared = () => setUser(null)
    window.addEventListener('invoiceflow:auth-cleared', onCleared)
    return () => window.removeEventListener('invoiceflow:auth-cleared', onCleared)
  }, [])

  useEffect(() => {
    const { access } = getStoredTokens()
    if (!access) return
    let cancelled = false
    // Defer hydration so the effect body does not synchronously chain into state updates (eslint).
    const timeoutId = window.setTimeout(() => {
      void refreshProfile().finally(() => {
        if (!cancelled) setReady(true)
      })
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [refreshProfile])

  const login = useCallback(async (email, password) => {
    const res = await authPost('/login/', { email, password })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(formatApiError(data))
    }
    const nextUser = applyAuthPayload(data)
    setUser(nextUser)
    return nextUser
  }, [])

  const register = useCallback(async (payload) => {
    const res = await authPost('/register/', payload)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(formatApiError(data))
    }
    const nextUser = applyAuthPayload(data)
    setUser(nextUser)
    return nextUser
  }, [])

  const loginWithGoogle = useCallback(async (idToken) => {
    const res = await authPost('/google/', { id_token: idToken })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(formatApiError(data))
    }
    const nextUser = applyAuthPayload(data)
    setUser(nextUser)
    return nextUser
  }, [])

  /**
   * Optimistic logout: clear UI and storage immediately so sign-out feels instant.
   * Blacklist the refresh token in the background (server still invalidates it when reachable).
   */
  const logout = useCallback(() => {
    const { access, refresh } = getStoredTokens()
    clearStoredAuth()
    setUser(null)

    if (refresh && access) {
      void fetch(`${AUTH_PREFIX}/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ refresh_token: refresh }),
      }).catch(() => {
        /* offline / slow server — session already cleared locally */
      })
    }
  }, [])

  const updateProfile = useCallback(async (partial) => {
    const res = await apiFetch(`${AUTH_PREFIX}/profile/`, {
      method: 'PATCH',
      body: JSON.stringify(partial),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(formatApiError(data))
    }
    setStoredUser(data)
    setUser(data)
    return data
  }, [])

  const value = useMemo(
    () => ({
      user,
      ready,
      isAuthenticated,
      login,
      register,
      loginWithGoogle,
      logout,
      updateProfile,
      refreshProfile,
    }),
    [
      user,
      ready,
      isAuthenticated,
      login,
      register,
      loginWithGoogle,
      logout,
      updateProfile,
      refreshProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
