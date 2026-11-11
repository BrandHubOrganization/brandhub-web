import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminErrorBanner({ onRetry }: { onRetry?: () => void } = {}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center gap-3 rounded-xl border p-6 text-center">
      <div className="text-destructive flex items-center gap-2 text-sm font-medium">
        <AlertCircle className="size-4" />
        <span>{t("dashboard.admin.loadError")}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => (onRetry ? onRetry() : void navigate(0))}
        className="gap-2 text-xs"
      >
        <RefreshCw className="size-3.5" /> {t("dashboard.admin.retry")}
      </Button>
    </div>
  );
}

export default AdminErrorBanner;
