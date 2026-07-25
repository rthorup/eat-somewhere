import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import AdminShell from '@/components/layout/AdminShell'
import LandingPage from '@/pages/LandingPage'
import ExplorePage from '@/pages/ExplorePage'
import FindPage from '@/pages/FindPage'
import SharePage from '@/pages/SharePage'
import RestaurantPage from '@/pages/RestaurantPage'
import LoginPage from '@/pages/auth/LoginPage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminLocationsPage from '@/pages/admin/AdminLocationsPage'
import AdminRestaurantsPage from '@/pages/admin/AdminRestaurantsPage'
import LocationFormPage from '@/pages/admin/LocationFormPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route element={<AppShell />}>
              <Route path="/"               element={<LandingPage />} />
              <Route path="/explore"        element={<ExplorePage />} />
              <Route path="/find"           element={<FindPage />} />
              <Route path="/share"          element={<SharePage />} />
              <Route path="/restaurants/:id" element={<RestaurantPage />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="locations"          element={<AdminLocationsPage />} />
              <Route path="locations/new"      element={<LocationFormPage />} />
              <Route path="locations/:id/edit" element={<LocationFormPage />} />
              <Route path="restaurants"        element={<AdminRestaurantsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
