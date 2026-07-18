export default function Loading() {
  return (
    <div className="animate-in space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-surface-container rounded animate-pulse" />
        <div className="h-4 w-64 bg-surface-container-high rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-surface-container rounded-xl border border-outline-variant animate-pulse" />
        ))}
      </div>
      <div className="h-64 bg-surface-container rounded-xl border border-outline-variant animate-pulse" />
    </div>
  )
}