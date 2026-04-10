// src/app/(dashboard)/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="h-16 border-b px-6 flex items-center justify-between bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="lg:hidden w-8 h-8 skeleton" />
          <div className="space-y-2">
            <div className="h-5 w-32 skeleton" />
            <div className="h-3 w-48 skeleton hidden sm:block" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full skeleton" />
          <div className="h-10 w-10 rounded-full skeleton" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 p-6 space-y-6 overflow-hidden">
        {/* Toolbar Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-1 w-full sm:w-auto">
            <div className="h-10 w-full sm:w-64 skeleton" />
            <div className="h-10 w-32 skeleton" />
          </div>
          <div className="h-10 w-40 skeleton" />
        </div>

        {/* Highlight Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 glass-card rounded-xl p-4 space-y-3">
              <div className="h-3 w-1/2 skeleton" />
              <div className="h-8 w-1/3 skeleton" />
            </div>
          ))}
        </div>

        {/* Table/List Skeleton */}
        <div className="bg-card rounded-xl border shadow-sm flex-1 overflow-hidden">
          <div className="p-4 border-b flex justify-between">
            <div className="h-4 w-48 skeleton" />
            <div className="h-4 w-24 skeleton" />
          </div>
          <div className="divide-y">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg skeleton" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 skeleton" />
                    <div className="h-3 w-1/4 skeleton" />
                  </div>
                </div>
                <div className="h-6 w-16 skeleton hidden sm:block" />
                <div className="h-8 w-24 skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
