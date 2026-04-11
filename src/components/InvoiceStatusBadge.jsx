const STYLES = {
  DRAFT: 'bg-slate-700/80 text-slate-200 ring-slate-600',
  SENT: 'bg-cyan-950/80 text-cyan-200 ring-cyan-700/50',
  PAID: 'bg-emerald-950/80 text-emerald-200 ring-emerald-700/50',
  OVERDUE: 'bg-amber-950/80 text-amber-200 ring-amber-700/50',
  CANCELLED: 'bg-rose-950/80 text-rose-200 ring-rose-700/50',
}

export function InvoiceStatusBadge({ status }) {
  const cls = STYLES[status] || STYLES.DRAFT
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      {status || '—'}
    </span>
  )
}
