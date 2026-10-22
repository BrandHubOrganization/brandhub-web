import { useId, useImperativeHandle, useState } from "react";
import type { RefObject } from "react";
import { EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { TaskCommentMentionDropdown } from "@/pages/tasks/components/comments/TaskCommentMentionDropdown";
import { useTaskCommentMembers } from "@/pages/tasks/hooks/useTaskCommentMembers";
import { useTaskCommentRichEditor } from "@/pages/tasks/hooks/useTaskCommentRichEditor";
import {
  COMMENT_MENTION_NODE,
  commentValue,
  richMentionQuery,
} from "@/pages/tasks/utils/taskCommentRichText";
import { MAX_COMMENT_LENGTH } from "@/pages/tasks/utils/taskCommentMention";
import type { MentionQuery } from "@/pages/tasks/utils/taskCommentMention";
import type { CommentMember } from "@/pages/tasks/types/taskComment";

export interface TaskCommentInputHandle {
  insertMention: (member: CommentMember) => void;
}
interface Props {
  workspaceId: string;
  taskId: string;
  value: string;
  disabled: boolean;
  invalid: boolean;
  canMention: boolean;
  editor: RefObject<TaskCommentInputHandle | null>;
  onChange: (content: string, mentions: CommentMember[]) => void;
  onSubmit: () => void;
}
export function TaskCommentTextInput({ editor: handle, ...props }: Props) {
  const { t } = useTranslation();
  const listId = useId();
  const labelId = useId();
  const [query, setQuery] = useState<MentionQuery | null>(null);
  const [dismissed, setDismissed] = useState("");
  const [navigation, setNavigation] = useState({ key: "", index: 0 });
  const [error, setError] = useState("");
  const key = query ? `${query.start}:${query.end}:${query.search}` : "";
  const open =
    !!query && !props.disabled && props.canMention && dismissed !== key;
  const members = useTaskCommentMembers({
    workspaceId: props.workspaceId,
    taskId: props.taskId,
    search: query?.search || "",
    enabled: open,
  });
  const options = members.isSearching
    ? []
    : members.data?.pages.flatMap((page) => page.items) || [];
  const activeIndex =
    navigation.key === key ? Math.min(navigation.index, options.length - 1) : 0;
  const activeId =
    open && options[activeIndex] ? `${listId}-${activeIndex}` : undefined;
  const editor = useTaskCommentRichEditor({
    value: props.value,
    disabled: props.disabled,
    labelId,
    helpId: `task-${props.taskId}-comment-help`,
    expanded: open,
    listId,
    activeId,
    invalid: props.invalid || !!error,
    onChange: props.onChange,
    onContext: updateContext,
    onKeyDown: handleKeyDown,
  });

  function updateContext(current: Editor | null, changed: boolean) {
    const next =
      current && !current.view.composing ? richMentionQuery(current) : null;
    setQuery((previous) =>
      previous?.start === next?.start &&
      previous?.end === next?.end &&
      previous?.search === next?.search
        ? previous
        : next,
    );
    if (changed) {
      setDismissed("");
      setError("");
    }
  }
  function insertMention(member: CommentMember, replaceQuery: boolean) {
    if (!editor || props.disabled) return;
    const selection = editor.state.selection;
    const from = replaceQuery && query ? query.start : selection.from;
    const to = replaceQuery && query ? query.end : selection.to;
    const content = commentValue(editor.getJSON()).content;
    const removed = editor.state.doc.textBetween(from, to, "\n", (node) =>
      node.type.name === COMMENT_MENTION_NODE
        ? `@${node.attrs.displayName}`
        : "\n",
    );
    if (
      content.length - removed.length + member.displayName.length + 2 >
      MAX_COMMENT_LENGTH
    ) {
      setError(t("tasks.comments.mentionTooLong"));
      return;
    }
    editor
      .chain()
      .focus()
      .insertContentAt({ from, to }, [
        { type: COMMENT_MENTION_NODE, attrs: member },
        { type: "text", text: " " },
      ])
      .run();
    setDismissed(key);
  }
  function handleKeyDown(event: KeyboardEvent) {
    if (event.isComposing || event.keyCode === 229 || editor?.view.composing)
      return false;
    if (open && event.key === "Escape") {
      event.preventDefault();
      setDismissed(key);
      return true;
    }
    if (open && event.key === "Tab") setDismissed(key);
    if (
      open &&
      ["ArrowUp", "ArrowDown"].includes(event.key) &&
      options.length
    ) {
      event.preventDefault();
      const index =
        (activeIndex + (event.key === "ArrowDown" ? 1 : -1) + options.length) %
        options.length;
      setNavigation({ key, index });
      document
        .getElementById(`${listId}-${index}`)
        ?.scrollIntoView({ block: "nearest" });
      return true;
    }
    if (open && event.key === "Enter") {
      event.preventDefault();
      if (options[activeIndex]) insertMention(options[activeIndex], true);
      return true;
    }
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      if (!props.disabled) props.onSubmit();
      return true;
    }
    return false;
  }
  useImperativeHandle(handle, () => ({
    insertMention: (member) => insertMention(member, false),
  }));
  return (
    <div className="space-y-2">
      <Label id={labelId} onClick={() => editor?.commands.focus()}>
        {t("tasks.comments.write")}
      </Label>
      <div
        className={cn(
          "border-input bg-input-background text-foreground focus-within:border-ring focus-within:ring-ring/50 dark:bg-input/30 relative rounded-md border transition-[color,box-shadow] focus-within:ring-[3px]",
          props.disabled && "pointer-events-none opacity-50",
        )}
        onCompositionStartCapture={() => setQuery(null)}
        onCompositionEndCapture={() =>
          requestAnimationFrame(() => updateContext(editor, false))
        }
      >
        {!props.value && (
          <p
            aria-hidden
            className="text-muted-foreground pointer-events-none absolute top-2 right-3 left-3 text-base md:text-sm"
          >
            {t("tasks.comments.placeholder")}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>
      <TaskCommentMentionDropdown
        editor={editor}
        query={query}
        open={open}
        listId={listId}
        members={members}
        activeIndex={activeIndex}
        onSelect={(member) => insertMention(member, true)}
        onDismiss={() => setDismissed(key)}
      />
      {error && (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
