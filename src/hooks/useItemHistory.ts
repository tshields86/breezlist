import { useCallback, useState } from 'react'
import { supabase } from '@/lib/supabase.ts'
import { useAuth } from '@/hooks/useAuth.ts'

interface HistoryItem {
  text_display: string
  frequency: number
  category_hint: string | null
}

export function useItemHistory() {
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)

  const searchHistory = useCallback(async (query: string) => {
    if (!user) return

    setLoading(true)
    const { data } = await supabase
      .from('item_history')
      .select('text_display, frequency, category_hint')
      .eq('user_id', user.id)
      .ilike('text_normalized', `${query.toLowerCase()}%`)
      .order('frequency', { ascending: false })
      .limit(10)

    setSuggestions((data as HistoryItem[]) ?? [])
    setLoading(false)
  }, [user])

  const getFrequentItems = useCallback(async () => {
    if (!user) return

    setLoading(true)
    const { data } = await supabase
      .from('item_history')
      .select('text_display, frequency, category_hint')
      .eq('user_id', user.id)
      .order('frequency', { ascending: false })
      .limit(10)

    setSuggestions((data as HistoryItem[]) ?? [])
    setLoading(false)
  }, [user])

  const clearSuggestions = useCallback(() => {
    setSuggestions([])
  }, [])

  return {
    suggestions,
    loading,
    searchHistory,
    getFrequentItems,
    clearSuggestions,
  }
}
