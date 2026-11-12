import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";
import { useTaskSections } from "@/hooks/useTaskSections";
import { useSurveyEditor } from "@/pages/tasks/hooks/useSurveyEditor";
import { SectionFieldsBlock } from "@/components/task-sections/SectionFieldsBlock";
import { SectionFrame } from "@/components/task-sections/SectionFrame";
import { TaskExportButton } from "@/components/task-sections/TaskExportButton";
import { SurveyQuestionsView } from "@/pages/tasks/components/survey/SurveyQuestionsView";

const BEFORE_REGISTRATION = [
  "WORKSHOP.PROGRAM",
  "WORKSHOP.SPEAKERS",
  "WORKSHOP.LOGISTICS",
];
const AFTER_REGISTRATION = ["WORKSHOP.REPORT"];

export default function WorkshopEditorPage() {
  const { id = "", taskId = "" } = useParams<{ id: string; taskId: string }>();
  const { t } = useTranslation();
  const api = useTaskSections(id, taskId, Boolean(id && taskId));
  const registrationEditor = useSurveyEditor(id, taskId);
  const registrationSection = api.sections?.find(
    (s) => s.key === "WORKSHOP.REGISTRATION",
  );

  if (api.isLoading || registrationEditor.loading) {
    return (
      <div className="bg-background text-muted-foreground flex min-h-screen items-center justify-center p-8 text-sm">
        <Spinner className="text-brand-orange mr-2 size-6" />
        <span>{t("tasks.loading")}</span>
      </div>
    );
  }

  const registrationView = (
    <SurveyQuestionsView
      title={registrationEditor.title}
      description={registrationEditor.description}
      bannerUrl={registrationEditor.bannerUrl}
      onTitleChange={registrationEditor.setTitle}
      onDescriptionChange={registrationEditor.setDescription}
      onBannerChange={registrationEditor.setBannerUrl}
      questions={registrationEditor.questions}
      activeQuestionId={registrationEditor.activeQuestionId}
      onSelectQuestion={registrationEditor.setActiveQuestionId}
      onUpdateQuestion={registrationEditor.handleUpdateQuestion}
      onDuplicateQuestion={registrationEditor.handleDuplicateQuestion}
      onDeleteQuestion={registrationEditor.handleDeleteQuestion}
      onMoveQuestion={registrationEditor.handleMoveQuestion}
      onAddQuestion={registrationEditor.handleAddQuestion}
      onAddSection={registrationEditor.handleAddSection}
      onMergeSection={registrationEditor.handleMergeSection}
      onDuplicateSection={registrationEditor.handleDuplicateSection}
      onMoveSection={registrationEditor.handleMoveSection}
      onDeleteSection={registrationEditor.handleDeleteSection}
      onUpdateSectionNext={registrationEditor.handleUpdateSectionNext}
      onSave={() => void registrationEditor.handleSave()}
      saving={registrationEditor.saving}
      isPublished={registrationEditor.isPublished}
    />
  );

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-4xl space-y-4 px-4 py-8 sm:px-6">
        <div className="flex justify-end">
          <TaskExportButton workspaceId={id} taskId={taskId} />
        </div>
        {BEFORE_REGISTRATION.map((key) => {
          const section = api.sections?.find((s) => s.key === key);
          return section ? (
            <SectionFieldsBlock key={key} section={section} api={api} />
          ) : null;
        })}
        {registrationSection ? (
          <SectionFrame
            section={registrationSection}
            api={api}
            saveBinding={{
              dirty: false,
              state:
                registrationEditor.saveStatus === "saving"
                  ? "saving"
                  : undefined,
              save: async () => {
                await registrationEditor.handleSave();
                return true;
              },
            }}
          >
            {registrationView}
          </SectionFrame>
        ) : (
          registrationView
        )}
        {AFTER_REGISTRATION.map((key) => {
          const section = api.sections?.find((s) => s.key === key);
          return section ? (
            <SectionFieldsBlock key={key} section={section} api={api} />
          ) : null;
        })}
      </main>
    </div>
  );
}
