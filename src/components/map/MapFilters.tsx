import { useAppStore } from '@/store'
import type { BourdainShow } from '@/types'

const SHOWS: { value: BourdainShow; label: string }[] = [
  { value: 'no_reservations', label: 'No Reservations' },
  { value: 'parts_unknown',   label: 'Parts Unknown' },
  { value: 'the_layover',     label: 'The Layover' },
]

export default function MapFilters() {
  const { filters, setFilters } = useAppStore()

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
      <select
        value={filters.show ?? ''}
        onChange={(e) => setFilters({ show: (e.target.value as BourdainShow) || null })}
        className="bg-brand-950/90 backdrop-blur text-brand-50 text-xs border border-brand-700/60 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        <option value="">All Shows</option>
        {SHOWS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <select
        value={filters.season ?? ''}
        onChange={(e) => setFilters({ season: e.target.value ? Number(e.target.value) : null })}
        className="bg-brand-950/90 backdrop-blur text-brand-50 text-xs border border-brand-700/60 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        <option value="">All Seasons</option>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((s) => (
          <option key={s} value={s}>Season {s}</option>
        ))}
      </select>

      {(filters.show || filters.season || filters.country) && (
        <button
          onClick={() => setFilters({ show: null, season: null, country: null })}
          className="bg-brand-700/80 backdrop-blur text-brand-300 text-xs border border-brand-700/60 rounded-lg px-3 py-1.5 hover:bg-brand-700 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}
