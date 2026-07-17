import { useState } from 'react'
import { useLists } from '@/hooks/useLists.ts'
import { ListGrid } from '@/components/lists/ListGrid.tsx'
import { CreateListModal } from '@/components/lists/CreateListModal.tsx'
import type { ListType } from '@/types/index.ts'

export default function Home() {
  const { ownedLists, sharedLists, loading, createList, deleteList } = useLists()
  const [showCreate, setShowCreate] = useState(false)

  const handleCreate = async (name: string, listType: ListType) => {
    await createList({ name, list_type: listType })
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this list? This cannot be undone.')) {
      await deleteList(id)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const totalLists = ownedLists.length + sharedLists.length

  return (
    <div className="p-4">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">My Lists</h1>
          {totalLists > 0 && (
            <p className="mt-0.5 text-sm font-medium text-text-muted">
              {totalLists} {totalLists === 1 ? 'list' : 'lists'}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="grad-sky shadow-sky hidden shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-white transition-transform hover:-translate-y-0.5 lg:inline-flex"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New list
        </button>
      </div>

      <ListGrid
        ownedLists={ownedLists}
        sharedLists={sharedLists}
        onDelete={handleDelete}
      />

      <button
        onClick={() => setShowCreate(true)}
        className="grad-sky shadow-sky fixed right-4 z-30 flex h-14 w-14 items-center justify-center rounded-2xl text-white transition-transform hover:-translate-y-0.5 lg:hidden"
        style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
        aria-label="Create new list"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <CreateListModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />
    </div>
  )
}
