import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase.ts'
import { useAuth } from '@/hooks/useAuth.ts'
import type { Database } from '@/lib/database.types.ts'

type List = Database['public']['Tables']['lists']['Row']
type ListInsert = Database['public']['Tables']['lists']['Insert']

interface ListWithMeta extends List {
  item_count: number
  completed_count: number
  members: Array<{
    user_id: string
    role: string
    profile: { display_name: string | null; avatar_url: string | null } | null
  }>
}

export function useLists() {
  const { user } = useAuth()
  const [lists, setLists] = useState<ListWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLists = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('lists')
      .select(`
        *,
        list_members(user_id, role, profile:profiles!list_members_user_id_fkey(display_name, avatar_url)),
        items(is_completed)
      `)
      .eq('is_template', false)
      .order('updated_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    const mapped: ListWithMeta[] = (data ?? []).map((list) => {
      const items = (list.items as unknown as Array<{ is_completed: boolean }>) ?? []
      return {
        ...list,
        item_count: items.length,
        completed_count: items.filter((i) => i.is_completed).length,
        members: ((list.list_members ?? []) as unknown as Array<{
          user_id: string
          role: string
          profile: { display_name: string | null; avatar_url: string | null } | null
        }>).map((m) => ({
          user_id: m.user_id,
          role: m.role,
          profile: m.profile ?? null,
        })),
      }
    })

    setLists(mapped)
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchLists()
  }, [fetchLists])

  const createList = useCallback(async (input: Pick<ListInsert, 'name' | 'list_type' | 'description'>) => {
    if (!user) return null

    const { data, error } = await supabase
      .from('lists')
      .insert({ ...input, owner_id: user.id })
      .select()
      .single()

    if (error) {
      setError(error.message)
      return null
    }

    await fetchLists()
    return data
  }, [user, fetchLists])

  const updateList = useCallback(async (id: string, updates: Partial<Pick<List, 'name' | 'description' | 'sort_preference'>>) => {
    const { error } = await supabase
      .from('lists')
      .update(updates)
      .eq('id', id)

    if (error) {
      setError(error.message)
      return false
    }

    await fetchLists()
    return true
  }, [fetchLists])

  const deleteList = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
      return false
    }

    await fetchLists()
    return true
  }, [fetchLists])

  const duplicateList = useCallback(async (sourceId: string, newName: string) => {
    if (!user) return null

    const sourceList = lists.find((l) => l.id === sourceId)
    if (!sourceList) return null

    const newList = await createList({
      name: newName,
      list_type: sourceList.list_type,
      description: sourceList.description,
    })
    if (!newList) return null

    // Copy items from source
    const { data: sourceItems } = await supabase
      .from('items')
      .select('text, quantity, unit, notes, category_id, sort_order, is_starred')
      .eq('list_id', sourceId)

    if (sourceItems && sourceItems.length > 0) {
      await supabase.from('items').insert(
        sourceItems.map((item) => ({
          ...item,
          list_id: newList.id,
          created_by: user.id,
          is_completed: false,
        })),
      )
    }

    await fetchLists()
    return newList
  }, [user, lists, createList, fetchLists])

  const ownedLists = lists.filter((l) => l.owner_id === user?.id)
  const sharedLists = lists.filter((l) => l.owner_id !== user?.id)

  return {
    lists,
    ownedLists,
    sharedLists,
    loading,
    error,
    createList,
    updateList,
    deleteList,
    duplicateList,
    refetch: fetchLists,
  }
}
