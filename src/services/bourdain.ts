import { supabase } from '@/lib/supabase'
import type { BourdainLocation, MapFilters } from '@/types'

export async function fetchLocations(filters: MapFilters): Promise<BourdainLocation[]> {
  let query = supabase.from('bourdain_locations').select('*')
  if (filters.show)    query = query.eq('show', filters.show)
  if (filters.country) query = query.eq('country', filters.country)
  if (filters.season)  query = query.eq('season', filters.season)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function fetchLocationById(id: string): Promise<BourdainLocation | null> {
  const { data, error } = await supabase
    .from('bourdain_locations')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function upsertLocation(
  location: Omit<BourdainLocation, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<BourdainLocation> {
  const { data, error } = await supabase
    .from('bourdain_locations')
    .upsert(location)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLocation(id: string): Promise<void> {
  const { error } = await supabase.from('bourdain_locations').delete().eq('id', id)
  if (error) throw error
}

export async function fetchCountries(): Promise<string[]> {
  const { data, error } = await supabase
    .from('bourdain_locations')
    .select('country')
  if (error) throw error
  return [...new Set((data ?? []).map((r: { country: string }) => r.country))].sort()
}
