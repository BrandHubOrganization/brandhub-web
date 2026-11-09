import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function MediaPackageLoadingState() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-52 w-full rounded-xl" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-72 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function PackageCatalogLoadingState() {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-label={t("mediaPackage.loading")}
      aria-busy="true"
      className="space-y-3"
    >
      {[0, 1, 2].map((item) => (
        <Skeleton
          key={item}
          className="h-24 w-full rounded-xl motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

export function WorkspacePackageLoadingState() {
  const { t } = useTranslation();
  return (
    <section
      role="status"
      aria-label={t("mediaPackage.loading")}
      aria-busy="true"
      className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,28%)]"
    >
      <div className="border-border bg-card space-y-4 rounded-xl border p-5">
        <Skeleton className="h-8 w-2/3 motion-reduce:animate-none" />
        <Skeleton className="h-12 w-3/4 motion-reduce:animate-none" />
        <Skeleton className="h-16 w-full motion-reduce:animate-none" />
        {[0, 1, 2].map((item) => (
          <Skeleton
            key={item}
            className="h-24 w-full motion-reduce:animate-none"
          />
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3 motion-reduce:animate-none" />
        <Skeleton className="h-9 w-full motion-reduce:animate-none" />
        <PackageCatalogLoadingState />
      </div>
    </section>
  );
}

interface MediaPackageErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function MediaPackageErrorState({
  message,
  onRetry,
}: MediaPackageErrorStateProps) {
  const { t } = useTranslation();
  return (
    <div className="border-destructive/30 bg-destructive/5 rounded-xl border p-6 text-center">
      <AlertCircle className="text-destructive mx-auto size-8" />
      <p className="text-foreground mt-3 text-sm font-medium">{message}</p>
      <Button variant="outline" className="mt-4" onClick={onRetry}>
        {t("mediaPackage.actions.retry")}
      </Button>
    </div>
  );
}
