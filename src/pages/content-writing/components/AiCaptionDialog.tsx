import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  Loader2,
  Replace,
  Sparkles,
  TextCursorInput,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  aiCaptionService,
  type CaptionLength,
  type CaptionOption,
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

/** FR 3.7.2: three AI caption options; the Creator inserts or replaces, then edits freely. */
export function AiCaptionDialog({
  workspaceId,
  initialTopic,
  onInsert,
  onReplace,
  onClose,
}: {
  workspaceId: string;
  initialTopic: string;
  onInsert: (text: string) => void;
  onReplace: (text: string) => void;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [topic, setTopic] = useState(initialTopic.slice(0, 1000));
  const [tone, setTone] = useState<string>("friendly");
  const [platform, setPlatform] = useState("facebook");
  const [length, setLength] = useState<CaptionLength>("medium");
  const [options, setOptions] = useState<CaptionOption[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [used, setUsed] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    aiCaptionService
      .credits(workspaceId)
      .then((b) => setRemaining(b.remaining))
      .catch(() => setRemaining(null));
  }, [workspaceId]);

  const tooShort = topic.trim().length < 10;
  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await aiCaptionService.generate(workspaceId, {
        topic: topic.trim(),
        tone,
        platform,
        length,
        language: i18n.language.startsWith("en") ? "en" : "vi",
      });
      setOptions(result.captions);
      setUsed(result.creditsUsed);
      setRemaining(result.creditsRemaining);
    } catch (err) {
      const code = errorCode(err);
      setError(
        code === "INSUFFICIENT_AI_CREDIT"
          ? t("editor.aiCaption.noCredit")
          : code === "AI_SERVICE_UNAVAILABLE"
            ? t("editor.aiCaption.aiDown")
            : t("editor.aiCaption.failed"),
      );
    } finally {
      setLoading(false);
    }
  };
  const full = (option: CaptionOption) =>
    option.hashtags.length && !option.caption.includes(option.hashtags[0])
      ? `${option.caption}\n\n${option.hashtags.join(" ")}`
      : option.caption;

  return (
    <Dialog open onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
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
              {t("editor.aiCaption.topicHint")}
            </span>
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
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
                  label: value[0].toUpperCase() + value.slice(1),
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
          </div>
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
          <div className="flex items-center justify-end gap-3">
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
            {options.map((option) => (
              <article
                key={option.type}
                className="border-border bg-card flex flex-col gap-2 rounded-xl border p-3"
              >
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
                <p className="text-sm leading-6 whitespace-pre-line">
                  {option.caption}
                </p>
                {option.hashtags.length > 0 && (
                  <p className="text-brand-orange text-xs">
                    {option.hashtags.join(" ")}
                  </p>
                )}
                <div className="mt-auto flex gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1 text-xs"
                    onClick={() => {
                      onInsert(full(option));
                      onClose();
                    }}
                  >
                    <TextCursorInput className="size-3.5" />
                    {t("editor.aiCaption.insert")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-brand-orange hover:bg-brand-orange/90 flex-1 gap-1 text-xs text-white"
                    onClick={() => {
                      onReplace(full(option));
                      onClose();
                    }}
                  >
                    <Replace className="size-3.5" />
                    {t("editor.aiCaption.replace")}
                  </Button>
                </div>
              </article>
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
