import { useState, type FormEvent } from 'react'
import { cn } from '@/lib/utils.ts'
import { ModalShell } from '@/components/ui/ModalShell.tsx'
import { TextField } from '@/components/ui/TextField.tsx'
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
    <ModalShell
      open={open}
      onClose={onClose}
      title="New List"
      right={
        <button
          type="submit"
          form="create-list-form"
          disabled={loading || !name.trim()}
          className="px-3 py-2 rounded-lg text-accent-text font-semibold hover:bg-bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
      }
    >
      <form id="create-list-form" onSubmit={handleSubmit} className="space-y-5">
        <TextField
          id="list-name"
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
          autoComplete="off"
          placeholder="e.g., Weekly Groceries"
        />

        <div>
          <label className="mb-2 block text-sm font-semibold text-text-secondary">Type</label>
          <div className="flex flex-wrap gap-2">
            {listTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setListType(type.value)}
                className={cn(
                  'rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors',
                  listType === type.value
                    ? 'grad-sky text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:text-text-primary',
                )}
              >
                {type.emoji} {type.label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </ModalShell>
  )
}
