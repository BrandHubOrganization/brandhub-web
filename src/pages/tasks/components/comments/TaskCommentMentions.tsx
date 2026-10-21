import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useTaskCommentMembers } from "@/pages/tasks/hooks/useTaskCommentMembers";
import type { CommentMember } from "@/pages/tasks/types/taskComment";

export function TaskCommentMentions({
  workspaceId,
  taskId,
  disabled,
  onSelect,
}: {
  workspaceId: string;
  taskId: string;
  disabled: boolean;
  onSelect: (member: CommentMember) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const members = useTaskCommentMembers({
    workspaceId,
    taskId,
    search,
    enabled: open,
  });
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="sm" disabled={disabled}>
          <AtSign aria-hidden className="size-4" />
          {t("tasks.comments.mention")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-72 rounded-xl"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          maxLength={200}
          aria-label={t("tasks.comments.searchMembers")}
          placeholder={t("tasks.comments.searchMembers")}
          onKeyDown={(event) => {
            if (
              event.key !== "Escape" &&
              event.key !== "Tab" &&
              event.key !== "ArrowDown"
            )
              event.stopPropagation();
          }}
        />
        {(members.isPending || members.isSearching) && (
          <p role="status" className="p-2 text-sm">
            {t("tasks.loading")}
          </p>
        )}
        {members.isError && !members.isSearching && (
          <div role="alert" className="p-2 text-sm">
            <p>{t("tasks.comments.membersError")}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void members.refetch()}
            >
              {t("tasks.retry")}
            </Button>
          </div>
        )}
        {!members.isSearching &&
          members.data?.pages
            .flatMap((page) => page.items)
            .map((member) => (
              <DropdownMenuItem
                key={member.userId}
                className="min-h-10 cursor-pointer"
                onSelect={() => onSelect(member)}
              >
                <span className="min-w-0 flex-1 break-words">
                  {member.displayName}
                </span>
                <span className="text-muted-foreground text-xs">
                  {t(`tasks.comments.roles.${member.role}`)}
                </span>
              </DropdownMenuItem>
            ))}
        {members.isSuccess &&
          !members.isSearching &&
          members.data.pages.every((page) => !page.items.length) && (
            <p className="p-2 text-sm">{t("tasks.comments.noMembers")}</p>
          )}
        {members.hasNextPage && !members.isSearching && (
          <DropdownMenuItem
            disabled={members.isFetchingNextPage}
            onSelect={(event) => {
              event.preventDefault();
              void members.fetchNextPage();
            }}
          >
            {t("tasks.comments.loadMore")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
