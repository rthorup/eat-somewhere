import { supabase } from '@/lib/supabase'

const BUCKET = 'restaurant-photos'

export async function uploadPhoto(
  userId: string,
  file: File
): Promise<{ storagePath: string; publicUrl: string }> {
  const ext = file.name.split('.').pop()
  const storagePath = `${userId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, file)
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  return { storagePath, publicUrl: data.publicUrl }
}

export function getPublicUrl(storagePath: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}
