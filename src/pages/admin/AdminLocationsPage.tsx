import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchLocations, deleteLocation } from '@/services/bourdain'
import type { BourdainLocation, BourdainShow } from '@/types'

const SHOW_LABELS: Record<BourdainShow, string> = {
  no_reservations: 'No Res',
  parts_unknown:   'Parts',
  the_layover:     'Layover',
}
const SHOW_COLORS: Record<BourdainShow, string> = {
  no_reservations: 'bg-brand-500/20 text-brand-300',
  parts_unknown:   'bg-brand-300/20 text-brand-200',
  the_layover:     'bg-brand-700/40 text-brand-50/60',
}

const PAGE_SIZE = 50

export default function AdminLocationsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [search, setSearch]         = useState('')
  const [showFilter, setShowFilter] = useState<BourdainShow | ''>('')
  const [page, setPage]             = useState(0)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { data: all = [], isLoading } = useQuery({
    queryKey: ['admin', 'bourdain_locations'],
    queryFn: () => fetchLocations({ show: null, country: null, season: null }),
    staleTime: 0,
  })

  const deleteMut = useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'bourdain_locations'] })
      setConfirmDelete(null)
    },
  })

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return all.filter((loc: BourdainLocation) => {
      if (showFilter && loc.show !== showFilter) return false
      if (!q) return true
      return (
        loc.location_name.toLowerCase().includes(q) ||
        loc.city.toLowerCase().includes(q) ||
        loc.country.toLowerCase().includes(q) ||
        (loc.episode_title ?? '').toLowerCase().includes(q)
      )
    })
  }, [all, search, showFilter])

  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE)
  const page_items  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleSearch(v: string)     { setSearch(v);                              setPage(0) }
  function handleShowFilter(v: string) { setShowFilter(v as BourdainShow | '');    setPage(0) }

  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-brand-300">Bourdain Locations</h1>
          <p className="text-brand-50/40 text-sm mt-0.5">
            {isLoading ? '…' : `${filtered.length.toLocaleString()} of ${all.length.toLocaleString()} locations`}
          </p>
        </div>
        <Link
          to="/admin/locations/new"
          className="px-4 py-2 bg-brand-500 hover:bg-brand-500/80 text-brand-50 text-sm font-medium rounded-lg transition-colors"
        >
          + Add Location
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search name, city, country, episode…"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="flex-1 bg-brand-900 border border-brand-700/50 text-brand-50 text-sm rounded-lg px-3 py-2 placeholder:text-brand-50/30 focus:outline-none focus:border-brand-500"
        />
        <select
          value={showFilter}
          onChange={e => handleShowFilter(e.target.value)}
          className="bg-brand-900 border border-brand-700/50 text-brand-50 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
        >
          <option value="">All Shows</option>
          <option value="no_reservations">No Reservations</option>
          <option value="parts_unknown">Parts Unknown</option>
          <option value="the_layover">The Layover</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-brand-900/50 border border-brand-700/30 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-700/30 text-brand-50/40 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">Show</th>
              <th className="text-left px-4 py-3 font-medium">S·E</th>
              <th className="text-left px-4 py-3 font-medium">Location</th>
              <th className="text-left px-4 py-3 font-medium">City</th>
              <th className="text-left px-4 py-3 font-medium">Country</th>
              <th className="text-left px-4 py-3 font-medium">Coords</th>
              <th className="text-center px-4 py-3 font-medium">Desc</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-brand-50/30">Loading…</td>
              </tr>
            )}
            {!isLoading && page_items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-brand-50/30">No locations found</td>
              </tr>
            )}
            {page_items.map((loc: BourdainLocation) => (
              <tr
                key={loc.id}
                className="border-t border-brand-700/20 hover:bg-brand-800/30 transition-colors"
              >
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SHOW_COLORS[loc.show]}`}>
                    {SHOW_LABELS[loc.show]}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-brand-50/40 font-mono text-xs">
                  {loc.season != null ? `${loc.season}·${loc.episode ?? '?'}` : '—'}
                </td>
                <td className="px-4 py-2.5 text-brand-50 font-medium max-w-[200px] truncate">
                  {loc.location_name}
                </td>
                <td className="px-4 py-2.5 text-brand-50/60 max-w-[140px] truncate">{loc.city}</td>
                <td className="px-4 py-2.5 text-brand-50/50 max-w-[120px] truncate">{loc.country}</td>
                <td className="px-4 py-2.5 text-brand-50/30 font-mono text-xs whitespace-nowrap">
                  {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {loc.description
                    ? <span className="text-brand-500 text-xs">✓</span>
                    : <span className="text-brand-50/20 text-xs">—</span>}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => navigate(`/admin/locations/${loc.id}/edit`)}
                      className="text-xs text-brand-300/60 hover:text-brand-300 transition-colors px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    {confirmDelete === loc.id ? (
                      <>
                        <button
                          onClick={() => deleteMut.mutate(loc.id)}
                          disabled={deleteMut.isPending}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded"
                        >
                          {deleteMut.isPending ? '…' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs text-brand-50/30 hover:text-brand-50 transition-colors px-2 py-1 rounded"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(loc.id)}
                        className="text-xs text-brand-50/20 hover:text-red-400 transition-colors px-2 py-1 rounded"
                      >
                        Del
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-brand-50/40">
          <span>Page {page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 border border-brand-700/40 rounded hover:border-brand-500/50 disabled:opacity-30 transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 border border-brand-700/40 rounded hover:border-brand-500/50 disabled:opacity-30 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
