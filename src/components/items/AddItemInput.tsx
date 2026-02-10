import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react'
import { useItemHistory } from '@/hooks/useItemHistory.ts'
import { ItemAutocomplete } from '@/components/items/ItemAutocomplete.tsx'

interface AddItemInputProps {
  onAdd: (input: {
    text: string
    quantity?: number | null
    unit?: string | null
    notes?: string | null
  }) => Promise<unknown>
}

export function AddItemInput({ onAdd }: AddItemInputProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { suggestions, searchHistory, getFrequentItems, clearSuggestions } = useItemHistory()

  useEffect(() => {
    if (!focused) return
    if (text.trim().length > 0) {
      searchHistory(text.trim())
    } else {
      getFrequentItems()
    }
  }, [text, focused, searchHistory, getFrequentItems])

  const submitItem = async (itemText: string) => {
    if (!itemText || loading) return
    setLoading(true)
    await onAdd({ text: itemText })
    setText('')
    clearSuggestions()
    setLoading(false)
    inputRef.current?.focus()
  }

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()
    await submitItem(text.trim())
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSuggestionSelect = (selectedText: string, _categoryHint: string | null) => {
    submitItem(selectedText)
  }

  return (
    <div className="sticky bottom-16 bg-bg-primary border-t border-border px-4 py-3 z-20">
      <div className="relative">
        <ItemAutocomplete
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
          visible={focused && suggestions.length > 0}
        />
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Add an item..."
            maxLength={500}
            className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-bg-secondary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={!text.trim() || loading}
            className="px-4 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            aria-label="Add item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
