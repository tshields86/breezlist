import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { supabase } from '@/lib/supabase.ts'
import { useAuth } from '@/hooks/useAuth.ts'
import { useItems } from '@/hooks/useItems.ts'
import { useCategories } from '@/hooks/useCategories.ts'
import { useTemplates } from '@/hooks/useTemplates.ts'
import { useRealtime } from '@/hooks/useRealtime.ts'
import { useToast } from '@/components/ui/Toast.tsx'
import { ShareListModal } from '@/components/lists/ShareListModal.tsx'
import { SortableItemRow } from '@/components/items/SortableItemRow.tsx'
import { ItemRow } from '@/components/items/ItemRow.tsx'
import { AddItemInput } from '@/components/items/AddItemInput.tsx'
import { EditItemModal } from '@/components/items/EditItemModal.tsx'
import { CategoryGroup } from '@/components/items/CategoryGroup.tsx'
import { SortModeSelector } from '@/components/items/SortModeSelector.tsx'
import { emojiForListType } from '@/lib/listTypes.ts'
import type { Database } from '@/lib/database.types.ts'
import type { SortPreference } from '@/types/index.ts'

type List = Database['public']['Tables']['lists']['Row']
type Item = Database['public']['Tables']['items']['Row']

interface ListMember {
  user_id: string
  role: string
  profile: { display_name: string | null; avatar_url: string | null } | null
}

