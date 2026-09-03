import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchRestaurants } from '@/services/restaurants'
import RestaurantCard from '@/components/community/RestaurantCard'

export default function LandingPage() {
  const { data: recent = [] } = useQuery({
    queryKey: ['restaurants', 'recent'],
    queryFn: () => fetchRestaurants({ limit: 6 }),
    staleTime: 60_000,
  })

  return (
    <div>
      {/* Hero: two-panel choice */}
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-3rem)]">
        {/* Bourdain panel */}
        <Link
          to="/explore"
          className="relative flex flex-col justify-end p-10 md:p-16 border-b md:border-b-0 md:border-r border-brand-700/30 group overflow-hidden min-h-[50vh] md:min-h-0"
        >
          {/* Background photo */}
          <img
            src="/landing-page.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700"
          />
          {/* Gradient: dark at bottom for text, fading up */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/70 to-brand-950/20" />

          {/* Content */}
          <div className="relative z-10">
            <p className="text-xs text-brand-500 uppercase tracking-widest mb-4 font-semibold">
              The Map
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-50 leading-tight mb-4">
              The World Through Bourdain
            </h2>
            <p className="text-brand-50/60 text-base leading-relaxed mb-8 max-w-sm">
              Every restaurant, market, and dive bar he visited. 500+ locations from No Reservations, Parts Unknown, and The Layover.
            </p>
            <span className="text-brand-300 text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
              Explore the Map →
            </span>
          </div>
        </Link>

        {/* Find panel */}
        <Link
          to="/find"
          className="relative flex flex-col justify-end p-10 md:p-16 group overflow-hidden min-h-[50vh] md:min-h-0"
        >
          {/* Background photo */}
          <img
            src="/restaurant.jpeg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700"
          />
          {/* Gradient: dark at bottom for text, fading up */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/70 to-brand-950/20" />

          {/* Content */}
          <div className="relative z-10">
            <p className="text-xs text-brand-500 uppercase tracking-widest mb-4 font-semibold">
              Community
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-50 leading-tight mb-4">
              Find Somewhere Worth Going
            </h2>
            <p className="text-brand-50/60 text-base leading-relaxed mb-8 max-w-sm">
              Not reviews. Reasons to go. Real places shared by people who were moved enough to write it down.
            </p>
            <span className="text-brand-300 text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
              Browse Places →
            </span>
          </div>
        </Link>
      </div>

      {/* Recently shared */}
      {recent.length > 0 && (
        <div className="border-t border-brand-700/30 py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-50/40 mb-8">
              Recently Shared
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recent.map(r => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                to="/find"
                className="text-sm text-brand-50/40 hover:text-brand-300 transition-colors"
              >
                See all places →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
