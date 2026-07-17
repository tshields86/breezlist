import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase.ts'
import { useAuth } from '@/hooks/useAuth.ts'
import { useToast } from '@/components/ui/Toast.tsx'
import { Logo } from '@/components/ui/Logo.tsx'
import { BrandMark } from '@/components/ui/Mark.tsx'
import { emojiForListType } from '@/lib/listTypes.ts'
import { cn } from '@/lib/utils.ts'

type SharedList = { id: string; name: string; list_type: string }
type SharedItem = {
  id: string
  text: string
  quantity: number | null
  unit: string | null
  is_completed: boolean
  is_starred: boolean
  sort_order: number
}

export default function SharedListPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [list, setList] = useState<SharedList | null>(null)
  const [items, setItems] = useState<SharedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (!token) return
    let active = true
    ;(async () => {
      const [{ data: listRows }, { data: itemRows }] = await Promise.all([
        supabase.rpc('get_shared_list', { _token: token }),
        supabase.rpc('get_shared_items', { _token: token }),
      ])
      if (!active) return
      setList((listRows as SharedList[] | null)?.[0] ?? null)
      setItems(((itemRows as SharedItem[] | null) ?? []).sort((a, b) => a.sort_order - b.sort_order))
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [token])

  const handleEdit = useCallback(async () => {
    if (!token) return
    if (!user) {
      sessionStorage.setItem('pendingShareToken', token)
      navigate('/login')
      return
    }
    setJoining(true)
    const { data, error } = await supabase.rpc('join_via_share_link', { _token: token })
    setJoining(false)
    if (error || !data) {
      toast('Could not open this list. Please try again.', 'error')
      return
    }
    navigate(`/lists/${data}`)
  }, [token, user, navigate, toast])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  if (!list) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-primary px-6 text-center">
        <BrandMark size={56} className="opacity-90" />
        <h1 className="text-xl font-bold text-text-primary">This link isn&apos;t available</h1>
        <p className="max-w-xs text-text-secondary">
          The list may have been unshared or the link is incorrect.
        </p>
        <a href="/" className="grad-sky shadow-sky mt-2 rounded-xl px-5 py-2.5 font-bold text-white">
          Go to Breezlist
        </a>
      </div>
    )
  }

  const active = items.filter((i) => !i.is_completed)
  const completed = items.filter((i) => i.is_completed)

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Logo withMark markSize={30} className="text-lg" />
          <button
            onClick={handleEdit}
            disabled={joining}
            className="grad-sky shadow-sky rounded-xl px-4 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {joining ? 'Opening…' : user ? 'Add to my lists' : 'Sign in to edit'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-2xl" aria-hidden>{emojiForListType(list.list_type)}</span>
          <h1 className="text-2xl font-extrabold tracking-tight">{list.name}</h1>
        </div>
        <p className="mb-6 text-sm font-medium text-text-muted">Shared with you · read-only</p>

        {items.length === 0 ? (
          <p className="text-text-secondary">This list is empty.</p>
        ) : (
          <div className="shadow-soft overflow-hidden rounded-2xl border border-border bg-bg-secondary">
            {active.map((item) => <SharedRow key={item.id} item={item} />)}
            {completed.length > 0 && (
              <div className="border-t border-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                Completed · {completed.length}
              </div>
            )}
            {completed.map((item) => <SharedRow key={item.id} item={item} />)}
          </div>
        )}
      </main>
    </div>
  )
}

function SharedRow({ item }: { item: SharedItem }) {
  const quantity = item.quantity ? `${item.quantity}${item.unit ? ` ${item.unit}` : ''}` : null
  return (
    <div className={cn('flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0', item.is_completed && 'opacity-60')}>
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
          item.is_completed ? 'grad-sky border-transparent' : 'border-text-muted/40',
        )}
      >
        {item.is_completed && (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span className={cn('font-medium', item.is_completed && 'text-text-muted line-through')}>{item.text}</span>
      {quantity && <span className="text-sm text-text-secondary">{quantity}</span>}
      {item.is_starred && !item.is_completed && (
        <svg className="ml-auto text-star" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )}
    </div>
  )
}
