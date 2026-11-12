import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { taskCatalogService } from "@/services/taskCatalogService";
import type { TaskType } from "@/types/task";

/**
 * Catalogue roles for a task type (T8.7 "suggest from catalog"), with i18n-aware labels.
 * Shared by JiraInlineSubtaskCreator, TimelineSubtaskCreator, and the subtask-list role badges —
 * React Query dedupes the request across callers sharing the same `taskType`.
 */
export function useTaskCatalogRoles(taskType: TaskType | undefined) {
  const { t } = useTranslation();
  const catalog = useQuery({
    queryKey: ["task-catalog", taskType],
    queryFn: () => taskCatalogService.get(taskType as TaskType),
    enabled: Boolean(taskType),
    staleTime: Infinity,
  });
  const roles = catalog.data?.roles ?? [];

  const roleLabel = (role?: string | null) => {
    if (!role) return null;
    const fallback = roles.find((r) => r.role === role)?.name ?? role;
    return t(`tasks.subtaskRoles.${role}`, { defaultValue: fallback });
  };

  return { roles, roleLabel };
}
