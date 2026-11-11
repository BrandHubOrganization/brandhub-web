import { TaskTimelineView } from "@/pages/tasks/components/timeline/TaskTimelineView";
import type { TaskGanttViewProps } from "./types/types";

export type { TaskGanttViewProps };

export function TaskGanttView({
  tasks,
  onTaskClick,
  workspaceId,
  onUpdated,
}: TaskGanttViewProps) {
  return (
    <div className="w-full max-w-full min-w-0 overflow-x-hidden">
      <TaskTimelineView
        tasks={tasks}
        onTaskClick={onTaskClick}
        workspaceId={workspaceId}
        onUpdated={onUpdated}
      />
    </div>
  );
}
