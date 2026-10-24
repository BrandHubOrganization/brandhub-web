import { Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { ChatWorkspace } from "@/pages/chat/components/ChatWorkspace";

export function WorkspaceChatPage() {
  const { t } = useTranslation();
  const { id: workspaceId } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const workspace = useWorkspaceStore((state) => state.currentWorkspace);
  const workspaces = useWorkspaceStore((state) => state.workspaceList);
  if (!workspaceId || !user) return <Navigate to="/workspace" replace />;
  const name =
    (workspace?.id === workspaceId
      ? workspace.name
      : workspaces.find((entry) => entry.id === workspaceId)?.name) ||
    t("chat.title");
  return (
    <ChatWorkspace
      key={`${user.id}:${workspaceId}`}
      workspaceId={workspaceId}
      workspaceName={name}
      userId={user.id}
    />
  );
}

export default WorkspaceChatPage;
