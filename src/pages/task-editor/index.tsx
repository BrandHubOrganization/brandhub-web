import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";
import { taskWorkflowService } from "@/pages/tasks/services/taskWorkflowService";
import { opensPostEditor } from "@/types/task";

export default function TaskEditorPage() {
  const { id = "", taskId = "" } = useParams<{ id: string; taskId: string }>();
  const { t } = useTranslation();
  const {
    data: task,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["task-workflow", id, taskId],
    queryFn: () => taskWorkflowService.read(id, taskId),
    enabled: Boolean(id && taskId),
  });

  if (isLoading) {
    return (
      <div className="bg-background text-muted-foreground flex min-h-screen items-center justify-center p-8 text-sm">
        <Spinner className="text-brand-orange mr-2 size-6" />
        <span>{t("tasks.loading")}</span>
      </div>
    );
  }
  if (isError || !task)
    return <Navigate to={`/workspaces/${id}/tasks`} replace />;

  if (opensPostEditor(task.type))
    return (
      <Navigate to={`/workspaces/${id}/editor?taskId=${taskId}`} replace />
    );
  if (task.type === "SURVEY")
    return <Navigate to={`/workspaces/${id}/tasks/${taskId}/survey`} replace />;
  if (task.type === "EVENT_PLAN")
    return <Navigate to={`/workspaces/${id}/tasks/${taskId}/event`} replace />;
  if (task.type === "PRESS_RECOMMENDATION")
    return <Navigate to={`/workspaces/${id}/tasks/${taskId}/press`} replace />;
  if (task.type === "KOL_BOOKING")
    return <Navigate to={`/workspaces/${id}/tasks/${taskId}/kol`} replace />;
  if (task.type === "WORKSHOP")
    return (
      <Navigate to={`/workspaces/${id}/tasks/${taskId}/workshop`} replace />
    );
  if (task.type === "EMAIL_NEWSLETTER")
    return (
      <Navigate to={`/workspaces/${id}/tasks/${taskId}/newsletter`} replace />
    );

  return <Navigate to={`/workspaces/${id}/tasks/${taskId}/detail`} replace />;
}
