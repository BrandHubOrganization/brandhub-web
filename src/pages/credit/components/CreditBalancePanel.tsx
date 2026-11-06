import { useTranslation } from "react-i18next";
import { Lock, Plus, RotateCw } from "lucide-react";
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
    <section
      aria-label={t("credit.balance.title")}
      className="border-border bg-card space-y-5 rounded-xl border p-4 sm:p-6"
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-foreground text-lg font-semibold">
              {t("credit.balance.title")}
            </h2>
            <HelpHint label={t("credit.balance.title")}>
              {t("credit.balance.help")}
            </HelpHint>
          </div>
          <p className="text-muted-foreground text-sm">
            {t(
              "credit.balance.subtitle",
              "Hạn ngạch AI & Tài nguyên điện toán dùng chung Agency",
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
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
            <Button
              type="button"
              size="sm"
              variant="orange"
              onClick={onTopUpClick}
            >
              <Plus className="mr-1.5 size-4" />
              {t("credit.topup.action", "Nạp thêm Credit")}
            </Button>
          )}
        </div>
      </div>

      {/* Main Balance & Held Summary */}
      <div className="border-border/60 flex flex-col justify-between gap-4 border-t pt-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-muted-foreground text-xs font-medium uppercase">
            {t("credit.balance.available")}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-foreground text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
              {formatCredits(available, i18n.language)}
            </span>
            <span className="text-muted-foreground text-sm font-medium">
              Credits
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3.5" />
          <span>
            {t("credit.balance.held")}:{" "}
            <strong className="text-foreground font-semibold tabular-nums">
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

      {/* Simple Minimal Breakdown Bar */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="bg-brand-orange size-2 rounded-full" />
            <span>
              {t("credit.balance.plan")}:{" "}
              <strong className="text-foreground font-medium tabular-nums">
                {formatCredits(balance.planAvailable, i18n.language)}
              </strong>{" "}
              ({Math.round(planPct)}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-foreground/60 size-2 rounded-full" />
            <span>
              {t("credit.balance.purchased")}:{" "}
              <strong className="text-foreground font-medium tabular-nums">
                {formatCredits(balance.purchasedAvailable, i18n.language)}
              </strong>{" "}
              ({Math.round(purchasedPct)}%)
            </span>
          </div>
        </div>

        <div className="bg-muted flex h-2 w-full overflow-hidden rounded-full">
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
              className="bg-brand-orange h-full transition-all"
              style={{ width: `${planPct}%` }}
            />
          )}
          {purchasedPct > 0 && (
            <div
              aria-label="Credit mua thêm"
              className="bg-foreground/60 h-full transition-all"
              style={{ width: `${purchasedPct}%` }}
            />
          )}
        </div>
      </div>

      {/* Breakdown Metrics Grid */}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map(([label, amount]) => (
          <div
            key={label}
            className="border-border bg-muted/20 rounded-lg border p-3.5"
          >
            <dt className="text-muted-foreground text-xs">
              {t(`credit.balance.${label}`)}
            </dt>
            <dd className="text-foreground mt-1 text-lg font-semibold tabular-nums">
              {formatCredits(amount, i18n.language)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
