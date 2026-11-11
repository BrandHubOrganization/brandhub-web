import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";
import { useTaskSections } from "@/hooks/useTaskSections";
import { SectionFieldsBlock } from "@/components/task-sections/SectionFieldsBlock";

const SECTION_KEYS = [
  "KOL.SHORTLIST",
  "KOL.DEAL",
  "KOL.BRIEF",
  "KOL.DRAFT",
  "KOL.REPORT",
];

export default function KolEditorPage() {
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
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-4xl space-y-4 px-4 py-8 sm:px-6">
        {SECTION_KEYS.map((key) => {
          const section = api.sections?.find((s) => s.key === key);
          return section ? (
            <SectionFieldsBlock key={key} section={section} api={api} />
          ) : null;
        })}
      </main>
    </div>
  );
}
