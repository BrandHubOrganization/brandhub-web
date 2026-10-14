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
