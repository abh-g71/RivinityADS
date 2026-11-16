'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

const EMPTY_VALUE = '__rivinityads_storage_empty__'
const UNAVAILABLE_VALUE = '__rivinityads_storage_unavailable__'
const LOCAL_STORAGE_EVENT = 'rivinityads:local-storage-change'

type StoredResult<T> = {
  value: T
  error: Error | null
}

export function useLocalStorageJson<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
) {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) onStoreChange()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener(LOCAL_STORAGE_EVENT, onStoreChange)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(LOCAL_STORAGE_EVENT, onStoreChange)
    }
  }, [key])

  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(key) ?? EMPTY_VALUE
    } catch {
      return UNAVAILABLE_VALUE
    }
  }, [key])

  const serialized = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_VALUE)
  const result = useMemo<StoredResult<T>>(() => {
    if (serialized === EMPTY_VALUE) return { value: fallback, error: null }
    if (serialized === UNAVAILABLE_VALUE) {
      return { value: fallback, error: new Error('Browser storage is unavailable.') }
    }
    try {
      const parsed: unknown = JSON.parse(serialized)
      return isValid(parsed)
        ? { value: parsed, error: null }
        : { value: fallback, error: new Error('Stored data has an unsupported format.') }
    } catch (error) {
      return {
        value: fallback,
        error: error instanceof Error ? error : new Error('Stored data is invalid.'),
      }
    }
  }, [fallback, isValid, serialized])

  const setValue = useCallback((value: T) => {
    window.localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new Event(LOCAL_STORAGE_EVENT))
  }, [key])

  return { ...result, setValue }
}
