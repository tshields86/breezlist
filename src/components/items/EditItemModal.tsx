import { useState, type FormEvent } from 'react'
import { ModalShell } from '@/components/ui/ModalShell.tsx'
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
    categoryId?: string | null
  }
  categories?: Array<{ id: string; name: string }>
  onSave: (updates: {
    text: string
    quantity: number | null
    unit: string | null
    notes: string | null
    category_id: string | null
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

const fieldClass = 'w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent'
const labelClass = 'block text-sm font-medium text-text-secondary mb-1'

export function EditItemModal({ open, onClose, item, categories, onSave, onDelete }: EditItemModalProps) {
  const [text, setText] = useState(item.text)
  const [quantity, setQuantity] = useState(item.quantity?.toString() ?? '')
  const [unit, setUnit] = useState(item.unit ?? '')
  const [notes, setNotes] = useState(item.notes ?? '')
  const [categoryId, setCategoryId] = useState(item.categoryId ?? '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    setLoading(true)
    await onSave({
      text: text.trim(),
      quantity: quantity ? Number(quantity) : null,
      unit: unit || null,
      notes: notes.trim() || null,
      category_id: categoryId || null,
    })
    setLoading(false)
    onClose()
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Edit Item"
      right={
        <button
          type="submit"
          form="edit-item-form"
          disabled={loading || !text.trim()}
          className="px-3 py-2 rounded-lg text-accent font-semibold hover:bg-bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save
        </button>
      }
    >
      <form id="edit-item-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="edit-text" className={labelClass}>Item</label>
          <input
            id="edit-text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            maxLength={500}
            autoComplete="off"
            className={fieldClass}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="edit-qty" className={labelClass}>Quantity</label>
            <input
              id="edit-qty"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              step="any"
              autoComplete="off"
              className={fieldClass}
              placeholder="0"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="edit-unit" className={labelClass}>Unit</label>
            <select
              id="edit-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className={fieldClass}
            >
              <option value="">None</option>
              {units.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="edit-notes" className={labelClass}>Notes</label>
          <textarea
            id="edit-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
            rows={2}
            autoComplete="off"
            className={`${fieldClass} placeholder:text-text-muted resize-none`}
            placeholder="Optional notes..."
          />
        </div>

        {categories && categories.length > 0 && (
          <div>
            <label htmlFor="edit-category" className={labelClass}>Group</label>
            <select
              id="edit-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={fieldClass}
            >
              <option value="">No group</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        <button
          type="button"
          onClick={onDelete}
          className="w-full mt-2 py-2.5 px-4 rounded-lg border border-danger text-danger font-medium hover:bg-danger hover:text-white transition-colors"
        >
          Delete item
        </button>
      </form>
    </ModalShell>
  )
}
