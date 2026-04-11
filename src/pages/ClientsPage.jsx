import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '../lib/http'
import { formatDateTime } from '../lib/format'
import { PaginationBar } from '../components/PaginationBar'

const PAGE_SIZE = 20

export function ClientsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ page: String(page) })
    if (appliedSearch.trim()) params.set('search', appliedSearch.trim())
    try {
      const res = await apiGet(`/api/clients/?${params.toString()}`)
      setData(res)
    } catch (e) {
      setError(e.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [page, appliedSearch])

  useEffect(() => {
    load()
  }, [load])

  function applySearch(e) {
    e.preventDefault()
    setPage(1)
    setAppliedSearch(search)
  }

  const results = data?.results ?? []
  const count = data?.count ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Clients</h1>
          <p className="mt-1 text-sm text-slate-400">
            Customers you bill. Used when creating invoices.
          </p>
        </div>
        <Link
          to="/clients/new"
          className="inline-flex shrink-0 justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20"
        >
          Add client
        </Link>
      </div>

      <form onSubmit={applySearch} className="flex flex-wrap gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, company…"
          className="min-w-[200px] flex-1 rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <button
          type="submit"
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
        >
          Search
        </button>
      </form>

      {error ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-xl shadow-black/20">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        No clients yet. Create your first client to start invoicing.
                      </td>
                    </tr>
                  ) : (
                    results.map((c) => (
                      <tr key={c.id} className="text-slate-300 hover:bg-slate-800/30">
                        <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                        <td className="px-4 py-3">{c.email || '—'}</td>
                        <td className="px-4 py-3">{c.company || '—'}</td>
                        <td className="px-4 py-3">{c.phone || '—'}</td>
                        <td className="px-4 py-3 text-slate-500">{formatDateTime(c.updated_at)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            to={`/clients/${c.id}/edit`}
                            className="font-medium text-emerald-400 hover:text-emerald-300"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <PaginationBar
              count={count}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  )
}
