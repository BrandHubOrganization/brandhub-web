import { useTranslation } from "react-i18next";
import { PlusCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SurveyHeaderCard } from "@/pages/tasks/components/survey/SurveyHeaderCard";
import { SurveyQuestionItem } from "@/pages/tasks/components/survey/SurveyQuestionItem";
import type { SurveyQuestion } from "@/pages/tasks/types/survey";

interface SurveyQuestionsViewProps {
  title: string;
  description: string;
  onTitleChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  questions: SurveyQuestion[];
  activeQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  onUpdateQuestion: (index: number, updates: Partial<SurveyQuestion>) => void;
  onDuplicateQuestion: (index: number) => void;
  onDeleteQuestion: (index: number) => void;
  onAddQuestion: () => void;
  onSave: () => void;
  saving: boolean;
  isPublished: boolean;
}

export function SurveyQuestionsView({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  questions,
  activeQuestionId,
  onSelectQuestion,
  onUpdateQuestion,
  onDuplicateQuestion,
  onDeleteQuestion,
  onAddQuestion,
  onSave,
  saving,
  isPublished,
}: SurveyQuestionsViewProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Google Forms Iconic Top Header Card */}
      <SurveyHeaderCard
        title={title}
        description={description}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
      />

      {/* Questions Stack */}
      <div className="space-y-4">
        {questions.map((question, qIndex) => (
          <SurveyQuestionItem
            key={question.id}
            question={question}
            isActive={activeQuestionId === question.id}
            onSelect={() => onSelectQuestion(question.id)}
            onUpdate={(updates) => onUpdateQuestion(qIndex, updates)}
            onDuplicate={() => onDuplicateQuestion(qIndex)}
            onDelete={() => onDeleteQuestion(qIndex)}
          />
        ))}
      </div>

      {/* Bottom Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onAddQuestion}
          className="gap-2 border-border/80 hover:border-brand-orange/60 hover:text-brand-orange"
        >
          <PlusCircle className="size-4" />
          <span>{t("tasks.survey.addQuestion")}</span>
        </Button>

        <Button
          type="button"
          variant="orange"
          onClick={onSave}
          disabled={saving}
          className="gap-2 shadow-xs"
        >
          {saving ? (
            <Spinner className="size-4" />
          ) : (
            <Sparkles className="size-4" />
          )}
          <span>
            {saving
              ? t("tasks.survey.saving")
              : isPublished
                ? t("tasks.survey.saveButton")
                : t("tasks.survey.publishButton")}
          </span>
        </Button>
      </div>
    </div>
  );
}
