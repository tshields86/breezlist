import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase.ts'
import type { Database } from '@/lib/database.types.ts'

type Category = Database['public']['Tables']['categories']['Row']

const DEFAULT_GROCERY_CATEGORIES = ['Produce', 'Dairy', 'Meat & Seafood', 'Bakery', 'Pantry', 'Frozen', 'Beverages', 'Snacks', 'Household']

export function useCategories(listId: string | undefined) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    if (!listId) return
    setLoading(true)
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('list_id', listId)
      .order('sort_order', { ascending: true })
    setCategories(data ?? [])
    setLoading(false)
  }, [listId])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const addCategory = useCallback(async (name: string) => {
    if (!listId) return null
    const maxOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.sort_order)) : 0
    const { data, error } = await supabase
      .from('categories')
      .insert({ list_id: listId, name, sort_order: maxOrder + 1 })
      .select()
      .single()

    if (error) return null
    setCategories((prev) => [...prev, data])
    return data
  }, [listId, categories])

  const renameCategory = useCallback(async (id: string, name: string) => {
    const { error } = await supabase.from('categories').update({ name }).eq('id', id)
    if (error) return false
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, name } : c))
    return true
  }, [])

  const deleteCategory = useCallback(async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) return false
    setCategories((prev) => prev.filter((c) => c.id !== id))
    return true
  }, [])

  const initDefaultCategories = useCallback(async (listType: string) => {
    if (!listId || categories.length > 0) return
    if (listType !== 'grocery') return

    const inserts = DEFAULT_GROCERY_CATEGORIES.map((name, i) => ({
      list_id: listId,
      name,
      sort_order: i + 1,
    }))

    const { data } = await supabase.from('categories').insert(inserts).select()
    if (data) setCategories(data)
  }, [listId, categories.length])

  return {
    categories,
    loading,
    addCategory,
    renameCategory,
    deleteCategory,
    initDefaultCategories,
    refetch: fetchCategories,
  }
}
