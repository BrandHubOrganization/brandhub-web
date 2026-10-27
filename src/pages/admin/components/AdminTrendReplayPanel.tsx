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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTrendReplay } from "@/pages/admin/hooks/useTrendReplay";
import { TrendReplayDetail } from "@/pages/admin/components/TrendReplayDetail";
import type { ReplaySelection, ReplayStatus } from "@/pages/admin/types/trendReplay";

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
  const [form, setForm] = useState<ReplaySelection>({
    startDate: "",
    endDate: "",
    prefix: "crawler-raw/",
  });

  const change = (field: keyof ReplaySelection, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    replay.invalidatePreview();
  };

  const job = replay.detail.data;
  const canStart =
    job &&
    job.processing_mode === "NORMAL_PIPELINE_V2" &&
    ((job.status === "PREVIEW" && replay.previewId === job.id) ||
      ["FAILED", "INTERRUPTED"].includes(job.status));
  const busy = replay.preview.isPending || replay.start.isPending;

  return (
    <div className="min-w-0 space-y-6">
      {/* S3 Raw Archive Preview Form - Doppelrand Surface */}
      <form
        className="relative rounded-2xl border border-border/80 bg-card/95 p-5 shadow-xs ring-1 ring-black/[0.04] dark:ring-white/[0.05] backdrop-blur-xs space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          replay.preview.mutate(form);
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
              <Database aria-hidden="true" className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {t("admin.navigation.trendReplay")}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                NORMAL_PIPELINE_V2 · Neo4j, Chroma & Redis
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[11px] font-mono">
            S3 Raw Replay
          </Badge>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Input
            type="date"
            required
            label={t("admin.trendReplay.from")}
            value={form.startDate}
            disabled={busy}
            onChange={(e) => change("startDate", e.target.value)}
          />
          <Input
            type="date"
            required
            label={t("admin.trendReplay.to")}
            value={form.endDate}
            min={form.startDate}
            disabled={busy}
            onChange={(e) => change("endDate", e.target.value)}
          />
          <Input
            required
            label={t("admin.trendReplay.prefix")}
            value={form.prefix}
            disabled={busy}
            onChange={(e) => change("prefix", e.target.value)}
          />
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed max-w-3xl">
          {t("admin.trendReplay.scope")}
        </p>

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
            <p role="alert" className="text-destructive text-sm font-medium flex items-center gap-1.5">
              <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
              {t("admin.trendReplay.error")}
            </p>
          )}
        </div>
      </form>

      {/* Main Workspace: History List + Detail */}
      <div className="grid min-w-0 gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
        {/* Left Column: Replay History Cards */}
        <section className="bg-card/95 border-border/80 min-w-0 space-y-3 self-start rounded-2xl border p-4 shadow-xs ring-1 ring-black/[0.04] dark:ring-white/[0.05]">
          <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2">
              <Layers aria-hidden="true" className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">
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
                className={cn("size-3.5", replay.history.isFetching && "animate-spin")}
              />
            </Button>
          </div>

          {replay.history.isPending && (
            <div role="status" className="py-6 text-center text-sm text-muted-foreground">
              <RefreshCw aria-hidden="true" className="size-4 animate-spin mx-auto mb-2 opacity-60" />
              {t("admin.loading")}
            </div>
          )}

          {replay.history.isError && (
            <p role="alert" className="text-destructive text-xs p-2 rounded-lg bg-destructive/10 border border-destructive/20">
              {t("admin.trendReplay.error")}
            </p>
          )}

          {replay.history.data?.jobs.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">
              <Calendar aria-hidden="true" className="size-6 mx-auto mb-2 opacity-40" />
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
                    "group w-full rounded-xl border p-3 text-left transition-all duration-150 relative overflow-hidden block",
                    isSelected
                      ? "border-brand-orange/60 bg-brand-orange/5 ring-1 ring-brand-orange/20 shadow-xs"
                      : "border-border/60 bg-card/60 hover:border-border hover:bg-muted/40",
                  )}
                >
                  {/* Top line: Status Badge + Created Date */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] px-1.5 py-0 font-medium", getStatusBadgeStyle(item.status))}
                    >
                      {t(`admin.trendReplay.status.${item.status}`)}
                    </Badge>
                    <span className="font-mono tabular-nums text-[11px] text-muted-foreground">
                      {formatJobTime(item.created_at)}
                    </span>
                  </div>

                  {/* Middle: ID / Prefix */}
                  <div className="mt-2 min-w-0">
                    <p className="font-mono text-xs font-medium text-foreground truncate max-w-full">
                      {item.prefix || item.id}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground truncate max-w-full mt-0.5">
                      ID: {item.id}
                    </p>
                  </div>

                  {/* Bottom: Progress Bar & Days */}
                  <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-medium">
                      {item.completed_days} / {item.total_days} days
                    </span>
                    <span className="font-mono text-[10px] tabular-nums font-semibold text-foreground">
                      {percent}%
                    </span>
                  </div>

                  <div className="mt-1.5 h-1 w-full bg-muted/70 rounded-full overflow-hidden">
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
            <div role="status" className="rounded-2xl border border-border/80 bg-card/95 p-8 text-center text-sm text-muted-foreground">
              <RefreshCw aria-hidden="true" className="size-5 animate-spin mx-auto mb-2 text-brand-orange" />
              {t("admin.loading")}
            </div>
          )}

          {replay.detail.isError && (
            <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
              <p className="font-semibold">{t("admin.trendReplay.error")}</p>
            </div>
          )}

          {!replay.selected && !job && (
            <div className="rounded-2xl border border-border/60 bg-card/40 p-12 text-center text-muted-foreground space-y-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 mx-auto text-muted-foreground">
                <Sparkles aria-hidden="true" className="size-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {t("admin.trendReplay.details")}
              </h3>
              <p className="text-xs max-w-md mx-auto leading-relaxed">
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