import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TaskWorkflowError } from "@/pages/tasks/components/TaskWorkflowError";
import { workflowError } from "@/pages/tasks/taskWorkflowErrors";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";

export function TaskStartAction({
  start,
}: {
  start: () => Promise<TaskWorkflow>;
}) {
  const { t } = useTranslation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit() {
    setPending(true);
    setError("");
    try {
      await start();
      toast.success(t("tasks.workflow.started"));
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
      <Button variant="orange" loading={pending} onClick={() => void submit()}>
        {t("tasks.workflow.start")}
      </Button>
    </section>
  );
}
