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
  const other = balance.otherAvailable ?? 0;
  const available =
    balance.planAvailable + balance.purchasedAvailable + development + other;

  if (
    !validCreditAmounts([
      available,
      balance.planAvailable,
      balance.purchasedAvailable,
      balance.held,
      development,
      other,
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
    ...(other > 0 ? [["other", other] as const] : []),
  ] as const;

  return (
    <section aria-label={t("credit.balance.title")} className="space-y-4">
      {/* Outer Doppelrand Shell with 3D diffused elevation */}
      <div className="from-border/80 via-border/30 to-border/10 relative rounded-[2rem] bg-gradient-to-b p-1.5 shadow-[0_20px_50px_-15px_rgba(249,115,22,0.12),0_10px_30px_-5px_rgba(0,0,0,0.06)] sm:p-2 dark:shadow-[0_25px_60px_-15px_rgba(249,115,22,0.2)]">
        {/* Inner Core with backdrop blur and ambient glows */}
        <div className="bg-card/90 dark:bg-card/75 relative overflow-hidden rounded-[calc(2rem-6px)] border border-white/40 p-6 backdrop-blur-2xl sm:rounded-[calc(2rem-8px)] sm:p-8 dark:border-white/10">
          {/* Ambient Glows: Orange (top right) and Teal/Emerald (bottom left) */}
          <div
            aria-hidden="true"
            className="bg-brand-orange/15 dark:bg-brand-orange/20 pointer-events-none absolute -top-24 -right-24 size-80 rounded-full blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-teal-500/10 blur-3xl dark:bg-emerald-400/15"
          />

          {/* Top Header Row */}
          <div className="border-border/40 relative z-10 flex flex-wrap items-center justify-between gap-3 border-b pb-6">
            <div className="flex items-center gap-3">
              <div className="bg-brand-orange/10 text-brand-orange border-brand-orange/20 flex size-11 items-center justify-center rounded-2xl border shadow-xs">
                <Coins className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-foreground text-base font-semibold tracking-tight sm:text-lg">
                    {t("credit.balance.title")}
                  </h2>
                  <HelpHint label={t("credit.balance.title")}>
                    {t("credit.balance.help")}
                  </HelpHint>
                </div>
                <p className="text-muted-foreground text-xs">
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
                className="text-muted-foreground hover:text-foreground h-9 cursor-pointer px-3 text-xs"
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
                  className="group from-brand-orange shadow-brand-orange/25 hover:shadow-brand-orange/40 relative inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-gradient-to-r to-amber-500 py-1.5 pr-1.5 pl-4 text-xs font-semibold text-white shadow-lg transition-all duration-200 active:scale-95 sm:text-sm"
                >
                  <span>{t("credit.topup.action", "Nạp thêm Credit")}</span>
                  <span className="flex size-7 items-center justify-center rounded-full bg-white/20 text-white shadow-inner backdrop-blur-xs transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight className="size-4 stroke-[2.5]" />
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Main Balance Row */}
          <div className="relative z-10 space-y-6 pt-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase sm:text-sm">
                  {t("credit.balance.available")}
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-foreground font-mono text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
                    {formatCredits(available, i18n.language)}
                  </span>
                  <span className="text-muted-foreground font-sans text-sm font-semibold sm:text-base">
                    Credits
                  </span>
                </div>
              </div>

              {/* Held Balance Amber Badge with Tooltip */}
              <div className="flex items-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-medium text-amber-700 shadow-xs dark:bg-amber-500/15 dark:text-amber-300">
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
            <div className="bg-muted/40 border-border/50 space-y-2.5 rounded-2xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-brand-orange ring-brand-orange/20 size-2.5 rounded-full ring-2" />
                  <span className="text-muted-foreground">
                    {t("credit.balance.plan")}:{" "}
                    <strong className="text-foreground font-mono font-semibold">
                      {formatCredits(balance.planAvailable, i18n.language)}
                    </strong>{" "}
                    ({Math.round(planPct)}%)
                  </span>
                  <span className="bg-brand-orange/10 text-brand-orange rounded-md px-1.5 py-0.5 text-[10px] font-medium">
                    Reset cuối kỳ
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-teal-500 ring-2 ring-teal-500/20" />
                  <span className="text-muted-foreground">
                    {t("credit.balance.purchased")}:{" "}
                    <strong className="text-foreground font-mono font-semibold">
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
              <div className="bg-muted/80 flex h-3 w-full overflow-hidden rounded-full p-0.5 shadow-inner">
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
                    className="from-brand-orange h-full rounded-l-full bg-gradient-to-r to-amber-500 transition-all duration-500"
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
            <dl className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
              {metrics.map(([label, amount]) => (
                <div
                  key={label}
                  className="border-border/60 bg-background/60 hover:border-border hover:bg-background/80 relative overflow-hidden rounded-xl border p-3.5 transition-all"
                >
                  <dt className="text-muted-foreground text-xs font-medium">
                    {t(`credit.balance.${label}`)}
                  </dt>
                  <dd className="text-foreground mt-1.5 font-mono text-xl font-semibold tracking-tight tabular-nums">
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
