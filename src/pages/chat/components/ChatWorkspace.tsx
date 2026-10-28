import { useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { PanelLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useChatChannels } from "@/pages/chat/hooks/useChatChannels";
import { useChatWideLayout } from "@/pages/chat/hooks/useChatWideLayout";
import { useChatThreadWidth } from "@/pages/chat/hooks/useChatThreadWidth";
import { ChatResizableThread } from "@/pages/chat/components/ChatResizableThread";
import { ChatThreadWidthMenu } from "@/pages/chat/components/ChatThreadWidthMenu";
import { ChatChannelSidebar } from "@/pages/chat/components/ChatChannelSidebar";
import { ChatChannelForm } from "@/pages/chat/components/ChatChannelForm";
import { ChatChannelDetails } from "@/pages/chat/components/ChatChannelDetails";
import { ChatConversation } from "@/pages/chat/components/ChatConversation";
import { ChatThreadPanel } from "@/pages/chat/components/ChatThreadPanel";
import { ChatCallBar } from "@/pages/chat/components/ChatCallBar";
import { ChatScheduledPanel } from "@/pages/chat/components/ChatScheduledPanel";
import { useChatCall } from "@/pages/chat/hooks/useChatCall";
import type { ChatContextType } from "@/types/chat";
import type { ChatChannel } from "@/types/chatCollaboration";

interface WorkspaceProps {
  workspaceId: string;
  workspaceName: string;
  userId: string;
}
type Panel =
  | { kind: "create"; direct: boolean }
  | { kind: "details" }
  | { kind: "thread"; rootId: string }
  | { kind: "scheduled" }
  | null;

export function ChatWorkspace(props: WorkspaceProps) {
  const { t } = useTranslation();
  const calls = useChatCall(props.workspaceId, props.userId);
  const [params, setParams] = useSearchParams();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<HTMLElement>(null);
  const chatNavigationRef = useRef<HTMLElement>(null);
  const threadWidth = useChatThreadWidth(conversationRef, chatNavigationRef);
  const navigationOpener = useRef<HTMLElement | null>(null);
  const panelOpener = useRef<HTMLElement | null>(null);
  const rememberFocus = () =>
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  const openPanel = (next: Panel) => {
    panelOpener.current = rememberFocus();
    setPanel(next);
  };
  const openNavigation = () => {
    navigationOpener.current = rememberFocus();
    setNavigationOpen(true);
  };
  const restoreFocus = (event: Event, opener: HTMLElement | null) => {
    event.preventDefault();
    const visible = (element: HTMLElement) =>
      element.isConnected &&
      element.getClientRects().length > 0 &&
      !element.closest('[aria-hidden="true"], [inert]');
    const fallback = Array.from(
      workspaceRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [],
    ).find(visible);
    (opener && visible(opener) ? opener : fallback)?.focus();
  };
  const wide = useChatWideLayout();
  const role = useWorkspaceStore((state) => state.currentMemberRole);
  const channelId = params.get("channel") || "general";
  const chat = useChatChannels(props.workspaceId, channelId);
  const status = isAxiosError(chat.selected.error)
    ? chat.selected.error.response?.status
    : undefined;
  const denied = status === 401 || status === 403 || status === 404;
  const channel = denied ? undefined : chat.selected.data;
  const selectedType = params.get("contextType");
  const contextType: ChatContextType =
    selectedType === "MEDIA_PACKAGE" || selectedType === "MEDIA_CAMPAIGN"
      ? selectedType
      : "GENERAL";
  const contextId = contextType === "GENERAL" ? null : params.get("contextId");
  const contextValid =
    (!selectedType ||
      ["GENERAL", "MEDIA_PACKAGE", "MEDIA_CAMPAIGN"].includes(selectedType)) &&
    (contextType === "GENERAL" || Boolean(contextId));
  const selectChannel = (id: string) => {
    setParams({ channel: id });
    setPanel(null);
    setNavigationOpen(false);
  };
  const created = (createdChannel: ChatChannel) =>
    selectChannel(createdChannel.id);
  const canCreate = role === "MANAGER" || role === "CREATOR";
  const sidebar = (
    <ChatChannelSidebar
      workspaceName={props.workspaceName}
      channels={chat.list}
      channelId={channelId}
      loading={chat.channels.isPending}
      error={chat.channels.isError}
      canCreate={canCreate}
      hasMore={chat.channels.hasNextPage}
      loadingMore={chat.channels.isFetchingNextPage}
      onLoadMore={() => void chat.channels.fetchNextPage()}
      onRetry={() => void chat.channels.refetch()}
      onSelect={selectChannel}
      onCreate={(direct) => {
        setNavigationOpen(false);
        openPanel({ kind: "create", direct });
      }}
      onScheduled={() => {
        setNavigationOpen(false);
        openPanel({ kind: "scheduled" });
      }}
    />
  );
  const mentionPeople = channel
    ? chat.people.filter(
        (person) =>
          channel.id === "general" ||
          channel.memberUserIds.includes(person.userId) ||
          (channel.type === "PUBLIC" && person.role !== "CLIENT"),
      )
    : [];
  let panelContent: ReactNode = null;
  if (panel?.kind === "scheduled")
    panelContent = (
      <ChatScheduledPanel
        key={props.workspaceId}
        workspaceId={props.workspaceId}
        channels={chat.list}
        onClose={() => setPanel(null)}
        onNavigate={(id, root) => {
          setParams(root ? { channel: id, message: root } : { channel: id });
          setPanel(root ? { kind: "thread", rootId: root } : null);
        }}
      />
    );
  if (panel?.kind === "create")
    panelContent = (
      <ChatChannelForm
        key={String(panel.direct)}
        direct={panel.direct}
        userId={props.userId}
        people={chat.people}
        loading={chat.directory.isPending}
        directoryError={chat.directory.isError}
        hasMore={chat.directory.hasNextPage}
        loadingMore={chat.directory.isFetchingNextPage}
        onLoadMore={() => void chat.directory.fetchNextPage()}
        onRetryDirectory={() => void chat.directory.refetch()}
        onCreate={chat.create.mutateAsync}
        onCreated={created}
        onClose={() => setPanel(null)}
      />
    );
  if (panel?.kind === "details" && channel)
    panelContent = (
      <ChatChannelDetails
        key={channel.id}
        channel={channel}
        userId={props.userId}
        people={chat.people}
        hasMorePeople={chat.directory.hasNextPage}
        directoryError={chat.directory.isError}
        onRetryDirectory={() => void chat.directory.refetch()}
        onLoadMorePeople={() => void chat.directory.fetchNextPage()}
        onUpdate={chat.update.mutateAsync}
        onMember={(userId, add) => chat.member.mutateAsync({ userId, add })}
        onClose={() => setPanel(null)}
      />
    );
  if (panel?.kind === "thread" && channel)
    panelContent = (
      <ChatThreadPanel
        key={`${channel.id}:${panel.rootId}`}
        workspaceId={props.workspaceId}
        channel={
          chat.selected.isError ? { ...channel, canPost: false } : channel
        }
        rootId={panel.rootId}
        widthControl={
          wide ? <ChatThreadWidthMenu sizing={threadWidth} /> : undefined
        }
        people={mentionPeople}
        onClose={() => setPanel(null)}
      />
    );
  return (
    <div ref={workspaceRef} className="flex h-full min-h-0 flex-col p-0 sm:p-3">
      {calls.current.isError && (
        <div
          role="status"
          className="border-border/80 bg-muted/40 text-muted-foreground flex items-center gap-3 border-b px-3 py-2 text-xs sm:mb-2 sm:rounded-xl sm:border"
        >
          <span className="flex-1 truncate">{t("chat.calls.unavailable")}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 rounded-lg px-2.5 text-xs"
            onClick={() => void calls.current.refetch()}
          >
            {t("chat.actions.retry")}
          </Button>
        </div>
      )}
      <ChatCallBar
        calls={calls}
        userId={props.userId}
        name={
          chat.list.find((entry) => entry.id === calls.call?.channelId)?.name ??
          ""
        }
      />
      <section
        ref={conversationRef}
        aria-label={t("chat.title")}
        className="border-border/80 bg-card flex min-h-0 flex-1 overflow-hidden shadow-2xs sm:rounded-2xl sm:border"
      >
        <aside
          ref={chatNavigationRef}
          className="border-border/80 hidden w-64 shrink-0 border-r xl:block"
        >
          {sidebar}
        </aside>
        {channel ? (
          <ChatConversation
            onCall={() => calls.start.mutate(channel.id)}
            callDisabled={
              Boolean(calls.call) ||
              calls.start.isPending ||
              calls.current.isError ||
              calls.current.isPending
            }
            unavailable={chat.selected.isError}
            onRetryChannel={() => void chat.selected.refetch()}
            key={channel.id}
            workspaceId={props.workspaceId}
            userId={props.userId}
            channel={
              chat.selected.isError ? { ...channel, canPost: false } : channel
            }
            people={mentionPeople}
            contextType={contextType}
            contextId={contextId}
            contextValid={contextValid}
            onClearContext={() => setParams({ channel: channelId })}
            onMenu={openNavigation}
            onSettings={() => openPanel({ kind: "details" })}
            onThread={(rootId) => openPanel({ kind: "thread", rootId })}
            onScheduled={() => openPanel({ kind: "scheduled" })}
          />
        ) : (
          <div className="bg-card flex min-w-0 flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <Button
              variant="outline"
              className="rounded-lg xl:hidden"
              onClick={openNavigation}
            >
              <PanelLeft className="size-4" />
              {t("chat.channels.open")}
            </Button>
            {chat.selected.isPending ? (
              <Spinner />
            ) : (
              <div className="border-border/70 bg-muted/20 flex max-w-sm flex-col items-center gap-3 rounded-2xl border p-6">
                <p className="text-foreground text-sm font-medium">
                  {t("chat.errors.channelUnavailable")}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => void chat.selected.refetch()}
                  >
                    <RefreshCw className="size-3.5" />
                    {t("chat.actions.retry")}
                  </Button>
                  {channelId !== "general" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => selectChannel("general")}
                    >
                      {t("chat.channels.backGeneral")}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {wide &&
          panelContent &&
          (panel?.kind === "thread" ? (
            <ChatResizableThread sizing={threadWidth}>
              {panelContent}
            </ChatResizableThread>
          ) : (
            <aside className="border-border/80 w-80 shrink-0 border-l">
              {panelContent}
            </aside>
          ))}
      </section>
      <Sheet open={navigationOpen && !wide} onOpenChange={setNavigationOpen}>
        <SheetContent
          side="left"
          className="w-[min(20rem,90vw)] gap-0 p-0"
          onCloseAutoFocus={(event) => {
            if (panel) event.preventDefault();
            else restoreFocus(event, navigationOpener.current);
          }}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{t("chat.channels.navigation")}</SheetTitle>
          </SheetHeader>
          {sidebar}
        </SheetContent>
      </Sheet>
      <Sheet
        open={Boolean(panelContent) && !wide}
        onOpenChange={(open) => {
          if (!open) setPanel(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full max-w-full gap-0 p-0 sm:max-w-lg [&>button:last-child]:hidden"
          onCloseAutoFocus={(event) => restoreFocus(event, panelOpener.current)}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{t("chat.channels.panel")}</SheetTitle>
          </SheetHeader>
          {panelContent}
        </SheetContent>
      </Sheet>
    </div>
  );
}
