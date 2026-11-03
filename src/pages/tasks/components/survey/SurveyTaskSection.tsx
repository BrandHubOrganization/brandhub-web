import { SurveyOverviewCard } from "./SurveyOverviewCard";

interface SurveyTaskSectionProps {
  workspaceId: string;
  taskId: string;
  taskTitle: string;
  onUpdated?: () => void;
}

export function SurveyTaskSection({
  workspaceId,
  taskId,
  taskTitle,
}: SurveyTaskSectionProps) {
  return (
    <div className="space-y-4">
      <SurveyOverviewCard
        workspaceId={workspaceId}
        taskId={taskId}
        taskTitle={taskTitle}
      />
    </div>
  );
}
