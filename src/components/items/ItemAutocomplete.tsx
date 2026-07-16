import { cn } from '@/lib/utils.ts'

interface Suggestion {
  text_display: string
  frequency: number
  category_hint: string | null
}

interface ItemAutocompleteProps {
  suggestions: Suggestion[]
  onSelect: (text: string, categoryHint: string | null) => void
  visible: boolean
}

export function ItemAutocomplete({ suggestions, onSelect, visible }: ItemAutocompleteProps) {
  if (!visible || suggestions.length === 0) return null

  // Keep the popup compact on mobile so it doesn't bury the list behind it.
  const shown = suggestions.slice(0, 3)

  return (
    <div className="shadow-soft absolute left-0 right-0 top-full z-30 mt-1 max-h-52 overflow-y-auto overflow-hidden rounded-xl border border-border bg-bg-secondary">
      {shown.map((item, i) => (
        <button
          key={`${item.text_display}-${i}`}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect(item.text_display, item.category_hint)
          }}
          className={cn(
            'flex w-full items-center justify-between px-4 py-2.5 text-left',
            'transition-colors hover:bg-bg-tertiary',
            i > 0 && 'border-t border-border',
          )}
        >
          <span className="font-medium text-text-primary">{item.text_display}</span>
          <span className="text-xs text-text-muted ml-2 shrink-0">
            {item.frequency > 1 ? `${item.frequency}x` : 'once'}
          </span>
        </button>
      ))}
    </div>
  )
}
