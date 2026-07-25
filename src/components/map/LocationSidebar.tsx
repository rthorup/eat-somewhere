import type { BourdainLocation } from '@/types'

const SHOW_LABELS: Record<string, string> = {
  no_reservations: 'No Reservations',
  parts_unknown:   'Parts Unknown',
  the_layover:     'The Layover',
}

const SHOW_COLORS: Record<string, string> = {
  no_reservations: 'text-brand-500',
  parts_unknown:   'text-brand-300',
  the_layover:     'text-brand-50/50',
}

interface Props {
  location: BourdainLocation | null
  onClose: () => void
}

export default function LocationSidebar({ location, onClose }: Props) {
  if (!location) return null

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-brand-950/95 backdrop-blur border-l border-brand-700/40 flex flex-col z-10 shadow-2xl">
      <div className="flex items-start justify-between p-5 border-b border-brand-700/40">
        <div>
          <span className={`text-xs font-semibold uppercase tracking-widest ${SHOW_COLORS[location.show]}`}>
            {SHOW_LABELS[location.show]}
          </span>
          {location.season && location.episode && (
            <p className="text-brand-50/30 text-xs mt-0.5">
              S{location.season} · E{location.episode}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-brand-50/30 hover:text-brand-50 transition-colors text-lg leading-none mt-0.5"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-brand-50 leading-snug">
            {location.episode_title ?? location.location_name}
          </h2>
          <p className="text-brand-50/50 text-sm mt-1">
            {location.city}{location.city !== location.country ? `, ${location.country}` : ''}
          </p>
        </div>

        {location.air_date && (
          <div>
            <p className="text-xs text-brand-300/60 uppercase tracking-wider mb-1">Aired</p>
            <p className="text-sm text-brand-50/60">
              {new Date(location.air_date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>
        )}

        {location.description && (
          <div>
            <p className="text-xs text-brand-300/60 uppercase tracking-wider mb-1">About</p>
            <p className="text-sm text-brand-50/70 leading-relaxed">{location.description}</p>
          </div>
        )}

        {location.notes && (
          <div className="border-t border-brand-700/30 pt-4">
            <p className="text-xs text-brand-300/60 uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-brand-50/50 leading-relaxed">{location.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
