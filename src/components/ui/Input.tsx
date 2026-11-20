import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  errorTextClassName?: 'text-sm' | 'text-xs'
}

export function Input({ label, error, errorTextClassName = 'text-xs', className = '', id, ...props }: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const errorId = `${inputId}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : props['aria-invalid']}
        aria-describedby={error ? errorId : props['aria-describedby']}
        className={`h-11 rounded-lg border bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground motion-reduce:transition-none ${
          error ? 'border-danger-600' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error && <p id={errorId} className={`${errorTextClassName} text-danger-600`}>{error}</p>}
    </div>
  )
}
