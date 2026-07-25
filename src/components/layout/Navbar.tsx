import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { session, isAdmin, signOut } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-brand-950/90 backdrop-blur border-b border-brand-900">
      <Link to="/" className="text-brand-300 font-semibold tracking-wide text-sm uppercase hover:text-brand-50 transition-colors">
        Eat Somewhere
      </Link>

      <div className="flex items-center gap-6 text-sm">
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            isActive ? 'text-brand-300' : 'text-brand-50/60 hover:text-brand-50 transition-colors'
          }
        >
          Bourdain
        </NavLink>
        <NavLink
          to="/find"
          className={({ isActive }) =>
            isActive ? 'text-brand-300' : 'text-brand-50/60 hover:text-brand-50 transition-colors'
          }
        >
          Find
        </NavLink>
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              isActive ? 'text-brand-300' : 'text-brand-50/60 hover:text-brand-50 transition-colors'
            }
          >
            Admin
          </NavLink>
        )}
        {session ? (
          <button
            onClick={signOut}
            className="text-brand-50/40 hover:text-brand-50/80 transition-colors"
          >
            Sign out
          </button>
        ) : (
          <NavLink
            to="/login"
            className="px-3 py-1 rounded bg-brand-500 text-white text-xs font-medium hover:bg-brand-700 transition-colors"
          >
            Sign in
          </NavLink>
        )}
      </div>
    </nav>
  )
}
