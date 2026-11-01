import { Skeleton } from "@/components/ui/skeleton";

export function TrendSkeleton({ detail = false }: { detail?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="space-y-4 motion-reduce:[&_*]:animate-none"
    >
      {detail ? (
        <>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </>
      ) : (
        Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="border-border flex items-center justify-between gap-4 border-b p-4"
          >
            <div className="w-2/3 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))
      )}
    </div>
  );
}
