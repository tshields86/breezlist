import { cn } from '@/lib/utils.ts'

interface ItemRowProps {
  id: string
  text: string
  quantity: number | null
  unit: string | null
  notes: string | null
  isCompleted: boolean
  isStarred: boolean
  onToggleComplete: () => void
  onToggleStar: () => void
  onEdit: () => void
  onDelete: () => void
}

export function ItemRow({
  id,
  text,
  quantity,
  unit,
  notes,
  isCompleted,
  isStarred,
  onToggleComplete,
  onToggleStar,
  onEdit,
  onDelete,
}: ItemRowProps) {
  const quantityDisplay = quantity
    ? `${quantity}${unit ? ` ${unit}` : ''}`
    : null

  return (
    <div
      id={`item-${id}`}
      className={cn(
        'flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0',
        'transition-colors',
        isCompleted && 'opacity-60',
      )}
    >
      <button
        onClick={onToggleComplete}
        className={cn(
          'mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
          isCompleted
            ? 'bg-accent border-accent'
            : 'border-border hover:border-accent',
        )}
        aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        {isCompleted && (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      <button
        onClick={onEdit}
        className="flex-1 min-w-0 text-left"
      >
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-text-primary',
            isCompleted && 'line-through text-text-muted',
          )}>
            {text}
          </span>
          {quantityDisplay && (
            <span className={cn(
              'text-sm text-text-secondary shrink-0',
              isCompleted && 'line-through text-text-muted',
            )}>
              {quantityDisplay}
            </span>
          )}
        </div>
        {notes && (
          <p className={cn(
            'text-sm text-text-muted mt-0.5 truncate',
            isCompleted && 'line-through',
          )}>
            {notes}
          </p>
        )}
      </button>

      <div className="flex items-center gap-1 shrink-0">
        {!isCompleted && (
          <button
            onClick={onToggleStar}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              isStarred ? 'text-star' : 'text-text-muted hover:text-star',
            )}
            aria-label={isStarred ? 'Unstar' : 'Star'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isStarred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-text-muted hover:text-danger transition-colors"
          aria-label="Delete item"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
