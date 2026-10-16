import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TaskWorkflowContent } from "@/pages/tasks/components/TaskWorkflowContent";

interface PanelProps {
  workspaceId: string;
  taskId: string;
  isDesktop: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onRestoreFocus: () => void;
}

export function TaskDetailPanel(props: PanelProps) {
  const { t } = useTranslation();
  const content = (
    <TaskWorkflowContent
      workspaceId={props.workspaceId}
      taskId={props.taskId}
      onUpdated={props.onUpdated}
    />
  );
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) props.onClose();
      }}
    >
      <DialogContent
        id="task-detail-panel"
        className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 motion-reduce:animate-none motion-reduce:transition-none sm:max-w-3xl [&>button]:hidden"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          props.onRestoreFocus();
        }}
      >
        <DialogHeader className="shrink-0 flex-row items-center justify-between gap-3 border-b px-5 py-3 text-left">
          <div className="min-w-0">
            <DialogTitle>{t("tasks.details")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("tasks.panel.hint")}
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("tasks.close")}
            onClick={props.onClose}
          >
            <X aria-hidden className="size-4" />
          </Button>
        </DialogHeader>
        <div
          data-task-scroll="detail"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6"
        >
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
