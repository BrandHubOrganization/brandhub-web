import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { TaskEditSession } from "@/pages/tasks/taskEditSession";

interface SessionValue {
  session: TaskEditSession;
  onUpdated: () => void;
  canLeave: () => boolean;
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
  const canLeave = useCallback(() => {
    if (session.pending) {
      toast.info(t("tasks.inline.waitSaving"));
      return false;
    }
    if (session.hasUnsaved && !window.confirm(t("tasks.inline.discardWarning")))
      return false;
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
        !canLeave()
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", navigate, true);
    };
  }, [session, canLeave]);
  return (
    <Context.Provider value={{ session, onUpdated, canLeave }}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </Context.Provider>
  );
}
