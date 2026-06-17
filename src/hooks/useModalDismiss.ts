import { useEffect } from 'react'

/**
 * Shared modal behavior: while `open`, lock background scroll and close on Escape.
 * The viewport scroll container is the documentElement (<html>), so we lock that
 * — locking <body> alone does not freeze the page.
 */
export function useModalDismiss(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const prevOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      root.style.overflow = prevOverflow
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])
}
