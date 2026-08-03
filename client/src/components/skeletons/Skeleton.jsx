import clsx from '../../utils/clsx';

export function SkeletonLine({ className = '' }) {
  return <div className={clsx('animate-pulse bg-navy-50 rounded', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-parchment-100 rounded-card shadow-card p-6 space-y-3">
      <SkeletonLine className="h-4 w-1/3" />
      <SkeletonLine className="h-3 w-2/3" />
      <SkeletonLine className="h-3 w-1/2" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((__, c) => (
            <SkeletonLine key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
