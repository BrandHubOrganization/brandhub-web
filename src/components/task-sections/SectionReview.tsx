import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock, Inbox, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SectionContentView,
  type SectionMedia,
} from "@/components/task-sections/SectionContentView";
import { SectionReturnDialog } from "@/components/task-sections/SectionReturnDialog";
import { SectionStatusBadge } from "@/components/task-sections/SectionStatusBadge";
import { taskPostService } from "@/pages/editor/services/taskPostService";
import { taskSectionService } from "@/services/taskSectionService";
import { errorCode } from "@/utils/error";
import {
  opensPostEditor,
  type TaskSection,
  type TaskType,
} from "@/types/task";

type Decide = (
  taskId: string,
  section: TaskSection,
  action: "approve" | "return",
  note?: string,
) => Promise<boolean>;

const isMediaSection = (key: string) =>
  key.endsWith(".MEDIA") || key.endsWith(".EDIT");

/** Approve / return one section, then refresh every list that shows it. */
function useSectionDecision(workspaceId: string): Decide {
  const { t } = useTranslation();
  const qc = useQueryClient();
  return async (taskId, section, action, note) => {
    try {
      await taskSectionService.act(
        workspaceId,
        taskId,
        section.key,
        action,
        note,
      );
      toast.success(
        t(
          action === "approve"
            ? "tasks.sectionReview.approved"
            : "tasks.sectionReview.returned",
        ),
      );
      return true;
    } catch (err) {
      const code = errorCode(err) ?? "UNKNOWN";
      toast.error(
        t(`tasks.sectionActions.errors.${code}`, {
          defaultValue: t("tasks.sectionActions.errors.UNKNOWN"),
        }),
      );
      return false;
    } finally {
      void qc.invalidateQueries({ queryKey: ["sections-client-pending"] });
      void qc.invalidateQueries({
        queryKey: ["task-sections", workspaceId, taskId],
      });
      void qc.invalidateQueries({ queryKey: ["task-workflow"] });
    }
  };
}

/** Post media with resolved URLs; section rows only store storage keys. */
function usePostMedia(
  workspaceId: string,
  taskId: string,
  taskType: TaskType,
  enabled: boolean,
) {
  const query = useQuery({
    queryKey: ["task-post-media", workspaceId, taskId],
    queryFn: () => taskPostService.read(workspaceId, taskId),
    enabled: enabled && opensPostEditor(taskType),
    refetchOnWindowFocus: false,
    retry: false,
  });
  return query.data?.post?.media as SectionMedia[] | undefined;
}

function SectionReviewCard({
  taskId,
  section,
  media,
  decide,
}: {
  taskId: string;
  section: TaskSection;
  media?: SectionMedia[];
  decide: Decide;
}) {
  const { t, i18n } = useTranslation();
  const [returning, setReturning] = useState(false);
  const [busy, setBusy] = useState(false);
  const title = t(`tasks.sections.${section.key}.title`, {
    defaultValue: section.key,
  });
  const approve = async () => {
    setBusy(true);
    try {
      await decide(taskId, section, "approve");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section
      aria-label={title}
      className="bg-background rounded-lg border"
      data-section-key={section.key}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold">{title}</h4>
          <SectionStatusBadge status={section.status} />
          {section.clientPendingSince &&
            section.status === "INTERNAL_APPROVED" && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Clock className="size-3" aria-hidden="true" />
                {t("tasks.sectionReview.waitingSince", {
                  date: new Date(section.clientPendingSince).toLocaleString(
                    i18n.language,
                  ),
                })}
              </span>
            )}
        </div>
        {(section.canApprove || section.canReturn) && (
          <div className="flex items-center gap-2">
            {section.canReturn && (
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => setReturning(true)}
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                {t("tasks.sectionActions.return")}
              </Button>
            )}
            {section.canApprove && (
              <Button
                size="sm"
                variant="orange"
                loading={busy}
                onClick={() => void approve()}
              >
                <Check className="size-3.5" aria-hidden="true" />
                {t("tasks.sectionActions.approve")}
              </Button>
            )}
          </div>
        )}
      </header>
      {section.status === "RETURNED" && section.returnNote && (
        <p
          role="status"
          className="border-b border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200"
        >
          <span className="font-medium">{t("editor.sections.returned")} </span>
          {section.returnNote}
        </p>
      )}
      <div className="p-3">
        <SectionContentView
          section={section}
          media={isMediaSection(section.key) ? media : undefined}
        />
      </div>
      {returning && (
        <SectionReturnDialog
          action="return"
          sectionTitle={title}
          onClose={() => setReturning(false)}
          onConfirm={async (note) => {
            if (await decide(taskId, section, "return", note))
              setReturning(false);
          }}
        />
      )}
    </section>
  );
}

