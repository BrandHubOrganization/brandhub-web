import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Check,
  Flame,
  Layers,
  Loader2,
  Replace,
  ShieldQuestion,
  Sparkles,
  TextCursorInput,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectMenu } from "@/components/ui/select-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { errorCode } from "@/services/adminRevenueService";
import {
  fetchTrends,
  topicLabel,
  type TrendItem,
} from "@/services/trendService";
import {
  aiCaptionService,
  type CaptionContextUsed,
  type CaptionDraft,
  type CaptionGoal,
  type CaptionLength,
  type CaptionOption,
  type CaptionRequest,
  type RefineInstruction,
} from "@/services/aiCaptionService";

const TONES = [
  "friendly",
  "professional",
  "humorous",
  "inspirational",
  "bold",
  "empathetic",
  "trendy",
] as const;
const PLATFORMS = ["facebook", "instagram", "tiktok", "threads", "linkedin"];
const LENGTHS: CaptionLength[] = ["short", "medium", "long"];
const GOALS: CaptionGoal[] = [
  "engagement",
  "sales",
  "announcement",
  "storytelling",
];
const REFINES: RefineInstruction[] = [
  "shorter",
  "longer",
  "add_cta",
  "less_emoji",
  "more_formal",
  "more_casual",
];
const platformName = (p: string) => p[0].toUpperCase() + p.slice(1);

/** What the editor needs to insert: full text plus caption and hashtags apart. */
export interface CaptionPick {
  text: string;
  caption: string;
  hashtags: string[];
}

/**
 * FR 3.7.2: context (goal, trend, brand, past posts, task) -> three options with checks ->
 * refine / adapt -> insert or replace. Shared by the Content Writing View and the Content Studio.
 */
