import React from 'react';

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-zinc-200/80 rounded ${className}`} />;
}

export function ProjectRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-workspace-border rounded-xl">
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-72" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function DocumentRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-3.5 bg-white border border-workspace-border rounded-lg">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 rounded-md" />
    </div>
  );
}

export function AnalysisReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="p-5 bg-white border border-workspace-border rounded-xl space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </div>
  );
}
