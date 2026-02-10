import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { supabase } from '@/lib/supabase.ts'
import { useItems } from '@/hooks/useItems.ts'
import { SortableItemRow } from '@/components/items/SortableItemRow.tsx'
import { ItemRow } from '@/components/items/ItemRow.tsx'
import { AddItemInput } from '@/components/items/AddItemInput.tsx'
import { EditItemModal } from '@/components/items/EditItemModal.tsx'
import { SortModeSelector } from '@/components/items/SortModeSelector.tsx'
import type { Database } from '@/lib/database.types.ts'
import type { SortPreference } from '@/types/index.ts'

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
    reorderItem,
  } = useItems(id)

  const sortPreference = (list?.sort_preference ?? 'manual') as SortPreference

  const sortedActiveItems = useMemo(() => {
    const items = [...activeItems]
    switch (sortPreference) {
      case 'alphabetical':
        return items.sort((a, b) => a.text.localeCompare(b.text))
      case 'recent':
        return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'manual':
      default:
        return items.sort((a, b) => a.sort_order - b.sort_order)
    }
  }, [activeItems, sortPreference])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

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

  const handleSortChange = useCallback(async (mode: SortPreference) => {
    if (!list) return
    await supabase.from('lists').update({ sort_preference: mode }).eq('id', list.id)
    setList((prev) => prev ? { ...prev, sort_preference: mode } : prev)
  }, [list])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortedActiveItems.findIndex((i) => i.id === active.id)
    const newIndex = sortedActiveItems.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const prev = newIndex > 0 ? sortedActiveItems[newIndex - 1]?.sort_order ?? 0 : 0
    const next = newIndex < sortedActiveItems.length - 1
      ? sortedActiveItems[newIndex + (newIndex > oldIndex ? 0 : 1)]?.sort_order ?? prev + 2
      : prev + 2
    const newSortOrder = (prev + next) / 2

    await reorderItem(active.id as string, newSortOrder)
  }, [sortedActiveItems, reorderItem])

  const handleRename = useCallback(async () => {
    if (!list || !newName.trim() || newName.trim() === list.name) {
      setIsRenaming(false)
      setNewName(list?.name ?? '')
      return
    }
    await supabase.from('lists').update({ name: newName.trim() }).eq('id', list.id)
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

  const isManualSort = sortPreference === 'manual'

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

        {/* Sort mode selector */}
        {(activeItems.length > 1 || completedItems.length > 0) && (
          <div className="flex justify-end mt-2">
            <SortModeSelector value={sortPreference} onChange={handleSortChange} />
          </div>
        )}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto">
        {sortedActiveItems.length === 0 && completedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No items yet</h3>
            <p className="text-text-secondary">Start adding items below</p>
          </div>
        ) : (
          <>
            {/* Active items — sortable in manual mode */}
            {isManualSort ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sortedActiveItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                  {sortedActiveItems.map((item) => (
                    <SortableItemRow
                      key={item.id}
                      id={item.id}
                      text={item.text}
                      quantity={item.quantity}
                      unit={item.unit}
                      notes={item.notes}
                      isCompleted={false}
                      isStarred={item.is_starred}
                      showDragHandle={true}
                      onToggleComplete={() => toggleComplete(item.id)}
                      onToggleStar={() => toggleStar(item.id)}
                      onEdit={() => setEditingItem(item)}
                      onDelete={() => deleteItem(item.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              <div>
                {sortedActiveItems.map((item) => (
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
            )}

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
