import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { PlusCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SurveyPublishCard } from "./SurveyPublishCard";
import { SurveyHeaderCard } from "./SurveyHeaderCard";
import { SurveyQuestionItem } from "./SurveyQuestionItem";
import { surveyService } from "@/services/surveyService";
import type { SurveyModel, SurveyQuestion } from "@/pages/tasks/types/survey";

interface SurveyFormBuilderProps {
  workspaceId: string; taskId: string; taskTitle: string; onUpdated?: () => void;
}

const createDefaultQ = (t: TFunction): SurveyQuestion => ({
  id: "q_" + Math.random().toString(36).slice(2, 9), type: "MULTIPLE_CHOICE", label: "", timeSlot: "00:00",
  options: [t("tasks.survey.optionPlaceholder", { index: 1 }), t("tasks.survey.optionPlaceholder", { index: 2 })], required: true,
});

export function SurveyFormBuilder({ workspaceId, taskId, taskTitle, onUpdated }: SurveyFormBuilderProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [survey, setSurvey] = useState<SurveyModel | null>(null);
  const [title, setTitle] = useState(taskTitle || "");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void surveyService.getSurvey(workspaceId, taskId).then((data) => {
      if (!mounted) return;
      setSurvey(data);
      setTitle(data.title || taskTitle || "");
      setDescription(data.description || "");
      const qs = data.questions?.length ? data.questions : [createDefaultQ(t)];
      setQuestions(qs);
      setActiveQuestionId(qs[0].id);
    }).catch(() => {
      if (!mounted) return;
      setQuestions([createDefaultQ(t)]);
      setActiveQuestionId(questions[0]?.id || null);
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [workspaceId, taskId, taskTitle, t]);

  const handleAddQuestion = () => {
    const newQ = { ...createDefaultQ(t), required: false };
    setQuestions((prev) => [...prev, newQ]);
    setActiveQuestionId(newQ.id);
  };
  const handleDuplicateQuestion = (idx: number) => {
    const q = questions[idx];
    const clone = { ...q, id: "q_" + Math.random().toString(36).slice(2, 9), options: q.options ? [...q.options] : undefined };
    setQuestions((prev) => [...prev.slice(0, idx + 1), clone, ...prev.slice(idx + 1)]);
    setActiveQuestionId(clone.id);
  };
  const handleDeleteQuestion = (idx: number) => {
    if (questions.length <= 1) return toast.error(t("tasks.survey.emptyQuestions"));
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    if (activeQuestionId === questions[idx].id) setActiveQuestionId(updated[Math.max(0, idx - 1)]?.id || null);
  };

  const handleSave = async () => {
    if (!title.trim()) return toast.error(t("tasks.survey.titlePlaceholder"));
    if (questions.length === 0) return toast.error(t("tasks.survey.emptyQuestions"));
    try {
      setSaving(true);
      const saved = await surveyService.saveSurvey(workspaceId, taskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        questions: questions.map((q) => ({ ...q, label: q.label.trim() || t("tasks.survey.questionTitlePlaceholder") })),
      });
      setSurvey(saved);
      toast.success(t("tasks.survey.savedSuccess"));
      onUpdated?.();
    } catch { toast.error(t("tasks.survey.saveError")); } finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8 text-muted-foreground text-sm"><Spinner className="size-5 mr-2" /><span>{t("tasks.loading")}</span></div>;
  }

  return (
    <div className="space-y-6">
      <SurveyPublishCard survey={survey} />
      <SurveyHeaderCard title={title} description={description} onTitleChange={setTitle} onDescriptionChange={setDescription} />
      <div className="space-y-4">
        {questions.map((question, qIndex) => (
          <SurveyQuestionItem
            key={question.id}
            question={question}
            isActive={activeQuestionId === question.id}
            onSelect={() => setActiveQuestionId(question.id)}
            onUpdate={(updates) => setQuestions((prev) => prev.map((q, i) => (i === qIndex ? { ...q, ...updates } : q)))}
            onDuplicate={() => handleDuplicateQuestion(qIndex)}
            onDelete={() => handleDeleteQuestion(qIndex)}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button type="button" variant="outline" onClick={handleAddQuestion} className="gap-2 border-border/80 hover:border-brand-orange/60 hover:text-brand-orange">
          <PlusCircle className="size-4" /><span>{t("tasks.survey.addQuestion")}</span>
        </Button>
        <Button type="button" variant="orange" onClick={() => void handleSave()} disabled={saving} className="gap-2 shadow-xs">
          {saving ? <Spinner className="size-4" /> : <Sparkles className="size-4" />}
          <span>{saving ? t("tasks.survey.saving") : survey?.publicLink ? t("tasks.survey.saveButton") : t("tasks.survey.publishButton")}</span>
        </Button>
      </div>
    </div>
  );
}
