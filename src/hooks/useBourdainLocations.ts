import { useQuery } from '@tanstack/react-query'
import { fetchLocations } from '@/services/bourdain'
import { useAppStore } from '@/store'

export function useBourdainLocations() {
  const filters = useAppStore((s) => s.filters)
  return useQuery({
    queryKey: ['bourdain_locations', filters],
    queryFn: () => fetchLocations(filters),
    staleTime: 5 * 60 * 1000,
  })
}
