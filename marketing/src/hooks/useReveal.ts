'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Reveals content once it scrolls into view (for a subtle fade-in-up entrance).
 * Falls back to immediately visible when the user prefers reduced motion, so
 * content is never left hidden. Returns a ref to attach to the observed element
 * and a `visible` flag to drive the animation class.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}
