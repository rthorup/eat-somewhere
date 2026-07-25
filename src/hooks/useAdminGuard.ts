import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function useAdminGuard() {
  const { session, loading, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!session) {
      navigate('/login?returnTo=/admin', { replace: true })
    } else if (!isAdmin) {
      navigate('/', { replace: true })
    }
  }, [session, loading, isAdmin, navigate])

  return { loading, isAdmin }
}
