import { useState } from "react";
import type React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import type { TaskListItem, TaskStatus } from "@/types/task";
import { taskService } from "@/services/taskService";

export interface UseBoardDragAndDropParams {
  localTasks: TaskListItem[];
  setLocalTasks: React.Dispatch<React.SetStateAction<TaskListItem[]>>;
  workspaceId?: string;
  onStatusChange?: (
    taskId: string,
    newStatus: TaskStatus,
  ) => Promise<void> | void;
}

export function useBoardDragAndDrop({
  localTasks,
  setLocalTasks,
  workspaceId,
  onStatusChange,
}: UseBoardDragAndDropParams) {
  const { t } = useTranslation();
  const currentMemberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const userId = useAuthStore((s) => s.user?.id);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
    task: TaskListItem,
  ) => {
    if (currentMemberRole === "CREATOR" && task.assigneeId !== userId) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedTaskId(task.id);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLElement>,
    status: TaskStatus,
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStatus !== status) setDragOverStatus(status);
  };

  const handleDragLeave = (
    e: React.DragEvent<HTMLElement>,
    status: TaskStatus,
  ) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (dragOverStatus === status) setDragOverStatus(null);
    }
  };

  const persistStatusChange = async (
    taskId: string,
    targetStatus: TaskStatus,
  ) => {
    if (onStatusChange) {
      await onStatusChange(taskId, targetStatus);
    } else if (workspaceId) {
      await taskService.updateTaskStatus(workspaceId, taskId, targetStatus);
    }
  };

  const canUpdateTask = (task: TaskListItem) => {
    if (currentMemberRole === "CREATOR" && task.assigneeId !== userId) {
      toast.error(
        t("tasks.creatorOnlyOwnTasks", {
          defaultValue: "Bạn chỉ có thể cập nhật công việc được phân công cho mình",
        }),
      );
      return false;
    }
    return true;
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLElement>,
    targetStatus: TaskStatus,
  ) => {
    e.preventDefault();
    const taskId = draggedTaskId;
    setDragOverStatus(null);
    setDraggedTaskId(null);
    if (!taskId) return;

    const task = localTasks.find((item) => item.id === taskId);
    if (!task || task.status === targetStatus || !canUpdateTask(task)) return;

    const prevTasks = [...localTasks];
    setLocalTasks((current) =>
      current.map((item) =>
        item.id === taskId ? { ...item, status: targetStatus } : item,
      ),
    );

    try {
      await persistStatusChange(taskId, targetStatus);
      toast.success(
        t("tasks.statusUpdated", {
          defaultValue: "Đã cập nhật trạng thái công việc",
        }),
      );
    } catch {
      setLocalTasks(prevTasks);
      toast.error(
        t("tasks.statusUpdateFailed", {
          defaultValue: "Không thể cập nhật trạng thái",
        }),
      );
    }
  };

  return {
    draggedTaskId,
    dragOverStatus,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
