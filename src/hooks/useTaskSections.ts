import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  taskSectionService,
  type SectionAction,
} from "@/services/taskSectionService";
import {
  afterSave,
  dropDraft,
  editDraft,
  upsertSection,
  type SectionDrafts,
  type SectionSaveState,
} from "@/hooks/sectionDrafts";
import { errorCode } from "@/utils/error";
import type { TaskSection } from "@/types/task";

const AUTOSAVE_MS = 30_000;

/**
 * Sections of a task editor: per-section drafts saved by autosave or the Save button with
 * `expectedRevision`; `TASK_REVISION_CONFLICT` keeps the typed draft until the user reloads.
 * Permissions come only from the server's `can*` flags.
 */
export function useTaskSections(
  workspaceId: string,
  taskId: string,
  enabled = true,
) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const queryKey = useMemo(
    () => ["task-sections", workspaceId, taskId],
    [workspaceId, taskId],
  );
  const query = useQuery({
    queryKey,
    queryFn: () => taskSectionService.list(workspaceId, taskId),
    enabled: Boolean(workspaceId && taskId && enabled),
    refetchOnWindowFocus: false,
  });
  const [drafts, setDrafts] = useState<SectionDrafts>({});
  const [saveState, setSaveState] = useState<Record<string, SectionSaveState>>(
    {},
  );
  const draftsRef = useRef(drafts);
  const stateRef = useRef(saveState);
  const inflight = useRef<Record<string, Promise<boolean>>>({});
  useEffect(() => {
    draftsRef.current = drafts;
    stateRef.current = saveState;
  }, [drafts, saveState]);

  const mark = useCallback((key: string, state: SectionSaveState | null) => {
    setSaveState((prev) => {
      const next = { ...prev };
      if (state) next[key] = state;
      else delete next[key];
      stateRef.current = next;
      return next;
    });
  }, []);
  const put = useCallback(
    (section: TaskSection) =>
      qc.setQueryData<TaskSection[]>(queryKey, (list) =>
        upsertSection(list, section),
      ),
    [qc, queryKey],
  );
  const fail = useCallback(
    (err: unknown) => {
      const code = errorCode(err) ?? "UNKNOWN";
      toast.error(
        t(`tasks.sectionActions.errors.${code}`, {
          defaultValue: t("tasks.sectionActions.errors.UNKNOWN"),
        }),
      );
    },
    [t],
  );

  const edit = useCallback(
    (section: TaskSection, patch: Record<string, unknown>) => {
      setDrafts((prev) => {
        const next = editDraft(prev, section, patch);
        draftsRef.current = next;
        return next;
      });
    },
    [],
  );

  /** Saves the section's draft; resolves false when it could not be saved. */
  const save = useCallback(
    (key: string): Promise<boolean> => {
      const draft = draftsRef.current[key];
      if (!draft) return Promise.resolve(true);
      if (stateRef.current[key] === "conflict") return Promise.resolve(false);
      const running = inflight.current[key];
      if (running) return running;
      mark(key, "saving");
      const op = taskSectionService
        .patch(workspaceId, taskId, key, draft.content, draft.base)
        .then((section) => {
          put(section);
          setDrafts((prev) => {
            const next = afterSave(prev, key, draft.edit, section.revision);
            draftsRef.current = next;
            return next;
          });
          mark(key, "saved");
          return true;
        })
        .catch((err) => {
          if (errorCode(err) === "TASK_REVISION_CONFLICT")
            mark(key, "conflict");
          else {
            mark(key, "error");
            fail(err);
          }
          return false;
        })
        .finally(() => delete inflight.current[key]);
      inflight.current[key] = op;
      return op;
    },
    [workspaceId, taskId, mark, put, fail],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      for (const key of Object.keys(draftsRef.current)) void save(key);
    }, AUTOSAVE_MS);
    return () => window.clearInterval(timer);
  }, [save]);

  /** Conflict banner "Reload": discard the draft and take the server copy. */
  const reload = useCallback(
    async (key: string) => {
      setDrafts((prev) => {
        const next = dropDraft(prev, key);
        draftsRef.current = next;
        return next;
      });
      mark(key, null);
      await qc.invalidateQueries({ queryKey });
    },
    [qc, queryKey, mark],
  );

  const act = useCallback(
    async (key: string, action: SectionAction, note?: string) => {
      if (action === "submit" && !(await save(key))) return null;
      try {
        const section = await taskSectionService.act(
          workspaceId,
          taskId,
          key,
          action,
          note,
        );
        put(section);
        // Other sections, subtasks and the parent task may move with this one.
        void qc.invalidateQueries({ queryKey });
        void qc.invalidateQueries({ queryKey: ["task-workflow"] });
        return section;
      } catch (err) {
        fail(err);
        return null;
      }
    },
    [workspaceId, taskId, save, put, qc, queryKey, fail],
  );

  const restore = useCallback(
    async (section: TaskSection, versionNo: number) => {
      try {
        const next = await taskSectionService.restore(
          workspaceId,
          taskId,
          section.key,
          versionNo,
          section.revision,
        );
        put(next);
        setDrafts((prev) => {
          const d = dropDraft(prev, section.key);
          draftsRef.current = d;
          return d;
        });
        mark(section.key, null);
        return next;
      } catch (err) {
        if (errorCode(err) === "TASK_REVISION_CONFLICT")
          mark(section.key, "conflict");
        else fail(err);
        return null;
      }
    },
    [workspaceId, taskId, put, mark, fail],
  );

  /** Replace the list from another response (e.g. `TaskPostResponse.sections`). */
  const replaceAll = useCallback(
    (list: TaskSection[]) => qc.setQueryData(queryKey, list),
    [qc, queryKey],
  );

  /** Content to render: the local draft when there is one, else the server copy. */
  const contentOf = useCallback(
    (section: TaskSection) => drafts[section.key]?.content ?? section.content,
    [drafts],
  );

  return {
    workspaceId,
    taskId,
    sections: query.data,
    isLoading: query.isLoading,
    error: query.error,
    contentOf,
    isDirty: (key: string) => Boolean(drafts[key]),
    saveState,
    edit,
    save,
    reload,
    act,
    restore,
    replaceAll,
  };
}
export type TaskSectionsApi = ReturnType<typeof useTaskSections>;
