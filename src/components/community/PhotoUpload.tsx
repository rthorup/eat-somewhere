import { useState, useRef } from 'react'
import type { ChangeEvent } from 'react'
import { uploadPhoto } from '@/services/storage'
import { addImage } from '@/services/restaurants'

interface Props {
  restaurantId: string
  userId: string
  onUploaded: () => void
}

export default function PhotoUpload({ restaurantId, userId, onUploaded }: Props) {
  const inputRef  = useRef<HTMLInputElement>(null)
  const [file,    setFile]    = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError(null)
  }

  function cancel() {
    setFile(null)
    setPreview(null)
    setCaption('')
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const { storagePath } = await uploadPhoto(userId, file)
      await addImage({
        restaurant_id: restaurantId,
        user_id:       userId,
        storage_path:  storagePath,
        caption:       caption.trim() || null,
      })
      onUploaded()
      cancel()
    } catch (e) {
      setError((e as Error).message ?? 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  if (!file) {
    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-sm text-brand-50/40 hover:text-brand-300 transition-colors border border-dashed border-brand-700/40 hover:border-brand-500/50 rounded-lg px-4 py-3 w-full text-center"
        >
          + Add a photo
        </button>
      </>
    )
  }

  return (
    <div className="border border-brand-700/40 rounded-lg overflow-hidden">
      {preview && (
        <div className="relative aspect-video bg-brand-900">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-3 space-y-3">
        <textarea
          rows={2}
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="What's in this photo? What should people know? (hover caption)"
          className="w-full bg-brand-900 border border-brand-700/50 text-brand-50 text-sm rounded-lg px-3 py-2 placeholder:text-brand-50/20 focus:outline-none focus:border-brand-500 resize-none"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-1.5 bg-brand-500 hover:bg-brand-500/80 text-brand-50 text-sm rounded-lg transition-colors disabled:opacity-40"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
          <button
            type="button"
            onClick={cancel}
            className="text-sm text-brand-50/30 hover:text-brand-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
