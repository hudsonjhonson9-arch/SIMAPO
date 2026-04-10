// src/app/(dashboard)/loading.tsx
import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <div className="absolute inset-0 w-10 h-10 border-4 border-primary/20 rounded-full" />
        </div>
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium text-foreground/70 animate-pulse">
            Memuat dashboard...
          </p>
          <div className="mt-4 flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Optional: Add skeleton-like boxes to simulate layout stability */}
      <div className="absolute inset-0 p-6 -z-10 opacity-20 pointer-events-none overflow-hidden">
        <div className="h-10 w-48 bg-muted rounded-lg mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-[400px] bg-muted rounded-xl" />
      </div>
    </div>
  );
}
