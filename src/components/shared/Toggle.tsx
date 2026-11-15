'use client'

import { Switch } from '@/components/primitives/switch'

type ToggleProps = {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Toggle({ id, label, checked, onChange }: ToggleProps) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="h-6 w-11 data-[state=unchecked]:bg-slate-300 data-[state=checked]:bg-brand-600"
      />
      {label}
    </label>
  )
}
