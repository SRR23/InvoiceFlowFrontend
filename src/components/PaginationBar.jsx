/**
 * DRF-style pagination: pass count, page, pageSize, onPageChange.
 */
export function PaginationBar({ count, page, pageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize))
  const canPrev = page > 1
  const canNext = page < totalPages

  if (count === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 px-2 py-3 text-sm text-slate-400">
      <p>
        Page <span className="text-slate-200">{page}</span> of{' '}
        <span className="text-slate-200">{totalPages}</span>
        <span className="text-slate-500"> · {count} total</span>
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-200 transition enabled:hover:bg-slate-800 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-200 transition enabled:hover:bg-slate-800 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
