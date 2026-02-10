import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase.ts'
import { useAuth } from '@/hooks/useAuth.ts'
import type { Database } from '@/lib/database.types.ts'

type List = Database['public']['Tables']['lists']['Row']

export function useTemplates() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<List[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTemplates = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('lists')
      .select('*')
      .eq('is_template', true)
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false })

    setTemplates(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const saveAsTemplate = useCallback(async (sourceListId: string, templateName: string) => {
    if (!user) return null

    // Get the source list
    const { data: sourceList } = await supabase
      .from('lists')
      .select('*')
      .eq('id', sourceListId)
      .single()

    if (!sourceList) return null

    // Create template
    const { data: template, error } = await supabase
      .from('lists')
      .insert({
        owner_id: user.id,
        name: templateName,
        list_type: sourceList.list_type,
        description: sourceList.description,
        is_template: true,
      })
      .select()
      .single()

    if (error || !template) return null

    // Copy items
    const { data: sourceItems } = await supabase
      .from('items')
      .select('text, quantity, unit, notes, category_id, sort_order, is_starred')
      .eq('list_id', sourceListId)
      .eq('is_completed', false)

    if (sourceItems && sourceItems.length > 0) {
      await supabase.from('items').insert(
        sourceItems.map((item) => ({
          ...item,
          list_id: template.id,
          created_by: user.id,
        })),
      )
    }

    await fetchTemplates()
    return template
  }, [user, fetchTemplates])

  const createListFromTemplate = useCallback(async (templateId: string) => {
    if (!user) return null

    const template = templates.find((t) => t.id === templateId)
    if (!template) return null

    const { data: newList, error } = await supabase
      .from('lists')
      .insert({
        owner_id: user.id,
        name: template.name,
        list_type: template.list_type,
        description: template.description,
        is_template: false,
      })
      .select()
      .single()

    if (error || !newList) return null

    const { data: templateItems } = await supabase
      .from('items')
      .select('text, quantity, unit, notes, category_id, sort_order, is_starred')
      .eq('list_id', templateId)

    if (templateItems && templateItems.length > 0) {
      await supabase.from('items').insert(
        templateItems.map((item) => ({
          ...item,
          list_id: newList.id,
          created_by: user.id,
        })),
      )
    }

    return newList
  }, [user, templates])

  const deleteTemplate = useCallback(async (id: string) => {
    const { error } = await supabase.from('lists').delete().eq('id', id)
    if (error) return false
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    return true
  }, [])

  return {
    templates,
    loading,
    saveAsTemplate,
    createListFromTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  }
}
