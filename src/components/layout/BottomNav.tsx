import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils.ts'
import { navItems } from '@/components/layout/navItems.tsx'

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border safe-area-bottom z-40 lg:hidden">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 w-20 h-full font-semibold transition-colors',
                isActive ? 'text-accent-text' : 'text-text-muted hover:text-text-secondary',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'grid place-items-center rounded-xl px-4 py-1 transition-colors',
                    isActive && 'grad-chip',
                  )}
                >
                  {item.icon}
                </span>
                <span className="text-xs">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
