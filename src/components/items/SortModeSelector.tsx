import { cn } from '@/lib/utils.ts'
import type { SortPreference } from '@/types/index.ts'

interface SortModeSelectorProps {
  value: SortPreference
  onChange: (mode: SortPreference) => void
}

const modes: Array<{ value: SortPreference; label: string }> = [
  { value: 'manual', label: 'Manual' },
  { value: 'recent', label: 'Recent' },
  { value: 'alphabetical', label: 'A-Z' },
]

export function SortModeSelector({ value, onChange }: SortModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-bg-tertiary rounded-lg p-0.5">
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={cn(
            'px-3 py-1 text-xs font-medium rounded-md transition-colors',
            value === mode.value
              ? 'bg-bg-primary text-text-primary shadow-sm'
              : 'text-text-muted hover:text-text-secondary',
          )}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}
