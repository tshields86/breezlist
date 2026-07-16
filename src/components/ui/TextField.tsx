import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils.ts'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
}

/** Labelled text input used across the auth and list forms. */
export function TextField({ id, label, className, ...props }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-text-secondary">
        {label}
      </label>
      <input
        id={id}
        className={cn(
          'w-full rounded-xl border border-border bg-bg-secondary px-3.5 py-3 text-text-primary',
          'placeholder:text-text-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent',
          'transition',
          className,
        )}
        {...props}
      />
    </div>
  )
}
