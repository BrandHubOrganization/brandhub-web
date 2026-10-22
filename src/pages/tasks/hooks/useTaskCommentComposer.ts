import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInlineTaskField } from "@/pages/tasks/hooks/useInlineTaskField";
import { useTaskEditContext } from "@/pages/tasks/components/TaskWorkflowProvider";
import { taskCommentService as service } from "@/pages/tasks/services/taskCommentService";
import { workflowError } from "@/pages/tasks/utils/taskWorkflowErrors";
import type { CommentDraft } from "@/pages/tasks/types/taskComment";

const EMPTY_DRAFT: CommentDraft = { content: "", mentions: [], uploads: [] };
export function useTaskCommentComposer(
  workspaceId: string,
  taskId: string,
  onCreated: () => Promise<unknown>,
) {
  const { t } = useTranslation();
  const { session } = useTaskEditContext();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const attempt = useRef({ signature: "", id: "" });
  const identity = `${workspaceId}:${taskId}:comments`;
  const field = useInlineTaskField<CommentDraft>(
    `task-${taskId}-comment-draft`,
    EMPTY_DRAFT,
    async (draft) => {
      const payload = {
        content: draft.content.trim(),
        mentions: draft.mentions.map((member) => member.userId),
        attachmentIds: draft.uploads.map((upload) => upload.id),
      };
      const signature = JSON.stringify(payload);
      if (attempt.current.signature !== signature)
        attempt.current = { signature, id: crypto.randomUUID() };
      session.retry(identity);
      await session.run(identity, () =>
        service.create(workspaceId, taskId, {
          ...payload,
          clientRequestId: attempt.current.id,
        }),
      );
      attempt.current = { signature: "", id: "" };
      await onCreated();
    },
  );

  async function upload(files: File[]) {
    setUploadError("");
    if (
      field.value.uploads.length + files.length > 5 ||
      files.some(
        (file) =>
          file.size === 0 ||
          file.size > 5 * 1024 * 1024 ||
          !["image/jpeg", "image/png", "image/webp"].includes(file.type),
      )
    ) {
      setUploadError(t("tasks.comments.imageRules"));
      return;
    }
    setUploading(true);
    let next = field.value;
    try {
      for (const file of files) {
        setProgress(0);
        session.retry(identity);
        const uploaded = await session.run(identity, () =>
          service.upload(workspaceId, taskId, file, setProgress),
        );
        next = { ...next, uploads: [...next.uploads, uploaded] };
        field.change(next);
      }
    } catch (error) {
      setUploadError(workflowError(error, t));
    } finally {
      setUploading(false);
    }
  }
  const busy = uploading || field.status === "saving";
  return { field, upload, uploading, progress, uploadError, busy };
}
