import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { chatCollaborationService as service } from "@/services/chatCollaborationService";

interface Props {
  workspaceId: string;
  channelId: string;
  userId: string;
}

export function ChatNotificationMenu({
  workspaceId,
  channelId,
  userId,
}: Props) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const prefix = ["chat-preferences", userId, workspaceId];
  const preference = useQuery({
    queryKey: [...prefix, channelId],
    queryFn: ({ signal }) =>
      service.preferences(workspaceId, channelId, signal),
    retry: false,
  });
  const change = useMutation({
    mutationFn: ({
      kind,
      enabled,
    }: {
      kind: "dnd" | "mute";
      enabled: boolean;
    }) => service.preference(workspaceId, channelId, kind, enabled),
    onSuccess: () => client.invalidateQueries({ queryKey: prefix }),
  });
  const disabled =
    preference.isPending ||
    preference.isError ||
    change.isPending ||
    preference.isFetching;
  const silent = preference.data?.dnd || preference.data?.muted;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label={t("chat.notifications.title")}
          title={t("chat.notifications.title")}
        >
          {silent ? (
            <BellOff className="size-4" />
          ) : (
            <Bell className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 max-w-[calc(100vw-2rem)]"
      >
        <DropdownMenuLabel>{t("chat.notifications.title")}</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={preference.data?.dnd ?? false}
          disabled={disabled}
          onSelect={(event) => event.preventDefault()}
          onCheckedChange={(enabled) => change.mutate({ kind: "dnd", enabled })}
        >
          {t("chat.notifications.dnd")}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={preference.data?.muted ?? false}
          disabled={disabled}
          onSelect={(event) => event.preventDefault()}
          onCheckedChange={(enabled) =>
            change.mutate({ kind: "mute", enabled })
          }
        >
          {t("chat.notifications.mute")}
        </DropdownMenuCheckboxItem>
        <p className="text-muted-foreground px-2 py-2 text-xs">
          {t("chat.notifications.hint")}
        </p>
        {(preference.isFetching || change.isPending) && (
          <p role="status" className="px-2 py-2 text-xs">
            {t("chat.notifications.loading")}
          </p>
        )}
        {(preference.isError || change.isError) && (
          <p role="alert" className="text-destructive px-2 py-2 text-xs">
            {t("chat.notifications.error")}
          </p>
        )}
        {preference.isError && (
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              void preference.refetch();
            }}
          >
            {t("chat.actions.retry")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