function ReviewTask({
  workspaceId,
  taskId,
  taskType,
  sections,
  decide,
}: {
  workspaceId: string;
  taskId: string;
  taskType: TaskType;
  sections: TaskSection[];
  decide: Decide;
}) {
  const media = usePostMedia(
    workspaceId,
    taskId,
    taskType,
    sections.some((section) => isMediaSection(section.key)),
  );
  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <SectionReviewCard
          key={section.key}
          taskId={taskId}
          section={section}
          media={media}
          decide={decide}
        />
      ))}
    </div>
  );
}

/** Workspace queue: sections waiting for the Client, grouped by task (spec §8 Client portal). */
export function SectionApprovalQueue({ workspaceId }: { workspaceId: string }) {
  const { t, i18n } = useTranslation();
  const decide = useSectionDecision(workspaceId);
  const query = useQuery({
    queryKey: ["sections-client-pending", workspaceId],
    queryFn: () => taskSectionService.clientPending(workspaceId),
    enabled: Boolean(workspaceId),
    refetchOnWindowFocus: false,
  });
  const tasks = query.data ?? [];
  const count = tasks.reduce((sum, task) => sum + task.sections.length, 0);
  return (
    <section
      aria-labelledby="section-approval-queue"
      className="bg-card overflow-hidden rounded-xl border"
    >
      <header className="bg-muted/10 border-b p-4">
        <h2 id="section-approval-queue" className="text-sm font-bold">
          {t("tasks.sectionReview.queueTitle")}
          {count > 0 && (
            <span className="bg-brand-orange ml-2 rounded-full px-2 py-0.5 text-xs font-semibold text-white">
              {count}
            </span>
          )}
        </h2>
        <p className="text-muted-foreground text-xs">
          {t("tasks.sectionReview.queueHint")}
        </p>
      </header>
      <div className="space-y-5 p-4">
        {query.isPending && <Skeleton className="h-32 rounded-lg" />}
        {query.isError && (
          <div role="alert" className="space-y-2 text-sm">
            <p>{t("tasks.sectionReview.loadError")}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void query.refetch()}
            >
              {t("tasks.retry")}
            </Button>
          </div>
        )}
        {query.isSuccess && tasks.length === 0 && (
          <div className="text-muted-foreground flex flex-col items-center gap-2 py-8 text-center text-sm">
            <Inbox className="size-8" aria-hidden="true" />
            {t("tasks.sectionReview.empty")}
          </div>
        )}
        {tasks.map((task) => (
          <article key={task.taskId} className="space-y-3">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h3 className="text-sm font-semibold break-words">
                {task.taskName}
              </h3>
              <span className="text-muted-foreground text-xs">
                {t(`tasks.types.${task.taskType}`, {
                  defaultValue: task.taskType,
                })}
                {task.dueDate &&
                  ` · ${t("tasks.deadline")}: ${new Date(task.dueDate).toLocaleDateString(i18n.language)}`}
              </span>
            </div>
            <ReviewTask
              workspaceId={workspaceId}
              taskId={task.taskId}
              taskType={task.taskType}
              sections={task.sections}
              decide={decide}
            />
          </article>
        ))}
      </div>
    </section>
  );
}

/**
 * Per-section review of one role task on the approval page: every section the caller may see,
 * with Approve / Return where the server allows it. Renders nothing for tasks without role subtasks.
 */
export function TaskSectionsReview({
  workspaceId,
  taskId,
  taskType,
}: {
  workspaceId: string;
  taskId: string;
  taskType: TaskType;
}) {
  const { t } = useTranslation();
  const decide = useSectionDecision(workspaceId);
  const query = useQuery({
    queryKey: ["task-sections", workspaceId, taskId],
    queryFn: () => taskSectionService.list(workspaceId, taskId),
    enabled: Boolean(workspaceId && taskId),
    refetchOnWindowFocus: false,
    retry: false,
  });
  const sections = query.data ?? [];
  if (!sections.some((section) => section.ownerSubtaskIds.length > 0))
    return null;
  const done = sections.filter((section) => section.finalState).length;
  return (
    <section aria-labelledby="task-sections-review" className="mb-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="task-sections-review" className="text-sm font-semibold">
          {t("tasks.sectionReview.taskTitle")}
        </h3>
        <span className="text-muted-foreground text-xs">
          {t("tasks.sectionReview.progress", { done, total: sections.length })}
        </span>
      </div>
      <ReviewTask
        workspaceId={workspaceId}
        taskId={taskId}
        taskType={taskType}
        sections={sections}
        decide={decide}
      />
    </section>
  );
}
