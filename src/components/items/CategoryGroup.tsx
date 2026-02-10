import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils.ts'

interface CategoryGroupProps {
  name: string
  itemCount: number
  children: ReactNode
  onRename?: (name: string) => void
  onDelete?: () => void
}

export function CategoryGroup({ name, itemCount, children, onRename, onDelete }: CategoryGroupProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(name)

  const handleRename = () => {
    if (editName.trim() && editName.trim() !== name) {
      onRename?.(editName.trim())
    }
    setEditing(false)
    setEditName(name)
  }

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 px-4 py-2 bg-bg-secondary">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-text-muted hover:text-text-secondary transition-colors"
          aria-label={collapsed ? 'Expand' : 'Collapse'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('transition-transform', collapsed ? '-rotate-90' : 'rotate-0')}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {editing ? (
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') {
                setEditing(false)
                setEditName(name)
              }
            }}
            autoFocus
            className="flex-1 text-sm font-semibold text-text-primary bg-transparent border-b border-accent focus:outline-none"
          />
        ) : (
          <button
            onClick={() => onRename && setEditing(true)}
            className="flex-1 text-left text-sm font-semibold text-text-secondary uppercase tracking-wider"
          >
            {name}
          </button>
        )}

        <span className="text-xs text-text-muted">{itemCount}</span>

        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1 rounded text-text-muted hover:text-danger transition-colors"
            aria-label="Delete category"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {!collapsed && (
        <div>{children}</div>
      )}
    </div>
  )
}
