/**
 * Shared field styling so the border, background, and focus-ring tokens are
 * defined once. Callers add their own width (`w-full` / `flex-1`) and any
 * per-field extras via `cn()`.
 */
export const inputClasses =
  'rounded-xl border border-border bg-bg-secondary px-3.5 py-3 text-text-primary placeholder:text-text-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent transition'

export const labelClasses = 'mb-1.5 block text-sm font-semibold text-text-secondary'
