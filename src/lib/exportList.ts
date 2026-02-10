interface ExportItem {
  text: string
  quantity: number | null
  unit: string | null
  notes: string | null
  is_completed: boolean
  category_name: string | null
}

interface ExportOptions {
  listName: string
  items: ExportItem[]
}

export function formatListForExport({ listName, items }: ExportOptions): string {
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const lines: string[] = []

  lines.push(`📋 ${listName} (${date})`)
  lines.push('━'.repeat(26))
  lines.push('')

  const activeItems = items.filter((i) => !i.is_completed)
  const completedItems = items.filter((i) => i.is_completed)

  // Group by category
  const categories = new Map<string, ExportItem[]>()
  const uncategorized: ExportItem[] = []

  for (const item of activeItems) {
    if (item.category_name) {
      const existing = categories.get(item.category_name) ?? []
      existing.push(item)
      categories.set(item.category_name, existing)
    } else {
      uncategorized.push(item)
    }
  }

  // Render categorized items
  for (const [category, categoryItems] of categories) {
    lines.push(`📂 ${category}`)
    for (const item of categoryItems) {
      lines.push(`  ☐ ${formatItem(item)}`)
    }
    lines.push('')
  }

  // Render uncategorized items
  if (uncategorized.length > 0) {
    if (categories.size > 0) {
      lines.push('📂 Other')
    }
    for (const item of uncategorized) {
      lines.push(`  ☐ ${formatItem(item)}`)
    }
    lines.push('')
  }

  // Completed items
  if (completedItems.length > 0) {
    lines.push('✅ Completed')
    for (const item of completedItems) {
      lines.push(`  ☑ ${formatItem(item)}`)
    }
    lines.push('')
  }

  lines.push('━'.repeat(26))
  lines.push('Shared via Breezlist')

  return lines.join('\n')
}

function formatItem(item: ExportItem): string {
  let text = item.text
  if (item.quantity) {
    text += ` (${item.quantity}${item.unit ? ` ${item.unit}` : ''})`
  }
  if (item.notes) {
    text += ` — ${item.notes}`
  }
  return text
}

export async function shareOrCopyList(text: string): Promise<'shared' | 'copied'> {
  if (navigator.share) {
    try {
      await navigator.share({ text })
      return 'shared'
    } catch {
      // User cancelled or share failed, fall through to clipboard
    }
  }

  await navigator.clipboard.writeText(text)
  return 'copied'
}
