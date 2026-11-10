import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { taskPostService } from "@/pages/editor/services/taskPostService";
import { taskApprovalService } from "@/pages/tasks/services/taskApprovalService";
import {
  changedPostParts,
  draftFromPost,
  postPartKey,
  emptyTaskDraft,
  postInput,
  taskEditorError,
} from "@/pages/editor/types/taskPostDraft";
import type { TaskPostDraft } from "@/pages/editor/types/taskPostDraft";
import type {
  TaskEditorSession as Session,
  TaskEditorState,
} from "@/pages/editor/types/taskEditor";
import type { ContentTemplate } from "@/types/template";
import type { SocialPlatform } from "@/types/editor";

export type { TaskEditorState } from "@/pages/editor/types/taskEditor";
const AUTOSAVE_MS = 30_000;

export function useTaskEditorForm(workspaceId: string, taskId: string) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(emptyTaskDraft);
  const [session, setSession] = useState<Session>();
  const [isLoading, setIsLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  // Role tasks: last saved copy (to find the edited sections) and sections hit by a conflict.
  const [saved, setSaved] = useState(emptyTaskDraft);
  const [conflictKeys, setConflictKeys] = useState<string[]>([]);
  const latest = useRef({
    draft: emptyTaskDraft(),
    saved: emptyTaskDraft(),
    session: undefined as Session | undefined,
    dirty: false,
    conflict: false,
  });
  const lifecycle = useRef({
    live: false,
    epoch: 0,
    edit: 0,
    submitting: false,
  });
  const saving = useRef<Promise<void> | null>(null);

  const load = useCallback(async () => {
    const epoch = ++lifecycle.current.epoch;
    try {
      const [linked, review] = await Promise.all([
        taskPostService.read(workspaceId, taskId),
        taskApprovalService.read(workspaceId, taskId),
      ]);
      if (!lifecycle.current.live || lifecycle.current.epoch !== epoch) return;
      const next = linked.post ? draftFromPost(linked.post) : emptyTaskDraft();
      latest.current = {
        draft: next,
        saved: next,
        session: { linked, review },
        dirty: false,
        conflict: false,
      };
      setSession({ linked, review });
      setDraft(next);
      setSaved(next);
      setConflictKeys([]);
      setIsDirty(false);
    } catch (error) {
      const explicitCode = (
        error as { response?: { data?: { error?: { code?: string } } } }
      )?.response?.data?.error?.code;
      const isTaskReviewDomainError =
        typeof explicitCode === "string" &&
        (explicitCode.startsWith("TASK_") ||
          explicitCode.startsWith("POST_") ||
          explicitCode === "FORBIDDEN" ||
          explicitCode === "VALIDATION_ERROR");
      if (!isTaskReviewDomainError) {
        try {
          const res = await api.get<{
            data?: { name?: string; title?: string; description?: string };
          }>(`/api/v1/workspaces/${workspaceId}/tasks/${taskId}`);
          const task = res.data?.data;
          if (
            task &&
            lifecycle.current.live &&
            lifecycle.current.epoch === epoch
          ) {
            const next: TaskPostDraft = {
              ...emptyTaskDraft(),
              caption: task.description || task.name || task.title || "",
            };
            const fallbackSession: Session = {
              linked: {
                taskRevision: 1,
                post: null,
                canEdit: true,
                blockedReason: null,
              },
              review: {
                taskId,
                taskStatus: "IN_PROGRESS",
                revision: 1,
                currentRound: 0,
                activeStep: null,
                steps: [],
                logs: [],
              } as unknown as Session["review"],
            };
            latest.current = {
              draft: next,
              saved: next,
              session: fallbackSession,
              dirty: false,
              conflict: false,
            };
            setSession(fallbackSession);
            setDraft(next);
            setIsDirty(false);
            setErrorCode(null);
            return;
          }
        } catch {
          // Fall through to standard error state
        }
      }
      if (lifecycle.current.live && lifecycle.current.epoch === epoch)
        setErrorCode(taskEditorError(error));
    } finally {
      if (lifecycle.current.live && lifecycle.current.epoch === epoch)
        setIsLoading(false);
    }
  }, [workspaceId, taskId]);

  useEffect(() => {
    const currentLifecycle = lifecycle.current;
    currentLifecycle.live = true;
    const timer = window.setTimeout(() => void load(), 0);
    return () => {
      window.clearTimeout(timer);
      currentLifecycle.live = false;
      currentLifecycle.epoch++;
    };
  }, [load]);

  const edit = (change: (current: TaskPostDraft) => TaskPostDraft) => {
    if (!latest.current.session?.linked.canEdit || lifecycle.current.submitting)
      return;
    const next = change(latest.current.draft);
    latest.current.draft = next;
    latest.current.dirty = true;
    lifecycle.current.edit++;
    setDraft(next);
    setIsDirty(true);
  };

  const persist = useCallback((): Promise<void> => {
    if (saving.current) return saving.current;
    const current = latest.current;
    if (!current.session?.linked.canEdit || !current.dirty)
      return Promise.resolve();
    const revision = current.session.linked.taskRevision;
    if (revision === null)
      return Promise.reject(new Error("INVALID_TASK_POST"));
    const epoch = lifecycle.current.epoch;
    const editVersion = lifecycle.current.edit;
    const sections = current.session.linked.sections;
    let sectionRevisions: Record<string, number> | undefined;
    if (sections) {
      if (current.conflict)
        return Promise.reject(new Error("TASK_REVISION_CONFLICT"));
      // Per-section save: only the edited sections, each with the revision we read.
      sectionRevisions = {};
      for (const part of changedPostParts(current.saved, current.draft)) {
        const key = postPartKey(sections, part);
        const section = sections.find((s) => s.key === key);
        if (key && section) sectionRevisions[key] = section.revision;
      }
      if (!Object.keys(sectionRevisions).length) {
        current.dirty = false;
        setIsDirty(false);
        return Promise.resolve();
      }
    }
    setIsSaving(true);
    const operation = taskPostService
      .save(workspaceId, taskId, {
        expectedRevision: revision,
        expectedPostContentVersion:
          current.session.linked.post?.contentVersion ?? null,
        post: postInput(current.draft),
        sectionRevisions,
      })
      .then((linked) => {
        if (!lifecycle.current.live || lifecycle.current.epoch !== epoch)
          return;
        const next = { linked, review: current.session!.review };
        latest.current.session = next;
        setSession(next);
        if (sections && linked.post) {
          // Others may have saved other sections: take the server copy as the new baseline,
          // and as the content too when nothing was typed meanwhile.
          const server = draftFromPost(linked.post);
          latest.current.saved = server;
          setSaved(server);
          if (lifecycle.current.edit === editVersion) {
            latest.current.draft = server;
            setDraft(server);
          }
        }
        if (lifecycle.current.edit === editVersion) {
          latest.current.dirty = false;
          setIsDirty(false);
        }
        setErrorCode(null);
      })
      .catch((error) => {
        if (
          sectionRevisions &&
          taskEditorError(error) === "TASK_REVISION_CONFLICT"
        ) {
          latest.current.conflict = true;
          setConflictKeys(Object.keys(sectionRevisions));
        }
        throw error;
      })
      .finally(() => {
        saving.current = null;
        if (lifecycle.current.live && lifecycle.current.epoch === epoch)
          setIsSaving(false);
      });
    saving.current = operation;
    return operation;
  }, [workspaceId, taskId]);

  const save = useCallback(async () => {
    try {
      await persist();
    } catch (error) {
      // A section conflict shows on the section (banner + Reload), not as an editor error.
      if (lifecycle.current.live && !latest.current.conflict)
        setErrorCode(taskEditorError(error));
    }
  }, [persist]);
  /** SectionFrame Save/Submit for post sections: true when the post is saved. */
  const savePost = useCallback(async () => {
    await save();
    return !latest.current.dirty;
  }, [save]);
  useEffect(() => {
    if (errorCode) return;
    const timer = window.setInterval(() => {
      if (!lifecycle.current.submitting) void save();
    }, AUTOSAVE_MS);
    return () => window.clearInterval(timer);
  }, [save, errorCode]);

  const handleSubmitForReview = async () => {
    if (lifecycle.current.submitting || !latest.current.session?.linked.canEdit)
      return;
    if (!latest.current.draft.caption.trim()) {
      toast.error(t("editor.submitEmptyError"));
      return;
    }
    lifecycle.current.submitting = true;
    setIsSubmitting(true);
    const epoch = lifecycle.current.epoch;
    try {
      if (saving.current) await saving.current;
      await persist();
      if (!lifecycle.current.live || lifecycle.current.epoch !== epoch) return;
      const current = latest.current.session!;
      if (!current.linked.post || current.linked.taskRevision === null)
        throw new Error("INVALID_TASK_POST");
      const review = await taskApprovalService.submit(workspaceId, taskId, {
        expectedRevision: current.linked.taskRevision,
        expectedApprovalRound: current.review.approvalRound,
        expectedPostContentVersion: current.linked.post.contentVersion,
      });
      if (!lifecycle.current.live || lifecycle.current.epoch !== epoch) return;
      const linked = {
        ...current.linked,
        canEdit: false,
        taskRevision: review.workflowRevision,
        blockedReason: "TASK_REVIEW_CONTENT_LOCKED",
      };
      latest.current.session = { linked, review };
      setSession({ linked, review });
      setErrorCode(null);
      toast.success(t("editor.submitSuccess"));
    } catch (error) {
      if (lifecycle.current.live && lifecycle.current.epoch === epoch)
        setErrorCode(taskEditorError(error));
    } finally {
      lifecycle.current.submitting = false;
      if (lifecycle.current.live && lifecycle.current.epoch === epoch)
        setIsSubmitting(false);
    }
  };

  const setTargetPlatforms = (
    value: SocialPlatform[] | ((current: SocialPlatform[]) => SocialPlatform[]),
  ) =>
    edit((current) => ({
      ...current,
      targetPlatforms:
        typeof value === "function" ? value(current.targetPlatforms) : value,
    }));
  const toggleTargetPlatform = (platform: SocialPlatform) =>
    edit((current) => ({
      ...current,
      targetPlatforms: current.targetPlatforms.includes(platform)
        ? current.targetPlatforms.length > 1
          ? current.targetPlatforms.filter((value) => value !== platform)
          : current.targetPlatforms
        : [...current.targetPlatforms, platform],
    }));
  const handleApplyTemplate = (template: ContentTemplate) =>
    edit((current) => ({
      ...current,
      caption: template.caption,
      hashtags: template.hashtags?.length
        ? template.hashtags
        : current.hashtags,
      mediaUrls: template.mediaUrls?.length
        ? template.mediaUrls
        : current.mediaUrls,
    }));
  const handleGeneratedMedia = (
    url: string,
    s3Key: string | undefined,
    mediaType: "IMAGE" | "VIDEO",
  ) =>
    edit((current) => ({
      ...current,
      mediaUrls: Array.from(new Set([...current.mediaUrls, url])),
      aiGenerated: true,
      storedMedia: {
        ...current.storedMedia,
        [url]: s3Key ? { s3Key, mediaType } : { externalUrl: url, mediaType },
      },
    }));
  const handleRepositoryMedia = (
    url: string,
    materialId: string,
    mediaType: "IMAGE" | "VIDEO",
  ) =>
    edit((current) => ({
      ...current,
      mediaUrls: Array.from(new Set([...current.mediaUrls, url])),
      storedMedia: { ...current.storedMedia, [url]: { materialId, mediaType } },
    }));
  const handleReplaceMedia = (
    oldUrl: string,
    newUrl: string,
    materialId: string,
    mediaType: "IMAGE" | "VIDEO",
  ) =>
    edit((current) => {
      const { [oldUrl]: _removed, ...restStoredMedia } = current.storedMedia;
      return {
        ...current,
        mediaUrls: current.mediaUrls.map((url) =>
          url === oldUrl ? newUrl : url,
        ),
        storedMedia: {
          ...restStoredMedia,
          [newUrl]: { materialId, mediaType },
        },
      };
    });
  const handleApplyAIResult = (
    caption: string,
    hashtags: string[],
    imageUrl?: string,
  ) =>
    edit((current) => ({
      ...current,
      caption,
      hashtags: Array.from(new Set([...current.hashtags, ...hashtags])),
      aiGenerated: true,
      mediaUrls: imageUrl
        ? Array.from(new Set([...current.mediaUrls, imageUrl]))
        : current.mediaUrls,
    }));

  return {
    ...draft,
    isDirty,
    isSaving,
    isSubmitting,
    isPreviewOpen,
    setIsPreviewOpen,
    isTemplatePickerOpen,
    setIsTemplatePickerOpen,
    setTargetPlatforms,
    toggleTargetPlatform,
    lastSavedTime: session?.linked.post
      ? new Date(session.linked.post.updatedAt).toLocaleTimeString()
      : "",
    publishStatus: "IDLE" as const,
    postSections: {
      sections: session?.linked.sections ?? null,
      dirtyKeys: session?.linked.sections
        ? changedPostParts(saved, draft).map((part) =>
            postPartKey(session.linked.sections!, part),
          )
        : [],
      conflictKeys,
      isSaving,
      save: savePost,
    },
    handleCaptionChange: (caption: string) =>
      edit((current) => ({ ...current, caption })),
    handleHashtagsChange: (hashtags: string[]) =>
      edit((current) => ({ ...current, hashtags })),
    handleMediaUrlsChange: (mediaUrls: string[]) =>
      edit((current) => ({ ...current, mediaUrls })),
    handleGeneratedMedia,
    handleRepositoryMedia,
    handleReplaceMedia,
    handleApplyAIResult,
    handleApplyTemplate,
    handleSubmitForReview,
    taskEditor: {
      isLoading,
      errorCode,
      blockedReason: session?.linked.blockedReason ?? null,
      isReadOnly: !session?.linked.canEdit || isLoading || isSubmitting,
      canSubmit: Boolean(
        session?.linked.canEdit &&
        draft.caption.trim() &&
        !isLoading &&
        !errorCode,
      ),
      reload: () => {
        if (!saving.current && !lifecycle.current.submitting) {
          setIsLoading(true);
          setErrorCode(null);
          void load();
        }
      },
      save,
    } satisfies TaskEditorState,
  };
}
