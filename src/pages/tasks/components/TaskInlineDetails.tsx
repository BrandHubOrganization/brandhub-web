import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskReferenceFields } from "@/pages/tasks/components/TaskReferenceFields";
import { InlineTaskField } from "@/pages/tasks/components/InlineTaskField";
import { TaskInlineAssignment } from "@/pages/tasks/components/TaskInlineAssignment";
import { useInlineTaskField } from "@/pages/tasks/hooks/useInlineTaskField";
import { useTaskWorkflow } from "@/pages/tasks/hooks/useTaskWorkflow";
import { taskInstant, taskLocalMinute } from "@/pages/tasks/taskWorkflowDates";
import type { TaskWorkflow } from "@/pages/tasks/types/taskWorkflow";

function readableDate(value: string | null, zone: string, language: string) {
  if (!value || !Number.isFinite(Date.parse(value))) return "";
  try {
    return new Intl.DateTimeFormat(language, {
      timeZone: zone,
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "";
  }
}
function safeReference(value: string) {
  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function TaskDeadlineField({
  task,
  scope = "detail",
}: {
  task: TaskWorkflow;
  scope?: string;
}) {
  const { t, i18n } = useTranslation();
  const state = useTaskWorkflow(task.workspaceId, task.id);
  const zone = task.dates.timezone || "UTC";
  return (
    <InlineTaskField
      id={`task-${task.id}-${scope}-deadline`}
      label={t("tasks.deadline")}
      type="datetime-local"
      value={taskLocalMinute(task.dueDate, zone)}
      displayValue={readableDate(task.dueDate, zone, i18n.language)}
      editable={task.allowedActions.canEditDetail && task.dates.ready}
      min={task.dates.minDate ? `${task.dates.minDate}T00:00` : undefined}
      max={task.dates.maxDate ? `${task.dates.maxDate}T23:59` : undefined}
      required={Boolean(task.assigneeId)}
      save={(value) =>
        state.field("dueDate", value ? taskInstant(value, zone) : null)
      }
      retry={state.retry}
    />
  );
}
function References({ task }: { task: TaskWorkflow }) {
  const { t } = useTranslation();
  const state = useTaskWorkflow(task.workspaceId, task.id);
  const field = useInlineTaskField(
    `task-${task.id}-references`,
    task.inputReferences,
    (value) => state.field("inputReferences", value),
  );
  if (!task.allowedActions.canEditDetail)
    return (
      <section className="space-y-2">
        <h3 className="text-sm font-medium">
          {t("tasks.workflow.fields.inputReferences")}
        </h3>
        <ul className="space-y-2 text-sm">
          {task.inputReferences.map((ref, index) => (
            <li key={index}>
              {safeReference(ref.url) ? (
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {ref.label}
                </a>
              ) : (
                ref.label
              )}
            </li>
          ))}
        </ul>
      </section>
    );
  return (
    <div
      className="space-y-2"
      onBlur={(event) => {
        if (
          field.status !== "error" &&
          !event.currentTarget.contains(event.relatedTarget as Node | null)
        )
          void field.commit();
      }}
    >
      <fieldset disabled={field.status === "saving"}>
        <TaskReferenceFields
          references={field.value}
          disabled={field.status === "saving"}
          onChange={field.change}
        />
      </fieldset>
      <p aria-live="polite" className="text-xs">
        {field.error ||
          (field.status === "saving"
            ? t("tasks.inline.saving")
            : field.status === "saved"
              ? t("tasks.inline.saved")
              : "")}
      </p>
      {field.error && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              state.retry();
              void field.commit();
            }}
          >
            {t("tasks.retry")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              state.retry();
              field.discard();
            }}
          >
            {t("tasks.inline.discard")}
          </Button>
        </div>
      )}
    </div>
  );
}
export function TaskInlineDetails({ task }: { task: TaskWorkflow }) {
  const { t, i18n } = useTranslation();
  const state = useTaskWorkflow(task.workspaceId, task.id);
  const zone = task.dates.timezone || "UTC";
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{t(`tasks.types.${task.type}`)}</Badge>
        <Badge variant="outline">{t(`tasks.status.${task.status}`)}</Badge>
        {task.reviewStep && (
          <span className="text-muted-foreground text-xs">
            {t(`tasks.inline.reviewSteps.${task.reviewStep}`)}
          </span>
        )}
      </div>
      <InlineTaskField
        id={`task-${task.id}-description`}
        label={t("tasks.workflow.fields.description")}
        value={task.description || ""}
        editable={task.allowedActions.canEditDetail}
        multiline
        maxLength={10000}
        required={Boolean(task.assigneeId)}
        save={(value) => state.field("description", value)}
        retry={state.retry}
      />
      <div className="border-y py-4">
        <TaskInlineAssignment task={task} />
      </div>
      <TaskDeadlineField task={task} />
      {task.type === "POST" && (
        <InlineTaskField
          id={`task-${task.id}-publish`}
          label={t("tasks.workflow.fields.plannedPublishAt")}
          value={taskLocalMinute(task.plannedPublishAt, zone)}
          displayValue={readableDate(
            task.plannedPublishAt,
            zone,
            i18n.language,
          )}
          type="datetime-local"
          editable={task.allowedActions.canEditDetail && task.dates.ready}
          min={taskLocalMinute(task.dueDate, zone) || undefined}
          max={task.dates.maxDate ? `${task.dates.maxDate}T23:59` : undefined}
          save={(value) =>
            state.field(
              "plannedPublishAt",
              value ? taskInstant(value, zone) : null,
            )
          }
          retry={state.retry}
        />
      )}
      <p className="text-muted-foreground text-xs">
        {t("tasks.workflow.timezone", { timezone: zone })}
      </p>
      <References task={task} />
      <div className="space-y-2 border-t pt-4 text-sm">
        <p className="text-muted-foreground">
          {t("tasks.source")}:{" "}
          {task.sourceType
            ? t(`tasks.sources.${task.sourceType}`)
            : t("tasks.missing")}
        </p>
        {task.campaignId && (
          <Link
            className="block underline"
            to={`/workspaces/${task.workspaceId}/campaigns`}
          >
            {task.campaignName || t("tasks.openCampaign")}
          </Link>
        )}
        {task.sourceType === "CONTENT_REQUEST" && task.sourceRefId && (
          <Link
            className="block underline"
            to={`/workspaces/${task.workspaceId}/requests?request=${encodeURIComponent(task.sourceRefId)}`}
          >
            {t("tasks.openRequest")}
          </Link>
        )}
      </div>
    </div>
  );
}
