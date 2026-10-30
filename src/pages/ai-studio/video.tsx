import { useEffect, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Clapperboard,
  Download,
  Film,
  Loader2,
  RotateCcw,
  UserRound,
  Wand2,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { errorCode } from "@/services/adminRevenueService";
import { aiCaptionService } from "@/services/aiCaptionService";
import { aiGenerationService } from "@/services/aiGenerationService";
import {
  aiVideoService,
  type VideoJob,
  type VideoStyle,
} from "@/services/aiVideoService";

/** Veo usually needs 1–3 minutes; the bar is an estimate, the status comes from the server. */
const ESTIMATE_SECONDS = 120;

/** FR 3.7.6 (style gallery) + FR 3.7.7 (async generation with progress, credit, refund on failure). */
export function VideoStudioPage() {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return (
    <QueryClientProvider client={client}>
      <VideoStudio />
    </QueryClientProvider>
  );
}

function VideoStudio() {
  const { t, i18n } = useTranslation();
  const vi = !i18n.language.startsWith("en");
  const queries = useQueryClient();
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspace?.id);
  const [prompt, setPrompt] = useState("");
  const [styleKey, setStyleKey] = useState<string | null>(null);
  const [ambassadorId, setAmbassadorId] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("9:16");
  const [jobId, setJobId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const styles = useQuery({
    queryKey: ["video-styles", workspaceId],
    queryFn: () => aiVideoService.styles(workspaceId!),
    enabled: !!workspaceId,
    staleTime: 600_000,
  });
  const ambassadors = useQuery({
    queryKey: ["ambassador-presets"],
    queryFn: () => aiGenerationService.listAmbassadorPresets(),
    staleTime: 600_000,
  });
  const credits = useQuery({
    queryKey: ["ai-credits", workspaceId],
    queryFn: () => aiCaptionService.credits(workspaceId!),
    enabled: !!workspaceId,
  });
  const history = useQuery({
    queryKey: ["video-jobs", workspaceId],
    queryFn: () => aiVideoService.recent(workspaceId!),
    enabled: !!workspaceId,
  });
  const job = useQuery({
    queryKey: ["video-job", workspaceId, jobId],
    queryFn: () => aiVideoService.status(workspaceId!, jobId!),
    enabled: !!workspaceId && !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "COMPLETED" || status === "FAILED" ? false : 5000;
    },
  });
  const current = job.data;
  const running =
    current?.status === "PENDING" || current?.status === "PROCESSING";

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (current && !running) {
      void queries.invalidateQueries({ queryKey: ["video-jobs"] });
      void queries.invalidateQueries({ queryKey: ["ai-credits"] });
    }
  }, [current, running, queries]);

  if (!workspaceId) {
    return (
      <PageWrapper
        title={t("aiStudio.video.title")}
        description={t("aiStudio.video.description")}
      >
        <p className="text-muted-foreground border-border rounded-xl border border-dashed p-10 text-center text-sm">
          {t("aiStudio.video.noWorkspace")}
        </p>
      </PageWrapper>
    );
  }

  const chooseStyle = (style: VideoStyle) => {
    const next = styleKey === style.id ? null : style.id;
    setStyleKey(next);
    if (next) setAspectRatio(style.aspect_ratio);
  };
  const generate = async () => {
    setStarting(true);
    setError(null);
    try {
      const started = await aiVideoService.generate(workspaceId, {
        prompt: prompt.trim(),
        styleKey,
        ambassadorId,
        aspectRatio,
      });
      queries.setQueryData(
        ["video-job", workspaceId, started.job.jobId],
        started.job,
      );
      setJobId(started.job.jobId);
      setNow(Date.now());
      void queries.invalidateQueries({ queryKey: ["ai-credits"] });
      void queries.invalidateQueries({ queryKey: ["video-jobs"] });
    } catch (err) {
      const code = errorCode(err);
      setError(
        code === "INSUFFICIENT_AI_CREDIT"
          ? t("aiStudio.video.errors.noCredit")
          : code === "AI_SERVICE_UNAVAILABLE"
            ? t("aiStudio.video.errors.aiDown")
            : t("aiStudio.video.errors.failed"),
      );
    } finally {
      setStarting(false);
    }
  };
  const elapsed = current
    ? Math.max(0, (now - new Date(current.createdAt).getTime()) / 1000)
    : 0;
  const progress =
    current?.status === "COMPLETED"
      ? 100
      : Math.min(95, Math.round((elapsed / ESTIMATE_SECONDS) * 100));
  const styleName = (s: VideoStyle) => (vi ? s.name_vi : s.name_en);
  const tooShort = prompt.trim().length < 10;

  return (
    <PageWrapper
      title={t("aiStudio.video.title")}
      description={t("aiStudio.video.description")}
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="border-border bg-card space-y-3 rounded-xl border p-5">
            <label className="block space-y-2">
              <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {t("aiStudio.video.promptLabel")}
              </span>
              <Textarea
                rows={4}
                value={prompt}
                maxLength={1000}
                placeholder={t("aiStudio.video.promptPlaceholder")}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </label>
            <p className="text-muted-foreground text-xs">
              {t("aiStudio.video.promptHint")}
            </p>
          </section>

          <section className="border-border bg-card space-y-3 rounded-xl border p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Clapperboard className="text-brand-orange size-4" />
              {t("aiStudio.video.styleTitle")}
            </h2>
            <div
              role="radiogroup"
              aria-label={t("aiStudio.video.styleTitle")}
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {(styles.data ?? []).map((style) => (
                <button
                  key={style.id}
                  type="button"
                  role="radio"
                  aria-checked={styleKey === style.id}
                  onClick={() => chooseStyle(style)}
                  className={cn(
                    "border-border overflow-hidden rounded-xl border text-left transition-colors",
                    styleKey === style.id
                      ? "border-brand-orange ring-brand-orange/40 ring-2"
                      : "hover:border-brand-orange/40",
                  )}
                >
                  {style.preview_url ? (
                    <video
                      src={style.preview_url}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="flex aspect-video w-full items-end p-2"
                      style={{
                        background: `linear-gradient(135deg, ${style.accent}, ${style.accent}33)`,
                      }}
                    >
                      <span className="rounded bg-black/30 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        {style.aspect_ratio}
                      </span>
                    </span>
                  )}
                  <span className="block p-2">
                    <span className="block text-xs font-semibold">
                      {styleName(style)}
                    </span>
                    <span className="text-muted-foreground line-clamp-2 block text-[11px]">
                      {vi ? style.description_vi : style.description_en}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="border-border bg-card space-y-3 rounded-xl border p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <UserRound className="text-brand-orange size-4" />
              {t("aiStudio.video.ambassadorTitle")}
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                aria-pressed={ambassadorId === null}
                onClick={() => setAmbassadorId(null)}
                className={cn(
                  "border-border rounded-xl border px-3 py-2 text-xs",
                  ambassadorId === null &&
                    "border-brand-orange text-brand-orange",
                )}
              >
                {t("aiStudio.video.noAmbassador")}
              </button>
              {(ambassadors.data ?? []).map((a) => (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={ambassadorId === a.id}
                  onClick={() => setAmbassadorId(a.id)}
                  className={cn(
                    "border-border flex items-center gap-2 rounded-xl border p-1.5 pr-3 text-xs",
                    ambassadorId === a.id && "border-brand-orange",
                  )}
                >
                  <img
                    src={a.image_url}
                    alt=""
                    className="size-9 rounded-lg object-cover"
                  />
                  {a.name}
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border-border bg-card space-y-4 rounded-xl border p-5">
            <div className="space-y-1.5 text-sm font-medium">
              <span>{t("aiStudio.video.aspect")}</span>
              <div
                role="group"
                aria-label={t("aiStudio.video.aspect")}
                className="bg-muted flex rounded-lg p-1"
              >
                {(["9:16", "16:9"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={aspectRatio === value}
                    onClick={() => setAspectRatio(value)}
                    className={cn(
                      "flex-1 rounded-md px-2 py-1 text-xs font-medium",
                      aspectRatio === value
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground",
                    )}
                  >
                    {t(
                      `aiStudio.video.aspects.${value === "9:16" ? "vertical" : "horizontal"}`,
                    )}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              {credits.data
                ? t("aiStudio.video.credits", { count: credits.data.remaining })
                : t("aiStudio.video.creditsUnknown")}
            </p>
            {error && (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}
            <Button
              variant="orange"
              className="w-full gap-2"
              disabled={tooShort || starting || running}
              onClick={() => void generate()}
            >
              {starting || running ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Wand2 className="size-4" />
              )}
              {t("aiStudio.video.generateButton")}
            </Button>
          </section>

          {current && (
            <section
              aria-live="polite"
              className="border-border bg-card space-y-3 rounded-xl border p-5"
            >
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <Film className="text-brand-orange size-4" />
                  {t(`aiStudio.video.status.${current.status}`)}
                </span>
                {running && (
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {Math.floor(elapsed)}s
                  </span>
                )}
              </div>
              {running && (
                <div
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="bg-muted h-2 overflow-hidden rounded-full"
                >
                  <div
                    className="bg-brand-orange h-full rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              {current.status === "COMPLETED" && current.videoUrl && (
                <>
                  <video
                    src={current.videoUrl}
                    controls
                    className="w-full rounded-lg bg-black"
                  />
                  <Button asChild variant="outline" className="w-full gap-2">
                    <a
                      href={current.videoUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download className="size-4" />
                      {t("aiStudio.video.download")}
                    </a>
                  </Button>
                </>
              )}
              {current.status === "FAILED" && (
                <div className="space-y-2">
                  <p className="text-destructive flex items-start gap-1.5 text-xs">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    {t(
                      current.errorCode === "VIDEO_GENERATION_TIMEOUT"
                        ? "aiStudio.video.errors.timeout"
                        : "aiStudio.video.errors.jobFailed",
                    )}
                    {current.refunded && ` ${t("aiStudio.video.refunded")}`}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => void generate()}
                    disabled={tooShort || starting}
                  >
                    <RotateCcw className="size-3.5" />
                    {t("aiStudio.video.retry")}
                  </Button>
                </div>
              )}
            </section>
          )}

          {(history.data ?? []).length > 0 && (
            <section className="border-border bg-card space-y-2 rounded-xl border p-5">
              <h2 className="text-sm font-semibold">
                {t("aiStudio.video.history")}
              </h2>
              <ul className="space-y-2">
                {history.data!.map((item: VideoJob) => (
                  <li key={item.jobId}>
                    <button
                      type="button"
                      onClick={() => {
                        queries.setQueryData(
                          ["video-job", workspaceId, item.jobId],
                          item,
                        );
                        setJobId(item.jobId);
                      }}
                      className="hover:bg-muted flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-xs"
                    >
                      <span className="truncate">{item.prompt}</span>
                      <span
                        className={cn(
                          "shrink-0 font-medium",
                          item.status === "COMPLETED" &&
                            "text-emerald-600 dark:text-emerald-400",
                          item.status === "FAILED" && "text-destructive",
                        )}
                      >
                        {t(`aiStudio.video.status.${item.status}`)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </PageWrapper>
  );
}

export default VideoStudioPage;
