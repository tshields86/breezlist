import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import type { ThemeMode } from '@/types/index.ts'
import { applyThemeColorMeta, getStoredTheme, getSystemTheme, persistTheme } from '@/lib/theme.ts'

interface ThemeContextValue {
  theme: ThemeMode
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme)
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme)

  const resolvedTheme = theme === 'system' ? systemTheme : theme

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme)
    persistTheme(newTheme)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    applyThemeColorMeta(resolvedTheme)
  }, [resolvedTheme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
