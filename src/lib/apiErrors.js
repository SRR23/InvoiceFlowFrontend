/**
 * Normalize DRF/custom handler errors into a single display string or field map.
 * Backend shape: { error, detail } where detail may be string, array, or nested object.
 */
export function formatApiError(payload) {
  if (!payload || typeof payload !== 'object') {
    return 'Something went wrong. Please try again.'
  }

  const detail = payload.detail ?? payload.error ?? payload

  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail)) {
    return detail.join(' ')
  }

  if (typeof detail === 'object') {
    const parts = []
    for (const [key, value] of Object.entries(detail)) {
      if (Array.isArray(value)) {
        parts.push(`${key}: ${value.join(' ')}`)
      } else if (typeof value === 'string') {
        parts.push(`${key}: ${value}`)
      } else if (value && typeof value === 'object') {
        parts.push(`${key}: ${JSON.stringify(value)}`)
      }
    }
    return parts.length ? parts.join(' · ') : 'Invalid request. Check the form fields.'
  }

  return 'Something went wrong. Please try again.'
}
