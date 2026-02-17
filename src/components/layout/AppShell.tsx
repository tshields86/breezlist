import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header.tsx'
import { BottomNav } from '@/components/layout/BottomNav.tsx'
import { InstallBanner } from '@/components/ui/InstallBanner.tsx'

export function AppShell() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Header />
      <div className="max-w-lg mx-auto">
        <InstallBanner />
      </div>
      <main className="pb-[calc(5rem+env(safe-area-inset-bottom,0px))] max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
