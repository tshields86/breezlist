import type { ThemeMode } from '@/types/index.ts'

/** Storage key + cookie name for the persisted theme preference. */
export const THEME_KEY = 'breezlist-theme'

const LIGHT_BG = '#f4f8ff'
const DARK_BG = '#0b1220'

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readThemeCookie(): ThemeMode | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|; )breezlist-theme=(light|dark|system)/)
  return match ? (match[1] as ThemeMode) : null
}

/** Preference resolution: cross-domain cookie → localStorage → system. */
export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const fromCookie = readThemeCookie()
  if (fromCookie) return fromCookie
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

/**
 * Persist the preference to localStorage and a cookie. On *.breezlist.com the
 * cookie is scoped to the parent domain so marketing and app share it; elsewhere
 * (dev, preview deploys) it falls back to a host-only cookie.
 */
export function persistTheme(theme: ThemeMode): void {
  localStorage.setItem(THEME_KEY, theme)
  const onBreezlist = location.hostname === 'breezlist.com' || location.hostname.endsWith('.breezlist.com')
  const domain = onBreezlist ? '; domain=.breezlist.com' : ''
  document.cookie = `${THEME_KEY}=${theme}; path=/; max-age=31536000; samesite=lax${domain}`
}

/** Keep the browser/PWA chrome colour in sync with the resolved theme. */
export function applyThemeColorMeta(resolved: 'light' | 'dark'): void {
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', resolved === 'dark' ? DARK_BG : LIGHT_BG)
}
