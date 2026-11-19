import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
}

export function Checkbox({ label, id, className = '', ...props }: CheckboxProps) {
  const autoId = useId()
  const checkboxId = id ?? autoId

  return (
    <label htmlFor={checkboxId} className="flex cursor-pointer items-start gap-2.5">
      <input
        id={checkboxId}
        type="checkbox"
        className={`mt-0.5 h-4 w-4 cursor-pointer rounded border-border accent-primary ${className}`}
        {...props}
      />
      <span className="text-sm text-foreground">{label}</span>
    </label>
  )
}