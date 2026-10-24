import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Hash,
  LockKeyhole,
  MessageSquare,
  Plus,
  Search,
  Archive,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { ChatChannel } from "@/types/chatCollaboration";

interface SidebarProps {
  workspaceName: string;
  channels: ChatChannel[];
  channelId: string;
  loading: boolean;
  error: boolean;
  canCreate: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onSelect: (channelId: string) => void;
  onCreate: (direct: boolean) => void;
}

export function ChatChannelSidebar(props: SidebarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const channels = props.channels.filter((channel) =>
    channel.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  return (
    <nav
      aria-label={t("chat.channels.navigation")}
      className="bg-muted/25 flex h-full min-h-0 flex-col"
    >
      <div className="border-border border-b p-4">
        <div className="flex items-center gap-3">
          <div className="bg-brand-orange-soft text-brand-orange flex size-10 shrink-0 items-center justify-center rounded-xl font-semibold">
            {props.workspaceName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {props.workspaceName}
            </p>
            <p className="text-muted-foreground text-xs">
              {t("chat.channels.workspace")}
            </p>
          </div>
        </div>
        <Input
          aria-label={t("chat.channels.find")}
          placeholder={t("chat.channels.find")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          iconPrefix={<Search />}
          className="bg-background mt-4"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
        {props.loading && (
          <div role="status" className="flex justify-center p-4">
            <Spinner />
          </div>
        )}
        {props.error && (
          <Button variant="outline" className="w-full" onClick={props.onRetry}>
            <RefreshCw className="size-4" />
            {t("chat.actions.retry")}
          </Button>
        )}
        {(["channels", "direct"] as const).map((group) => (
          <section key={group} className="mb-6">
            <div className="mb-2 flex items-center justify-between px-2">
              <h2 className="text-muted-foreground text-xs font-semibold">
                {t(`chat.channels.${group}`)}
              </h2>
              {(group === "direct" || props.canCreate) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  aria-label={t(
                    group === "direct"
                      ? "chat.channels.newDirect"
                      : "chat.channels.create",
                  )}
                  onClick={() => props.onCreate(group === "direct")}
                >
                  <Plus className="size-4" />
                </Button>
              )}
            </div>
            {channels
              .filter(
                (channel) =>
                  (channel.type === "DIRECT") === (group === "direct"),
              )
              .map((channel) => {
                const Icon =
                  channel.type === "DIRECT"
                    ? MessageSquare
                    : channel.type === "PRIVATE"
                      ? LockKeyhole
                      : Hash;
                return (
                  <Button
                    key={channel.id}
                    variant="ghost"
                    aria-current={
                      props.channelId === channel.id ? "page" : undefined
                    }
                    onClick={() => props.onSelect(channel.id)}
                    className={cn(
                      "mb-1 min-h-11 w-full justify-start gap-2 px-3",
                      props.channelId === channel.id &&
                        "bg-brand-orange-soft text-brand-orange-fg hover:bg-brand-orange-soft",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span
                      className={cn(
                        "truncate",
                        channel.unreadCount > 0 && "font-semibold",
                      )}
                    >
                      {channel.id === "general"
                        ? t("chat.channels.general")
                        : channel.name}
                    </span>
                    {channel.archived && (
                      <Archive
                        className="text-muted-foreground ml-auto size-3.5"
                        aria-label={t("chat.channels.archived")}
                      />
                    )}
                    {channel.unreadCount > 0 && (
                      <span className="bg-brand-orange text-primary-foreground ml-auto rounded-md px-1.5 text-xs">
                        {channel.unreadCount > 99 ? "99+" : channel.unreadCount}
                      </span>
                    )}
                  </Button>
                );
              })}
            {!props.loading &&
              group === "direct" &&
              !channels.some((channel) => channel.type === "DIRECT") && (
                <p className="text-muted-foreground px-3 py-2 text-xs leading-5">
                  {t("chat.channels.noDirect")}
                </p>
              )}
          </section>
        ))}
        {props.hasMore && (
          <Button
            variant="ghost"
            className="w-full"
            loading={props.loadingMore}
            onClick={props.onLoadMore}
          >
            {t("chat.channels.loadMore")}
          </Button>
        )}
      </div>
      <p className="border-border text-muted-foreground border-t px-4 py-3 text-xs leading-5">
        {t("chat.channels.privacy")}
      </p>
    </nav>
  );
}
