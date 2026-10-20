import { useTranslation } from "react-i18next";
import {
  Sparkles,
  MessageSquareText,
  Hash,
  UserCheck,
  Users,
  Camera,
  Video,
  Bot,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  RotateCw,
  Activity,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelpHint } from "@/components/shared/HelpHint";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditQueryState } from "@/pages/credit/components/CreditQueryState";
import { useCreditUsage } from "@/pages/credit/hooks/useCreditReporting";
import {
  formatCredits,
  validCreditAmounts,
} from "@/pages/credit/utils/creditFormat";
import type { CreditOperation, CreditUsage } from "@/pages/credit/types/credit";
import { cn } from "@/lib/utils";

function getOperationIcon(op: CreditOperation) {
  switch (op) {
    case "CONTENT_GENERATE":
      return <Sparkles className="size-4 text-purple-500" />;
    case "CAPTION_VARIANTS":
      return <MessageSquareText className="size-4 text-sky-500" />;
    case "HASHTAG_GENERATE":
      return <Hash className="size-4 text-amber-500" />;
    case "AMBASSADOR_GENERATE":
      return <UserCheck className="size-4 text-rose-500" />;
    case "CHARACTER_SHEET":
      return <Users className="size-4 text-indigo-500" />;
    case "COMMERCIAL_IMAGE":
      return <Camera className="size-4 text-teal-500" />;
    case "VIDEO_GENERATE":
      return <Video className="size-4 text-emerald-500" />;
    default:
      return <Bot className="size-4 text-muted-foreground" />;
  }
}

export function CreditUsagePanel({
  agencyId,
  memberId,
}: {
  agencyId: string;
  memberId?: string;
}) {
  const { t } = useTranslation();
  const query = useCreditUsage(agencyId, memberId);

  return (
    <section
      aria-label={t("credit.usage.title")}
      className="border-border/70 bg-card space-y-4 rounded-2xl border p-5 sm:p-6 shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Activity className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {t("credit.usage.title")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t(
                "credit.usage.subtitle",
                "Theo dõi chi tiêu hạn ngạch và chi tiết 7 thao tác AI",
              )}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <RotateCw
            className={cn("mr-1.5 size-3.5", query.isFetching && "animate-spin")}
          />
          {t("credit.refresh")}
        </Button>
      </div>

      {query.isPending || query.isError ? (
        <CreditQueryState
          loading={query.isPending}
          error={query.error}
          retry={() => query.refetch()}
        />
      ) : (
        <CreditUsageReport usage={query.data} />
      )}
    </section>
  );
}

