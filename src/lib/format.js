/** Format a numeric amount with currency code (ISO 4217). */
export function formatMoney(amount, currency = 'USD') {
  if (amount === null || amount === undefined || amount === '') return '—'
  const n = typeof amount === 'string' ? parseFloat(amount) : Number(amount)
  if (Number.isNaN(n)) return String(amount)
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(n)
  } catch {
    return `${n} ${currency}`
  }
}

export function formatDate(isoDate) {
  if (!isoDate) return '—'
  try {
    return new Date(isoDate + 'T12:00:00').toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return String(isoDate)
  }
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return String(iso)
  }
}
