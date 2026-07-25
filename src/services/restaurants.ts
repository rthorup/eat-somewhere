import { supabase } from '@/lib/supabase'
import type { Restaurant, RestaurantComment, RestaurantImage } from '@/types'

interface RestaurantFilters {
  city?: string
  cuisine_type?: string
  limit?: number
}

export async function fetchRestaurants(filters: RestaurantFilters = {}): Promise<Restaurant[]> {
  let query = supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters.city)         query = query.ilike('city', `%${filters.city}%`)
  if (filters.cuisine_type) query = query.eq('cuisine_type', filters.cuisine_type)
  if (filters.limit)        query = query.limit(filters.limit)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function fetchRestaurantById(id: string): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createRestaurant(
  restaurant: Omit<Restaurant, 'id' | 'created_at'>
): Promise<Restaurant> {
  const { data, error } = await supabase
    .from('restaurants')
    .insert(restaurant)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function addImage(
  image: Omit<RestaurantImage, 'id' | 'created_at'>
): Promise<RestaurantImage> {
  const { data, error } = await supabase
    .from('restaurant_images')
    .insert(image)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchImages(restaurantId: string): Promise<RestaurantImage[]> {
  const { data, error } = await supabase
    .from('restaurant_images')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at')
  if (error) throw error
  return data ?? []
}

export async function fetchComments(restaurantId: string): Promise<RestaurantComment[]> {
  const { data, error } = await supabase
    .from('restaurant_comments')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at')
  if (error) throw error
  return data ?? []
}

export async function addComment(restaurantId: string, userId: string, body: string): Promise<RestaurantComment> {
  const { data, error } = await supabase
    .from('restaurant_comments')
    .insert({ restaurant_id: restaurantId, user_id: userId, body })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchVoteCount(restaurantId: string): Promise<number> {
  const { count, error } = await supabase
    .from('restaurant_votes')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurantId)
  if (error) throw error
  return count ?? 0
}

export async function addVote(restaurantId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('restaurant_votes')
    .insert({ restaurant_id: restaurantId, user_id: userId })
  if (error) throw error
}

export async function removeVote(restaurantId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('restaurant_votes')
    .delete()
    .eq('restaurant_id', restaurantId)
    .eq('user_id', userId)
  if (error) throw error
}
