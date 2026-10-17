import { useMemo } from "react";
import { Popover } from "radix-ui";
import { useTranslation } from "react-i18next";
import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { useTaskCommentMembers } from "@/pages/tasks/hooks/useTaskCommentMembers";
import type { CommentMember } from "@/pages/tasks/types/taskComment";
import type { MentionQuery } from "@/pages/tasks/utils/taskCommentMention";
interface Props {
  editor: Editor | null;
  query: MentionQuery | null;
  open: boolean;
  listId: string;
  activeIndex: number;
  members: ReturnType<typeof useTaskCommentMembers>;
  onSelect: (member: CommentMember) => void;
  onDismiss: () => void;
}
export function TaskCommentMentionDropdown(props: Props) {
  const { t } = useTranslation();
  const { editor, query, members } = props;
  const virtualRef = useMemo(
    () => ({
      current: {
        getBoundingClientRect() {
          if (!editor || editor.isDestroyed || !query) return new DOMRect();
          const position = editor.view.coordsAtPos(query.start);
          return new DOMRect(
            position.left,
            position.top,
            1,
            position.bottom - position.top,
          );
        },
      },
    }),
    [editor, query],
  );
  const options = members.isSearching
    ? []
    : members.data?.pages.flatMap((page) => page.items) || [];
  return (
    <Popover.Root
      open={props.open}
      onOpenChange={(open) => {
        if (!open) props.onDismiss();
      }}
    >
      <Popover.Anchor virtualRef={virtualRef} />
      <Popover.Portal>
        <Popover.Content
          role="presentation"
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          updatePositionStrategy="always"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            if (
              event.target instanceof globalThis.Node &&
              editor?.view.dom.contains(event.target)
            )
              event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            event.preventDefault();
            props.onDismiss();
          }}
          className="bg-popover text-popover-foreground z-[80] w-72 max-w-[calc(100vw-24px)] overflow-y-auto rounded-xl border p-1 shadow-md outline-none"
          style={{
            maxHeight:
              "min(320px, var(--radix-popover-content-available-height))",
          }}
        >
          <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
            {t("tasks.comments.mention")}
          </p>
          {(members.isPending || members.isSearching) && (
            <p role="status" className="p-2 text-sm">
              {t("tasks.loading")}
            </p>
          )}
          {members.isError && !members.isSearching && (
            <div role="alert" className="space-y-2 p-2 text-sm">
              <p>{t("tasks.comments.membersError")}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => void members.refetch()}
              >
                {t("tasks.retry")}
              </Button>
            </div>
          )}
          <div
            id={props.listId}
            role="listbox"
            aria-label={t("tasks.comments.mentionSuggestions")}
          >
            {options.map((member, index) => (
              <Button
                key={member.userId}
                id={`${props.listId}-${index}`}
                type="button"
                role="option"
                aria-selected={index === props.activeIndex}
                tabIndex={-1}
                variant="ghost"
                className={cn(
                  "min-h-12 w-full justify-start gap-3 px-2 text-left whitespace-normal",
                  index === props.activeIndex &&
                    "bg-accent text-accent-foreground",
                )}
                onPointerDown={(event) => event.preventDefault()}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => props.onSelect(member)}
              >
                <span
                  aria-hidden
                  className="bg-muted text-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                >
                  {member.displayName
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((word) => Array.from(word)[0])
                    .join("")
                    .toLocaleUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium break-words">
                    {member.displayName}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {t(`tasks.comments.roles.${member.role}`)}
                  </span>
                </span>
              </Button>
            ))}
          </div>
          {members.isSuccess && !members.isSearching && !options.length && (
            <p role="status" className="p-2 text-sm">
              {t("tasks.comments.noMembers")}
            </p>
          )}
          {members.hasNextPage && !members.isSearching && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={members.isFetchingNextPage}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => void members.fetchNextPage()}
            >
              {t("tasks.comments.loadMore")}
            </Button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
