import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-brand-950">
      <Navbar />
      <main className="pt-12">
        <Outlet />
      </main>
    </div>
  )
}
