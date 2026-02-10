import { useNavigate } from 'react-router-dom'
import { useTemplates } from '@/hooks/useTemplates.ts'

const typeEmoji: Record<string, string> = {
  grocery: '🛒',
  todo: '✅',
  packing: '🧳',
  gift: '🎁',
  general: '📝',
}

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
      <h2 className="text-xl font-semibold text-text-primary mb-4">Templates</h2>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No templates yet</h3>
          <p className="text-text-secondary">Save a list as a template to reuse it later</p>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="p-4 rounded-xl border border-border bg-bg-primary"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{typeEmoji[template.list_type] ?? '📝'}</span>
                  <h3 className="font-semibold text-text-primary">{template.name}</h3>
                </div>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-danger transition-colors"
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
                className="w-full py-2 px-4 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors text-sm"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
