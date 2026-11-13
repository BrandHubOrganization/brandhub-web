import { useEffect, useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RichTextInput,
  stripRichTextHtml,
} from "@/components/ui/rich-text-input";
import { Select } from "@/components/ui/select";
import { campaignTimelineService } from "@/pages/campaign/services/campaignTimelineService";
import type { TimelineTask } from "@/pages/campaign/types/campaignTimeline";
import {
  addDays,
  dayInstant,
  todayIn,
} from "@/pages/campaign/utils/timelineDates";
import type { TaskMemberOption } from "@/pages/tasks/types/taskWorkflow";

const OUT_OF_SCOPE_TASK_TYPES = [
  "POST",
  "SHORT_VIDEO",
  "EVENT_PLAN",
  "PRESS_RECOMMENDATION",
  "KOL_BOOKING",
  "WORKSHOP",
  "SURVEY",
  "EMAIL_NEWSLETTER",
] as const;

export function skipOutOfScopeConfirmKey(userId: string, campaignId: string) {
  return `brandhub:skip-out-of-scope:${userId || "anon"}:${campaignId}`;
}

export function CampaignOutOfScopeTaskDialog({
  open,
  workspaceId,
  campaignId,
  userId,
  timezone,
  members,
  onClose,
  onCreated,
}: {
  open: boolean;
  workspaceId: string;
  campaignId: string;
  userId: string;
  timezone: string;
  members: TaskMemberOption[];
  onClose: () => void;
  onCreated: (created: TimelineTask) => void;
}) {
  const { t } = useTranslation();
  const storageKey = skipOutOfScopeConfirmKey(userId, campaignId);

  const [step, setStep] = useState<"confirm" | "form">("confirm");
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("POST");
  const [assigneeId, setAssigneeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let skip = false;
    try {
      skip = window.localStorage.getItem(storageKey) === "true";
    } catch {
      /* localStorage unavailable; default to showing the confirm step. */
    }
    const today = todayIn(timezone);
    setStep(skip ? "form" : "confirm");
    setDontAskAgain(false);
    setName("");
    setType("POST");
    setAssigneeId("");
    setStartDate(today);
    setDueDate(addDays(today, 2));
    setDescription("");
    setAcceptanceCriteria("");
    setError(null);
  }, [open, storageKey, timezone]);

  function handleConfirmWarning() {
    if (dontAskAgain) {
      try {
        window.localStorage.setItem(storageKey, "true");
      } catch {
        /* Ignore storage quota or private-mode restrictions. */
      }
    }
    setStep("form");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || submitting) return;
    if (startDate && dueDate && dueDate <= startDate) {
      setError(
        t("campaign.timeline.createTaskDateError", {
          defaultValue: "Hạn hoàn thành phải sau ngày bắt đầu.",
        }),
      );
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await campaignTimelineService.createTask(
        workspaceId,
        campaignId,
        {
          name: trimmedName,
          type,
          assigneeId: assigneeId || null,
          plannedStartDate: startDate ? dayInstant(startDate, timezone) : null,
          dueDate: dueDate ? dayInstant(dueDate, timezone) : null,
          description: stripRichTextHtml(description).trim()
            ? description
            : null,
          acceptanceCriteria: stripRichTextHtml(acceptanceCriteria).trim()
            ? acceptanceCriteria
            : null,
        },
      );
      toast.success(
        t("campaign.timeline.createTaskSuccess", {
          defaultValue: "Đã thêm công việc ngoài phạm vi",
        }),
      );
      onCreated(created);
      onClose();
    } catch {
      toast.error(t("campaign.timeline.saveFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      {step === "confirm" ? (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <span className="bg-brand-orange/15 text-brand-orange flex size-8 shrink-0 items-center justify-center rounded-lg">
                <AlertTriangle className="size-4" />
              </span>
              <span>
                {t("campaign.timeline.outOfScopeWarningTitle", {
                  defaultValue: "Thêm công việc ngoài phạm vi (Out of Scope)?",
                })}
              </span>
            </DialogTitle>
            <DialogDescription className="text-foreground/80 pt-1 text-sm leading-relaxed">
              {t("campaign.timeline.outOfScopeWarningBody", {
                defaultValue:
                  "Công việc này nằm ngoài phạm vi gói dịch vụ đã chốt trong chiến dịch. Bạn có chắc chắn muốn thêm không?",
              })}
            </DialogDescription>
          </DialogHeader>

          <label className="border-border bg-brand-orange-soft/45 hover:bg-brand-orange-soft/70 flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors select-none">
            <input
              type="checkbox"
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
              className="accent-brand-orange size-4 cursor-pointer rounded"
            />
            <span>
              {t("campaign.timeline.outOfScopeSkipConfirm", {
                defaultValue: "Không hỏi lại trong chiến dịch này",
              })}
            </span>
          </label>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("campaign.timeline.outOfScopeConfirmNo", {
                defaultValue: "Không",
              })}
            </Button>
            <Button
              type="button"
              variant="orange"
              onClick={handleConfirmWarning}
            >
              {t("campaign.timeline.outOfScopeConfirmYes", {
                defaultValue: "Có, tiếp tục",
              })}
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : (
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <span className="bg-brand-orange flex size-7 shrink-0 items-center justify-center rounded-lg text-white">
                <Plus className="size-4" />
              </span>
              <span>
                {t("campaign.timeline.createTaskTitle", {
                  defaultValue: "Thêm công việc lớn ngoài phạm vi",
                })}
              </span>
              <span className="border-brand-orange/40 bg-brand-orange/15 text-brand-orange ml-auto rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                {t("campaign.timeline.outOfScopeBadge", {
                  defaultValue: "Ngoài phạm vi",
                })}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t("campaign.timeline.createTaskSubtitle", {
                defaultValue:
                  "Công việc này sẽ được đánh dấu Ngoài phạm vi (Out of Scope) và tự động tạo các đầu việc con theo loại công việc.",
              })}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="oos-task-name" className="text-xs font-semibold">
                {t("campaign.timeline.taskNameLabel", {
                  defaultValue: "Tên công việc lớn",
                })}{" "}
                <span className="text-brand-orange">*</span>
              </Label>
              <Input
                id="oos-task-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={255}
                required
                autoFocus
                placeholder={t("campaign.timeline.taskNamePlaceholder", {
                  defaultValue: "VD: Bài PR bổ sung, Video recap sự kiện…",
                })}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="oos-task-type"
                  className="text-xs font-semibold"
                >
                  {t("campaign.timeline.taskTypeLabel", {
                    defaultValue: "Loại công việc",
                  })}
                </Label>
                <Select
                  id="oos-task-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {OUT_OF_SCOPE_TASK_TYPES.map((taskType) => (
                    <option key={taskType} value={taskType}>
                      {t(`campaign.types.${taskType}`, {
                        defaultValue: taskType,
                      })}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="oos-task-assignee"
                  className="text-xs font-semibold"
                >
                  {t("campaign.timeline.taskAssigneeLabel", {
                    defaultValue: "Người phụ trách (không bắt buộc)",
                  })}
                </Label>
                <Select
                  id="oos-task-assignee"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                >
                  <option value="">
                    {t("campaign.timeline.taskUnassigned", {
                      defaultValue: "Chưa giao",
                    })}
                  </option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.displayName}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="oos-task-start"
                  className="text-xs font-semibold"
                >
                  {t("campaign.timeline.taskStartDateLabel", {
                    defaultValue: "Ngày bắt đầu",
                  })}
                </Label>
                <Input
                  id="oos-task-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="oos-task-due" className="text-xs font-semibold">
                  {t("campaign.timeline.taskDueDateLabel", {
                    defaultValue: "Hạn hoàn thành",
                  })}
                </Label>
                <Input
                  id="oos-task-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("campaign.timeline.taskDescriptionLabel", {
                  defaultValue: "Yêu cầu chi tiết",
                })}
              </Label>
              <RichTextInput
                value={description}
                onChange={setDescription}
                editorClassName="min-h-[84px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("campaign.timeline.taskAcceptanceLabel", {
                  defaultValue: "Tiêu chí nghiệm thu",
                })}
              </Label>
              <RichTextInput
                value={acceptanceCriteria}
                onChange={setAcceptanceCriteria}
                editorClassName="min-h-[84px]"
              />
            </div>

            {error && (
              <p className="text-destructive text-xs font-medium" role="alert">
                {error}
              </p>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
              >
                {t("common.cancel", { defaultValue: "Hủy" })}
              </Button>
              <Button
                type="submit"
                variant="orange"
                disabled={submitting || !name.trim()}
              >
                {t("campaign.timeline.createTaskSubmit", {
                  defaultValue: "Tạo công việc",
                })}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}
