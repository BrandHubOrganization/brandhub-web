import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { LEVEL_CHIP } from "@/pages/admin/components/moderation/ModerationKanbanCard";
import { adminModerationService } from "@/services/adminModerationService";
import { errorCode } from "@/services/adminRevenueService";
import type { StrikeLevel } from "@/services/adminAccountService";
import type { ModerationItem } from "@/services/adminModerationService";

export interface ModerationReviewedSummaryProps {
  item: ModerationItem;
  formatTime: (iso: string) => string;
  onNotifyAuthor: () => void;
  onClose: () => void;
}

export function ModerationReviewedSummary({
  item,
  formatTime,
  onNotifyAuthor,
  onClose,
}: ModerationReviewedSummaryProps) {
  const { t } = useTranslation();
  return (
    <section className="border-border rounded-xl border p-4 text-sm">
      <p className="font-semibold">
        {t(`admin.moderation.status.${item.status}`)}
        {item.strikeLevel && `, ${t(`admin.level.${item.strikeLevel}`)}`}
        {item.reviewedByName && item.reviewedAt && (
          <span className="text-muted-foreground font-normal">
            {" "}
            ({t("admin.moderation.reviewedAt", { time: formatTime(item.reviewedAt), name: item.reviewedByName })})
          </span>
        )}
      </p>
      <p className="text-muted-foreground mt-1">{item.decisionNote}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onNotifyAuthor}
          className="text-brand-orange border-brand-orange/40 hover:bg-brand-orange-soft hover:text-brand-orange gap-1.5 text-xs font-semibold"
        >
          <BellRing className="size-3.5" />
          <span>{t("admin.moderation.notifyAuthorButton")}</span>
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          {t("admin.notifications.close")}
        </Button>
      </div>
    </section>
  );
}

export interface ModerationDecisionFormProps {
  item: ModerationItem;
  initialChoice: "APPROVE" | "BLOCK" | null;
  onNotifyAuthor: () => void;
  onClose: () => void;
}

const ERROR_KEY_MAP: Record<string, string> = {
  MODERATION_NOTE_TOO_SHORT: "admin.moderation.noteTooShort",
  ADMIN_STATE_CONFLICT: "admin.moderation.conflict",
  FORBIDDEN: "admin.moderation.forbiddenTarget",
};

export function ModerationDecisionForm({
  item,
  initialChoice,
  onNotifyAuthor,
  onClose,
}: ModerationDecisionFormProps) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const [note, setNote] = useState("");
  const [choice, setChoice] = useState<"APPROVE" | "BLOCK" | null>(initialChoice);
  const [level, setLevel] = useState<StrikeLevel>("YELLOW");

  const decide = useMutation({
    mutationFn: (decision: "APPROVE" | "BLOCK") =>
      adminModerationService.decide(item.id, {
        decision,
        note: note.trim(),
        strikeLevel: decision === "BLOCK" ? level : undefined,
        rowVersion: item.rowVersion,
      }),
    onSuccess: (_, decision) => {
      toast.success(t(decision === "APPROVE" ? "admin.moderation.approved" : "admin.moderation.blocked"));
      void client.invalidateQueries({ queryKey: ["admin-moderation"] });
      void client.invalidateQueries({ queryKey: ["admin-statistics"] });
      onClose();
    },
  });

  const code = errorCode(decide.error) ?? "";
  const length = note.trim().length;
  const canSubmit = choice === "APPROVE" ? length >= 10 : choice === "BLOCK" ? length >= 3 : false;

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">{t("admin.moderation.decisionLabel")}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(["APPROVE", "BLOCK"] as const).map((value) => (
            <label
              key={value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                choice === value
                  ? value === "APPROVE" ? "border-success bg-success/10" : "border-destructive bg-destructive/5"
                  : "border-border hover:bg-muted/50",
              )}
            >
              <input
                type="radio"
                name="decision"
                checked={choice === value}
                onChange={() => setChoice(value)}
                className={cn("mt-1", value === "APPROVE" ? "accent-success" : "accent-destructive")}
              />
              <span>
                <span className="block text-sm font-semibold">
                  {t(value === "APPROVE" ? "admin.moderation.approveAction" : "admin.moderation.blockAction")}
                </span>
                <span className="text-muted-foreground mt-0.5 block text-xs leading-5">
                  {t(value === "APPROVE" ? "admin.moderation.approveHint" : "admin.moderation.blockHintChoice")}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {choice === "BLOCK" && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium">{t("admin.moderation.strikeLevel")}</legend>
          <div className="flex gap-2">
            {(["YELLOW", "ORANGE", "RED"] as const).map((value) => (
              <Button
                key={value}
                type="button"
                variant="outline"
                aria-pressed={level === value}
                onClick={() => setLevel(value)}
                className={cn(
                  "h-9 flex-1 text-sm font-medium",
                  level === value ? cn(LEVEL_CHIP[value], "border-current") : "border-border text-muted-foreground",
                )}
              >
                {t(`admin.level.${value}`)}
              </Button>
            ))}
          </div>
        </fieldset>
      )}
      {choice && (
        <label className="block space-y-1.5 text-sm font-medium">
          <span>{t(choice === "BLOCK" ? "admin.moderation.blockReason" : "admin.moderation.approveNote")} *</span>
          <Textarea value={note} rows={3} maxLength={2000} onChange={(e) => setNote(e.target.value)} />
          <span className="text-muted-foreground flex justify-between text-xs font-normal">
            <span>{t(choice === "BLOCK" ? "admin.moderation.blockHint" : "admin.moderation.noteHint")}</span>
            <span className="font-sans">{length}/2000</span>
          </span>
        </label>
      )}
      {decide.isError && (
        <p role="alert" className="text-destructive text-sm">{t(ERROR_KEY_MAP[code] ?? "admin.moderation.error")}</p>
      )}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onNotifyAuthor}
          className="text-brand-orange border-brand-orange/40 hover:bg-brand-orange-soft hover:text-brand-orange mr-auto gap-1.5 text-xs font-semibold"
        >
          <BellRing className="size-3.5" />
          <span>{t("admin.moderation.notifyAuthorAction")}</span>
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>{t("admin.notifications.close")}</Button>
        {choice && (
          <Button
            type="button"
            variant={choice === "BLOCK" ? "destructive" : "orange"}
            disabled={!canSubmit || decide.isPending}
            onClick={() => decide.mutate(choice)}
          >
            {t(choice === "BLOCK" ? "admin.moderation.confirmBlock" : "admin.moderation.confirmApprove")}
          </Button>
        )}
      </div>
    </form>
  );
}
