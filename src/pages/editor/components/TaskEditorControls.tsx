import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TaskEditorState } from "@/pages/editor/hooks/useTaskEditorForm";

interface ActionProps {
  task: TaskEditorState;
  isDirty: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  onPreview: () => void;
  onTemplate: () => void;
  onSubmit: () => void;
}

export function TaskEditorActions(props: ActionProps) {
  const { t } = useTranslation();
  const busy = props.isSaving || props.isSubmitting || props.task.isLoading;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span role="status" className="text-muted-foreground text-sm">
        {t(
          props.isSaving
            ? "editor.header.autoSaving"
            : props.isDirty
              ? "editor.header.unsavedDraft"
              : "editor.review.singlePost",
        )}
      </span>
      <Button variant="outline" onClick={props.onPreview}>
        {t("editor.header.previewButton")}
      </Button>
      <Button
        variant="outline"
        disabled={props.task.isReadOnly || busy}
        onClick={props.onTemplate}
      >
        {t("editor.header.templatePickerButton")}
      </Button>
      <Button
        variant="outline"
        loading={props.isSaving}
        disabled={props.task.isReadOnly || busy || !props.isDirty}
        onClick={() => void props.task.save()}
      >
        {t("editor.review.save")}
      </Button>
      <Button
        variant="orange"
        loading={props.isSubmitting}
        disabled={!props.task.canSubmit || busy}
        onClick={props.onSubmit}
      >
        {t("editor.header.submitForApproval")}
      </Button>
    </div>
  );
}

export function TaskEditorNotice({
  task,
  isDirty,
  busy,
  workspaceId,
  taskId,
}: {
  task: TaskEditorState;
  isDirty: boolean;
  busy: boolean;
  workspaceId: string;
  taskId: string;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [confirmAction, setConfirmAction] = useState<"reload" | "back" | null>(
    null,
  );
  const taskUrl = `/workspaces/${workspaceId}/tasks?task=${encodeURIComponent(taskId)}`;
  const code = task.errorCode || task.blockedReason;
  return (
    <>
      <section className="border-border bg-muted/30 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
        <div
          role={task.errorCode ? "alert" : "status"}
          className="min-w-0 space-y-1 text-sm"
        >
          <p className="font-medium">{t("editor.review.singlePost")}</p>
          <p className="text-muted-foreground">
            {task.isLoading
              ? t("editor.review.loading")
              : code
                ? t(`editor.review.errors.${code}`, {
                    defaultValue: t("editor.review.errors.generic"),
                  })
                : t("editor.review.hint")}
          </p>
          {task.errorCode && isDirty && <p>{t("editor.review.draftKept")}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={busy || task.isLoading}
            onClick={() => {
              if (isDirty) setConfirmAction("reload");
              else task.reload();
            }}
          >
            {t("editor.review.reload")}
          </Button>
          <Button variant="outline" disabled={busy} asChild>
            <Link
              to={taskUrl}
              aria-disabled={busy}
              onClick={(event) => {
                if (busy) {
                  event.preventDefault();
                  return;
                }
                if (isDirty) {
                  event.preventDefault();
                  setConfirmAction("back");
                }
              }}
            >
              {t("editor.review.backToTask")}
            </Link>
          </Button>
        </div>
      </section>
      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t(
                confirmAction === "back"
                  ? "editor.review.leaveTitle"
                  : "editor.review.reloadTitle",
              )}
            </DialogTitle>
            <DialogDescription>
              {t(
                confirmAction === "back"
                  ? "editor.review.leaveDescription"
                  : "editor.review.reloadDescription",
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              {t("editor.review.keepEditing")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmAction === "back") navigate(taskUrl);
                else task.reload();
                setConfirmAction(null);
              }}
            >
              {t(
                confirmAction === "back"
                  ? "editor.review.discardLeave"
                  : "editor.review.discardReload",
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
