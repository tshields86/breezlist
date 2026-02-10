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

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 bg-bg-primary border border-border rounded-lg shadow-lg overflow-hidden z-30 max-h-60 overflow-y-auto">
      {suggestions.map((item, i) => (
        <button
          key={`${item.text_display}-${i}`}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect(item.text_display, item.category_hint)
          }}
          className={cn(
            'w-full flex items-center justify-between px-4 py-2.5 text-left',
            'hover:bg-bg-secondary transition-colors',
            i > 0 && 'border-t border-border',
          )}
        >
          <span className="text-text-primary">{item.text_display}</span>
          <span className="text-xs text-text-muted ml-2 shrink-0">
            {item.frequency > 1 ? `${item.frequency}x` : 'once'}
          </span>
        </button>
      ))}
    </div>
  )
}
