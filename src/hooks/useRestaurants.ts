import { useQuery } from '@tanstack/react-query'
import { fetchRestaurants } from '@/services/restaurants'

export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants,
  })
}
