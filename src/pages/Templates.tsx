import { useNavigate } from 'react-router-dom'
import { useTemplates } from '@/hooks/useTemplates.ts'
import { emojiForListType } from '@/lib/listTypes.ts'

export default function Templates() {
  const navigate = useNavigate()
  const { templates, loading, createListFromTemplate, deleteTemplate } = useTemplates()

  const handleUseTemplate = async (templateId: string) => {
    const newList = await createListFromTemplate(templateId)
    if (newList) {
      navigate(`/lists/${newList.id}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this template?')) {
      await deleteTemplate(id)
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
      <h2 className="mb-5 text-2xl font-extrabold tracking-tight text-text-primary">Templates</h2>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
          <span className="grad-chip mb-4 grid h-16 w-16 place-items-center rounded-2xl text-3xl">📋</span>
          <h3 className="mb-2 text-lg font-bold text-text-primary">No templates yet</h3>
          <p className="max-w-xs text-text-secondary">
            Save a list as a template to reuse it later — perfect for weekly groceries.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="shadow-soft rounded-2xl border border-border bg-bg-secondary p-4"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="grad-chip grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl">
                  {emojiForListType(template.list_type)}
                </span>
                <h3 className="min-w-0 flex-1 truncate font-bold text-text-primary">{template.name}</h3>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="rounded-lg p-1.5 text-text-muted transition-colors hover:text-danger"
                  aria-label="Delete template"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => handleUseTemplate(template.id)}
                className="grad-sky shadow-sky w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                Use template
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
