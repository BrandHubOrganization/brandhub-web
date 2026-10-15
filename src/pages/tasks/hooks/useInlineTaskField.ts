import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTaskEditContext } from "@/pages/tasks/components/TaskWorkflowProvider";
import { workflowError } from "@/pages/tasks/taskWorkflowErrors";

export function useInlineTaskField<T>(
  id: string,
  value: T,
  save: (value: T) => Promise<unknown>,
) {
  const { t } = useTranslation();
  const { session } = useTaskEditContext();
  const [draft, setDraft] = useState<{ value: T } | null>(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const pending = useRef(false);
  useEffect(() => () => session.setDirty(id, false), [id, session]);
  function change(next: T) {
    setDraft({ value: next });
    session.setDirty(id, true);
    setError("");
    setStatus("idle");
  }
  function discard() {
    setDraft(null);
    setError("");
    setStatus("idle");
    session.setDirty(id, false);
  }
  async function commit(override?: T) {
    if (pending.current || (override === undefined && !draft)) return false;
    const next = override === undefined ? draft!.value : override;
    if (JSON.stringify(next) === JSON.stringify(value)) {
      discard();
      return true;
    }
    pending.current = true;
    setStatus("saving");
    setError("");
    try {
      await save(next);
      setDraft(null);
      session.setDirty(id, false);
      setStatus("saved");
      return true;
    } catch (failure) {
      setDraft({ value: next });
      session.setDirty(id, true);
      setError(
        failure instanceof Error && failure.message === "INVALID_LOCAL_TIME"
          ? t("tasks.workflow.invalidDate")
          : workflowError(failure, t),
      );
      setStatus("error");
      return false;
    } finally {
      pending.current = false;
    }
  }
  function invalid() {
    setError(t("tasks.workflow.invalidField"));
    setStatus("error");
  }
  return {
    value: draft ? draft.value : value,
    status,
    error,
    change,
    discard,
    commit,
    invalid,
    dirty: draft !== null,
  };
}
