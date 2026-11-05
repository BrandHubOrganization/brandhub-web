import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";
import { useSurveyEditor } from "@/pages/tasks/hooks/useSurveyEditor";
import { SurveyEditorHeader } from "@/pages/tasks/components/survey/SurveyEditorHeader";
import { SurveyQuestionsView } from "@/pages/tasks/components/survey/SurveyQuestionsView";
import { SurveyAnalysisView } from "@/pages/tasks/components/survey/SurveyAnalysisView";
import { SurveyShareDialog } from "@/pages/tasks/components/survey/SurveyShareDialog";

export default function SurveyEditorPage() {
  const { id = "", taskId = "" } = useParams<{ id: string; taskId: string }>();
  const { t } = useTranslation();
  const editor = useSurveyEditor(id, taskId);

  if (editor.loading) {
    return (
      <div className="bg-background text-muted-foreground flex min-h-screen items-center justify-center p-8 text-sm">
        <Spinner className="text-brand-orange mr-2 size-6" />
        <span>{t("tasks.loading")}</span>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <SurveyEditorHeader
        formName={editor.formName}
        onFormNameChange={editor.setFormName}
        isPublished={editor.isPublished}
        spreadsheetUrl={editor.survey?.spreadsheetUrl}
        publicUrl={editor.publicUrl}
        totalResponses={editor.analysis?.totalResponses ?? 0}
        activeTab={editor.activeTab}
        onTabChange={editor.setActiveTab}
        onBack={editor.handleBack}
        onShare={() => editor.setShareOpen(true)}
        onSave={() => void editor.handleSave()}
        saving={editor.saving}
        saveStatus={editor.saveStatus}
        canEdit={editor.canEdit}
      />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {editor.canEdit && editor.activeTab === "questions" ? (
          <SurveyQuestionsView
            title={editor.title}
            description={editor.description}
            bannerUrl={editor.bannerUrl}
            onTitleChange={editor.setTitle}
            onDescriptionChange={editor.setDescription}
            onBannerChange={editor.setBannerUrl}
            questions={editor.questions}
            activeQuestionId={editor.activeQuestionId}
            onSelectQuestion={editor.setActiveQuestionId}
            onUpdateQuestion={editor.handleUpdateQuestion}
            onDuplicateQuestion={editor.handleDuplicateQuestion}
            onDeleteQuestion={editor.handleDeleteQuestion}
            onMoveQuestion={editor.handleMoveQuestion}
            onAddQuestion={editor.handleAddQuestion}
            onAddSection={editor.handleAddSection}
            onMergeSection={editor.handleMergeSection}
            onDuplicateSection={editor.handleDuplicateSection}
            onMoveSection={editor.handleMoveSection}
            onDeleteSection={editor.handleDeleteSection}
            onUpdateSectionNext={editor.handleUpdateSectionNext}
            onSave={() => void editor.handleSave()}
            saving={editor.saving}
            isPublished={editor.isPublished}
          />
        ) : (
          <SurveyAnalysisView workspaceId={id} taskId={taskId} />
        )}
      </main>

      {editor.isPublished && (
        <SurveyShareDialog
          open={editor.shareOpen}
          onOpenChange={editor.setShareOpen}
          surveyTitle={editor.title || editor.formName}
          publicUrl={editor.publicUrl}
          spreadsheetUrl={editor.survey?.spreadsheetUrl}
        />
      )}
    </div>
  );
}
