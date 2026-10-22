import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PenSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TaskWorkflowError } from "@/pages/tasks/components/TaskWorkflowError";
import { workflowError } from "@/pages/tasks/taskWorkflowErrors";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";

export function TaskStartAction({
  task,
  start,
  presentation = "detail",
}: {
  task?: Pick<TaskWorkflow, "id" | "workspaceId" | "type">;
  start: () => Promise<TaskWorkflow>;
  presentation?: "row" | "detail";
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);

  async function submit() {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError("");
    try {
      const started = await start();
      toast.success(t("tasks.workflow.started"));
      if (started.type === "POST") {
        navigate(
          `/workspaces/${started.workspaceId}/editor?taskId=${started.id}`,
        );
      }
    } catch (failure) {
      setError(workflowError(failure, t));
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  const controls = (
    <>
      <TaskWorkflowError message={error} />
      <Button
        type="button"
        variant="orange"
        size={presentation === "row" ? "sm" : "default"}
        className={
          presentation === "row" ? "h-7 px-3 text-xs font-medium" : undefined
        }
        loading={pending}
        aria-busy={pending}
        onClick={() => void submit()}
      >
        {task?.type === "POST" ? (
          <>
            <PenSquare className="mr-1.5 size-4" />
            {t("tasks.workflow.writePost")}
          </>
        ) : (
          t("tasks.workflow.start")
        )}
      </Button>
    </>
  );
  if (presentation === "row")
    return <div className="max-w-64 space-y-2">{controls}</div>;
  return (
    <section className="bg-card space-y-3 rounded-xl border p-5">
      <p className="text-sm">{t("tasks.workflow.startHint")}</p>
      <div className="flex flex-wrap items-center gap-3">{controls}</div>
    </section>
  );
}
