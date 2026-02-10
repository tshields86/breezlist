import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ItemRow } from '@/components/items/ItemRow.tsx'
import { cn } from '@/lib/utils.ts'

interface SortableItemRowProps {
  id: string
  text: string
  quantity: number | null
  unit: string | null
  notes: string | null
  isCompleted: boolean
  isStarred: boolean
  showDragHandle: boolean
  onToggleComplete: () => void
  onToggleStar: () => void
  onEdit: () => void
  onDelete: () => void
}

export function SortableItemRow({
  id,
  showDragHandle,
  ...itemProps
}: SortableItemRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center',
        isDragging && 'opacity-50 z-50 bg-bg-secondary rounded-lg shadow-lg',
      )}
    >
      {showDragHandle && (
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 px-1 py-3 cursor-grab active:cursor-grabbing text-text-muted hover:text-text-secondary touch-none"
          aria-label="Drag to reorder"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <ItemRow id={id} {...itemProps} />
      </div>
    </div>
  )
}
