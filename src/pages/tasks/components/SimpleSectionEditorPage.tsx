import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useTaskSections } from "@/hooks/useTaskSections";
import { SectionFieldsBlock } from "@/components/task-sections/SectionFieldsBlock";
import { TaskExportButton } from "@/components/task-sections/TaskExportButton";

/** Shared shell for task-type editors that are just a flat list of plain field-block sections (Event/Press/Kol). */
export function SimpleSectionEditorPage({
  sectionKeys,
}: {
  sectionKeys: string[];
}) {
  const { id = "", taskId = "" } = useParams<{ id: string; taskId: string }>();
  const { t } = useTranslation();
  const api = useTaskSections(id, taskId, Boolean(id && taskId));

  if (api.isLoading) {
    return (
      <div className="bg-background text-muted-foreground flex min-h-screen items-center justify-center p-8 text-sm">
        <Spinner className="text-brand-orange mr-2 size-6" />
        <span>{t("tasks.loading")}</span>
      </div>
    );
  }

  return (
    <PageWrapper
      title={t("tasks.title")}
      description={t("tasks.description")}
      guideUrl="/help/guide#tasks"
      compact
      fullWidth={false}
      actions={<TaskExportButton workspaceId={id} taskId={taskId} />}
      contentClassName="mx-auto max-w-4xl space-y-4"
    >
      {sectionKeys.map((key) => {
        const section = api.sections?.find((s) => s.key === key);
        return section ? (
          <SectionFieldsBlock key={key} section={section} api={api} />
        ) : null;
      })}
    </PageWrapper>
  );
}
