import { useState, type FormEvent } from 'react'
import { useModalDismiss } from '@/hooks/useModalDismiss.ts'
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

export function EditItemModal({ open, onClose, item, categories, onSave, onDelete }: EditItemModalProps) {
  const [text, setText] = useState(item.text)
  const [quantity, setQuantity] = useState(item.quantity?.toString() ?? '')
  const [unit, setUnit] = useState(item.unit ?? '')
  const [notes, setNotes] = useState(item.notes ?? '')
  const [categoryId, setCategoryId] = useState(item.categoryId ?? '')
  const [loading, setLoading] = useState(false)

  useModalDismiss(open, onClose)

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
      category_id: categoryId || null,
    })
    setLoading(false)
    onClose()
  }

  const fieldClass = 'w-full px-3 py-2.5 rounded-lg border border-border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent'
  const labelClass = 'block text-sm font-medium text-text-secondary mb-1'

  // Full-screen on mobile, centered card on larger screens. A single scroll
  // region (the form) holds the fields; the app bar with Cancel/Save stays
  // fixed at the top. The keyboard simply overlays the bottom and the browser
  // scrolls the focused field into view — no keyboard-offset math needed.
  return (
    <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center sm:bg-black/40">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="hidden sm:block fixed inset-0 cursor-default"
      />
      <div className="relative flex flex-col w-full h-full bg-bg-primary overflow-hidden sm:h-auto sm:max-h-[85vh] sm:max-w-md sm:rounded-2xl sm:shadow-xl">
        <header className="shrink-0 flex items-center justify-between gap-2 h-14 px-2 border-b border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg text-text-secondary font-medium hover:bg-bg-secondary transition-colors"
          >
            Cancel
          </button>
          <h2 className="text-base font-semibold text-text-primary">Edit Item</h2>
          <button
            type="submit"
            form="edit-item-form"
            disabled={loading || !text.trim()}
            className="px-3 py-2 rounded-lg text-accent font-semibold hover:bg-bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </header>

        <form
          id="edit-item-form"
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4"
        >
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
      </div>
    </div>
  )
}
