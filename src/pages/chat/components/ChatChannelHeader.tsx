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
    <header className="border-border bg-card shrink-0 border-b">
      <div className="flex min-h-18 items-center gap-2 px-3 sm:gap-3 sm:px-5">
        <Button
          variant="ghost"
          size="icon"
          className="size-11 xl:hidden"
          aria-label={t("chat.channels.open")}
          onClick={props.onMenu}
        >
          <PanelLeft className="size-5" />
        </Button>
        <Icon
          className="text-muted-foreground hidden size-5 shrink-0 sm:block"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold">{name}</h1>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            {props.channel.description ||
              t(`chat.channels.type.${props.channel.type}`)}
          </p>
        </div>
        <span
          role="status"
          className="text-muted-foreground hidden items-center gap-1.5 text-xs lg:flex"
        >
          <span
            className={cn(
              "size-2 rounded-full",
              props.connection === "CONNECTED" ? "bg-success" : "bg-warning",
            )}
          />
          {t(`chat.connection.${props.connection.toLowerCase()}`)}
        </span>
        {props.channel.type === "DIRECT" && (
          <Button
            variant="ghost"
            size="icon"
            className="size-11"
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
          className="size-11"
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
          className="size-11"
          aria-label={t("chat.channels.details")}
          title={t("chat.channels.details")}
          onClick={props.onSettings}
        >
          <Settings2 className="size-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2 px-3 pb-3 sm:px-5">
        <Input
          type="search"
          aria-label={t("chat.search.label")}
          placeholder={t("chat.search.placeholder")}
          maxLength={200}
          value={props.search}
          onChange={(event) => props.onSearch(event.target.value)}
          iconPrefix={<Search />}
          className="bg-muted/30"
        />
        {props.search && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("chat.search.clear")}
            onClick={() => props.onSearch("")}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </header>
  );
}
