import { Skeleton } from '@/components/primitives/skeleton'

export default function ConsoleLoading() {
  return (
    <div role="status" aria-label="Loading console page" className="mx-auto max-w-7xl space-y-6 p-2">
      <div className="space-y-3">
        <Skeleton className="h-4 w-40 rounded-lg" />
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-80 max-w-full rounded-lg" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-28 rounded-lg" />)}
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  )
}
