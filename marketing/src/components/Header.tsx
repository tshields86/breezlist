'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { Logo } from './Logo'

function getScrolled() {
  return typeof window !== 'undefined' && window.scrollY > 10
}

function subscribeScroll(callback: () => void) {
  window.addEventListener('scroll', callback, { passive: true })
  return () => window.removeEventListener('scroll', callback)
}

function getIsDark() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
}

export function Header() {
  const scrolled = useSyncExternalStore(subscribeScroll, getScrolled, () => false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(getIsDark())
  }, []) // eslint-disable-line react-hooks/set-state-in-effect

  function toggleTheme() {
    const next = !dark
    const value = next ? 'dark' : 'light'
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('breezlist-theme', value)
    // Shared across *.breezlist.com so the app picks up the same preference.
    const onBreezlist =
      location.hostname === 'breezlist.com' || location.hostname.endsWith('.breezlist.com')
    const domain = onBreezlist ? '; domain=.breezlist.com' : ''
    document.cookie = `breezlist-theme=${value}; path=/; max-age=31536000; samesite=lax${domain}`
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? 'glass border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3.5">
        <a href="/" aria-label="Breezlist home">
          <Logo withMark markSize={32} className="text-xl" />
        </a>

        <div className="flex items-center gap-6 sm:gap-8">
          <a
            href="#features"
            className="hidden sm:block text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="hidden sm:block text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            How it works
          </a>
          <button
            onClick={toggleTheme}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <a
            href="https://app.breezlist.com/signup"
            className="grad-sky shadow-sky inline-flex items-center px-4 py-2 rounded-xl text-white text-sm font-bold transition-transform hover:-translate-y-0.5"
          >
            Open app
          </a>
        </div>
      </div>
    </header>
  )
}
