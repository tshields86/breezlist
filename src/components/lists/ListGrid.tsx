import { useNavigate } from 'react-router-dom'
import { ListCard } from '@/components/lists/ListCard.tsx'
import { BrandMark } from '@/components/ui/Mark.tsx'
import { useAuth } from '@/hooks/useAuth.ts'

interface ListItem {
  id: string
  name: string
  list_type: string
  item_count: number
  completed_count: number
  updated_at: string
  owner_id: string
  members: Array<{
    user_id: string
    role: string
    profile: { display_name: string | null; avatar_url: string | null } | null
  }>
}

interface ListGridProps {
  ownedLists: ListItem[]
  sharedLists: ListItem[]
  onDelete: (id: string) => void
}

export function ListGrid({ ownedLists, sharedLists, onDelete }: ListGridProps) {
  const navigate = useNavigate()
  const { user } = useAuth()

  if (ownedLists.length === 0 && sharedLists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <BrandMark size={56} className="mb-5 opacity-90" />
        <h3 className="mb-2 text-lg font-bold text-text-primary">No lists yet</h3>
        <p className="max-w-xs text-text-secondary">
          Tap the <span className="font-semibold text-accent-text">+</span> button to start your first list —
          it&apos;s a breeze.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {ownedLists.length > 0 && (
        <section>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {ownedLists.map((list) => (
              <ListCard
                key={list.id}
                id={list.id}
                name={list.name}
                listType={list.list_type}
                itemCount={list.item_count}
                completedCount={list.completed_count}
                updatedAt={list.updated_at}
                isOwner={list.owner_id === user?.id}
                members={list.members}
                onClick={() => navigate(`/lists/${list.id}`)}
                onDelete={() => onDelete(list.id)}
              />
            ))}
          </div>
        </section>
      )}

      {sharedLists.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">
            Shared with Me
          </h2>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {sharedLists.map((list) => (
              <ListCard
                key={list.id}
                id={list.id}
                name={list.name}
                listType={list.list_type}
                itemCount={list.item_count}
                completedCount={list.completed_count}
                updatedAt={list.updated_at}
                isOwner={false}
                members={list.members}
                onClick={() => navigate(`/lists/${list.id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
