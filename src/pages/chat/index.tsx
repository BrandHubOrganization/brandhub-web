import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useParams, useSearchParams } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type { ChatContextType } from "@/types/chat";
import { ChatComposer } from "./components/ChatComposer";
import { ChatHeader } from "./components/ChatHeader";
import { ChatMessageList } from "./components/ChatMessageList";
import { useWorkspaceChat } from "./hooks/useWorkspaceChat";

const CONTEXT_TYPES = new Set<ChatContextType>([
  "GENERAL",
  "MEDIA_PACKAGE",
  "MEDIA_CAMPAIGN",
]);

export function WorkspaceChatPage() {
  const { t } = useTranslation();
  const { id: workspaceId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const workspaces = useWorkspaceStore((state) => state.workspaceList);
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const chat = useWorkspaceChat(workspaceId ?? "");

  const workspaceName =
    currentWorkspace && currentWorkspace.id === workspaceId
      ? currentWorkspace.name
      : workspaces.find((workspace) => workspace.id === workspaceId)?.name ||
        t("chat.title");
  const context = useMemo(() => {
    const requested = searchParams.get("contextType") as ChatContextType | null;
    const type = requested && CONTEXT_TYPES.has(requested) ? requested : "GENERAL";
    return {
      type,
      id: type === "GENERAL" ? null : searchParams.get("contextId"),
    };
  }, [searchParams]);

  if (!workspaceId || !user) return <Navigate to="/workspace" replace />;

  return (
    <div className="w-full p-4 md:p-6">
      <section className="border-border bg-muted/20 mx-auto flex h-[calc(100dvh-9.5rem)] min-h-[520px] max-w-5xl flex-col overflow-hidden rounded-xl border shadow-sm md:h-[calc(100dvh-6.5rem)]">
        <ChatHeader
          workspaceName={workspaceName}
          connectionState={chat.connectionState}
        />
        <ChatMessageList
          messages={chat.messages}
          currentUserId={user.id}
          hasMore={chat.hasMore}
          loading={chat.loadingHistory}
          onLoadOlder={() => void chat.loadOlder()}
        />
        <ChatComposer
          connected={chat.connectionState === "CONNECTED"}
          contextType={context.type}
          contextId={context.id}
          onSend={chat.sendMessage}
        />
      </section>
    </div>
  );
}

export default WorkspaceChatPage;

