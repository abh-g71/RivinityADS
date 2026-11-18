'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'

type ToastOptions = {
  title: string
  description?: string
  variant?: 'default' | 'success' | 'error'
  action?: { label: string; onClick: () => void }
}

type ToastEntry = ToastOptions & { id: number }
type ToastContextValue = (options: ToastOptions) => void

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([])

  const toast = useCallback((options: ToastOptions) => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { ...options, id }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((entry) => entry.id !== id))
    }, 5000)
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((entry) => entry.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3" aria-live="polite" aria-relevant="additions">
        {toasts.map((entry) => (
          <section
            key={entry.id}
            role={entry.variant === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto animate-toast-in rounded-lg border border-slate-200 bg-white p-4 text-navy-900 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className={`text-sm font-semibold ${entry.variant === 'error' ? 'text-danger-600' : entry.variant === 'success' ? 'text-success-600' : 'text-navy-900'}`}>{entry.title}</h2>
                {entry.description && <p className="mt-1 text-sm text-slate-600">{entry.description}</p>}
                {entry.action && (
                  <button
                    type="button"
                    onClick={() => {
                      entry.action?.onClick()
                      dismiss(entry.id)
                    }}
                    className="mt-2 rounded-md text-sm font-semibold text-brand-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    {entry.action.label}
                  </button>
                )}
              </div>
              <button type="button" onClick={() => dismiss(entry.id)} aria-label="Dismiss notification" className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </section>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const toast = useContext(ToastContext)
  if (!toast) throw new Error('useToast must be used within ToastProvider')
  return toast
}
