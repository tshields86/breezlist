import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header.tsx'
import { BottomNav } from '@/components/layout/BottomNav.tsx'

export function AppShell() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Header />
      <main className="pb-20 max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
