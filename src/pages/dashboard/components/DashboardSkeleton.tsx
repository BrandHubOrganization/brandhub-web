import { Skeleton } from "@/components/ui/skeleton";
export function DashboardSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-busy="true">
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
