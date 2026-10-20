import { useTranslation } from "react-i18next";
import { Coins, Lock, ArrowUpRight, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelpHint } from "@/components/shared/HelpHint";
import { CreditQueryState } from "@/pages/credit/components/CreditQueryState";
import { useCreditBalance } from "@/pages/credit/hooks/useCreditReporting";
import {
  formatCredits,
  validCreditAmounts,
} from "@/pages/credit/utils/creditFormat";
import { cn } from "@/lib/utils";

export interface CreditBalancePanelProps {
  agencyId: string;
  onTopUpClick?: () => void;
}

export function CreditBalancePanel({
  agencyId,
  onTopUpClick,
}: CreditBalancePanelProps) {
  const { t, i18n } = useTranslation();
  const query = useCreditBalance(agencyId);

  if (query.isPending || query.isError) {
    return (
      <CreditQueryState
        loading={query.isPending}
        error={query.error}
        retry={() => query.refetch()}
      />
    );
  }

  const balance = query.data;
  const development = balance.developmentAvailable ?? 0;
  const available = balance.planAvailable + balance.purchasedAvailable + development;

  if (
    !validCreditAmounts([
      available,
      balance.planAvailable,
      balance.purchasedAvailable,
      balance.held,
      development,
    ])
  ) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {t("credit.errors.unsafe")}
      </p>
    );
  }

  const totalPool = available;
  const planPct = totalPool > 0 ? (balance.planAvailable / totalPool) * 100 : 0;
  const purchasedPct =
    totalPool > 0 ? (balance.purchasedAvailable / totalPool) * 100 : 0;

  const metrics = [
    ["available", available],
    ["plan", balance.planAvailable],
    ["purchased", balance.purchasedAvailable],
    ["held", balance.held],
    ...(development > 0 ? [["development", development] as const] : []),
  ] as const;

  return (
    <section aria-label={t("credit.balance.title")} className="space-y-4">
      {/* Outer Doppelrand Shell with 3D diffused elevation */}
      <div className="relative rounded-[2rem] p-1.5 sm:p-2 bg-gradient-to-b from-border/80 via-border/30 to-border/10 shadow-[0_20px_50px_-15px_rgba(249,115,22,0.12),0_10px_30px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_60px_-15px_rgba(249,115,22,0.2)]">
        {/* Inner Core with backdrop blur and ambient glows */}
        <div className="relative overflow-hidden rounded-[calc(2rem-6px)] sm:rounded-[calc(2rem-8px)] border border-white/40 dark:border-white/10 bg-card/90 dark:bg-card/75 backdrop-blur-2xl p-6 sm:p-8">
          {/* Ambient Glows: Orange (top right) and Teal/Emerald (bottom left) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-brand-orange/15 dark:bg-brand-orange/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-teal-500/10 dark:bg-emerald-400/15 blur-3xl"
          />

          {/* Top Header Row */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange border border-brand-orange/20 shadow-xs">
                <Coins className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                    {t("credit.balance.title")}
                  </h2>
                  <HelpHint label={t("credit.balance.title")}>
                    {t("credit.balance.help")}
                  </HelpHint>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t(
                    "credit.balance.subtitle",
                    "Hạn ngạch AI & Tài nguyên điện toán dùng chung Agency",
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={query.isFetching}
                onClick={() => void query.refetch()}
                className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <RotateCw
                  className={cn(
                    "mr-1.5 size-3.5",
                    query.isFetching && "animate-spin",
                  )}
                />
                {t("credit.refresh")}
              </Button>

              {onTopUpClick && (
                <button
                  type="button"
                  onClick={onTopUpClick}
                  className="group relative inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-brand-orange to-amber-500 pl-4 pr-1.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-brand-orange/25 hover:shadow-brand-orange/40 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <span>{t("credit.topup.action", "Nạp thêm Credit")}</span>
                  <span className="flex size-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-xs transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shadow-inner">
                    <ArrowUpRight className="size-4 stroke-[2.5]" />
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Main Balance Row */}
          <div className="relative z-10 pt-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {t("credit.balance.available")}
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-foreground tabular-nums">
                    {formatCredits(available, i18n.language)}
                  </span>
                  <span className="font-sans text-sm sm:text-base font-semibold text-muted-foreground">
                    Credits
                  </span>
                </div>
              </div>

              {/* Held Balance Amber Badge with Tooltip */}
              <div className="flex items-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 px-3.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 shadow-xs">
                  <Lock className="size-3.5 text-amber-600 dark:text-amber-400" />
                  <span>
                    {t("credit.balance.held")}:{" "}
                    <strong className="font-mono font-bold tabular-nums">
                      {formatCredits(balance.held, i18n.language)}
                    </strong>
                  </span>
                  <HelpHint label={t("credit.balance.held")}>
                    {t(
                      "credit.balance.heldHelp",
                      "Credit tạm giữ cho các tác vụ AI đang xử lý. Sẽ tự động giải phóng hoặc quyết toán khi tác vụ hoàn thành.",
                    )}
                  </HelpHint>
                </div>
              </div>
            </div>

            {/* 2-Color Breakdown Bar */}
            <div className="space-y-2.5 rounded-2xl bg-muted/40 p-4 border border-border/50">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-brand-orange ring-2 ring-brand-orange/20" />
                  <span className="text-muted-foreground">
                    {t("credit.balance.plan")}:{" "}
                    <strong className="font-mono text-foreground font-semibold">
                      {formatCredits(balance.planAvailable, i18n.language)}
                    </strong>{" "}
                    ({Math.round(planPct)}%)
                  </span>
                  <span className="rounded-md bg-brand-orange/10 px-1.5 py-0.5 text-[10px] font-medium text-brand-orange">
                    Reset cuối kỳ
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-teal-500 ring-2 ring-teal-500/20" />
                  <span className="text-muted-foreground">
                    {t("credit.balance.purchased")}:{" "}
                    <strong className="font-mono text-foreground font-semibold">
                      {formatCredits(balance.purchasedAvailable, i18n.language)}
                    </strong>{" "}
                    ({Math.round(purchasedPct)}%)
                  </span>
                  <span className="rounded-md bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-medium text-teal-600 dark:text-teal-400">
                    Vô thời hạn
                  </span>
                </div>
              </div>

              {/* Bar track */}
              <div className="h-3 w-full rounded-full bg-muted/80 overflow-hidden flex p-0.5 shadow-inner">
                {development > 0 && (
                  <div
                    aria-label={t("credit.balance.development")}
                    className="bg-primary h-full"
                    style={{ width: `${(development / totalPool) * 100}%` }}
                  />
                )}
                {planPct > 0 && (
                  <div
                    aria-label="Credit gói"
                    className="h-full rounded-l-full bg-gradient-to-r from-brand-orange to-amber-500 transition-all duration-500"
                    style={{
                      width: `${planPct}%`,
                      borderTopRightRadius: purchasedPct === 0 ? "9999px" : 0,
                      borderBottomRightRadius:
                        purchasedPct === 0 ? "9999px" : 0,
                    }}
                  />
                )}
                {purchasedPct > 0 && (
                  <div
                    aria-label="Credit mua thêm"
                    className="h-full rounded-r-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
                    style={{
                      width: `${purchasedPct}%`,
                      borderTopLeftRadius: planPct === 0 ? "9999px" : 0,
                      borderBottomLeftRadius: planPct === 0 ? "9999px" : 0,
                    }}
                  />
                )}
              </div>
            </div>

            {/* 4 Secondary Breakdown Cards */}
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
              {metrics.map(([label, amount]) => (
                <div
                  key={label}
                  className="relative overflow-hidden rounded-xl border border-border/60 bg-background/60 p-3.5 transition-all hover:border-border hover:bg-background/80"
                >
                  <dt className="text-xs font-medium text-muted-foreground">
                    {t(`credit.balance.${label}`)}
                  </dt>
                  <dd className="mt-1.5 text-xl font-mono font-semibold tracking-tight text-foreground tabular-nums">
                    {formatCredits(amount, i18n.language)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
