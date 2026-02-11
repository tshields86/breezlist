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
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-bg-primary/80 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <a href="/" aria-label="Breezlist home">
          <Logo className="text-2xl" />
        </a>

        <div className="flex items-center gap-8">
          <a href="#features" className="hidden sm:block text-sm text-text-secondary hover:text-text-primary transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hidden sm:block text-sm text-text-secondary hover:text-text-primary transition-colors">
            How It Works
          </a>
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
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
            className="inline-flex items-center px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  )
}
