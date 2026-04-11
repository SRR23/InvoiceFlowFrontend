import { apiFetch } from './api'
import { apiPath } from './config'
import { formatApiError } from './apiErrors'

/**
 * Parse JSON and throw a readable Error when the response is not OK.
 */
export async function parseJsonResponse(res) {
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    throw new Error(text?.slice(0, 200) || 'Invalid response from server')
  }
  if (!res.ok) {
    throw new Error(formatApiError(data))
  }
  return data
}

export async function apiGet(pathOrUrl) {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : apiPath(pathOrUrl)
  const res = await apiFetch(url)
  return parseJsonResponse(res)
}

export async function apiPost(path, body) {
  const res = await apiFetch(apiPath(path), {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return parseJsonResponse(res)
}

export async function apiPatch(path, body) {
  const res = await apiFetch(apiPath(path), {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return parseJsonResponse(res)
}

export async function apiPut(path, body) {
  const res = await apiFetch(apiPath(path), {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  return parseJsonResponse(res)
}

export async function apiDelete(path) {
  const res = await apiFetch(apiPath(path), { method: 'DELETE' })
  if (res.status === 204) return null
  return parseJsonResponse(res)
}

/** Unauthenticated GET (e.g. public invoice). */
export async function publicGet(path) {
  const res = await fetch(apiPath(path))
  return parseJsonResponse(res)
}

/**
 * Follow DRF `next` links until all pages are loaded; returns combined `results`.
 */
export async function fetchAllPages(firstPath) {
  let url = firstPath.startsWith('http') ? firstPath : apiPath(firstPath)
  const combined = []
  while (url) {
    const res = await apiFetch(url)
    const data = await parseJsonResponse(res)
    if (Array.isArray(data)) {
      return data
    }
    if (data?.results) {
      combined.push(...data.results)
      url = data.next || null
    } else {
      return combined.length ? combined : data
    }
  }
  return combined
}
