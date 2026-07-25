import { getPublicUrl } from '@/services/storage'
import type { RestaurantImage } from '@/types'

interface Props {
  images: RestaurantImage[]
}

export default function PhotoGallery({ images }: Props) {
  if (images.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {images.map(img => (
        <div
          key={img.id}
          className="relative aspect-square overflow-hidden rounded-lg group bg-brand-900"
        >
          <img
            src={getPublicUrl(img.storage_path)}
            alt={img.caption ?? ''}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {img.caption && (
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-brand-950/90 via-brand-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3">
              <p className="text-brand-50 text-xs leading-relaxed">{img.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
