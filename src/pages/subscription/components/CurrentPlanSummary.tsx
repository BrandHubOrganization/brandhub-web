import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { CurrentSubscription } from "../types/subscription";
import { AiCreditUsageBar } from "./AiCreditUsageBar";

export interface CurrentPlanSummaryProps {
  subscription: CurrentSubscription;
}

export function CurrentPlanSummary({ subscription }: CurrentPlanSummaryProps) {
  const { t } = useTranslation();

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-xl border p-5 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-sm font-semibold">
            {t("subscription.plans.currentTier")}: {subscription.tier}
          </span>
          <Badge
            variant={subscription.status === "ACTIVE" ? "PUBLISHED" : "FAILED"}
          >
            {t(`subscription.status.${subscription.status}`)}
          </Badge>
        </div>
        {subscription.renewsAt && (
          <p className="text-muted-foreground text-xs">
            {t("subscription.plans.renewsAt")}{" "}
            {new Date(subscription.renewsAt).toLocaleDateString("vi-VN")}
          </p>
        )}
      </div>
      <div className="w-full md:w-64">
        <AiCreditUsageBar
          used={subscription.aiCreditsUsed}
          limit={subscription.aiCreditsLimit}
        />
      </div>
    </div>
  );
}

export default CurrentPlanSummary;
