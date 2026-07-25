import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchLocationById, upsertLocation, deleteLocation } from '@/services/bourdain'
import type { BourdainShow } from '@/types'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

const SHOWS: { value: BourdainShow; label: string }[] = [
  { value: 'no_reservations', label: 'No Reservations' },
  { value: 'parts_unknown',   label: 'Parts Unknown'   },
  { value: 'the_layover',     label: 'The Layover'     },
]

const EMPTY_FORM = {
  show:          'no_reservations' as BourdainShow,
  season:        '',
  episode:       '',
  episode_title: '',
  location_name: '',
  city:          '',
  country:       '',
  lat:           '',
  lng:           '',
  description:   '',
  air_date:      '',
  notes:         '',
}

type FormState = typeof EMPTY_FORM

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-brand-50/50 uppercase tracking-wider mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full bg-brand-900 border border-brand-700/50 text-brand-50 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500 placeholder:text-brand-50/20'

export default function LocationFormPage() {
  const { id } = useParams<{ id: string }>()
  const isNew   = !id || id === 'new'
  const navigate = useNavigate()
  const qc       = useQueryClient()

  const [form, setForm]       = useState<FormState>(EMPTY_FORM)
  const [geocoding, setGeocoding] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin', 'location', id],
    queryFn:  () => fetchLocationById(id!),
    enabled:  !isNew,
  })

  useEffect(() => {
    if (existing) {
      setForm({
        show:          existing.show,
        season:        existing.season?.toString() ?? '',
        episode:       existing.episode?.toString() ?? '',
        episode_title: existing.episode_title ?? '',
        location_name: existing.location_name,
        city:          existing.city,
        country:       existing.country,
        lat:           existing.lat.toString(),
        lng:           existing.lng.toString(),
        description:   existing.description ?? '',
        air_date:      existing.air_date ?? '',
        notes:         existing.notes ?? '',
      })
    }
  }, [existing])

  const saveMut = useMutation({
    mutationFn: () => upsertLocation({
      ...(isNew ? {} : { id }),
      show:          form.show,
      season:        form.season ? parseInt(form.season) : null,
      episode:       form.episode ? parseInt(form.episode) : null,
      episode_title: form.episode_title || null,
      location_name: form.location_name,
      city:          form.city,
      country:       form.country,
      lat:           parseFloat(form.lat),
      lng:           parseFloat(form.lng),
      description:   form.description || null,
      air_date:      form.air_date || null,
      notes:         form.notes || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'bourdain_locations'] })
      qc.invalidateQueries({ queryKey: ['bourdain_locations'] })
      navigate('/admin/locations')
    },
  })

  const deleteMut = useMutation({
    mutationFn: () => deleteLocation(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'bourdain_locations'] })
      qc.invalidateQueries({ queryKey: ['bourdain_locations'] })
      navigate('/admin/locations')
    },
  })

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function geocode() {
    const query = [form.location_name, form.city, form.country].filter(Boolean).join(', ')
    if (!query) return
    setGeocoding(true)
    try {
      const res  = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1`)
      const data = await res.json()
      const center = data.features?.[0]?.center as [number, number] | undefined
      if (center) setForm(f => ({ ...f, lng: center[0].toString(), lat: center[1].toString() }))
    } finally {
      setGeocoding(false)
    }
  }

  const canSave = form.location_name && form.city && form.country && form.lat && form.lng
  const hasError = saveMut.isError || deleteMut.isError

  if (!isNew && isLoading) {
    return <div className="p-8 text-brand-50/40">Loading…</div>
  }

  return (
    <div className="p-6 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-brand-50/40 mb-6">
        <Link to="/admin/locations" className="hover:text-brand-300 transition-colors">Locations</Link>
        <span>/</span>
        <span className="text-brand-50/70">{isNew ? 'New Location' : (existing?.location_name ?? 'Edit')}</span>
      </div>

      <h1 className="text-xl font-bold text-brand-300 mb-6">
        {isNew ? 'Add Location' : 'Edit Location'}
      </h1>

      <div className="space-y-4">
        {/* Show */}
        <Field label="Show">
          <select value={form.show} onChange={set('show')} className={inputCls}>
            {SHOWS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>

        {/* Season + Episode */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Season">
            <input type="number" min="1" value={form.season} onChange={set('season')} className={inputCls} placeholder="e.g. 3" />
          </Field>
          <Field label="Episode">
            <input type="number" min="1" value={form.episode} onChange={set('episode')} className={inputCls} placeholder="e.g. 7" />
          </Field>
        </div>

        {/* Episode title */}
        <Field label="Episode Title">
          <input type="text" value={form.episode_title} onChange={set('episode_title')} className={inputCls} placeholder="e.g. Los Angeles" />
        </Field>

        {/* Location name */}
        <Field label="Location Name *">
          <input type="text" value={form.location_name} onChange={set('location_name')} className={inputCls} placeholder="e.g. Roscoe's Chicken and Waffles" />
        </Field>

        {/* City + Country */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="City *">
            <input type="text" value={form.city} onChange={set('city')} className={inputCls} placeholder="e.g. Los Angeles" />
          </Field>
          <Field label="Country *">
            <input type="text" value={form.country} onChange={set('country')} className={inputCls} placeholder="e.g. USA" />
          </Field>
        </div>

        {/* Lat + Lng + Geocode */}
        <Field label="Coordinates *">
          <div className="flex gap-2">
            <input
              type="number" step="any" value={form.lat} onChange={set('lat')}
              className={`${inputCls} flex-1`} placeholder="Latitude"
            />
            <input
              type="number" step="any" value={form.lng} onChange={set('lng')}
              className={`${inputCls} flex-1`} placeholder="Longitude"
            />
            <button
              type="button"
              onClick={geocode}
              disabled={geocoding}
              className="px-3 py-2 bg-brand-700/50 hover:bg-brand-700 text-brand-50/70 hover:text-brand-50 text-sm rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {geocoding ? '…' : 'Geocode'}
            </button>
          </div>
          <p className="text-brand-50/30 text-xs mt-1">Geocode fills from Location Name + City + Country via Mapbox.</p>
        </Field>

        {/* Air date */}
        <Field label="Air Date">
          <input type="date" value={form.air_date} onChange={set('air_date')} className={inputCls} />
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea
            value={form.description} onChange={set('description')}
            rows={4} className={`${inputCls} resize-y`}
            placeholder="Episode summary or notes about what Bourdain ate here…"
          />
        </Field>

        {/* Notes */}
        <Field label="Notes">
          <textarea
            value={form.notes} onChange={set('notes')}
            rows={2} className={`${inputCls} resize-y`}
            placeholder="Admin notes…"
          />
        </Field>
      </div>

      {/* Error */}
      {hasError && (
        <p className="mt-4 text-sm text-red-400">
          {(saveMut.error as Error)?.message ?? (deleteMut.error as Error)?.message ?? 'Something went wrong.'}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-6 pt-6 border-t border-brand-700/30">
        <button
          onClick={() => saveMut.mutate()}
          disabled={!canSave || saveMut.isPending}
          className="px-5 py-2 bg-brand-500 hover:bg-brand-500/80 text-brand-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
        >
          {saveMut.isPending ? 'Saving…' : isNew ? 'Create Location' : 'Save Changes'}
        </button>
        <Link
          to="/admin/locations"
          className="px-4 py-2 text-brand-50/50 hover:text-brand-50 text-sm transition-colors"
        >
          Cancel
        </Link>

        {!isNew && (
          <div className="ml-auto">
            {confirmDel ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-brand-50/40">Delete this location?</span>
                <button
                  onClick={() => deleteMut.mutate()}
                  disabled={deleteMut.isPending}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  {deleteMut.isPending ? '…' : 'Yes, delete'}
                </button>
                <button
                  onClick={() => setConfirmDel(false)}
                  className="text-sm text-brand-50/30 hover:text-brand-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDel(true)}
                className="text-sm text-brand-50/30 hover:text-red-400 transition-colors"
              >
                Delete location
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
