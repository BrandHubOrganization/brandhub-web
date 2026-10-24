import {
  Hash,
  LockKeyhole,
  MessageSquare,
  PanelLeft,
  Search,
  Pin,
  Phone,
  Settings2,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChatNotificationMenu } from "@/pages/chat/components/ChatNotificationMenu";
import type { ChatChannel } from "@/types/chatCollaboration";
import type { ChatConnectionState } from "@/types/chat";

interface HeaderProps {
  onCall: () => void;
  callDisabled: boolean;
  workspaceId: string;
  userId: string;
  channel: ChatChannel;
  connection: ChatConnectionState;
  search: string;
  pinned: boolean;
  onSearch: (value: string) => void;
  onPinned: () => void;
  onMenu: () => void;
  onSettings: () => void;
}

export function ChatChannelHeader(props: HeaderProps) {
  const { t } = useTranslation();
  const Icon =
    props.channel.type === "DIRECT"
      ? MessageSquare
      : props.channel.type === "PRIVATE"
        ? LockKeyhole
        : Hash;
  const name =
    props.channel.id === "general"
      ? t("chat.channels.general")
      : props.channel.name;
  return (
    <header className="border-border bg-card/85 shrink-0 border-b backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 sm:gap-2.5 sm:px-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground size-9 shrink-0 rounded-lg xl:hidden"
          aria-label={t("chat.channels.open")}
          onClick={props.onMenu}
        >
          <PanelLeft className="size-4" />
        </Button>
        <div
          className="bg-brand-orange-soft text-brand-orange ring-brand-orange/15 flex size-8 shrink-0 items-center justify-center rounded-lg ring-1"
          aria-hidden="true"
        >
          <Icon className="size-4 shrink-0" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground truncate text-sm font-semibold tracking-tight sm:text-base">
            {name}
          </h1>
          <p className="text-muted-foreground truncate text-xs">
            {props.channel.description ||
              t(`chat.channels.type.${props.channel.type}`)}
          </p>
        </div>
        <span
          role="status"
          className="border-border/80 bg-muted/40 text-muted-foreground inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium"
        >
          <span
            aria-hidden="true"
            className={cn(
              "size-2 shrink-0 rounded-full",
              props.connection === "CONNECTED"
                ? "bg-emerald-500"
                : props.connection === "DISCONNECTED"
                  ? "bg-rose-500"
                  : " animate-pulse bg-amber-500",
            )}
          />
          <span className="truncate">
            {t(`chat.connection.${props.connection.toLowerCase()}`)}
          </span>
        </span>
        <div className="order-last flex w-full items-center gap-1.5 md:order-none md:w-44 lg:w-60 xl:w-64">
          <Input
            type="search"
            aria-label={t("chat.search.label")}
            placeholder={t("chat.search.placeholder")}
            maxLength={200}
            value={props.search}
            onChange={(event) => props.onSearch(event.target.value)}
            iconPrefix={<Search />}
            className="bg-muted/35 h-9 text-xs sm:text-sm"
          />
          {props.search && (
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-lg"
              aria-label={t("chat.search.clear")}
              onClick={() => props.onSearch("")}
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {props.channel.type === "DIRECT" && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground size-9 rounded-lg"
              aria-label={t("chat.calls.start")}
              title={t("chat.calls.start")}
              disabled={
                props.callDisabled ||
                props.channel.archived ||
                !props.channel.canPost
              }
              onClick={props.onCall}
            >
              <Phone className="size-4" aria-hidden="true" />
            </Button>
          )}
          <ChatNotificationMenu
            key={`${props.userId}:${props.workspaceId}:${props.channel.id}`}
            userId={props.userId}
            workspaceId={props.workspaceId}
            channelId={props.channel.id}
          />
          <Button
            variant={props.pinned ? "secondary" : "ghost"}
            size="icon"
            className={cn(
              "size-9 rounded-lg transition-colors",
              props.pinned
                ? "bg-brand-orange-soft text-brand-orange ring-brand-orange/20 hover:bg-brand-orange-soft/80 hover:text-brand-orange ring-1"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={props.pinned}
            aria-label={t("chat.actions.pins")}
            title={t("chat.actions.pins")}
            onClick={props.onPinned}
          >
            <Pin className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-9 rounded-lg"
            aria-label={t("chat.channels.details")}
            title={t("chat.channels.details")}
            onClick={props.onSettings}
          >
            <Settings2 className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
