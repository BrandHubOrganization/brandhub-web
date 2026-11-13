import { Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { PageWrapper } from "@/components/layout/PageWrapper";
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
    <PageWrapper
      title={t("chat.title", "Thảo luận nhóm")}
      description={t(
        "chat.description",
        "Trao đổi và phối hợp công việc theo kênh trong không gian làm việc.",
      )}
      compact
      className="flex h-full min-h-0 flex-col overflow-hidden p-2 pb-2 md:px-4 md:py-2.5 md:pb-2.5"
      contentClassName="min-h-0 flex-1 overflow-hidden"
    >
      <ChatWorkspace
        key={`${user.id}:${workspaceId}`}
        workspaceId={workspaceId}
        workspaceName={name}
        userId={user.id}
      />
    </PageWrapper>
  );
}

export default WorkspaceChatPage;
