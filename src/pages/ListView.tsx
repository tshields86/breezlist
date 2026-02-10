import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase.ts'
import { useItems } from '@/hooks/useItems.ts'
import { ItemRow } from '@/components/items/ItemRow.tsx'
import { AddItemInput } from '@/components/items/AddItemInput.tsx'
import { EditItemModal } from '@/components/items/EditItemModal.tsx'
import type { Database } from '@/lib/database.types.ts'

type List = Database['public']['Tables']['lists']['Row']
type Item = Database['public']['Tables']['items']['Row']

export default function ListView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [list, setList] = useState<List | null>(null)
  const [listLoading, setListLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState('')

  const {
    activeItems,
    completedItems,
    loading: itemsLoading,
    addItem,
    updateItem,
    toggleComplete,
    toggleStar,
    deleteItem,
    clearCompleted,
  } = useItems(id)

  useEffect(() => {
    if (!id) return
    setListLoading(true)
    supabase
      .from('lists')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          navigate('/lists', { replace: true })
          return
        }
        setList(data)
        setNewName(data.name)
        setListLoading(false)
      })
  }, [id, navigate])

  const handleRename = useCallback(async () => {
    if (!list || !newName.trim() || newName.trim() === list.name) {
      setIsRenaming(false)
      setNewName(list?.name ?? '')
      return
    }

    await supabase
      .from('lists')
      .update({ name: newName.trim() })
      .eq('id', list.id)

    setList((prev) => prev ? { ...prev, name: newName.trim() } : prev)
    setIsRenaming(false)
  }, [list, newName])

  const handleEditSave = useCallback(async (updates: {
    text: string
    quantity: number | null
    unit: string | null
    notes: string | null
  }) => {
    if (!editingItem) return
    await updateItem(editingItem.id, updates)
    setEditingItem(null)
  }, [editingItem, updateItem])

  const handleEditDelete = useCallback(async () => {
    if (!editingItem) return
    await deleteItem(editingItem.id)
    setEditingItem(null)
  }, [editingItem, deleteItem])

  if (listLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!list) return null

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem-4rem)]">
      {/* List header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/lists')}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-bg-tertiary transition-colors shrink-0"
            aria-label="Back to lists"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {isRenaming ? (
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename()
                if (e.key === 'Escape') {
                  setIsRenaming(false)
                  setNewName(list.name)
                }
              }}
              autoFocus
              maxLength={100}
              className="flex-1 text-lg font-semibold text-text-primary bg-transparent border-b-2 border-accent focus:outline-none"
            />
          ) : (
            <button
              onClick={() => setIsRenaming(true)}
              className="flex-1 text-left text-lg font-semibold text-text-primary truncate hover:text-accent transition-colors"
            >
              {list.name}
            </button>
          )}
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto">
        {activeItems.length === 0 && completedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No items yet</h3>
            <p className="text-text-secondary">Start adding items below</p>
          </div>
        ) : (
          <>
            {/* Active items */}
            <div>
              {activeItems.map((item) => (
                <ItemRow
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  quantity={item.quantity}
                  unit={item.unit}
                  notes={item.notes}
                  isCompleted={false}
                  isStarred={item.is_starred}
                  onToggleComplete={() => toggleComplete(item.id)}
                  onToggleStar={() => toggleStar(item.id)}
                  onEdit={() => setEditingItem(item)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
            </div>

            {/* Completed items */}
            {completedItems.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm font-medium text-text-muted">
                    Completed ({completedItems.length})
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all completed items?')) {
                        clearCompleted()
                      }
                    }}
                    className="text-sm text-accent hover:underline"
                  >
                    Clear all
                  </button>
                </div>
                {completedItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    id={item.id}
                    text={item.text}
                    quantity={item.quantity}
                    unit={item.unit}
                    notes={item.notes}
                    isCompleted={true}
                    isStarred={item.is_starred}
                    onToggleComplete={() => toggleComplete(item.id)}
                    onToggleStar={() => toggleStar(item.id)}
                    onEdit={() => setEditingItem(item)}
                    onDelete={() => deleteItem(item.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add item input */}
      <AddItemInput onAdd={addItem} />

      {/* Edit modal */}
      {editingItem && (
        <EditItemModal
          open={true}
          onClose={() => setEditingItem(null)}
          item={editingItem}
          onSave={handleEditSave}
          onDelete={handleEditDelete}
        />
      )}
    </div>
  )
}
