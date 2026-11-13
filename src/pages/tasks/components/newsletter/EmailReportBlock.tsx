import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RichTextInput } from "@/components/ui/rich-text-input";
import { SectionFrame } from "@/components/task-sections/SectionFrame";
import {
  newsletterService,
  type NewsletterReport,
} from "@/pages/tasks/services/newsletterService";
import type { TaskSectionsApi } from "@/hooks/useTaskSections";
import type { TaskSection } from "@/types/task";

const asText = (value: unknown) => (typeof value === "string" ? value : "");

/** EMAIL.REPORT: live batch stats (no open/click per spec §16.3) + a manual note. */
export function EmailReportBlock({
  workspaceId,
  taskId,
  section,
  api,
}: {
  workspaceId: string;
  taskId: string;
  section: TaskSection;
  api: TaskSectionsApi;
}) {
  const { t } = useTranslation();
  const content = api.contentOf(section);
  const note = asText(content.note);
  const [report, setReport] = useState<NewsletterReport | null>(null);

  useEffect(() => {
    newsletterService
      .report(workspaceId, taskId)
      .then(setReport)
      .catch(() => setReport(null));
  }, [workspaceId, taskId]);

  const stats = [
    { key: "total", value: report?.total },
    { key: "sentCount", value: report?.sent },
    { key: "bounceCount", value: report?.failed },
    { key: "unsubscribeCount", value: report?.unsubscribed },
  ];
  const isEmpty = !report?.batchId && !note.trim();

  return (
    <SectionFrame section={section} api={api} isEmpty={isEmpty}>
      <div className="space-y-3">
        {report?.batchId ? (
          <div className="grid grid-cols-2 gap-2 rounded-md border p-3 text-sm sm:grid-cols-4">
            {stats.map(({ key, value }) => (
              <div key={key}>
                <div className="text-muted-foreground text-xs">
                  {t(`tasks.sections.EMAIL.REPORT.fields.${key}`, {
                    defaultValue: key,
                  })}
                </div>
                <div className="font-semibold">{value ?? 0}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            {t("tasks.newsletter.noBatchYet")}
          </p>
        )}
        <div className="space-y-1">
          <RichTextInput
            label={t("tasks.sections.EMAIL.REPORT.fields.note")}
            value={note}
            disabled={!section.canEdit}
            onChange={(html) => api.edit(section, { note: html })}
          />
        </div>
      </div>
    </SectionFrame>
  );
}
