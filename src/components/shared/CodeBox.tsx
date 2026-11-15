'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

type CodeBoxProps = {
  title: string
  code: string
  note?: string
}

export function CodeBox({ title, code, note }: CodeBoxProps) {
  const [copyStatus, setCopyStatus] = useState('')

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setCopyStatus('Copied to clipboard.')
    } catch {
      setCopyStatus('Clipboard unavailable. Select and copy the code manually.')
    }
  }

  return (
    <section aria-label={title} className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-navy-900">{title}</h2>
        <Button type="button" variant="outline" onClick={copyCode}>Copy</Button>
      </div>
      {note && <p className="mt-2 text-sm text-slate-600">{note}</p>}
      <pre className="mt-4 overflow-x-auto rounded-lg bg-navy-950 p-4 text-xs text-slate-100">
        <code>{code}</code>
      </pre>
      {copyStatus && <p className="mt-2 text-sm text-slate-600" role="status">{copyStatus}</p>}
    </section>
  )
}
