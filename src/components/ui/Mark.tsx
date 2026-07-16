import { useId } from 'react'
import { cn } from '@/lib/utils.ts'

interface BrandMarkProps {
  /** Size of the rounded icon tile in pixels. */
  size?: number
  className?: string
}

/**
 * The Breezlist mark: a checkmark riding a breeze (three motion streaks
 * blowing into a check) on a sky-gradient tile. Shared by the header, splash,
 * and icon assets so the brand reads consistently everywhere.
 */
export function BrandMark({ size = 32, className }: BrandMarkProps) {
  const gradientId = useId()
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="Breezlist"
      className={cn(className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5aa6f7" />
          <stop offset="1" stopColor="#2f7ee0" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill={`url(#${gradientId})`} />
      <g stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 18H19" strokeWidth="3.2" opacity="0.55" />
        <path d="M8 24H18" strokeWidth="3.2" opacity="0.9" />
        <path d="M11 30H19" strokeWidth="3.2" opacity="0.55" />
        <path d="M18 24L23.5 30L37 14" strokeWidth="4" />
      </g>
    </svg>
  )
}
