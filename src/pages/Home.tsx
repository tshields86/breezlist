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

  return (
    <div className="p-4">
      <ListGrid
        ownedLists={ownedLists}
        sharedLists={sharedLists}
        onDelete={handleDelete}
      />

      <button
        onClick={() => setShowCreate(true)}
        className="fixed right-4 w-14 h-14 rounded-full bg-accent text-white shadow-lg hover:bg-accent-hover transition-colors flex items-center justify-center z-30"
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
