export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg shimmer" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-20 rounded shimmer" />
                <div className="h-6 w-16 rounded shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 w-20 rounded shimmer" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-4 flex gap-8 items-center">
              <div className="h-4 w-6 rounded shimmer" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full shimmer" />
                <div className="space-y-2">
                  <div className="h-4 w-16 rounded shimmer" />
                  <div className="h-3 w-20 rounded shimmer" />
                </div>
              </div>
              <div className="h-4 w-24 rounded shimmer ml-auto" />
              <div className="h-6 w-20 rounded shimmer" />
              <div className="h-4 w-20 rounded shimmer" />
              <div className="space-y-1">
                <div className="h-3 w-16 rounded shimmer" />
                <div className="h-3 w-16 rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
