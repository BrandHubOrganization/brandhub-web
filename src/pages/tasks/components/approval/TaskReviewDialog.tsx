import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, Calendar, Clock, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TaskReviewContent } from "@/pages/tasks/components/approval/TaskReviewContent";
import {
  useTaskReviewDialog,
  type ReviewDialogProps,
} from "@/pages/tasks/hooks/useTaskReviewDialog";
import { MAX_REVIEW_COMMENT } from "@/pages/tasks/utils/taskApprovalView";
import { cn } from "@/lib/utils";

export function TaskReviewDialog(props: ReviewDialogProps) {
  const { t } = useTranslation();
  const state = useTaskReviewDialog(props);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const isPostApproval =
    props.action === "approve" && props.task?.type === "POST";
  const post = state.view.linked?.post;
  const currentPublish =
    props.task?.publishDate || post?.scheduledAt || null;
  const hasNoSchedule = !currentPublish;

  const [publishChoice, setPublishChoice] = useState<
    "keep" | "now" | "schedule" | "later"
  >(hasNoSchedule ? "schedule" : "keep");
  const [scheduleDateTime, setScheduleDateTime] = useState<string>("");

  useEffect(() => {
    if (state.error) errorRef.current?.focus();
  }, [state.error]);

  const hasNote = props.action === "approve" || props.action === "reject";

  const handleConfirmAction = async () => {
    if (isPostApproval) {
      if (publishChoice === "schedule") {
        if (!scheduleDateTime) {
          toast.error("Vui lòng chọn ngày và giờ xuất bản hoặc chọn Đăng ngay / Lên lịch sau.");
          return;
        }
        const chosen = new Date(scheduleDateTime).getTime();
        if (chosen <= Date.now()) {
          toast.error("Thời gian hẹn xuất bản phải ở trong tương lai.");
          return;
        }
      }

      if (props.onSetPublishDate) {
        try {
          if (publishChoice === "now") {
            await props.onSetPublishDate(new Date().toISOString());
            toast.success("Đã thiết lập đăng bài ngay lập tức.");
          } else if (publishChoice === "schedule" && scheduleDateTime) {
            await props.onSetPublishDate(new Date(scheduleDateTime).toISOString());
            toast.success("Đã lưu lịch xuất bản bài viết.");
          }
        } catch {
          toast.error("Không thể cập nhật lịch đăng bài. Vui lòng thử lại.");
          return;
        }
      }
    }

    await state.confirm();
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) state.close();
      }}
    >
      <DialogContent
        className="rounded-xl motion-reduce:animate-none motion-reduce:transition-none sm:max-w-2xl [&>button]:hidden"
        aria-busy={state.busy}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          (hasNote ? noteRef.current : cancelRef.current)?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{t(`tasks.review.confirm.${props.action}`)}</DialogTitle>
          <DialogDescription>
            {t(`tasks.review.hint.${props.action}`)}
          </DialogDescription>
        </DialogHeader>
        <div className="min-w-0 space-y-4">
          <p className="text-muted-foreground text-sm">
            {t("tasks.review.currentRound", {
              round: state.view.review.approvalRound,
            })}
            {state.view.review.reviewStep &&
              ` · ${t(`tasks.review.steps.${state.view.review.reviewStep}`)}`}
          </p>
          {post && <TaskReviewContent post={post} />}

          {/* Prompt schedule options on post approval */}
          {isPostApproval && (
            <div className="space-y-3 rounded-xl border border-brand-orange/30 bg-brand-orange/5 p-4 shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-brand-orange/15 text-brand-orange">
                    <Clock className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      {hasNoSchedule
                        ? "Nhắc nhở: Lịch xuất bản bài viết"
                        : "Lịch xuất bản bài viết"}
                    </h4>
                    <p className="text-3xs text-muted-foreground">
                      {hasNoSchedule
                        ? "Bài viết này chưa được lên lịch xuất bản."
                        : "Bài viết đã có lịch xuất bản trước đó."}
                    </p>
                  </div>
                </div>
                {currentPublish && (
                  <span className="text-2xs rounded-md border border-brand-orange/30 bg-brand-orange/10 px-2 py-0.5 font-medium text-brand-orange">
                    Đã hẹn:{" "}
                    {new Date(currentPublish).toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                )}
              </div>

              {hasNoSchedule && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Bạn có thể chọn <strong>Đăng ngay lập tức</strong>,{" "}
                    <strong>Hẹn ngày giờ đăng</strong> hoặc{" "}
                    <strong>Lên lịch sau</strong> (hẹn lịch bất cứ lúc nào từ
                    Chi tiết Task).
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {currentPublish ? (
                  <button
                    type="button"
                    onClick={() => setPublishChoice("keep")}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-lg border p-2.5 text-xs transition-all cursor-pointer text-center",
                      publishChoice === "keep"
                        ? "border-brand-orange bg-brand-orange/15 font-semibold text-brand-orange ring-1 ring-brand-orange"
                        : "border-border/80 bg-card hover:border-brand-orange/40 text-foreground",
                    )}
                  >
                    <Clock className="size-4 text-brand-orange" />
                    <span>Giữ nguyên lịch</span>
                    <span className="text-3xs text-muted-foreground font-normal">
                      Theo lịch đã lên
                    </span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setPublishChoice("now")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-lg border p-2.5 text-xs transition-all cursor-pointer text-center",
                    publishChoice === "now"
                      ? "border-brand-orange bg-brand-orange/15 font-semibold text-brand-orange ring-1 ring-brand-orange"
                      : "border-border/80 bg-card hover:border-brand-orange/40 text-foreground",
                  )}
                >
                  <Zap className="size-4 text-amber-500" />
                  <span>Đăng ngay</span>
                  <span className="text-3xs text-muted-foreground font-normal">
                    Xuất bản bài viết lập tức
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPublishChoice("schedule")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-lg border p-2.5 text-xs transition-all cursor-pointer text-center",
                    publishChoice === "schedule"
                      ? "border-brand-orange bg-brand-orange/15 font-semibold text-brand-orange ring-1 ring-brand-orange"
                      : "border-border/80 bg-card hover:border-brand-orange/40 text-foreground",
                  )}
                >
                  <Calendar className="size-4 text-brand-orange" />
                  <span>Hẹn ngày giờ đăng</span>
                  <span className="text-3xs text-muted-foreground font-normal">
                    Chọn thời gian cụ thể
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPublishChoice("later")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-lg border p-2.5 text-xs transition-all cursor-pointer text-center",
                    publishChoice === "later"
                      ? "border-brand-orange bg-brand-orange/15 font-semibold text-brand-orange ring-1 ring-brand-orange"
                      : "border-border/80 bg-card hover:border-brand-orange/40 text-foreground",
                  )}
                >
                  <Clock className="size-4 text-muted-foreground" />
                  <span>Lên lịch sau</span>
                  <span className="text-3xs text-muted-foreground font-normal">
                    Duyệt trước, lên lịch sau
                  </span>
                </button>
              </div>

              {publishChoice === "schedule" && (
                <div className="pt-1 space-y-1.5">
                  <label
                    htmlFor="schedule-datetime-input"
                    className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Thời gian xuất bản:
                  </label>
                  <input
                    id="schedule-datetime-input"
                    type="datetime-local"
                    value={scheduleDateTime}
                    onChange={(e) => setScheduleDateTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-brand-orange"
                  />
                </div>
              )}
            </div>
          )}

          {hasNote && (
            <div className="space-y-2">
              <label htmlFor="task-review-note" className="text-sm font-medium">
                {t(
                  props.action === "reject"
                    ? "tasks.review.rejectReason"
                    : "tasks.review.optionalNote",
                )}
              </label>
              <Textarea
                id="task-review-note"
                ref={noteRef}
                value={state.comment}
                maxLength={MAX_REVIEW_COMMENT}
                required={props.action === "reject"}
                disabled={state.busy}
                aria-invalid={!!state.error}
                aria-describedby={
                  state.error ? "task-review-error" : "task-review-limit"
                }
                onChange={(event) => state.setComment(event.target.value)}
              />
              <p
                id="task-review-limit"
                className="text-muted-foreground text-xs"
              >
                {t("tasks.review.noteLimit", {
                  count: state.comment.length,
                  max: MAX_REVIEW_COMMENT,
                })}
              </p>
            </div>
          )}
          {state.error && (
            <p
              id="task-review-error"
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              className="text-destructive rounded-md border p-3 text-sm"
            >
              {state.error}
            </p>
          )}
          {state.needsReload && (
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                {t("tasks.review.reloadBeforeRetry")}
              </p>
              <Button
                variant="outline"
                loading={state.busy}
                onClick={() => void state.reload()}
              >
                {t("tasks.review.reload")}
              </Button>
            </div>
          )}
          {state.discarding && (
            <div
              role="alert"
              className="bg-muted space-y-3 rounded-xl border p-3"
            >
              <p className="text-sm">{t("tasks.review.discardNote")}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => state.setDiscarding(false)}
                >
                  {t("tasks.inline.keepEditing")}
                </Button>
                <Button variant="destructive" onClick={props.onClose}>
                  {t("tasks.inline.discardChanges")}
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            ref={cancelRef}
            variant="outline"
            disabled={state.busy}
            onClick={state.close}
          >
            {t("tasks.close")}
          </Button>
          <Button
            variant={props.action === "reject" ? "destructive" : "orange"}
            loading={state.busy}
            disabled={!state.canConfirm || state.discarding}
            onClick={() => void handleConfirmAction()}
          >
            {t(`tasks.review.actions.${props.action}`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
