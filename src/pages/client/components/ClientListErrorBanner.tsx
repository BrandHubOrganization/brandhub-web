import { useTranslation } from "react-i18next";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ClientListErrorBannerProps {
  onRetry: () => void;
}

export function ClientListErrorBanner({ onRetry }: ClientListErrorBannerProps) {
  const { t } = useTranslation();

  return (
    <div className="border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center gap-3 rounded-xl border p-6 text-center">
      <div className="text-destructive flex items-center gap-2 text-sm font-medium">
        <AlertCircle className="size-4" />
        <span>{t("client.loadListError")}</span>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 text-xs">
        <RefreshCw className="size-3.5" /> {t("client.list.retry")}
      </Button>
    </div>
  );
}

export default ClientListErrorBanner;
