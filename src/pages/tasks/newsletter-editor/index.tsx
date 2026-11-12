import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";
import { useTaskSections } from "@/hooks/useTaskSections";
import { EmailBlockSection } from "@/pages/tasks/components/newsletter/EmailBlockSection";
import { EmailAudienceBlock } from "@/pages/tasks/components/newsletter/EmailAudienceBlock";
import { EmailReportBlock } from "@/pages/tasks/components/newsletter/EmailReportBlock";
import { TaskExportButton } from "@/components/task-sections/TaskExportButton";

export default function NewsletterEditorPage() {
  const { id = "", taskId = "" } = useParams<{ id: string; taskId: string }>();
  const { t } = useTranslation();
  const api = useTaskSections(id, taskId, Boolean(id && taskId));
  const sectionOf = (key: string) => api.sections?.find((s) => s.key === key);
  const contentSection = sectionOf("EMAIL.CONTENT");
  const designSection = sectionOf("EMAIL.DESIGN");
  const audienceSection = sectionOf("EMAIL.AUDIENCE");
  const reportSection = sectionOf("EMAIL.REPORT");

  if (api.isLoading) {
    return (
      <div className="bg-background text-muted-foreground flex min-h-screen items-center justify-center p-8 text-sm">
        <Spinner className="text-brand-orange mr-2 size-6" />
        <span>{t("tasks.loading")}</span>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 sm:px-6">
        <div className="flex justify-end">
          <TaskExportButton workspaceId={id} taskId={taskId} />
        </div>
        {contentSection && (
          <EmailBlockSection section={contentSection} api={api} />
        )}
        {designSection && (
          <EmailBlockSection
            section={designSection}
            api={api}
            showSubject={false}
          />
        )}
        {audienceSection && (
          <EmailAudienceBlock
            workspaceId={id}
            taskId={taskId}
            section={audienceSection}
            api={api}
          />
        )}
        {reportSection && (
          <EmailReportBlock
            workspaceId={id}
            taskId={taskId}
            section={reportSection}
            api={api}
          />
        )}
      </main>
    </div>
  );
}
