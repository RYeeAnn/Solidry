'use client';

export default function AnalysisSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Score Card Skeleton */}
      <div className="panel p-6">
        <div className="flex items-center gap-6">
          <div className="w-[108px] h-[108px] rounded-full skeleton" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-24 skeleton" />
            <div className="h-8 w-16 skeleton" />
            <div className="h-3 w-36 skeleton" />
          </div>
        </div>
      </div>

      {/* Confidence Skeleton */}
      <div className="panel p-4 space-y-3">
        <div className="h-12 skeleton" />
        <div className="space-y-2">
          <div className="h-3 w-32 skeleton" />
          <div className="h-3 w-48 skeleton" />
          <div className="h-3 w-40 skeleton" />
        </div>
      </div>

      {/* Summary Skeleton */}
      <div className="panel p-4 space-y-2">
        <div className="h-4 w-20 skeleton" />
        <div className="h-3 w-full skeleton" />
        <div className="h-3 w-3/4 skeleton" />
      </div>

      {/* Metrics Skeleton */}
      <div className="panel p-4">
        <div className="h-4 w-24 skeleton mb-3" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 skeleton" />
          <div className="h-16 skeleton" />
          <div className="h-16 skeleton" />
        </div>
      </div>
    </div>
  );
}
