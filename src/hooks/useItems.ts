import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase.ts'
import { useAuth } from '@/hooks/useAuth.ts'
import type { Database } from '@/lib/database.types.ts'

type Item = Database['public']['Tables']['items']['Row']

export function useItems(listId: string | undefined) {
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // `silent` refetches (e.g. from realtime) skip the loading flag so the list
  // updates in place instead of flashing the full-page spinner on every remote
  // change.
  const fetchItems = useCallback(async (opts?: { silent?: boolean }) => {
    if (!listId) return
    if (!opts?.silent) setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('items')
      .select('*')
      .eq('list_id', listId)
      .order('is_completed', { ascending: true })
      .order('sort_order', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setItems(data ?? [])
    }
    setLoading(false)
  }, [listId])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const addItem = useCallback(async (input: {
    text: string
    quantity?: number | null
    unit?: string | null
    notes?: string | null
    category_id?: string | null
  }) => {
    if (!listId || !user) return null

    // New items go to the top of the list (lowest sort_order), so they appear
    // right under the top-anchored add bar instead of at the far bottom.
    const minSortOrder = items.length > 0
      ? Math.min(...items.filter((i) => !i.is_completed).map((i) => i.sort_order))
      : 0

    const { data, error } = await supabase
      .from('items')
      .insert({
        list_id: listId,
        text: input.text,
        quantity: input.quantity ?? null,
        unit: input.unit ?? null,
        notes: input.notes ?? null,
        category_id: input.category_id ?? null,
        sort_order: minSortOrder - 1,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      return null
    }

    setItems((prev) => [data, ...prev])
    return data
  }, [listId, user, items])

  const updateItem = useCallback(async (id: string, updates: Partial<Pick<Item, 'text' | 'quantity' | 'unit' | 'notes' | 'category_id' | 'is_starred'>>) => {
    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      setError(error.message)
      return false
    }

    setItems((prev) => prev.map((item) => item.id === id ? data : item))
    return true
  }, [])

  const toggleComplete = useCallback(async (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item || !user) return false

    const isCompleting = !item.is_completed
    const { data, error } = await supabase
      .from('items')
      .update({
        is_completed: isCompleting,
        completed_at: isCompleting ? new Date().toISOString() : null,
        completed_by: isCompleting ? user.id : null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      setError(error.message)
      return false
    }

    setItems((prev) => prev.map((i) => i.id === id ? data : i))
    return true
  }, [items, user])

  const toggleStar = useCallback(async (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return false

    return updateItem(id, { is_starred: !item.is_starred })
  }, [items, updateItem])

  const deleteItem = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
      return false
    }

    setItems((prev) => prev.filter((i) => i.id !== id))
    return true
  }, [])

  const clearCompleted = useCallback(async () => {
    if (!listId) return false

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('list_id', listId)
      .eq('is_completed', true)

    if (error) {
      setError(error.message)
      return false
    }

    setItems((prev) => prev.filter((i) => !i.is_completed))
    return true
  }, [listId])

  const reorderItem = useCallback(async (id: string, newSortOrder: number) => {
    const { error } = await supabase
      .from('items')
      .update({ sort_order: newSortOrder })
      .eq('id', id)

    if (error) {
      setError(error.message)
      return false
    }

    setItems((prev) =>
      prev.map((i) => i.id === id ? { ...i, sort_order: newSortOrder } : i)
        .sort((a, b) => {
          if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1
          return a.sort_order - b.sort_order
        }),
    )
    return true
  }, [])

  const activeItems = items.filter((i) => !i.is_completed)
  const completedItems = items.filter((i) => i.is_completed)

  return {
    items,
    activeItems,
    completedItems,
    loading,
    error,
    addItem,
    updateItem,
    toggleComplete,
    toggleStar,
    deleteItem,
    clearCompleted,
    reorderItem,
    refetch: fetchItems,
  }
}
