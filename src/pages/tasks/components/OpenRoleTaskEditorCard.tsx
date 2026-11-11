import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { taskSectionService } from "@/services/taskSectionService";
import type { TaskType } from "@/types/task";

const EDITOR_PATH: Partial<Record<TaskType, string>> = {
  EVENT_PLAN: "event",
  PRESS_RECOMMENDATION: "press",
  KOL_BOOKING: "kol",
  WORKSHOP: "workshop",
  EMAIL_NEWSLETTER: "newsletter",
};

/** "Open editor" + section-approval progress for role-subtask task types without a dedicated hub card yet (T8.8). */
export function OpenRoleTaskEditorCard({
  workspaceId,
  taskId,
  taskType,
}: {
  workspaceId: string;
  taskId: string;
  taskType: TaskType;
}) {
  const { t } = useTranslation();
  const slug = EDITOR_PATH[taskType];
  const query = useQuery({
    queryKey: ["task-sections", workspaceId, taskId],
    queryFn: () => taskSectionService.list(workspaceId, taskId),
    enabled: Boolean(workspaceId && taskId && slug),
    refetchOnWindowFocus: false,
    retry: false,
  });
  if (!slug) return null;
  const sections = query.data ?? [];
  const done = sections.filter((section) => section.finalState).length;

  return (
    <div className="border-brand-orange/30 from-brand-orange/10 via-card to-card flex items-center justify-between gap-3 rounded-xl border bg-gradient-to-br p-4 shadow-xs">
      <div className="min-w-0 space-y-0.5">
        <h3 className="text-foreground text-sm font-semibold">
          {t(`tasks.types.${taskType}`, { defaultValue: taskType })}
        </h3>
        {sections.length > 0 && (
          <p className="text-muted-foreground text-xs">
            {t("tasks.sectionReview.progress", {
              done,
              total: sections.length,
            })}
          </p>
        )}
      </div>
      <Button variant="orange" size="sm" className="shrink-0 gap-2" asChild>
        <Link to={`/workspaces/${workspaceId}/tasks/${taskId}/${slug}`}>
          <PenSquare className="size-4" />
          {t("tasks.openEditor")}
        </Link>
      </Button>
    </div>
  );
}
