import { BrandMark } from './Mark'

interface LogoProps {
  /** Render the icon mark alongside the wordmark as a full lockup. */
  withMark?: boolean
  /** Pixel size of the mark when `withMark` is set. */
  markSize?: number
  className?: string
}

/** The Breezlist wordmark, optionally paired with the brand mark. */
export function Logo({ withMark = false, markSize = 30, className = '' }: LogoProps) {
  const wordmark = (
    <span className="font-extrabold tracking-tight">
      <span className="text-brand-breez">breez</span>
      <span className="text-brand-list">list</span>
    </span>
  )

  if (!withMark) {
    return <span className={`font-extrabold tracking-tight ${className}`}>{wordmark}</span>
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark size={markSize} />
      {wordmark}
    </span>
  )
}
