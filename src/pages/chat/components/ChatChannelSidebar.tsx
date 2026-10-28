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
  Clock3,
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
  onScheduled: () => void;
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
      className="bg-muted/20 flex h-full min-h-0 flex-col"
    >
      <div className="border-border/80 bg-card/50 border-b p-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-brand-orange-soft text-brand-orange ring-brand-orange/20 flex size-8.5 shrink-0 items-center justify-center rounded-lg font-semibold shadow-2xs ring-1">
            {props.workspaceName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-semibold tracking-tight">
              {props.workspaceName}
            </p>
            <p className="text-muted-foreground truncate text-xs font-medium">
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
          wrapperClassName="mt-2"
          className="bg-background/90 h-8 text-xs shadow-2xs"
        />
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-2 py-3">
        <Button
          variant="ghost"
          className="min-h-8.5 w-full justify-start gap-2 px-2.5 py-1.5 text-xs"
          onClick={props.onScheduled}
        >
          <Clock3 className="size-3.5" aria-hidden="true" />
          {t("chat.schedule.title")}
        </Button>
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
          <section key={group} className="space-y-1">
            <div className="mb-1.5 flex items-center justify-between px-2">
              <h2 className="text-muted-foreground/85 text-[11px] font-semibold tracking-wider uppercase">
                {t(`chat.channels.${group}`)}
              </h2>
              {(group === "direct" || props.canCreate) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:bg-muted/70 hover:text-foreground size-7 rounded-lg"
                  aria-label={t(
                    group === "direct"
                      ? "chat.channels.newDirect"
                      : "chat.channels.create",
                  )}
                  onClick={() => props.onCreate(group === "direct")}
                >
                  <Plus className="size-3.5" />
                </Button>
              )}
            </div>
            {channels
              .filter(
                (channel) =>
                  (channel.type === "DIRECT") === (group === "direct"),
              )
              .map((channel) => {
                const isSelected = props.channelId === channel.id;
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
                    aria-current={isSelected ? "page" : undefined}
                    onClick={() => props.onSelect(channel.id)}
                    className={cn(
                      "relative mb-0.5 min-h-8 w-full justify-start gap-2 rounded-lg px-2.5 py-1 text-xs transition-colors",
                      isSelected
                        ? "bg-brand-orange-soft text-brand-orange hover:bg-brand-orange-soft hover:text-brand-orange ring-brand-orange/20 font-semibold shadow-2xs ring-1"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      !isSelected &&
                        channel.unreadCount > 0 &&
                        "text-foreground font-semibold",
                    )}
                  >
                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="bg-brand-orange absolute inset-y-1.5 left-0 w-1 rounded-r-full"
                      />
                    )}
                    <Icon
                      className={cn(
                        "size-3.5 shrink-0 transition-colors",
                        isSelected
                          ? "text-brand-orange"
                          : "text-muted-foreground",
                      )}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        "truncate",
                        (isSelected || channel.unreadCount > 0) &&
                          "font-semibold",
                      )}
                    >
                      {channel.id === "general"
                        ? t("chat.channels.general")
                        : channel.name}
                    </span>
                    {channel.archived && (
                      <Archive
                        className="text-muted-foreground ml-auto size-3 shrink-0"
                        aria-label={t("chat.channels.archived")}
                      />
                    )}
                    {channel.unreadCount > 0 && (
                      <span
                        className={cn(
                          "bg-brand-orange rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white tabular-nums",
                          !channel.archived && "ml-auto",
                        )}
                      >
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
      <p className="border-border/80 bg-card/30 text-muted-foreground border-t px-3 py-2 text-[10px] leading-relaxed">
        {t("chat.channels.privacy")}
      </p>
    </nav>
  );
}
