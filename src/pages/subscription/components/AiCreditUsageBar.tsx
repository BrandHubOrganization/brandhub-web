import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export interface AiCreditUsageBarProps {
  used: number;
  limit: number;
}

export function AiCreditUsageBar({ used, limit }: AiCreditUsageBarProps) {
  const { t } = useTranslation();
  const percent =
    limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {t("subscription.plans.aiCredits")}
        </span>
        <span className="text-foreground font-medium">
          {used} / {limit}
        </span>
      </div>
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            percent >= 90 ? "bg-destructive" : "bg-brand-orange",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default AiCreditUsageBar;
