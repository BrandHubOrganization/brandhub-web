import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PenSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TaskWorkflowError } from "@/pages/tasks/components/TaskWorkflowError";
import { workflowError } from "@/pages/tasks/utils/taskWorkflowErrors";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";

export function TaskStartAction({
  task,
  start,
}: {
  task?: TaskWorkflow;
  start: () => Promise<TaskWorkflow>;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setPending(true);
    setError("");
    try {
      await start();
      toast.success(t("tasks.workflow.started"));
      if (task?.type === "POST") {
        navigate(`/workspaces/${task.workspaceId}/editor?taskId=${task.id}`);
      }
    } catch (failure) {
      setError(workflowError(failure, t));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="bg-card space-y-3 rounded-xl border p-5">
      <p className="text-sm">{t("tasks.workflow.startHint")}</p>
      <TaskWorkflowError message={error} />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="orange" loading={pending} onClick={() => void submit()}>
          {task?.type === "POST" ? (
            <>
              <PenSquare className="mr-1.5 size-4" />
              Bắt đầu &amp; Soạn bài viết
            </>
          ) : (
            t("tasks.workflow.start")
          )}
        </Button>
      </div>
    </section>
  );
}
