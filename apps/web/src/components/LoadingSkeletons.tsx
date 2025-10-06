import { Skeleton } from './ui/skeleton'
import { Card } from './ui/card'

export function ListSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-10 w-48" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </Card>
        ))}
      </div>
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}

export function HomeSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-12 w-full mb-4" />
      <div className="grid gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}
