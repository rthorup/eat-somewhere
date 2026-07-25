import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = params.get('returnTo') ?? '/explore'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError(error)
      setLoading(false)
    } else {
      navigate(returnTo, { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-brand-300">Eat Somewhere</h1>
          <p className="text-brand-50/40 text-sm mt-1">Sign in to contribute</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-brand-900 rounded-2xl border border-brand-700/40 p-8 space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-brand-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-brand-950 border border-brand-700/50 px-3 py-2 text-sm text-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-brand-50/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-brand-300 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-brand-950 border border-brand-700/50 px-3 py-2 text-sm text-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
