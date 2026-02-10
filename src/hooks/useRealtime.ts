import { useEffect } from 'react'
import { supabase } from '@/lib/supabase.ts'

interface UseRealtimeOptions {
  listId: string | undefined
  onItemChange: () => void
}

export function useRealtime({ listId, onItemChange }: UseRealtimeOptions) {
  useEffect(() => {
    if (!listId) return

    const channel = supabase
      .channel(`list:${listId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'items',
        filter: `list_id=eq.${listId}`,
      }, () => {
        onItemChange()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [listId, onItemChange])
}
