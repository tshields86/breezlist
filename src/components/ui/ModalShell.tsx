import { useRef, type ReactNode } from 'react'
import { useModalDismiss } from '@/hooks/useModalDismiss.ts'
import { useFocusTrap } from '@/hooks/useFocusTrap.ts'

interface ModalShellProps {
  open: boolean
  onClose: () => void
  title: string
  /** Left app-bar slot. Defaults to a "Cancel" button; pass `false` to omit. */
  left?: ReactNode
  /** Right app-bar slot, e.g. a Save/Create/Done button. */
  right?: ReactNode
  children: ReactNode
}

/**
 * Shared modal chrome: full-screen sheet on mobile, centered card on larger
 * screens. A fixed app bar (left action / title / right action) sits above a
 * single scrolling content region, so the keyboard simply overlays the bottom
 * and the browser scrolls the focused field into view — no keyboard-offset
 * math and no competing scroll areas. Handles background scroll-lock + Esc.
 */
export function ModalShell({ open, onClose, title, left, right, children }: ModalShellProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useModalDismiss(open, onClose)
  useFocusTrap(open, dialogRef)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center sm:bg-black/60 sm:backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="hidden sm:block fixed inset-0 cursor-default"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="shadow-soft relative flex h-full w-full flex-col overflow-hidden bg-bg-primary outline-none sm:h-auto sm:max-h-[85vh] sm:max-w-md sm:rounded-3xl"
      >
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-2">
          <div className="flex flex-1 justify-start">
            {left ?? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-2 font-semibold text-text-secondary transition-colors hover:bg-bg-tertiary"
              >
                Cancel
              </button>
            )}
          </div>
          <h2 className="whitespace-nowrap text-base font-bold text-text-primary">{title}</h2>
          <div className="flex-1 flex justify-end">{right}</div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </div>
  )
}
