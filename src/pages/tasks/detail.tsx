import { Navigate, useParams } from "react-router-dom";

/** Preserve existing links while opening details inside the Task list. */
export default function TaskDetailPage() {
  const { id = "", taskId = "" } = useParams<{ id: string; taskId: string }>();
  return (
    <Navigate
      replace
      to={`/workspaces/${encodeURIComponent(id)}/tasks?task=${encodeURIComponent(taskId)}`}
    />
  );
}
