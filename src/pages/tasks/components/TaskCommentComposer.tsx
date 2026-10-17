import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Paperclip, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCommentTextInput } from "@/pages/tasks/components/TaskCommentTextInput";
import type { TaskCommentInputHandle } from "@/pages/tasks/components/TaskCommentTextInput";
import { TaskCommentMentions } from "@/pages/tasks/components/TaskCommentMentions";
import { TaskCommentImage } from "@/pages/tasks/components/TaskCommentImage";
import { useTaskCommentComposer } from "@/pages/tasks/hooks/useTaskCommentComposer";

export function TaskCommentComposer({
  workspaceId,
  taskId,
  onCreated,
}: {
  workspaceId: string;
  taskId: string;
  onCreated: () => Promise<unknown>;
}) {
  const { t } = useTranslation();
  const fileInput = useRef<HTMLInputElement>(null);
  const editor = useRef<TaskCommentInputHandle>(null);
  const { field, upload, uploading, progress, uploadError, busy } =
    useTaskCommentComposer(workspaceId, taskId, onCreated);
  const draft = field.value;
  return (
    <form
      className="bg-card text-card-foreground space-y-3 rounded-xl border p-3"
      aria-busy={busy}
      onSubmit={(event) => {
        event.preventDefault();
        if (!busy && draft.content.trim()) void field.commit();
      }}
    >
      <TaskCommentTextInput
        editor={editor}
        workspaceId={workspaceId}
        taskId={taskId}
        value={draft.content}
        disabled={busy}
        invalid={Boolean(field.error)}
        canMention={draft.mentions.length < 100}
        onChange={(content, mentions) =>
          field.change({ ...draft, content, mentions })
        }
        onSubmit={() => {
          if (!busy && draft.content.trim()) void field.commit();
        }}
      />
      {draft.uploads.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {draft.uploads.map((image) => (
            <li key={image.id} className="w-28 space-y-1">
              <TaskCommentImage
                workspaceId={workspaceId}
                taskId={taskId}
                id={image.id}
              />
              <p className="truncate text-xs" title={image.name}>
                {image.name}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                aria-label={t("tasks.comments.removeImage", {
                  name: image.name,
                })}
                onClick={() =>
                  field.change({
                    ...draft,
                    uploads: draft.uploads.filter(
                      (value) => value.id !== image.id,
                    ),
                  })
                }
              >
                <X aria-hidden className="size-3" />
                {t("tasks.comments.remove")}
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <TaskCommentMentions
            workspaceId={workspaceId}
            taskId={taskId}
            disabled={busy || draft.mentions.length >= 100}
            onSelect={(member) => editor.current?.insertMention(member)}
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy || draft.uploads.length >= 5}
            onClick={() => fileInput.current?.click()}
          >
            <Paperclip aria-hidden className="size-4" />
            {t("tasks.comments.attach")}
          </Button>
          <Input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            wrapperClassName="hidden"
            className="hidden"
            tabIndex={-1}
            aria-label={t("tasks.comments.attach")}
            disabled={busy}
            onChange={(event) => {
              const files = Array.from(event.target.files || []);
              event.target.value = "";
              void upload(files);
            }}
          />
        </div>
        <Button
          type="submit"
          variant="orange"
          size="sm"
          disabled={busy || !draft.content.trim()}
        >
          <Send aria-hidden className="size-4" />
          {field.status === "saving"
            ? t("tasks.comments.sending")
            : t(
                field.error
                  ? "tasks.comments.retrySend"
                  : "tasks.comments.send",
              )}
        </Button>
      </div>
      <p
        id={`task-${taskId}-comment-help`}
        className="text-muted-foreground text-xs"
      >
        {t("tasks.comments.imageRules")} · {t("tasks.comments.shortcut")}
        <br />
        {t("tasks.comments.mentionHint")}
      </p>
      <div aria-live="polite" className="text-xs">
        {uploading && (
          <p role="status">{t("tasks.comments.uploading", { progress })}</p>
        )}
        {uploadError && (
          <p role="alert" className="text-destructive">
            {uploadError}
          </p>
        )}
        {field.error && (
          <p role="alert" className="text-destructive">
            {field.error}
          </p>
        )}
        {field.status === "saved" && (
          <p className="text-muted-foreground">{t("tasks.comments.sent")}</p>
        )}
      </div>
    </form>
  );
}
