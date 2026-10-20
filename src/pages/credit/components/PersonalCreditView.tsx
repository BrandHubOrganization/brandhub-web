import { useTranslation } from "react-i18next";
import { Shield, Sparkles } from "lucide-react";
import { CreditQueryState } from "@/pages/credit/components/CreditQueryState";
import { CreditUsagePanel } from "@/pages/credit/components/CreditUsagePanel";
import { useOwnCreditLimit } from "@/pages/credit/hooks/useCreditReporting";
import {
  formatCredits,
  validCreditAmounts,
} from "@/pages/credit/utils/creditFormat";

export function PersonalCreditView({ agencyId }: { agencyId: string }) {
  const { t, i18n } = useTranslation();
  const query = useOwnCreditLimit(agencyId);

  if (query.isPending || query.isError) {
    return (
      <CreditQueryState
        loading={query.isPending}
        error={query.error}
        retry={() => query.refetch()}
      />
    );
  }

  const isSafe =
    query.data.effectiveLimit === null ||
    validCreditAmounts([query.data.effectiveLimit]);

  return (
    <div className="space-y-5">
      {/* Personal Quota Header Card */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
              <Shield className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  {t("credit.personal.title", "Hạn mức tài khoản của bạn")}
                </h2>
                <span className="rounded-full bg-brand-orange/10 text-brand-orange px-2.5 py-0.5 text-xs font-medium border border-brand-orange/20">
                  {t(`credit.sourceLabel.${query.data.source}`)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t(
                  "credit.personal.subtitle",
                  "Hạn ngạch credit phân bổ cho bạn trong chu kỳ hiện tại",
                )}
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 sm:text-right">
            <Sparkles className="size-4 text-brand-orange shrink-0 self-center" />
            <span className="font-mono text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {!isSafe
                ? t("credit.errors.unsafe")
                : query.data.effectiveLimit === null
                  ? t("credit.usage.unlimited")
                  : formatCredits(query.data.effectiveLimit, i18n.language)}
            </span>
            {query.data.effectiveLimit !== null && isSafe && (
              <span className="text-xs text-muted-foreground font-medium">
                credits/kỳ
              </span>
            )}
          </div>
        </div>
      </div>

      <CreditUsagePanel agencyId={agencyId} />
    </div>
  );
}
