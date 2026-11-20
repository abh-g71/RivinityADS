'use client'
import { useEffect, useRef, useState } from 'react'

type Photo = { id: string; url: string; name: string }

export function PhotoUpload() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const photosRef = useRef<Photo[]>([])

  useEffect(() => {
    photosRef.current = photos
  }, [photos])

  useEffect(() => {
    return () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url))
  }, [])

  const addFiles = (files: FileList | null) => {
    if (!files) return
    const added = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((f) => ({
        id: `${f.name}-${f.size}-${Math.random()}`,
        url: URL.createObjectURL(f),
        name: f.name,
      }))
    setPhotos((prev) => [...prev, ...added].slice(0, 8))
  }

  const remove = (id: string) => {
    setPhotos((prev) => {
      const gone = prev.find((p) => p.id === id)
      if (gone) URL.revokeObjectURL(gone.url)
      return prev.filter((p) => p.id !== id)
    })
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
        className={`rounded-lg border-2 border-dashed p-3 text-center transition-colors ${
          dragging ? 'border-accent bg-secondary' : 'border-border'
        }`}
      >
        <p className="text-sm text-muted-foreground">Drag photos here, or</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          Choose files
        </button>
        <p className="mt-2 text-sm text-muted-foreground">Up to 8 images</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {photos.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((p) => (
            <li key={p.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(p.id)}
                aria-label={`Remove ${p.name}`}
                className="absolute right-1 top-1 h-6 w-6 rounded-full bg-primary/80 text-sm text-white hover:bg-primary"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