export function AiCaptionDialog({
  workspaceId,
  initialTopic,
  taskId,
  defaultPlatform = "facebook",
  onInsert,
  onReplace,
  onClose,
}: {
  workspaceId: string;
  initialTopic: string;
  taskId?: string | null;
  defaultPlatform?: string;
  onInsert: (pick: CaptionPick) => void;
  onReplace?: (pick: CaptionPick) => void;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.startsWith("en") ? "en" : "vi";
  const [topic, setTopic] = useState(initialTopic.slice(0, 1000));
  const [goal, setGoal] = useState<CaptionGoal>("engagement");
  const [tone, setTone] = useState<string>("friendly");
  const [platform, setPlatform] = useState(
    PLATFORMS.includes(defaultPlatform) ? defaultPlatform : "facebook",
  );
  const [length, setLength] = useState<CaptionLength>("medium");
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [trendId, setTrendId] = useState("");
  const [options, setOptions] = useState<CaptionOption[]>([]);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [generatedRequest, setGeneratedRequest] =
    useState<CaptionRequest | null>(null);
  const [usedContext, setUsedContext] = useState<CaptionContextUsed | null>(
    null,
  );
  const [remaining, setRemaining] = useState<number | null>(null);
  const [used, setUsed] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    aiCaptionService
      .credits(workspaceId)
      .then((b) => setRemaining(b.remaining))
      .catch(() => setRemaining(null));
    fetchTrends("7d", "")
      .then((data) => setTrends(data.items.slice(0, 15)))
      .catch(() => setTrends([]));
  }, [workspaceId]);

  const trend = trends.find((item) => item.id === trendId);
  const tooShort = topic.trim().length < 10;
  const failure = (err: unknown) => {
    const code = errorCode(err);
    setError(
      code === "INSUFFICIENT_AI_CREDIT"
        ? t("editor.aiCaption.noCredit")
        : code === "AI_SERVICE_UNAVAILABLE"
          ? t("editor.aiCaption.aiDown")
          : t("editor.aiCaption.failed"),
    );
  };
  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const request: CaptionRequest = {
        topic: topic.trim(),
        tone,
        platform,
        length,
        language,
        goal,
        taskId: taskId ?? null,
        trend: trend
          ? {
              keyword: trend.keyword,
              topic: trend.topic,
              keywords: trend.keywords.slice(0, 10),
            }
          : undefined,
      };
      const result = await aiCaptionService.generate(workspaceId, request);
      setOptions(result.captions);
      setGenerationId(result.generationId);
      setGeneratedRequest(request);
      setUsedContext(result.context);
      setUsed(result.creditsUsed);
      setRemaining(result.creditsRemaining);
    } catch (err) {
      failure(err);
    } finally {
      setLoading(false);
    }
  };
  const pick = (
    option: Pick<CaptionOption, "caption" | "hashtags">,
  ): CaptionPick => ({
    caption: option.caption,
    hashtags: option.hashtags,
    text:
      option.hashtags.length && !option.caption.includes(option.hashtags[0])
        ? `${option.caption}\n\n${option.hashtags.join(" ")}`
        : option.caption,
  });
  const apply = (
    option: CaptionOption | CaptionDraft,
    action: "INSERT" | "REPLACE",
    type?: string,
  ) => {
    if (option.compliance.status === "BLOCKED") return;
    const chosen = pick(option);
    (action === "REPLACE" && onReplace ? onReplace : onInsert)(chosen);
    if (generationId && type) {
      void aiCaptionService.choose(workspaceId, generationId, {
        type,
        action,
        finalText: chosen.text,
      });
    }
    onClose();
  };
  const charged = (r: { creditsUsed: number; creditsRemaining: number }) => {
    setUsed(r.creditsUsed);
    setRemaining(r.creditsRemaining);
  };
  const contextLine = usedContext
    ? [
        usedContext.brand && t("editor.aiCaption.used.brand"),
        usedContext.task && t("editor.aiCaption.used.task"),
        usedContext.trend &&
          generatedRequest?.trend &&
          `#${generatedRequest.trend.keyword}`,
        usedContext.examples > 0 &&
          t("editor.aiCaption.used.examples", { count: usedContext.examples }),
        usedContext.knowledgeChunks > 0 &&
          t("editor.aiCaption.used.docs", {
            count: usedContext.knowledgeChunks,
          }),
      ].filter(Boolean)
    : [];

  return (
    <Dialog open onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-brand-orange size-5" />
            {t("editor.aiCaption.title")}
          </DialogTitle>
          <DialogDescription>
            {remaining == null
              ? t("editor.aiCaption.description")
              : t("editor.aiCaption.creditsLeft", { count: remaining })}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!tooShort && !loading) void generate();
          }}
        >
          <label className="block space-y-1.5 text-sm font-medium">
            <span>{t("editor.aiCaption.topic")}</span>
            <Textarea
              value={topic}
              rows={3}
              maxLength={1000}
              placeholder={t("editor.aiCaption.topicPlaceholder")}
              onChange={(e) => setTopic(e.target.value)}
            />
            <span
              className={cn(
                "block text-xs font-normal",
                topic && tooShort
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}
            >
              {t(
                taskId
                  ? "editor.aiCaption.topicHintTask"
                  : "editor.aiCaption.topicHint",
              )}
            </span>
          </label>

          <div className="space-y-1.5 text-sm font-medium">
            <span>{t("editor.aiCaption.goal")}</span>
            <div
              role="group"
              aria-label={t("editor.aiCaption.goal")}
              className="flex flex-wrap gap-2"
            >
              {GOALS.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={goal === value}
                  onClick={() => setGoal(value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    goal === value
                      ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(`editor.aiCaption.goals.${value}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <label className="space-y-1.5 text-sm font-medium">
              <span>{t("editor.aiCaption.tone")}</span>
              <SelectMenu
                className="h-9 w-full text-sm"
                ariaLabel={t("editor.aiCaption.tone")}
                value={tone}
                onChange={setTone}
                options={TONES.map((value) => ({
                  value,
                  label: t(`editor.aiCaption.tones.${value}`),
                }))}
              />
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              <span>{t("editor.aiCaption.platform")}</span>
              <SelectMenu
                className="h-9 w-full text-sm"
                ariaLabel={t("editor.aiCaption.platform")}
                value={platform}
                onChange={setPlatform}
                options={PLATFORMS.map((value) => ({
                  value,
                  label: platformName(value),
                }))}
              />
            </label>
            <div className="space-y-1.5 text-sm font-medium">
              <span>{t("editor.aiCaption.length")}</span>
              <div
                role="group"
                aria-label={t("editor.aiCaption.length")}
                className="bg-muted flex rounded-lg p-1"
              >
                {LENGTHS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={length === value}
                    onClick={() => setLength(value)}
                    className={cn(
                      "flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                      length === value
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t(`editor.aiCaption.lengths.${value}`)}
                  </button>
                ))}
              </div>
            </div>
            <label className="space-y-1.5 text-sm font-medium">
              <span>{t("editor.aiCaption.trend")}</span>
              <SelectMenu
                className="h-9 w-full text-sm"
                ariaLabel={t("editor.aiCaption.trend")}
                value={trendId}
                onChange={setTrendId}
                options={[
                  { value: "", label: t("editor.aiCaption.noTrend") },
                  ...trends.map((item) => ({
                    value: item.id,
                    label: item.keyword,
                  })),
                ]}
              />
            </label>
          </div>
          {trend?.topic && (
            <p className="text-muted-foreground -mt-2 text-xs">
              {t("editor.aiCaption.trendTopic", {
                topic: topicLabel(t, trend.topic),
              })}
            </p>
          )}
          {trend?.brandRisk === "high" && (
            <p className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="size-3.5" />
              {t("editor.aiCaption.trendRisk")}
            </p>
          )}

          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-end gap-3">
            {contextLine.length > 0 && (
              <span className="text-muted-foreground mr-auto text-xs">
                {t("editor.aiCaption.used.label")} {contextLine.join(" · ")}
              </span>
            )}
            {used != null && (
              <span className="text-muted-foreground text-xs">
                {t("editor.aiCaption.charged", { count: used })}
              </span>
            )}
            <Button
              type="submit"
              className="bg-brand-orange hover:bg-brand-orange/90 gap-1.5 text-white"
              disabled={tooShort || loading}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {t(
                options.length
                  ? "editor.aiCaption.regenerate"
                  : "editor.aiCaption.generate",
              )}
            </Button>
          </div>
        </form>

        {options.length > 0 && (
          <div className="grid gap-3 md:grid-cols-3">
            {options.map((option, index) => (
              <OptionCard
                key={`${generationId}:${option.type}`}
                option={option}
                workspaceId={workspaceId}
                platform={generatedRequest?.platform ?? platform}
                language={generatedRequest?.language ?? language}
                topic={generatedRequest?.topic ?? topic.trim()}
                canReplace={!!onReplace}
                onChange={(next, cost) => {
                  setOptions((all) =>
                    all.map((o, i) => (i === index ? { ...o, ...next } : o)),
                  );
                  charged(cost);
                }}
                onCharged={charged}
                onError={failure}
                onApply={(item, action) => apply(item, action, option.type)}
              />
            ))}
          </div>
        )}
        {options.length > 0 && (
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Check className="size-3.5" />
            {t("editor.aiCaption.editAfter")}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function OptionCard({
  option,
  workspaceId,
  platform,
  language,
  topic,
  canReplace,
  onChange,
  onCharged,
  onError,
  onApply,
}: {
  option: CaptionOption;
  workspaceId: string;
  platform: string;
  language: "vi" | "en";
  topic: string;
  canReplace: boolean;
  onChange: (
    next: Partial<CaptionOption>,
    cost: { creditsUsed: number; creditsRemaining: number },
  ) => void;
  onCharged: (cost: { creditsUsed: number; creditsRemaining: number }) => void;
  onError: (err: unknown) => void;
  onApply: (
    item: CaptionOption | CaptionDraft,
    action: "INSERT" | "REPLACE",
  ) => void;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showTools, setShowTools] = useState(false);
  const [targets, setTargets] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<CaptionDraft[]>([]);
  const blocked = option.compliance.status === "BLOCKED";
  const topEmotion = Object.entries(option.signals.emotion).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const refine = async (instruction: RefineInstruction) => {
    setBusy(true);
    try {
      const out = await aiCaptionService.refine(workspaceId, {
        caption: option.caption,
        instruction,
        feedback: instruction === "custom" ? feedback.trim() : undefined,
        platform,
        language,
        topic,
      });
      const draft = out.drafts[0];
      onChange(
        {
          caption: draft.caption,
          hashtags: draft.hashtags.length ? draft.hashtags : option.hashtags,
          characterCount: draft.characterCount,
          recommendedMaxChars: draft.recommendedMaxChars,
          signals: draft.signals,
          compliance: draft.compliance,
        },
        out,
      );
      setFeedback("");
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };
  const adapt = async () => {
    setBusy(true);
    try {
      const out = await aiCaptionService.adapt(workspaceId, {
        caption: option.caption,
        platforms: targets,
        language,
        topic,
      });
      setDrafts(out.drafts);
      onCharged(out);
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="border-border bg-card flex flex-col gap-2 rounded-xl border p-3">
      <header className="flex items-center justify-between gap-2">
        <span className="bg-brand-orange/10 text-brand-orange rounded-full px-2 py-0.5 text-xs font-medium">
          {t(`editor.aiCaption.types.${option.type}`, option.title)}
        </span>
        <span
          className={cn(
            "text-xs tabular-nums",
            option.characterCount > option.recommendedMaxChars
              ? "text-destructive"
              : "text-muted-foreground",
          )}
        >
          {option.characterCount}/{option.recommendedMaxChars}
        </span>
      </header>
      <p
        className={cn(
          "text-sm leading-6 whitespace-pre-line",
          busy && "opacity-50",
        )}
      >
        {option.caption}
      </p>
      {option.hashtags.length > 0 && (
        <p className="text-brand-orange text-xs">{option.hashtags.join(" ")}</p>
      )}

      <div className="flex flex-wrap gap-1.5 text-[11px]">
        {topEmotion && (
          <span className="bg-muted rounded-full px-2 py-0.5">
            {t("editor.aiCaption.signals.emotion", {
              label: t(
                `aiStudio.trends.emotionName.${topEmotion[0]}`,
                topEmotion[0],
              ),
              value: Math.round(topEmotion[1] * 100),
            })}
          </span>
        )}
        {option.signals.trendUsed && (
          <span className="bg-brand-orange/10 text-brand-orange inline-flex items-center gap-1 rounded-full px-2 py-0.5">
            <Flame className="size-3" />
            {t("editor.aiCaption.signals.trend")}
          </span>
        )}
        <span
          className="text-muted-foreground inline-flex items-center gap-1 rounded-full px-1 py-0.5"
          title={t("editor.aiCaption.signals.complianceHint")}
        >
          <ShieldQuestion className="size-3" />
          {t(`editor.aiCaption.compliance.${option.compliance.status}`)}
        </span>
      </div>
      {option.signals.unverifiedClaims.length > 0 && (
        <p className="flex items-start gap-1.5 rounded-lg bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-800 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 size-3 shrink-0" />
          {t("editor.aiCaption.signals.claims", {
            claims: option.signals.unverifiedClaims.join(", "),
          })}
        </p>
      )}
      {option.compliance.issues.map((issue) => (
        <p
          key={issue.code + issue.excerpt}
          className="text-destructive text-[11px]"
        >
          {issue.message}
        </p>
      ))}

      <div className="mt-auto space-y-2 pt-1">
        <button
          type="button"
          onClick={() => setShowTools((v) => !v)}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
        >
          <Wand2 className="size-3.5" />
          {t("editor.aiCaption.tools")}
        </button>
        {showTools && (
          <div className="border-border space-y-2 rounded-lg border p-2">
            <div className="flex flex-wrap gap-1">
              {REFINES.map((instruction) => (
                <button
                  key={instruction}
                  type="button"
                  disabled={busy}
                  onClick={() => void refine(instruction)}
                  className="border-border hover:border-brand-orange rounded-full border px-2 py-0.5 text-[11px] disabled:opacity-50"
                >
                  {t(`editor.aiCaption.refines.${instruction}`)}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <Input
                value={feedback}
                maxLength={500}
                placeholder={t("editor.aiCaption.feedbackPlaceholder")}
                className="h-8 text-xs"
                onChange={(e) => setFeedback(e.target.value)}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                disabled={busy || !feedback.trim()}
                onClick={() => void refine("custom")}
              >
                {t("editor.aiCaption.apply")}
              </Button>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                <Layers className="size-3" />
                {t("editor.aiCaption.adapt")}
              </span>
              <div className="flex flex-wrap gap-1">
                {PLATFORMS.filter((p) => p !== platform).map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={targets.includes(p)}
                    onClick={() =>
                      setTargets((all) =>
                        all.includes(p)
                          ? all.filter((x) => x !== p)
                          : [...all, p],
                      )
                    }
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[11px]",
                      targets.includes(p)
                        ? "border-brand-orange text-brand-orange"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {platformName(p)}
                  </button>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-[11px]"
                  disabled={busy || targets.length === 0}
                  onClick={() => void adapt()}
                >
                  {t("editor.aiCaption.adaptGo")}
                </Button>
              </div>
            </div>
            {drafts.map((draft) => (
              <div
                key={draft.platform}
                className="bg-muted/50 space-y-1 rounded-lg p-2 text-xs"
              >
                <div className="flex items-center justify-between font-medium">
                  {platformName(draft.platform)}
                  <span className="text-muted-foreground tabular-nums">
                    {draft.characterCount}/{draft.recommendedMaxChars}
                  </span>
                </div>
                <p className="whitespace-pre-line">{draft.caption}</p>
                {draft.compliance.status === "BLOCKED" && (
                  <p className="text-destructive">
                    {t("editor.aiCaption.compliance.BLOCKED")}
                  </p>
                )}
                <button
                  type="button"
                  className="text-brand-orange text-[11px] font-medium disabled:opacity-50"
                  disabled={busy || draft.compliance.status === "BLOCKED"}
                  onClick={() => onApply(draft, "INSERT")}
                >
                  {t("editor.aiCaption.insert")}
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1 gap-1 text-xs"
            disabled={blocked || busy}
            onClick={() => onApply(option, "INSERT")}
          >
            <TextCursorInput className="size-3.5" />
            {t("editor.aiCaption.insert")}
          </Button>
          {canReplace && (
            <Button
              type="button"
              size="sm"
              className="bg-brand-orange hover:bg-brand-orange/90 flex-1 gap-1 text-xs text-white"
              disabled={blocked || busy}
              onClick={() => onApply(option, "REPLACE")}
            >
              <Replace className="size-3.5" />
              {t("editor.aiCaption.replace")}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
