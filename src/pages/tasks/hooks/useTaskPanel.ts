import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useSearchParams } from "react-router-dom";
import type { TaskListItem } from "@/types/task";
import { useTaskEditContext } from "@/pages/tasks/components/TaskWorkflowProvider";

const DESKTOP_QUERY = "(min-width: 1280px)";
function subscribe(listener: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

export function useTaskPanel(workspaceId: string) {
  const [params, setParams] = useSearchParams();
  const { canLeave } = useTaskEditContext();
  const opener = useRef<HTMLElement | null>(null);
  const openerTaskId = useRef("");
  const isDesktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
  const urlTaskId = params.get("task") || "";
  const [taskId, setTaskId] = useState(urlTaskId);
  useEffect(() => {
    if (urlTaskId === taskId) return;
    let active = true;
    async function syncSelection() {
      const allowed = await canLeave();
      if (!active) return;
      if (allowed) setTaskId(urlTaskId);
      else
        setParams(
          (previous) => {
            const next = new URLSearchParams(previous);
            if (taskId) next.set("task", taskId);
            else next.delete("task");
            return next;
          },
          { replace: true },
        );
    }
    void syncSelection();
    return () => {
      active = false;
    };
  }, [urlTaskId, taskId, canLeave, setParams]);
  const open = async (task: TaskListItem) => {
    if (task.workspaceId !== workspaceId) return;
    if (!(await canLeave())) return;
    openerTaskId.current = task.id;
    opener.current =
      document.querySelector<HTMLElement>(
        `[data-task-open="${CSS.escape(task.id)}"]`,
      ) ||
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    setTaskId(task.id);
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("task", task.id);
      return next;
    });
  };
  const restoreFocus = useCallback(() => {
    requestAnimationFrame(() => {
      // A successful save reloads list rows, so the original DOM node may be gone.
      const current = document.querySelector<HTMLElement>(
        `[data-task-open="${CSS.escape(openerTaskId.current)}"]`,
      );
      const target =
        current || (opener.current?.isConnected ? opener.current : null);
      target?.focus({ preventScroll: true });
    });
  }, []);
  const close = async () => {
    if (!(await canLeave())) return;
    setTaskId("");
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.delete("task");
      return next;
    });
    restoreFocus();
  };
  return { taskId, isDesktop, open, close, restoreFocus };
}
