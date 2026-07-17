import { Outlet, useMatch } from 'react-router-dom'
import { Header } from '@/components/layout/Header.tsx'
import { BottomNav } from '@/components/layout/BottomNav.tsx'
import { Sidebar } from '@/components/layout/Sidebar.tsx'
import { InstallBanner } from '@/components/ui/InstallBanner.tsx'
import { cn } from '@/lib/utils.ts'

export function AppShell() {
  // The list detail view provides its own contextual header, so the global
  // mobile header is suppressed there (avoids a stacked double header).
  const isListDetail = useMatch('/lists/:id')
  // The lists grid wants the full desktop width; reading views stay narrower.
  const isGrid = useMatch('/lists')
  const contentWidth = isGrid ? 'lg:max-w-5xl' : 'lg:max-w-2xl'

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary lg:flex">
      <Sidebar />

      <div className="min-w-0 flex-1">
        {!isListDetail && <Header />}

        <div className={cn('mx-auto w-full max-w-lg lg:px-8', contentWidth)}>
          <InstallBanner />
        </div>

        <main
          className={cn(
            'mx-auto w-full max-w-lg pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:px-8 lg:pb-12 lg:pt-4',
            contentWidth,
          )}
        >
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
