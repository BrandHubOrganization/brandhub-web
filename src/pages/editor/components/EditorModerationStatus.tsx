import { useTranslation } from "react-i18next";
import { Loader2, ShieldCheck } from "lucide-react";
import type { EditorModerationSnapshot } from "@/pages/editor/services/editorModeration";

export function EditorModerationStatus({
  snapshot,
}: {
  snapshot: EditorModerationSnapshot;
}) {
  const { t } = useTranslation();
  if (snapshot.phase === "IDLE") return null;
  const { result } = snapshot;
  const key =
    snapshot.text.length > 8000
      ? "tooLong"
      : snapshot.phase === "WAITING"
        ? "waiting"
        : snapshot.phase === "CHECKING"
          ? "checking"
          : result?.status === "NOT_CHECKED" && result.issues.some((issue) => issue.code.startsWith("unsupported_") && issue.code !== "unsupported_or_partial")
          ? "coverageIncomplete"
          : result?.status === "WARNING" && result.issues.some((issue) => issue.code.startsWith("unsupported_") && issue.code !== "unsupported_or_partial")
            ? "coveragePartial"
            : (result?.status ?? "NOT_CHECKED");
  return (
    <div
      data-testid="editor-moderation"
      className="border-border bg-card space-y-2 rounded-xl border p-3 text-xs"
      role="status"
      aria-live="polite"
    >
      <div className="text-foreground flex items-center gap-2 font-semibold">
        {snapshot.phase === "CHECKING" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ShieldCheck className="size-4" />
        )}
        {t("editor.moderation.title")}
      </div>
      <p
        className={
          result?.status === "BLOCKED"
            ? "text-destructive"
            : "text-muted-foreground"
        }
      >
        {t(`editor.moderation.${key}`)}
      </p>
      {result?.issues.length ? (
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
