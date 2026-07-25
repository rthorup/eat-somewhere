import { Link } from 'react-router-dom'
import type { Restaurant } from '@/types'

interface Props {
  restaurant: Restaurant
}

export default function RestaurantCard({ restaurant }: Props) {
  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="block bg-brand-900/50 border border-brand-700/30 rounded-xl p-5 hover:border-brand-500/40 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-brand-50 leading-snug group-hover:text-brand-300 transition-colors">
          {restaurant.name}
        </h3>
        {restaurant.cuisine_type && (
          <span className="text-xs text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
            {restaurant.cuisine_type}
          </span>
        )}
      </div>
      <p className="text-brand-50/40 text-xs mb-3">
        {restaurant.city}, {restaurant.country}
      </p>
      {restaurant.description && (
        <p className="text-brand-50/60 text-sm leading-relaxed line-clamp-3">
          {restaurant.description}
        </p>
      )}
    </Link>
  )
}
