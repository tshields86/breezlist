import { useState, type FormEvent } from 'react'
import { cn } from '@/lib/utils.ts'
import type { ListType } from '@/types/index.ts'

interface CreateListModalProps {
  open: boolean
  onClose: () => void
  onCreate: (name: string, listType: ListType) => Promise<void>
}

const listTypes: Array<{ value: ListType; label: string; emoji: string }> = [
  { value: 'grocery', label: 'Grocery', emoji: '🛒' },
  { value: 'todo', label: 'To-do', emoji: '✅' },
  { value: 'packing', label: 'Packing', emoji: '🧳' },
  { value: 'gift', label: 'Gift', emoji: '🎁' },
  { value: 'general', label: 'General', emoji: '📝' },
]

export function CreateListModal({ open, onClose, onCreate }: CreateListModalProps) {
  const [name, setName] = useState('')
  const [listType, setListType] = useState<ListType>('general')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    await onCreate(name.trim(), listType)
    setName('')
    setListType('general')
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-bg-primary rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-text-primary mb-4">New List</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="list-name" className="block text-sm font-medium text-text-secondary mb-1">
              Name
            </label>
            <input
              id="list-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="e.g., Weekly Groceries"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Type</label>
            <div className="flex flex-wrap gap-2">
              {listTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setListType(type.value)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    listType === type.value
                      ? 'bg-accent text-white'
                      : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary',
                  )}
                >
                  {type.emoji} {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-lg border border-border text-text-secondary font-medium hover:bg-bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-2.5 px-4 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
