'use client'

import { useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import {
  Select as PrimitiveSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/primitives/select'

type SelectOption = { value: string; label: string }
type SelectValueChange = { target: { value: string } }

type SelectProps = Pick<
  SelectHTMLAttributes<HTMLSelectElement>,
  'id' | 'name' | 'value' | 'defaultValue' | 'disabled' | 'required' | 'className'
> & {
  label: string
  labelClassName?: string
  compact?: boolean
  error?: string
  options: SelectOption[]
  onChange?: (event: SelectValueChange) => void
  onBlur?: () => void
}

const EMPTY_VALUE = '__rivinityads_empty_option__'

function toPrimitiveValue(value: string | undefined) {
  return value === '' ? EMPTY_VALUE : value
}

export function Select({
  label,
  labelClassName = '',
  compact = false,
  error,
  options,
  className = '',
  id,
  value,
  defaultValue,
  onChange,
  disabled,
  name,
  required,
  onBlur,
}: SelectProps) {
  const autoId = useId()
  const selectId = id ?? autoId
  const errorId = `${selectId}-error`

  return (
    <div className={cn('flex flex-col', compact ? 'gap-1' : 'gap-1.5')}>
      <label htmlFor={selectId} className={cn('text-sm font-medium text-foreground', labelClassName)}>
        {label}
      </label>
      <PrimitiveSelect
        value={value === undefined ? undefined : toPrimitiveValue(String(value))}
        defaultValue={defaultValue === undefined ? undefined : toPrimitiveValue(String(defaultValue))}
        onValueChange={(nextValue) => onChange?.({ target: { value: nextValue === EMPTY_VALUE ? '' : nextValue } })}
        disabled={disabled}
        name={name}
        required={required}
      >
        <SelectTrigger
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onBlur={onBlur}
          className={cn(`${compact ? 'h-9 py-1.5' : 'h-11'} w-full rounded-lg border-border bg-white text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground`, className)}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={toPrimitiveValue(option.value) ?? EMPTY_VALUE}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </PrimitiveSelect>
      {error && <p id={errorId} className="text-sm text-danger-600" role="alert">{error}</p>}
    </div>
  )
}
