interface LogoProps {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <span className={`font-bold tracking-tight ${className}`}>
      <span className="text-brand-breez">breez</span>
      <span className="text-brand-list">list</span>
    </span>
  )
}
