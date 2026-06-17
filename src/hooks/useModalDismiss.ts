import { useEffect, useRef } from 'react'

/**
 * Shared modal behavior: while `open`, lock background scroll and close on Escape.
 *
 * We use the `position: fixed` body-lock rather than `overflow: hidden`. On iOS
 * Safari, `overflow: hidden` stops scrolling only until the soft keyboard opens —
 * once an input inside the modal is focused, the page scrolls behind the lock.
 * Pinning the body (offset by the current scroll position) takes the page out of
 * flow entirely, so it stays put even with the keyboard up. Scroll is restored
 * on close.
 */
export function useModalDismiss(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const body = document.body
    const scrollY = window.scrollY
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    }

    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', handleKey)

    return () => {
      body.style.position = prev.position
      body.style.top = prev.top
      body.style.left = prev.left
      body.style.right = prev.right
      body.style.width = prev.width
      body.style.overflow = prev.overflow
      window.scrollTo(0, scrollY)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])
}
