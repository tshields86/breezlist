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
    <div className="flex items-center gap-1 rounded-xl bg-bg-tertiary p-1">
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={cn(
            'rounded-lg px-3 py-1 text-xs font-bold transition-colors',
            value === mode.value
              ? 'bg-bg-secondary text-accent shadow-sm'
              : 'text-text-muted hover:text-text-secondary',
          )}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}
