import { type ReactNode } from 'react'
import { useModalDismiss } from '@/hooks/useModalDismiss.ts'

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
  useModalDismiss(open, onClose)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center sm:bg-black/40">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="hidden sm:block fixed inset-0 cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex flex-col w-full h-full bg-bg-primary overflow-hidden sm:h-auto sm:max-h-[85vh] sm:max-w-md sm:rounded-2xl sm:shadow-xl"
      >
        <header className="shrink-0 flex items-center justify-between gap-2 h-14 px-2 border-b border-border">
          <div className="flex-1 flex justify-start">
            {left ?? (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-lg text-text-secondary font-medium hover:bg-bg-secondary transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
          <h2 className="text-base font-semibold text-text-primary whitespace-nowrap">{title}</h2>
          <div className="flex-1 flex justify-end">{right}</div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </div>
  )
}
