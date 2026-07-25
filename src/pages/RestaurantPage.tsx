import { useState } from 'react'
import type { FormEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchRestaurantById, fetchComments, addComment, fetchImages } from '@/services/restaurants'
import { useAuth } from '@/contexts/AuthContext'
import PhotoGallery from '@/components/community/PhotoGallery'
import PhotoUpload from '@/components/community/PhotoUpload'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days  = Math.floor(diff / 86_400_000)
  const hours = Math.floor(diff / 3_600_000)
  const mins  = Math.floor(diff / 60_000)
  if (days  > 30)  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  if (days  >= 1)  return `${days}d ago`
  if (hours >= 1)  return `${hours}h ago`
  if (mins  >= 1)  return `${mins}m ago`
  return 'just now'
}

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>()
  const { session } = useAuth()
  const qc = useQueryClient()
  const [comment, setComment] = useState('')

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => fetchRestaurantById(id!),
    enabled: !!id,
  })

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => fetchComments(id!),
    enabled: !!id,
  })

  const { data: images = [], refetch: refetchImages } = useQuery({
    queryKey: ['images', id],
    queryFn: () => fetchImages(id!),
    enabled: !!id,
  })

  const commentMut = useMutation({
    mutationFn: () => addComment(id!, session!.user.id, comment.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', id] })
      setComment('')
    },
  })

  function handleComment(e: FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return
    commentMut.mutate()
  }

  if (isLoading) {
    return <div className="max-w-3xl mx-auto px-6 py-10 text-brand-50/30">Loading…</div>
  }

  if (!restaurant) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 text-center">
        <p className="text-brand-50/30 mb-4">Place not found.</p>
        <Link to="/find" className="text-sm text-brand-300 hover:text-brand-50 transition-colors">
          ← Back to Find
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-brand-50/40 mb-8">
        <Link to="/find" className="hover:text-brand-300 transition-colors">Find</Link>
        <span>/</span>
        <span className="text-brand-50/70 truncate">{restaurant.name}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-3xl font-bold text-brand-50 leading-tight">{restaurant.name}</h1>
          {restaurant.cuisine_type && (
            <span className="shrink-0 text-sm text-brand-500 bg-brand-500/10 px-3 py-1 rounded-full">
              {restaurant.cuisine_type}
            </span>
          )}
        </div>
        <p className="text-brand-50/40 text-sm">
          {restaurant.city}, {restaurant.country}
        </p>
        {restaurant.website && (
          <a
            href={restaurant.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-300/60 hover:text-brand-300 transition-colors mt-1 inline-block"
          >
            {restaurant.website.replace(/^https?:\/\//, '')} ↗
          </a>
        )}
      </div>

      {/* The story */}
      {restaurant.description && (
        <div className="mb-12">
          <p className="text-xs text-brand-50/30 uppercase tracking-widest mb-4">Why you should go</p>
          <p className="text-brand-50/80 text-lg leading-loose">{restaurant.description}</p>
        </div>
      )}

      {/* Photos */}
      {(images.length > 0 || session) && (
        <div className="mb-12">
          <p className="text-xs text-brand-50/30 uppercase tracking-widest mb-4">Photos</p>
          <div className="space-y-3">
            <PhotoGallery images={images} />
            {session && (
              <PhotoUpload
                restaurantId={restaurant.id}
                userId={session.user.id}
                onUploaded={() => refetchImages()}
              />
            )}
          </div>
        </div>
      )}

      <div className="border-t border-brand-700/30 pt-10">
        {/* Others who went */}
        <p className="text-xs text-brand-50/30 uppercase tracking-widest mb-6">
          Others who went {comments.length > 0 && `(${comments.length})`}
        </p>

        {comments.length > 0 ? (
          <div className="space-y-6 mb-8">
            {comments.map(c => (
              <div key={c.id} className="flex gap-4">
                <div className="w-1 shrink-0 bg-brand-700/40 rounded-full" />
                <div>
                  <p className="text-brand-50/70 text-sm leading-relaxed mb-1">{c.body}</p>
                  <p className="text-brand-50/25 text-xs">{timeAgo(c.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-brand-50/20 text-sm mb-8">
            No other visits yet.
          </p>
        )}

        {/* Add comment */}
        {session ? (
          <form onSubmit={handleComment} className="space-y-3">
            <textarea
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add your own reason to go…"
              className="w-full bg-brand-900 border border-brand-700/50 text-brand-50 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500 placeholder:text-brand-50/20 resize-none"
            />
            {commentMut.isError && (
              <p className="text-xs text-red-400">
                {(commentMut.error as Error)?.message ?? 'Could not post.'}
              </p>
            )}
            <button
              type="submit"
              disabled={!comment.trim() || commentMut.isPending}
              className="px-4 py-2 bg-brand-700/60 hover:bg-brand-700 text-brand-50/80 hover:text-brand-50 text-sm rounded-lg transition-colors disabled:opacity-40"
            >
              {commentMut.isPending ? 'Posting…' : 'Share your visit'}
            </button>
          </form>
        ) : (
          <p className="text-brand-50/30 text-sm">
            <Link to={`/login?returnTo=/restaurants/${id}`} className="text-brand-300 hover:text-brand-50 transition-colors">
              Sign in
            </Link>{' '}
            to share your own visit.
          </p>
        )}
      </div>
    </div>
  )
}
