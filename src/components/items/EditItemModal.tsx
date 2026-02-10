import { useState, type FormEvent } from 'react'
import type { ItemUnit } from '@/types/index.ts'

interface EditItemModalProps {
  open: boolean
  onClose: () => void
  item: {
    id: string
    text: string
    quantity: number | null
    unit: string | null
    notes: string | null
  }
  onSave: (updates: {
    text: string
    quantity: number | null
    unit: string | null
    notes: string | null
  }) => Promise<void>
  onDelete: () => void
}

const units: Array<{ value: ItemUnit; label: string }> = [
  { value: 'pcs', label: 'pcs' },
  { value: 'oz', label: 'oz' },
  { value: 'lb', label: 'lb' },
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'ml', label: 'ml' },
  { value: 'l', label: 'l' },
  { value: 'cups', label: 'cups' },
  { value: 'dozen', label: 'dozen' },
  { value: 'pack', label: 'pack' },
]

export function EditItemModal({ open, onClose, item, onSave, onDelete }: EditItemModalProps) {
  const [text, setText] = useState(item.text)
  const [quantity, setQuantity] = useState(item.quantity?.toString() ?? '')
  const [unit, setUnit] = useState(item.unit ?? '')
  const [notes, setNotes] = useState(item.notes ?? '')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    setLoading(true)
    await onSave({
      text: text.trim(),
      quantity: quantity ? Number(quantity) : null,
      unit: unit || null,
      notes: notes.trim() || null,
    })
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-bg-primary rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Edit Item</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-text" className="block text-sm font-medium text-text-secondary mb-1">
              Item
            </label>
            <input
              id="edit-text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              maxLength={500}
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="edit-qty" className="block text-sm font-medium text-text-secondary mb-1">
                Quantity
              </label>
              <input
                id="edit-qty"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                step="any"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="0"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="edit-unit" className="block text-sm font-medium text-text-secondary mb-1">
                Unit
              </label>
              <select
                id="edit-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">None</option>
                {units.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="edit-notes" className="block text-sm font-medium text-text-secondary mb-1">
              Notes
            </label>
            <textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onDelete}
              className="py-2.5 px-4 rounded-lg border border-danger text-danger font-medium hover:bg-danger hover:text-white transition-colors"
            >
              Delete
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-lg border border-border text-text-secondary font-medium hover:bg-bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="py-2.5 px-4 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
