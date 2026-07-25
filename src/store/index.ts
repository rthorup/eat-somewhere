import { create } from 'zustand'
import type { MapFilters } from '@/types'

interface AppState {
  filters: MapFilters
  selectedLocationId: string | null
  sidebarOpen: boolean
  setFilters: (filters: Partial<MapFilters>) => void
  setSelectedLocation: (id: string | null) => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  filters: { show: null, country: null, season: null },
  selectedLocationId: null,
  sidebarOpen: false,
  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),
  setSelectedLocation: (selectedLocationId) =>
    set({ selectedLocationId, sidebarOpen: selectedLocationId !== null }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))
