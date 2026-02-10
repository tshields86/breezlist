import { Logo } from '@/components/ui/Logo.tsx'
import { ThemeToggle } from '@/components/ui/ThemeToggle.tsx'
import { useAuth } from '@/hooks/useAuth.ts'

export function Header() {
  const { signOut } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <Logo className="text-xl" />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={signOut}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-text-secondary hover:bg-bg-tertiary transition-colors"
            aria-label="Sign out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
