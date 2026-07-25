import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchRestaurants } from '@/services/restaurants'
import RestaurantCard from '@/components/community/RestaurantCard'
import CuisineCombobox from '@/components/ui/CuisineCombobox'
import { useAuth } from '@/contexts/AuthContext'

const inputCls = 'bg-brand-900 border border-brand-700/50 text-brand-50 text-sm rounded-lg px-3 py-2 placeholder:text-brand-50/30 focus:outline-none focus:border-brand-500'

export default function FindPage() {
  const { session } = useAuth()
  const [params, setParams] = useSearchParams()

  const city    = params.get('city')    ?? ''
  const cuisine = params.get('cuisine') ?? ''

  const [cityInput,    setCityInput]    = useState(city)
  const [cuisineInput, setCuisineInput] = useState(cuisine)

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['restaurants', { city, cuisine }],
    queryFn: () => fetchRestaurants({
      city:         city    || undefined,
      cuisine_type: cuisine || undefined,
    }),
  })

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (cityInput.trim())  next.city    = cityInput.trim()
    if (cuisineInput)      next.cuisine = cuisineInput
    setParams(next)
  }

  function clearFilters() {
    setCityInput('')
    setCuisineInput('')
    setParams({})
  }

  const hasFilters = !!(city || cuisine)

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-50">Find Somewhere Worth Going</h1>
          <p className="text-brand-50/40 text-sm mt-1">Not reviews. Reasons to go.</p>
        </div>
        {session ? (
          <Link
            to="/share"
            className="shrink-0 px-4 py-2 bg-brand-500 hover:bg-brand-500/80 text-brand-50 text-sm font-medium rounded-lg transition-colors"
          >
            + Share a Place
          </Link>
        ) : (
          <Link
            to="/login?returnTo=/share"
            className="shrink-0 px-4 py-2 border border-brand-700/50 text-brand-50/50 hover:text-brand-50 hover:border-brand-500/50 text-sm rounded-lg transition-colors"
          >
            Sign in to share
          </Link>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-10">
        <input
          type="text"
          placeholder="City or country…"
          value={cityInput}
          onChange={e => setCityInput(e.target.value)}
          className={`${inputCls} flex-1`}
        />
        <CuisineCombobox
          value={cuisineInput}
          onChange={v => setCuisineInput(v)}
          placeholder="Any cuisine…"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-brand-500 hover:bg-brand-500/80 text-brand-50 text-sm font-medium rounded-lg transition-colors"
        >
          Search
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 text-brand-50/40 hover:text-brand-50 text-sm transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      {/* Results */}
      {isLoading ? (
        <div className="text-brand-50/30 text-sm py-20 text-center">Loading…</div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <p className="text-brand-50/30 text-sm">
            {hasFilters
              ? 'No places found — try different search terms.'
              : 'Nothing shared yet. Be the first.'}
          </p>
          {!hasFilters && (
            <Link
              to={session ? '/share' : '/login?returnTo=/share'}
              className="inline-block text-sm text-brand-300 hover:text-brand-50 transition-colors"
            >
              Share a place →
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="text-brand-50/30 text-xs mb-4">
            {restaurants.length} {restaurants.length === 1 ? 'place' : 'places'}
            {hasFilters && ' found'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.map(r => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
