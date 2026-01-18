import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-gray-800/50',
        className
      )}
    />
  );
}

export function RaffleCardSkeleton() {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <LoadingSkeleton className="h-6 w-3/4 mb-2" />
          <LoadingSkeleton className="h-4 w-1/2" />
        </div>
        <LoadingSkeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mb-4 p-3 rounded-lg bg-gray-800/30">
        <LoadingSkeleton className="h-4 w-24 mb-2" />
        <LoadingSkeleton className="h-8 w-32" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <LoadingSkeleton className="h-4 w-20 mb-1" />
          <LoadingSkeleton className="h-5 w-24" />
        </div>
        <div>
          <LoadingSkeleton className="h-4 w-20 mb-1" />
          <LoadingSkeleton className="h-5 w-16" />
        </div>
      </div>
      <LoadingSkeleton className="h-2 w-full rounded-full mb-4" />
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <LoadingSkeleton className="h-5 w-24" />
        <LoadingSkeleton className="h-5 w-5 rounded" />
      </div>
    </div>
  );
}

export function RaffleDetailSkeleton() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton className="h-5 w-32" />
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div className="flex-1">
            <LoadingSkeleton className="h-8 w-3/4 mb-2" />
            <LoadingSkeleton className="h-4 w-1/2" />
          </div>
          <LoadingSkeleton className="h-10 w-32" />
        </div>
        <div className="p-6 rounded-xl bg-gray-800/30 mb-6">
          <LoadingSkeleton className="h-4 w-24 mb-2" />
          <LoadingSkeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg bg-gray-800/30">
              <LoadingSkeleton className="h-4 w-20 mb-2" />
              <LoadingSkeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <LoadingSkeleton className="h-6 w-32 mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-12 w-full mb-2" />
        ))}
      </div>
    </div>
  );
}
