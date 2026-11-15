type ProgressRingProps = {
  value: number
  label: string
}

export function ProgressRing({ value, label }: ProgressRingProps) {
  const circumference = 2 * Math.PI * 28
  const progress = Math.max(0, Math.min(100, value))

  return (
    <div className="flex items-center gap-3" aria-label={`${label}: ${progress}%`}>
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64" role="img" aria-label={`${progress}% ${label}`}>
        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="5" className="text-slate-100" />
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress / 100)}
          className="text-brand-600"
        />
      </svg>
      <span className="text-sm font-semibold text-navy-900">{label}</span>
    </div>
  )
}
