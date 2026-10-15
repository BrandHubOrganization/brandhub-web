import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TaskReference } from "@/pages/tasks/types/taskWorkflow";

export function TaskReferenceFields({
  references,
  onChange,
  disabled,
}: {
  references: TaskReference[];
  onChange: (references: TaskReference[]) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const patch = (index: number, update: Partial<TaskReference>) =>
    onChange(
      references.map((reference, position) =>
        position === index ? { ...reference, ...update } : reference,
      ),
    );
  return (
    <fieldset
      id="task-inputReferences"
      disabled={disabled}
      className="space-y-3"
    >
      <legend className="mb-2 text-sm font-medium">
        {t("tasks.workflow.fields.inputReferences")}
      </legend>
      {references.map((reference, index) => (
        <div
          key={index}
          className="grid items-end gap-3 rounded-xl border p-3 md:grid-cols-[1fr_2fr_auto]"
        >
          <Input
            label={t("tasks.workflow.referenceLabel")}
            required
            maxLength={200}
            value={reference.label}
            onChange={(event) => patch(index, { label: event.target.value })}
          />
          <Input
            type="url"
            label={t("tasks.workflow.referenceUrl")}
            required
            maxLength={2048}
            value={reference.url}
            onChange={(event) => patch(index, { url: event.target.value })}
          />
          <Button
            type="button"
            variant="outline"
            aria-label={t("tasks.workflow.removeReference", {
              number: index + 1,
            })}
            onClick={() =>
              onChange(references.filter((_, position) => position !== index))
            }
          >
            {t("tasks.workflow.remove")}
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        disabled={references.length >= 20}
        onClick={() => onChange([...references, { label: "", url: "" }])}
      >
        {t("tasks.workflow.addReference")}
      </Button>
    </fieldset>
  );
}
