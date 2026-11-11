import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RefreshCw,
  Database,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTrendReplay } from "@/pages/admin/hooks/useTrendReplay";
import { TrendReplayDetail } from "@/pages/admin/components/TrendReplayDetail";
import { TrendReplayFlow } from "@/pages/admin/components/TrendReplayFlow";
import { Link } from "react-router-dom";
import type {
  ReplaySelection,
  ReplayStatus,
} from "@/pages/admin/types/trendReplay";

function getStatusBadgeStyle(status: ReplayStatus) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
    case "RUNNING":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse";
    case "FAILED":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25";
    case "INTERRUPTED":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25";
    case "PREVIEW":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function formatJobTime(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })}`;
  } catch {
    return iso;
  }
}

export function AdminTrendReplayPanel() {
  const { t } = useTranslation();
  const replay = useTrendReplay();
  const [attempted, setAttempted] = useState(false);
  const [prefixTouched, setPrefixTouched] = useState(false);
  const [form, setForm] = useState<ReplaySelection>({
    startDate: "",
    endDate: "",
    prefix: "",
  });

  const defaultPrefix = replay.history.data?.default_prefix ?? "";
  if (!prefixTouched && defaultPrefix && form.prefix !== defaultPrefix) {
    setForm((current) => ({ ...current, prefix: defaultPrefix }));
  }

  const change = (field: keyof ReplaySelection, value: string) => {
    if (field === "prefix") setPrefixTouched(true);
    setForm((current) => ({ ...current, [field]: value }));
    replay.invalidatePreview();
  };

  const job = replay.detail.data;
  const activeBucket =
    replay.history.data?.bucket || job?.bucket || "crawler-social";
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const span =
    (Date.parse(form.endDate) - Date.parse(form.startDate)) / 86400000;
  const valid = Boolean(
    form.startDate &&
    form.endDate &&
    span >= 0 &&
    span <= 30 &&
    form.endDate <= today &&
    form.prefix.trim().length <= 500,
  );
  const canStart =
    job &&
    job.processing_mode === "NORMAL_PIPELINE_V3" &&
    ((job.status === "PREVIEW" && replay.previewId === job.id) ||
      ["FAILED", "INTERRUPTED"].includes(job.status));
  const busy = replay.preview.isPending || replay.start.isPending;

  return (
    <div className="min-w-0 space-y-4">
      {/* S3 Raw Archive Preview Form - Doppelrand Surface */}
      <form
        noValidate
        className="border-border/80 bg-card/95 relative space-y-4 rounded-2xl border p-5 shadow-xs ring-1 ring-black/[0.04] backdrop-blur-xs dark:ring-white/[0.05]"
        onSubmit={(event) => {
          event.preventDefault();
          setAttempted(true);
          if (valid && !busy)
            replay.preview.mutate({ ...form, prefix: form.prefix.trim() });
        }}
      >
        <div className="border-border/50 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-brand-orange/10 text-brand-orange flex size-7 items-center justify-center rounded-lg">
              <Database aria-hidden="true" className="size-4" />
            </span>
            <div>
              <h2 className="text-foreground text-sm font-semibold">
                {t("admin.navigation.trendReplay")}
              </h2>
              <p className="text-muted-foreground text-[11px]">
                {t("admin.trendReplay.multiplatformScope")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="border-border/60 bg-muted/40 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs">
              <span className="text-muted-foreground font-medium">
                {t("admin.trendReplay.sourceBucket")}:
              </span>
              <code className="text-foreground font-mono font-semibold">
                s3://{activeBucket}
              </code>
            </div>
            <Link
              className="text-brand-orange-fg rounded text-sm underline underline-offset-4"
              to="/admin?view=trendPipeline"
            >
              {t("admin.trendReplay.openPipeline")}
            </Link>
          </div>
        </div>

        <TrendReplayFlow stage="PREVIEW" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <DateRangePicker
              label={`${t("admin.trendReplay.from")} - ${t("admin.trendReplay.to")}`}
              required
              max={today}
              disabled={busy}
              from={form.startDate}
              to={form.endDate}
              className="w-full"
              triggerClassName="w-full"
              onChange={(f, t) => {
                change("startDate", f);
                change("endDate", t);
              }}
            />
          </div>
          <Input
            label={t("admin.trendReplay.prefix")}
            placeholder={t("admin.trendReplay.prefixPlaceholder")}
            value={form.prefix}
            disabled={busy}
            onChange={(e) => change("prefix", e.target.value)}
          />
        </div>

        <p className="text-muted-foreground max-w-3xl text-xs leading-relaxed">
          {t("admin.trendReplay.scope")}
        </p>
        {attempted && !valid && (
          <p role="alert" className="text-destructive text-sm">
            {t("admin.trendReplay.selectionInvalid")}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            type="submit"
            variant="outline"
            disabled={busy}
            loading={replay.preview.isPending}
            className="font-medium shadow-xs"
          >
            {t("admin.trendReplay.preview")}
          </Button>

          {(replay.preview.isError || replay.start.isError) && (
            <p
              role="alert"
              className="text-destructive flex items-center gap-1.5 text-sm font-medium"
            >
              <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
              {t("admin.trendReplay.error")}
            </p>
          )}
        </div>
      </form>

      {/* Main Workspace: History List + Detail */}
      <div className="grid min-w-0 gap-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
        {/* Left Column: Replay History Cards */}
        <section className="bg-card/95 border-border/80 min-w-0 space-y-3 self-start rounded-2xl border p-4 shadow-xs ring-1 ring-black/[0.04] dark:ring-white/[0.05]">
          <div className="border-border/50 flex items-center justify-between gap-2 border-b pb-2.5">
            <div className="flex items-center gap-2">
              <Layers
                aria-hidden="true"
                className="text-muted-foreground size-4"
              />
              <h2 className="text-foreground text-sm font-semibold">
                {t("admin.trendReplay.history")}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={t("admin.trendReplay.refresh")}
              onClick={() => {
                void replay.history.refetch();
                void replay.detail.refetch();
              }}
            >
              <RefreshCw
                aria-hidden="true"
                className={cn(
                  "size-3.5",
                  replay.history.isFetching && "animate-spin",
                )}
              />
            </Button>
          </div>

          {replay.history.isPending && (
            <div
              role="status"
              className="text-muted-foreground py-6 text-center text-sm"
            >
              <RefreshCw
                aria-hidden="true"
                className="mx-auto mb-2 size-4 animate-spin opacity-60"
              />
              {t("admin.loading")}
            </div>
          )}

          {replay.history.isError && (
            <p
              role="alert"
              className="text-destructive bg-destructive/10 border-destructive/20 rounded-lg border p-2 text-xs"
            >
              {t("admin.trendReplay.error")}
            </p>
          )}

          {replay.history.data?.jobs.length === 0 && (
            <div className="text-muted-foreground py-8 text-center text-xs">
              <Calendar
                aria-hidden="true"
                className="mx-auto mb-2 size-6 opacity-40"
              />
              <p>{t("admin.trendReplay.empty")}</p>
            </div>
          )}

          <div className="space-y-2">
            {replay.history.data?.jobs.map((item) => {
              const isSelected = replay.selected === item.id;
              const percent = Math.round(
                (item.completed_days / Math.max(1, item.total_days)) * 100,
              );
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => replay.setSelected(item.id)}
                  className={cn(
                    "group relative block w-full overflow-hidden rounded-xl border p-3 text-left transition-all duration-150",
                    isSelected
                      ? "border-brand-orange/60 bg-brand-orange/5 ring-brand-orange/20 shadow-xs ring-1"
                      : "border-border/60 bg-card/60 hover:border-border hover:bg-muted/40",
                  )}
                >
                  {/* Top line: Status Badge + Created Date */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-1.5 py-0 text-[10px] font-medium",
                        getStatusBadgeStyle(item.status),
                      )}
                    >
                      {t(`admin.trendReplay.status.${item.status}`)}
                    </Badge>
                    <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                      {formatJobTime(item.created_at)}
                    </span>
                  </div>

                  {/* Middle: S3 Bucket / Prefix + ID */}
                  <div className="mt-2 min-w-0">
                    <p className="text-foreground max-w-full truncate font-mono text-xs font-medium">
                      {item.prefix
                        ? `s3://${item.bucket}/${item.prefix.replace(/^\/+/, "")}`
                        : `s3://${item.bucket}`}
                    </p>
                    <p className="text-muted-foreground mt-0.5 max-w-full truncate font-mono text-[10px]">
                      ID: {item.id}
                    </p>
                  </div>

                  {/* Bottom: Progress Bar & Days */}
                  <div className="border-border/40 text-muted-foreground mt-2.5 flex items-center justify-between border-t pt-2 text-[11px]">
                    <span className="font-medium">
                      {t("admin.trendReplay.progress", {
                        completed: item.completed_days,
                        total: item.total_days,
                      })}
                    </span>
                    <span className="text-foreground font-mono text-[10px] font-semibold tabular-nums">
                      {percent}%
                    </span>
                  </div>

                  <div className="bg-muted/70 mt-1.5 h-1 w-full overflow-hidden rounded-full">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        item.status === "COMPLETED"
                          ? "bg-emerald-500"
                          : item.status === "FAILED"
                            ? "bg-rose-500"
                            : "bg-brand-orange",
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right Column: Replay Job Details */}
        <div className="min-w-0">
          {replay.selected && replay.detail.isPending && (
            <div
              role="status"
              className="border-border/80 bg-card/95 text-muted-foreground rounded-2xl border p-8 text-center text-sm"
            >
              <RefreshCw
                aria-hidden="true"
                className="text-brand-orange mx-auto mb-2 size-5 animate-spin"
              />
              {t("admin.loading")}
            </div>
          )}

          {replay.detail.isError && (
            <div
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive rounded-2xl border p-5 text-sm"
            >
              <p className="font-semibold">{t("admin.trendReplay.error")}</p>
            </div>
          )}

          {!replay.selected && !job && (
            <div className="border-border/60 bg-card/40 text-muted-foreground space-y-3 rounded-2xl border p-12 text-center">
              <div className="bg-muted/60 text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-2xl">
                <Sparkles aria-hidden="true" className="size-6" />
              </div>
              <h3 className="text-foreground text-sm font-semibold">
                {t("admin.trendReplay.details")}
              </h3>
              <p className="mx-auto max-w-md text-xs leading-relaxed">
                {t("admin.trendReplay.description")}
              </p>
            </div>
          )}

          {job && (
            <TrendReplayDetail
              key={job.id}
              job={job}
              busy={replay.start.isPending}
              mayStart={Boolean(canStart)}
              onStart={() => replay.start.mutate(job.id)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
