import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { TaskEditSession } from "@/pages/tasks/utils/taskEditSession";
import { TaskDiscardDialog } from "@/pages/tasks/components/TaskDiscardDialog";

interface SessionValue {
  session: TaskEditSession;
  onUpdated: () => void;
  canLeave: () => Promise<boolean>;
}
const Context = createContext<SessionValue | null>(null);
export function useTaskEditContext() {
  const context = useContext(Context);
  if (!context) throw new Error("TASK_WORKFLOW_PROVIDER_MISSING");
  return context;
}
export function useOptionalTaskEditContext() {
  return useContext(Context);
}

export function TaskWorkflowProvider({
  children,
  onUpdated = () => {},
}: {
  children: ReactNode;
  onUpdated?: () => void;
}) {
  const { t } = useTranslation();
  const [client] = useState(() => new QueryClient());
  const [session] = useState(() => new TaskEditSession());
  const navigateTo = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const decision = useRef<((discard: boolean) => void) | null>(null);
  const settle = useCallback((discard: boolean) => {
    const resolve = decision.current;
    decision.current = null;
    setConfirmOpen(false);
    resolve?.(discard);
  }, []);
  useEffect(
    () => () => {
      decision.current?.(false);
      decision.current = null;
    },
    [],
  );
  const canLeave = useCallback(async () => {
    if (session.pending) {
      toast.info(t("tasks.inline.waitSaving"));
      return false;
    }
    if (decision.current) return false;
    if (!session.hasUnsaved) return true;
    if (session.hasUnsaved) {
      const discard = await new Promise<boolean>((resolve) => {
        decision.current = resolve;
        setConfirmOpen(true);
      });
      if (!discard) return false;
      if (session.pending) {
        toast.info(t("tasks.inline.waitSaving"));
        return false;
      }
    }
    session.discard();
    return true;
  }, [session, t]);
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => {
      if (session.hasUnsaved) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const navigate = (event: MouseEvent) => {
      const anchor =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (
        !anchor ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        anchor.hasAttribute("download") ||
        (anchor.hasAttribute("target") &&
          anchor.getAttribute("target") !== "_self") ||
        event.button !== 0
      )
        return;
      const url = new URL(
        anchor.getAttribute("href") || "",
        window.location.href,
      );
      if (
        url.origin === window.location.origin &&
        url.pathname !== window.location.pathname &&
        session.hasUnsaved
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        void canLeave().then((allowed) => {
          if (allowed) navigateTo(url.pathname + url.search + url.hash);
        });
      }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", navigate, true);
    };
  }, [session, canLeave, navigateTo]);
  return (
    <Context.Provider value={{ session, onUpdated, canLeave }}>
      <QueryClientProvider client={client}>
        {children}
        <TaskDiscardDialog open={confirmOpen} onDecision={settle} />
      </QueryClientProvider>
    </Context.Provider>
  );
}
