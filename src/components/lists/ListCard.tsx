import { cn } from '@/lib/utils.ts'
import { emojiForListType } from '@/lib/listTypes.ts'
import type { MouseEvent } from 'react'

interface ListCardProps {
  id: string
  name: string
  listType: string
  itemCount: number
  updatedAt: string
  isOwner: boolean
  members: Array<{
    profile: { display_name: string | null; avatar_url: string | null } | null
  }>
  onClick: () => void
  onDelete?: () => void
}

export function ListCard({ name, listType, itemCount, updatedAt, isOwner, members, onClick, onDelete }: ListCardProps) {
  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation()
    onDelete?.()
  }

  const timeAgo = getRelativeTime(updatedAt)

  return (
    <article
      className={cn(
        'shadow-soft relative rounded-2xl border border-border p-4',
        'bg-bg-secondary transition-all hover:-translate-y-0.5 hover:border-accent/40',
      )}
    >
      {/* Full-card navigation target. Sits beneath the content so nested
          controls (delete) can layer above it without nesting <button>s. */}
      <button
        onClick={onClick}
        aria-label={`Open ${name}`}
        className="absolute inset-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />

      <div className="pointer-events-none relative flex items-center gap-3">
        <span className="grad-chip grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl">
          {emojiForListType(listType)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-text-primary">{name}</h3>
          <div className="mt-0.5 flex items-center gap-2 text-sm font-medium text-text-muted">
            <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
            <span aria-hidden>·</span>
            <span>{timeAgo}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {members.length > 0 && (
            <div className="flex -space-x-2">
              {members.slice(0, 3).map((m, i) => (
                <div
                  key={i}
                  className="grad-sky flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg-secondary text-xs font-bold text-white"
                  title={m.profile?.display_name ?? 'Member'}
                >
                  {m.profile?.display_name?.[0]?.toUpperCase() ?? '?'}
                </div>
              ))}
              {members.length > 3 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg-secondary bg-bg-tertiary text-xs font-bold text-text-muted">
                  +{members.length - 3}
                </div>
              )}
            </div>
          )}
          {isOwner && onDelete && (
            <button
              onClick={handleDelete}
              className="pointer-events-auto relative ml-1 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
              aria-label={`Delete ${name}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
