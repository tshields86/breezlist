import { NavLink } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo.tsx'
import { ThemeToggle } from '@/components/ui/ThemeToggle.tsx'
import { navItems } from '@/components/layout/navItems.tsx'
import { useAuth } from '@/hooks/useAuth.ts'
import { cn } from '@/lib/utils.ts'

/** Persistent desktop navigation. Replaces the mobile header + bottom nav at lg+. */
export function Sidebar() {
  const { signOut } = useAuth()

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-bg-secondary/40 px-4 py-6 lg:flex">
      <div className="px-2">
        <Logo withMark markSize={32} className="text-xl" />
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition-colors',
                isActive
                  ? 'grad-chip text-accent-text'
                  : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary',
              )
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <ThemeToggle />
        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
