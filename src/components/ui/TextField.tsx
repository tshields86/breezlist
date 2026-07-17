import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils.ts'
import { inputClasses, labelClasses } from '@/lib/formClasses.ts'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
}

/** Labelled text input used across the auth and list forms. */
export function TextField({ id, label, className, ...props }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      <input id={id} className={cn('w-full', inputClasses, className)} {...props} />
    </div>
  )
}
