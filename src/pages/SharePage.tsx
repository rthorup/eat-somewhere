import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { createRestaurant } from '@/services/restaurants'
import CuisineCombobox from '@/components/ui/CuisineCombobox'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

const inputCls = 'w-full bg-brand-900 border border-brand-700/50 text-brand-50 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500 placeholder:text-brand-50/20'

const EMPTY = {
  name:         '',
  city:         '',
  country:      '',
  cuisine_type: '',
  description:  '',
  website:      '',
}

export default function SharePage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()

  useEffect(() => {
    if (!loading && !session) navigate('/login?returnTo=/share', { replace: true })
  }, [session, loading, navigate])

  const [form, setForm] = useState(EMPTY)

  const mut = useMutation({
    mutationFn: async () => {
      // Auto-geocode from name + city + country
      let lat = 0, lng = 0
      try {
        const q = [form.name, form.city, form.country].filter(Boolean).join(', ')
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
        )
        const data = await res.json()
        const center = data.features?.[0]?.center as [number, number] | undefined
        if (center) { lng = center[0]; lat = center[1] }
      } catch {
        // non-critical — fallback to 0,0
      }

      return createRestaurant({
        user_id:      session!.user.id,
        name:         form.name,
        city:         form.city,
        country:      form.country,
        cuisine_type: form.cuisine_type || null,
        description:  form.description  || null,
        address:      null,
        website:      form.website || null,
        lat,
        lng,
      })
    },
    onSuccess: (restaurant) => {
      qc.invalidateQueries({ queryKey: ['restaurants'] })
      navigate(`/restaurants/${restaurant.id}`)
    },
  })

  function set(field: keyof typeof EMPTY) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    mut.mutate()
  }

  const canSubmit = form.name && form.city && form.country && form.description

  if (loading || !session) return null

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-brand-50/40 mb-6">
        <Link to="/find" className="hover:text-brand-300 transition-colors">Find</Link>
        <span>/</span>
        <span className="text-brand-50/70">Share a Place</span>
      </div>

      <h1 className="text-2xl font-bold text-brand-50 mb-2">Share a Place</h1>
      <p className="text-brand-50/40 text-sm mb-8 leading-relaxed">
        Tell people why they should go — not a rating, just a reason. The owners, a dish, the atmosphere, something that stuck with you.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs text-brand-50/50 uppercase tracking-wider mb-1">
            Restaurant Name *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={set('name')}
            placeholder="e.g. Joe's Diner"
            className={inputCls}
          />
        </div>

        {/* City + Country */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-brand-50/50 uppercase tracking-wider mb-1">
              City *
            </label>
            <input
              type="text"
              required
              value={form.city}
              onChange={set('city')}
              placeholder="e.g. New Orleans"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-brand-50/50 uppercase tracking-wider mb-1">
              Country *
            </label>
            <input
              type="text"
              required
              value={form.country}
              onChange={set('country')}
              placeholder="e.g. USA"
              className={inputCls}
            />
          </div>
        </div>

        {/* Cuisine */}
        <div>
          <label className="block text-xs text-brand-50/50 uppercase tracking-wider mb-1">
            Cuisine Type
          </label>
          <CuisineCombobox
            value={form.cuisine_type}
            onChange={v => setForm(f => ({ ...f, cuisine_type: v }))}
            placeholder="Start typing a cuisine…"
          />
        </div>

        {/* Why should someone go */}
        <div>
          <label className="block text-xs text-brand-50/50 uppercase tracking-wider mb-1">
            Why should someone go? *
          </label>
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={set('description')}
            placeholder="The owner greeted us like family. The bowl of pho had clearly been cooking all night…"
            className={`${inputCls} resize-y`}
          />
          <p className="text-brand-50/25 text-xs mt-1">
            No star ratings here. Just tell the story.
          </p>
        </div>

        {/* Website (optional) */}
        <div>
          <label className="block text-xs text-brand-50/50 uppercase tracking-wider mb-1">
            Website <span className="normal-case text-brand-50/25">(optional)</span>
          </label>
          <input
            type="url"
            value={form.website}
            onChange={set('website')}
            placeholder="https://…"
            className={inputCls}
          />
        </div>

        {mut.isError && (
          <p className="text-sm text-red-400">
            {(mut.error as Error)?.message ?? 'Something went wrong.'}
          </p>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={!canSubmit || mut.isPending}
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-500/80 text-brand-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
          >
            {mut.isPending ? 'Sharing…' : 'Share This Place'}
          </button>
          <Link to="/find" className="text-sm text-brand-50/40 hover:text-brand-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
