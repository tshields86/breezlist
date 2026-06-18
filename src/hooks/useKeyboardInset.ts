import { useEffect, useState } from 'react'

/**
 * Height (px) currently covered by the on-screen keyboard, derived from the
 * visualViewport API. Returns 0 when no keyboard is shown (and on platforms
 * without visualViewport). Use it to lift bottom-anchored UI — the add-item bar,
 * modal sheets — above the keyboard instead of letting it hide behind them.
 */
export function useKeyboardInset() {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      const overlap = window.innerHeight - vv.height - vv.offsetTop
      setInset(overlap > 1 ? overlap : 0)
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return inset
}
