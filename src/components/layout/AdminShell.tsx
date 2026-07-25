import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useAdminGuard } from '@/hooks/useAdminGuard'

const navItems = [
  { to: '/admin',             label: 'Overview',     end: true },
  { to: '/admin/locations',   label: 'Locations',    end: false },
  { to: '/admin/restaurants', label: 'Restaurants',  end: false },
]

export default function AdminShell() {
  const { loading } = useAdminGuard()
  const { session, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-950 flex items-center justify-center">
        <span className="text-brand-300 text-sm">Loading…</span>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-brand-950">
      <aside className="w-52 flex-shrink-0 bg-brand-900 border-r border-brand-700/40 flex flex-col">
        <div className="px-5 py-4 border-b border-brand-700/40">
          <p className="text-brand-300 font-semibold text-sm">Eat Somewhere</p>
          <p className="text-brand-50/30 text-xs mt-0.5">Admin</p>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-700/50 text-brand-300'
                    : 'text-brand-50/50 hover:text-brand-50 hover:bg-brand-700/20'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-brand-700/40">
          <p className="text-brand-50/30 text-xs truncate mb-2">{session?.user.email}</p>
          <button onClick={signOut} className="text-xs text-brand-50/30 hover:text-red-400 transition-colors">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