function CreditUsageReport({ usage }: { usage: CreditUsage }) {
  const { t, i18n } = useTranslation();

  const amounts = [
    usage.used,
    usage.held,
    usage.used + usage.held,
    ...(usage.limit === null ? [] : [usage.limit]),
    ...usage.byOperation.flatMap((entry) => [
      entry.successfulUnits,
      entry.charged,
      entry.held,
    ]),
  ];

  const start = new Date(usage.periodStart);
  const end = new Date(usage.periodEnd);

  if (
    !validCreditAmounts(amounts) ||
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime())
  ) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {t("credit.errors.unsafe")}
      </p>
    );
  }

  const formatter = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const hasLimit = usage.limit !== null && usage.limit > 0;
  const totalQuota = usage.limit ?? 0;
  const used = usage.used;
  const held = usage.held;
  const remaining = hasLimit ? Math.max(0, totalQuota - used - held) : null;
  const totalCommitted = used + held;

  const usedPct = hasLimit ? Math.min(100, (used / totalQuota) * 100) : 0;
  const heldPct =
    hasLimit ? Math.min(100 - usedPct, (held / totalQuota) * 100) : 0;
  const remainingPct = hasLimit
    ? Math.max(0, 100 - usedPct - heldPct)
    : 100;
  const totalPct = hasLimit
    ? Math.min(100, (totalCommitted / totalQuota) * 100)
    : 0;

  // 3-Level Warning System:
  // < 75%: An toàn
  // 75% - 90%: Cảnh báo hổ phách
  // > 90%: Nguy cấp đỏ
  let warningLevel: "safe" | "warning" | "danger" = "safe";
  if (hasLimit) {
    if (totalPct >= 90) {
      warningLevel = "danger";
    } else if (totalPct >= 75) {
      warningLevel = "warning";
    }
  }

  const metrics = [
    ["limit", usage.limit],
    ["used", usage.used],
    ["held", usage.held],
    ["remaining", remaining],
  ] as const;

  return (
    <div className="space-y-4">
      {/* Period timestamp */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/40 pb-3">
        <div className="flex items-center gap-1.5">
          <Calendar className="size-3.5" />
          <span>
            {t("credit.usage.period", {
              start: formatter.format(start),
              end: formatter.format(end),
            })}
          </span>
        </div>
        <span className="font-mono text-[11px]">
          {formatter.resolvedOptions().timeZone}
        </span>
      </div>

      {/* 3-Level Alert Banner */}
      {hasLimit && warningLevel === "danger" && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-red-700 dark:text-red-400">
          <AlertCircle className="size-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {t("credit.warning.danger", "Đạt ngưỡng giới hạn")} (
                {Math.round(totalPct)}%)
              </span>
              <span className="rounded-full bg-red-600 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Nguy cấp
              </span>
            </div>
            <p className="text-xs text-red-600/90 dark:text-red-300 mt-1">
              {t(
                "credit.warning.dangerDesc",
                "Đã sử dụng vượt 90% hạn mức kỳ! Các tác vụ AI có thể bị gián đoạn khi chạm trần.",
              )}
            </p>
          </div>
        </div>
      )}

      {hasLimit && warningLevel === "warning" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {t("credit.warning.warning", "Sắp đạt hạn mức kỳ")} (
                {Math.round(totalPct)}%)
              </span>
              <span className="rounded-full bg-amber-500 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Cảnh báo
              </span>
            </div>
            <p className="text-xs text-amber-700/90 dark:text-amber-300 mt-1">
              {t(
                "credit.warning.warningDesc",
                "Đã sử dụng từ 75% - 90% hạn mức kỳ. Hãy cân nhắc điều chỉnh hạn ngạch.",
              )}
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map(([label, amount]) => (
          <div
            key={label}
            className="rounded-xl border border-border/60 bg-muted/40 p-3.5 transition-all hover:bg-muted/60"
          >
            <dt className="text-xs font-medium text-muted-foreground">
              {t(`credit.usage.${label}`)}
            </dt>
            <dd className="mt-1 text-xl font-mono font-semibold tracking-tight text-foreground tabular-nums">
              {amount === null
                ? t("credit.usage.unlimited")
                : formatCredits(amount, i18n.language)}
            </dd>
          </div>
        ))}
      </dl>

      {/* Multi-segment Quota Gauge */}
      <div className="space-y-2.5 rounded-2xl border border-border/60 bg-muted/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Đã dùng (Cam) */}
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-brand-orange ring-2 ring-brand-orange/20" />
              <span className="text-muted-foreground">
                {t("credit.usage.used")}:
              </span>
              <strong className="font-mono text-foreground font-semibold">
                {formatCredits(usage.used, i18n.language)}
              </strong>
              {hasLimit && (
                <span className="text-[11px] text-muted-foreground">
                  ({Math.round(usedPct)}%)
                </span>
              )}
            </span>

            {/* Đang giữ (Vàng vằn) */}
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/20" />
              <span className="text-muted-foreground">
                {t("credit.usage.held")}:
              </span>
              <strong className="font-mono text-foreground font-semibold">
                {formatCredits(usage.held, i18n.language)}
              </strong>
              {hasLimit && (
                <span className="text-[11px] text-muted-foreground">
                  ({Math.round(heldPct)}%)
                </span>
              )}
            </span>

            {/* Còn lại (Muted) */}
            {hasLimit && (
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-muted-foreground/40 ring-2 ring-muted-foreground/10" />
                <span className="text-muted-foreground">
                  {t("credit.usage.remaining")}:
                </span>
                <strong className="font-mono text-foreground font-semibold">
                  {formatCredits(remaining ?? 0, i18n.language)}
                </strong>
                <span className="text-[11px] text-muted-foreground">
                  ({Math.round(remainingPct)}%)
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasLimit ? (
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                {Math.round(totalPct)}% đã cam kết
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                {t("credit.usage.unlimited")}
              </span>
            )}
          </div>
        </div>

        {/* Multi-segmented bar track */}
        <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden flex p-0.5 shadow-inner">
          {/* Segment 1: Đã dùng (Cam) */}
          {usedPct > 0 && (
            <div
              title={`Đã dùng: ${formatCredits(usage.used, i18n.language)}`}
              className="h-full bg-brand-orange transition-all duration-500"
              style={{
                width: `${usedPct}%`,
                borderTopLeftRadius: "9999px",
                borderBottomLeftRadius: "9999px",
                borderTopRightRadius:
                  heldPct === 0 && remainingPct === 0 ? "9999px" : 0,
                borderBottomRightRadius:
                  heldPct === 0 && remainingPct === 0 ? "9999px" : 0,
              }}
            />
          )}

          {/* Segment 2: Đang giữ (Vàng vằn) */}
          {heldPct > 0 && (
            <div
              title={`Đang giữ: ${formatCredits(usage.held, i18n.language)}`}
              className="h-full bg-amber-400 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.15),rgba(0,0,0,0.15)_4px,transparent_4px,transparent_8px)] transition-all duration-500"
              style={{
                width: `${heldPct}%`,
                borderTopLeftRadius: usedPct === 0 ? "9999px" : 0,
                borderBottomLeftRadius: usedPct === 0 ? "9999px" : 0,
                borderTopRightRadius: remainingPct === 0 ? "9999px" : 0,
                borderBottomRightRadius: remainingPct === 0 ? "9999px" : 0,
              }}
            />
          )}

          {/* Segment 3: Còn lại (Muted) */}
          {remainingPct > 0 && (
            <div
              title={`Còn lại: ${formatCredits(remaining ?? 0, i18n.language)}`}
              className="h-full bg-muted/60 transition-all duration-500"
              style={{
                width: `${remainingPct}%`,
                borderTopRightRadius: "9999px",
                borderBottomRightRadius: "9999px",
                borderTopLeftRadius:
                  usedPct === 0 && heldPct === 0 ? "9999px" : 0,
                borderBottomLeftRadius:
                  usedPct === 0 && heldPct === 0 ? "9999px" : 0,
              }}
            />
          )}
        </div>
      </div>

      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <span>{t("credit.usage.ceilingNote")}</span>
        <HelpHint label={t("credit.usage.remaining")}>
          {t("credit.usage.remainingHelp")}
        </HelpHint>
      </div>

      {/* 7 AI Operations Breakdown Table */}
      {usage.byOperation.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4 text-center">
          {t("credit.usage.empty")}
        </p>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-hidden shadow-2xs">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[40%] text-xs font-semibold">
                  {t("credit.price.operation")}
                </TableHead>
                <TableHead className="text-right text-xs font-semibold">
                  {t("credit.usage.outputs")}
                </TableHead>
                <TableHead className="text-right text-xs font-semibold">
                  {t("credit.usage.used")}
                </TableHead>
                <TableHead className="text-right text-xs font-semibold">
                  {t("credit.usage.held")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usage.byOperation.map((entry) => (
                <TableRow
                  key={entry.operation}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7.5 items-center justify-center rounded-lg bg-muted border border-border/50 shrink-0">
                        {getOperationIcon(entry.operation)}
                      </div>
                      <span className="font-medium text-xs sm:text-sm text-foreground">
                        {t(`credit.operations.${entry.operation}`)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs sm:text-sm tabular-nums text-muted-foreground py-3">
                    {formatCredits(entry.successfulUnits, i18n.language)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs sm:text-sm font-semibold tabular-nums text-foreground py-3">
                    {formatCredits(entry.charged, i18n.language)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs sm:text-sm tabular-nums text-amber-600 dark:text-amber-400 py-3">
                    {formatCredits(entry.held, i18n.language)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
