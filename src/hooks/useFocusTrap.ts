import { useEffect, type RefObject } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * While `active`, keep keyboard focus inside `container`: move focus in on open
 * (preferring the first form field), cycle Tab / Shift+Tab within the dialog, and
 * restore focus to the previously-focused element on close. Pair with
 * `useModalDismiss` for background scroll-lock + Escape.
 */
export function useFocusTrap(active: boolean, container: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active) return
    const node = container.current
    if (!node) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    const focusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      )

    // Prefer the first real input so the user can start typing immediately;
    // otherwise focus the first control, else the dialog itself.
    const firstField = node.querySelector<HTMLElement>(
      'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled])',
    )
    ;(firstField ?? focusables()[0] ?? node).focus()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) {
        e.preventDefault()
        node.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const activeEl = document.activeElement
      if (e.shiftKey) {
        if (activeEl === first || !node.contains(activeEl)) {
          e.preventDefault()
          last.focus()
        }
      } else if (activeEl === last || !node.contains(activeEl)) {
        e.preventDefault()
        first.focus()
      }
    }

    node.addEventListener('keydown', handleKey)
    return () => {
      node.removeEventListener('keydown', handleKey)
      previouslyFocused?.focus?.()
    }
  }, [active, container])
}