export default function ListView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [list, setList] = useState<List | null>(null)
  const [listLoading, setListLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [members, setMembers] = useState<ListMember[]>([])
  const { saveAsTemplate } = useTemplates()
  const { toast } = useToast()

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
    refetch: refetchItems,
  } = useItems(id)

  const { categories, addCategory, renameCategory, deleteCategory } = useCategories(id)

  const handleRealtimeChange = useCallback(() => {
    refetchItems({ silent: true })
  }, [refetchItems])

  useRealtime({ listId: id, onItemChange: handleRealtimeChange })

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

  const categoryItemsMap = useMemo(() => {
    if (categories.length === 0) return null
    const map = new Map<string | null, Item[]>()
    for (const cat of categories) map.set(cat.id, [])
    map.set(null, [])
    for (const item of sortedActiveItems) {
      const catId = item.category_id ?? null
      const bucket = map.has(catId) ? catId : null
      map.get(bucket)!.push(item)
    }
    return map
  }, [categories, sortedActiveItems])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const fetchMembers = useCallback(async () => {
    if (!id) return
    const { data } = await supabase
      .from('list_members')
      .select('user_id, role, profile:profiles!list_members_user_id_fkey(display_name, avatar_url)')
      .eq('list_id', id)

    if (data) {
      setMembers(
        (data as unknown as ListMember[]).filter((m) => m.user_id !== list?.owner_id),
      )
    }
  }, [id, list?.owner_id])

  useEffect(() => {
    if (!id) return
    setListLoading(true)
    supabase
      .from('lists')
      .select(`
        *,
        list_members(user_id, role, profile:profiles!list_members_user_id_fkey(display_name, avatar_url))
      `)
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          navigate('/lists', { replace: true })
          return
        }
        const { list_members, ...listData } = data as typeof data & { list_members: ListMember[] }
        setList(listData)
        setNewName(listData.name)
        setMembers(
          (list_members ?? []).filter((m) => m.user_id !== listData.owner_id),
        )
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
    category_id: string | null
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
    <div className="flex flex-col min-h-[calc(100vh-3.5rem-4rem-env(safe-area-inset-bottom,0px))]">
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

          <span className="shrink-0 text-xl" aria-hidden>{emojiForListType(list.list_type)}</span>

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
              className="flex-1 border-b-2 border-accent bg-transparent text-lg font-bold text-text-primary focus:outline-none"
            />
          ) : (
            <button
              onClick={() => setIsRenaming(true)}
              className="flex-1 truncate text-left text-lg font-bold text-text-primary transition-colors hover:text-accent"
            >
              {list.name}
            </button>
          )}

          {/* Menu button */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="p-1.5 rounded-lg text-text-secondary hover:bg-bg-tertiary transition-colors"
              aria-label="List menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
              </svg>
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="shadow-soft absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-bg-secondary py-1.5">
                  <button
                    onClick={() => {
                      setIsRenaming(true)
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      setShowShareModal(true)
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
                  >
                    Share
                  </button>
                  <button
                    onClick={async () => {
                      setShowMenu(false)
                      const name = window.prompt('Group name:')
                      if (!name?.trim()) return
                      const result = await addCategory(name.trim())
                      if (!result) toast('Failed to add group', 'error')
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
                  >
                    Add group
                  </button>
                  <button
                    onClick={async () => {
                      setShowMenu(false)
                      const name = window.prompt('Template name:', list.name)
                      if (!name) return
                      const result = await saveAsTemplate(list.id, name)
                      if (result) {
                        toast('Saved as template', 'success')
                      } else {
                        toast('Failed to save template', 'error')
                      }
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
                  >
                    Save as template
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sort mode selector */}
        {(activeItems.length > 1 || completedItems.length > 0) && (
          <div className="flex justify-start mt-2">
            <SortModeSelector value={sortPreference} onChange={handleSortChange} />
          </div>
        )}
      </div>

      {/* Add item input — anchored at the top, above the list */}
      <AddItemInput onAdd={addItem} />

      {/* Items list */}
      <div className="flex-1 overflow-y-auto">
        {sortedActiveItems.length === 0 && completedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
            <span className="grad-chip mb-4 grid h-16 w-16 place-items-center rounded-2xl text-3xl">
              {emojiForListType(list.list_type)}
            </span>
            <h3 className="mb-2 text-lg font-bold text-text-primary">No items yet</h3>
            <p className="text-text-secondary">Add your first item up top.</p>
          </div>
        ) : (
          <>
            {/* Active items — grouped when categories exist, flat otherwise */}
            {categoryItemsMap ? (
              /* Grouped rendering */
              isManualSort ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={sortedActiveItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    {categories.map((cat) => {
                      const catItems = categoryItemsMap.get(cat.id) ?? []
                      return (
                        <CategoryGroup
                          key={cat.id}
                          name={cat.name}
                          itemCount={catItems.length}
                          onRename={(name) => renameCategory(cat.id, name)}
                          onDelete={() => deleteCategory(cat.id)}
                        >
                          {catItems.map((item) => (
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
                        </CategoryGroup>
                      )
                    })}
                    {(categoryItemsMap.get(null) ?? []).length > 0 && (
                      <div className="mb-2">
                        <div className="bg-bg-tertiary px-4 py-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                          Uncategorized
                        </div>
                        {categoryItemsMap.get(null)!.map((item) => (
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
                      </div>
                    )}
                  </SortableContext>
                </DndContext>
              ) : (
                <div>
                  {categories.map((cat) => {
                    const catItems = categoryItemsMap.get(cat.id) ?? []
                    return (
                      <CategoryGroup
                        key={cat.id}
                        name={cat.name}
                        itemCount={catItems.length}
                        onRename={(name) => renameCategory(cat.id, name)}
                        onDelete={() => deleteCategory(cat.id)}
                      >
                        {catItems.map((item) => (
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
                      </CategoryGroup>
                    )
                  })}
                  {(categoryItemsMap.get(null) ?? []).length > 0 && (
                    <div className="mb-2">
                      <div className="px-4 py-2 bg-bg-secondary text-sm font-semibold text-text-muted uppercase tracking-wider">
                        Uncategorized
                      </div>
                      {categoryItemsMap.get(null)!.map((item) => (
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
                </div>
              )
            ) : (
              /* Flat rendering (no categories) */
              isManualSort ? (
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
              )
            )}

            {/* Completed items */}
            {completedItems.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Completed · {completedItems.length}
                  </span>
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all completed items?')) {
                        clearCompleted()
                      }
                    }}
                    className="text-sm font-semibold text-accent-text hover:underline"
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

      {/* Edit modal */}
      {editingItem && (
        <EditItemModal
          open={true}
          onClose={() => setEditingItem(null)}
          item={{ ...editingItem, categoryId: editingItem.category_id }}
          categories={categories.length > 0 ? categories : undefined}
          onSave={handleEditSave}
          onDelete={handleEditDelete}
        />
      )}

      {/* Share modal */}
      <ShareListModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        listId={list.id}
        isOwner={list.owner_id === user?.id}
        members={members}
        onMembersChange={fetchMembers}
      />
    </div>
  )
}
