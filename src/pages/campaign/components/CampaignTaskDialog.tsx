import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TaskWorkflowProvider,
  useTaskEditContext,
} from "@/pages/tasks/components/TaskWorkflowProvider";
import { TaskWorkflowContent } from "@/pages/tasks/components/TaskWorkflowContent";
function GuardedTaskDialog({
  workspaceId,
  taskId,
  onClose,
  onUpdated,
}: {
  workspaceId: string;
  taskId: string;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { t } = useTranslation();
  const { canLeave } = useTaskEditContext();
  async function close() {
    if (await canLeave()) {
      onUpdated();
      onClose();
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) void close();
      }}
    >
      <DialogContent
        className="ct-task-dialog motion-reduce:animate-none"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          void close();
        }}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-border shrink-0 border-b px-5 py-3 pr-12">
          <DialogTitle>{t("tasks.details")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("campaign.timeline.taskDialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="ct-task-dialog-body">
          <TaskWorkflowContent
            workspaceId={workspaceId}
            taskId={taskId}
            onUpdated={onUpdated}
            onClose={() => void close()}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
export function CampaignTaskDialog(props: {
  workspaceId: string;
  taskId: string | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  if (!props.taskId) return null;
  return (
    <TaskWorkflowProvider key={props.taskId} onUpdated={props.onUpdated}>
      <GuardedTaskDialog {...props} taskId={props.taskId} />
    </TaskWorkflowProvider>
  );
}
