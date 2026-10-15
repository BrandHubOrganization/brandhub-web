import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export function TaskWorkflowError({
  message,
  fields = [],
}: {
  message: string;
  fields?: string[];
}) {
  const { t } = useTranslation();
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (message) container.current?.focus();
  }, [message, fields]);
  if (!message) return null;
  return (
    <div
      ref={container}
      tabIndex={-1}
      role="alert"
      className="border-destructive/40 text-destructive rounded-xl border p-3 text-sm focus-visible:outline-2"
    >
      <p>{message}</p>
      {fields.length > 0 && (
        <ul className="mt-2 list-inside list-disc">
          {fields.map((field) => (
            <li key={field}>
              <a className="underline" href={`#task-${field}`}>
                {t(`tasks.workflow.fields.${field}`)}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
