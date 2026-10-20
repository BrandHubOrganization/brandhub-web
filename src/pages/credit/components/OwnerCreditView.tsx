import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Crown, ChevronDown } from "lucide-react";
import { CreditAmountForm } from "@/pages/credit/components/CreditAmountForm";
import { CreditBalancePanel } from "@/pages/credit/components/CreditBalancePanel";
import { CreditUsagePanel } from "@/pages/credit/components/CreditUsagePanel";
import { CreditQueryState } from "@/pages/credit/components/CreditQueryState";
import { MemberCreditPanel } from "@/pages/credit/components/MemberCreditPanel";
import { useAgencyCredit } from "@/pages/credit/hooks/useCreditConfiguration";

export function OwnerCreditView({ agencyId }: { agencyId: string }) {
  const { t } = useTranslation();
  const { policy, members, savePolicy, reloadPolicy, userId } =
    useAgencyCredit(agencyId);
  const [showOwnUsage, setShowOwnUsage] = useState(false);

  const policyPresets = [
    { label: "50", value: 50 },
    { label: "100", value: 100 },
    { label: "500", value: 500 },
    { label: "1.000", value: 1000 },
  ];

  return (
    <div className="space-y-6">
      <CreditBalancePanel agencyId={agencyId} />

      {/* Grid: Default Agency Policy & Owner Overview */}
      <div className="grid items-start gap-5 xl:grid-cols-2">
        {policy.isPending || policy.isError ? (
          <CreditQueryState
            loading={policy.isPending}
            error={policy.error}
            retry={() => policy.refetch()}
          />
        ) : (
          <CreditAmountForm
            key={policy.data.revision}
            title={t("credit.policy.title")}
            description={t("credit.policy.description")}
            initial={policy.data.defaultMemberLimit}
            revision={policy.data.revision}
            presets={policyPresets}
            onSave={savePolicy}
            onReload={reloadPolicy}
          />
        )}

        <div className="border-border/70 bg-card space-y-4 rounded-2xl border p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-border/40 pb-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Crown className="size-4" />
            </div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {t("credit.owner.title")}
            </h2>
          </div>

          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            {t("credit.owner.description")}
          </p>

          <div className="pt-2">
            <details
              className="group rounded-xl border border-border/60 bg-muted/20 p-3 transition-colors"
              onToggle={(event) => setShowOwnUsage(event.currentTarget.open)}
            >
              <summary className="flex cursor-pointer items-center justify-between text-xs sm:text-sm font-semibold text-foreground focus-visible:outline-hidden">
                <span>{t("credit.usage.myUsage")}</span>
                <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              {showOwnUsage ? (
                <div className="mt-3 pt-3 border-t border-border/40">
                  <CreditUsagePanel agencyId={agencyId} />
                </div>
              ) : null}
            </details>
          </div>
        </div>
      </div>

      {/* Members Credit Management Panel */}
      {members.isPending || members.isError ? (
        <CreditQueryState
          loading={members.isPending}
          error={members.error}
          retry={() => members.refetch()}
        />
      ) : (
        <MemberCreditPanel
          agencyId={agencyId}
          members={members.data.filter((member) => member.userId !== userId)}
          defaultAgencyLimit={policy.data?.defaultMemberLimit}
        />
      )}

    </div>
  );
}
