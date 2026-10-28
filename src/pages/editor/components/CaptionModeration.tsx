import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkCaption } from "@/services/textModerationService";
import type { ModerationResult } from "@/types/moderation";

export function CaptionModeration({
  workspaceId,
  text,
  initial,
  onChecked,
}: {
  workspaceId?: string;
  text: string;
  initial?: ModerationResult;
  onChecked?: (result: ModerationResult, text: string) => void;
}) {
  const { t } = useTranslation();
  const [checked, setChecked] = useState<{
    text: string;
    workspaceId?: string;
    result: ModerationResult;
  } | null>(initial ? { text, workspaceId, result: initial } : null);
  const [active, setActive] = useState<{
    text: string;
    workspaceId: string;
    request: AbortController;
  } | null>(null);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    return () => controller.current?.abort();
  }, [text, workspaceId]);
  const pending =
    active?.text === text &&
    active.workspaceId === workspaceId &&
    !active.request.signal.aborted;
  const result =
    checked?.text === text && checked.workspaceId === workspaceId
      ? checked.result
      : undefined;
  async function check() {
    if (!workspaceId || !text.trim() || text.length > 8000) return;
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setActive({ text, workspaceId, request });
    let next: ModerationResult;
    try {
      next = await checkCaption(workspaceId, text, request.signal);
    } catch {
      next = { status: "NOT_CHECKED", issues: [] };
    }
    setActive((current) => (current?.request === request ? null : current));
    if (request.signal.aborted || controller.current !== request) return;
    setChecked({ text, workspaceId, result: next });
    onChecked?.(next, text);
  }
  return (
    <div
      data-testid="caption-moderation"
      className="border-border bg-card text-foreground space-y-2 rounded-xl border p-3 text-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-semibold">
          <ShieldCheck className="size-4" />
          {t("editor.moderation.title")}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={check}
          disabled={
            pending || !workspaceId || !text.trim() || text.length > 8000
          }
        >
          {pending && <Loader2 className="size-3 animate-spin" />}
          {t(
            pending ? "editor.moderation.checking" : "editor.moderation.check",
          )}
        </Button>
      </div>
      <div
        role="status"
        aria-live="polite"
        className={
          result?.status === "BLOCKED"
            ? "text-destructive"
            : "text-muted-foreground"
        }
      >
        {pending
          ? t("editor.moderation.checking")
          : text.length > 8000
            ? t("editor.moderation.tooLong")
            : result?.status === "NOT_CHECKED" && result.issues.some((issue) => issue.code.startsWith("unsupported_") && issue.code !== "unsupported_or_partial")
            ? t("editor.moderation.coverageIncomplete")
            : result?.status === "WARNING" && result.issues.some((issue) => issue.code.startsWith("unsupported_") && issue.code !== "unsupported_or_partial")
              ? t("editor.moderation.coveragePartial")
              : t(`editor.moderation.${result?.status ?? "stale"}`)}
      </div>
      {!pending && result?.issues.length ? (
        <ul className="list-disc space-y-1 pl-4">
          {result.issues.map((issue, index) => (
            <li key={`${issue.code}-${index}`}>
              {t(`editor.moderation.issues.${issue.code}`, {
                defaultValue: t("editor.moderation.issues.other"),
              })}
              {issue.score != null && (
                <span className="ml-1">{t("editor.moderation.severity", { score: issue.score })}</span>
              )}
              {issue.excerpt && (
                <q className="ml-1 break-words">{issue.excerpt}</q>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
