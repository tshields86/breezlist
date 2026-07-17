import { useEffect } from 'react'
import { Outlet, useMatch, useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header.tsx'
import { BottomNav } from '@/components/layout/BottomNav.tsx'
import { Sidebar } from '@/components/layout/Sidebar.tsx'
import { InstallBanner } from '@/components/ui/InstallBanner.tsx'
import { supabase } from '@/lib/supabase.ts'
import { cn } from '@/lib/utils.ts'

export function AppShell() {
  const navigate = useNavigate()

  // A share link opened while logged out stashes its token; once the user is
  // authenticated and lands here, join the list and drop them into it.
  useEffect(() => {
    const token = sessionStorage.getItem('pendingShareToken')
    if (!token) return
    sessionStorage.removeItem('pendingShareToken')
    supabase.rpc('join_via_share_link', { _token: token }).then(({ data, error }) => {
      if (!error && data) navigate(`/lists/${data}`)
    })
  }, [navigate])

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
