import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { surveyService } from "@/services/surveyService";
import { SurveyShareDialog } from "@/pages/tasks/components/survey/SurveyShareDialog";
import { SurveyAnalysisView } from "@/pages/tasks/components/survey/SurveyAnalysisView";
import { SurveyEditorHeader } from "./SurveyEditorHeader";
import { SurveyQuestionsView } from "./SurveyQuestionsView";
import type {
  SurveyModel,
  SurveyQuestion,
  SurveyAnalysis,
  SurveySaveRequest,
} from "@/pages/tasks/types/survey";

const createDefaultQ = (t: TFunction): SurveyQuestion => ({
  id: "q_" + Math.random().toString(36).slice(2, 9),
  type: "MULTIPLE_CHOICE",
  label: "",
  timeSlot: "00:00",
  options: [
    t("tasks.survey.optionPlaceholder", { index: 1 }),
    t("tasks.survey.optionPlaceholder", { index: 2 }),
  ],
  required: true,
});

const buildSurveyPayload = (
  rawFormName: string,
  rawTitle: string,
  rawDescription: string,
  rawQuestions: SurveyQuestion[],
  fallbackTitle: string,
): SurveySaveRequest => ({
  formName: rawFormName.trim() || undefined,
  title: rawTitle.trim() || rawFormName.trim() || "Untitled form",
  description: rawDescription.trim() || undefined,
  questions: rawQuestions.map((q) => ({
    ...q,
    label: q.label.trim() || fallbackTitle,
  })),
});

export default function SurveyEditorPage() {
  const { id = "", taskId = "" } = useParams<{ id: string; taskId: string }>();
  const workspaceId = id;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const isInitialLoadRef = useRef(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedPayloadRef = useRef<string>("");

  const [survey, setSurvey] = useState<SurveyModel | null>(null);
  const [analysis, setAnalysis] = useState<SurveyAnalysis | null>(null);
  const [formName, setFormName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"questions" | "responses">("questions");
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const [surveyRes, analysisRes] = await Promise.allSettled([
          surveyService.getSurvey(workspaceId, taskId),
          surveyService.getSurveyAnalysis(workspaceId, taskId),
        ]);
        if (!mounted) return;
        if (surveyRes.status === "fulfilled") {
          const data = surveyRes.value;
          setSurvey(data);
          const fVal = data.formName || data.title || "";
          const tVal = data.title || "";
          const dVal = data.description || "";
          const qs = data.questions?.length ? data.questions : [createDefaultQ(t)];
          setFormName(fVal);
          setTitle(tVal);
          setDescription(dVal);
          setQuestions(qs);
          setActiveQuestionId(qs[0].id);
          lastSavedPayloadRef.current = JSON.stringify(
            buildSurveyPayload(fVal, tVal, dVal, qs, t("tasks.survey.questionTitlePlaceholder")),
          );
        } else {
          const fallback = [createDefaultQ(t)];
          setFormName("");
          setTitle("");
          setDescription("");
          setQuestions(fallback);
          setActiveQuestionId(fallback[0].id);
          lastSavedPayloadRef.current = JSON.stringify(
            buildSurveyPayload("", "", "", fallback, t("tasks.survey.questionTitlePlaceholder")),
          );
        }
        if (analysisRes.status === "fulfilled") {
          setAnalysis(analysisRes.value);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void init();
    return () => {
      mounted = false;
    };
  }, [workspaceId, taskId, t]);

  const handleBack = useCallback(() => {
    navigate(`/workspaces/${encodeURIComponent(workspaceId)}/tasks?task=${encodeURIComponent(taskId)}`);
  }, [navigate, workspaceId, taskId]);

  const handleAddQuestion = () => {
    const newQ = { ...createDefaultQ(t), required: false };
    setQuestions((prev) => [...prev, newQ]);
    setActiveQuestionId(newQ.id);
  };

  const handleDuplicateQuestion = (idx: number) => {
    const q = questions[idx];
    const clone: SurveyQuestion = {
      ...q,
      id: "q_" + Math.random().toString(36).slice(2, 9),
      options: q.options ? [...q.options] : undefined,
    };
    setQuestions((prev) => [...prev.slice(0, idx + 1), clone, ...prev.slice(idx + 1)]);
    setActiveQuestionId(clone.id);
  };

  const handleDeleteQuestion = (idx: number) => {
    if (questions.length <= 1) {
      toast.error(t("tasks.survey.emptyQuestions"));
      return;
    }
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    if (activeQuestionId === questions[idx]?.id) {
      setActiveQuestionId(updated[Math.max(0, idx - 1)]?.id || null);
    }
  };

  const handleUpdateQuestion = (idx: number, updates: Partial<SurveyQuestion>) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...updates } : q)));
  };

  const handleSave = async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (questions.length === 0) {
      toast.error(t("tasks.survey.emptyQuestions"));
      return;
    }
    try {
      setSaving(true);
      setSaveStatus("saving");
      const payload = buildSurveyPayload(
        formName,
        title,
        description,
        questions,
        t("tasks.survey.questionTitlePlaceholder"),
      );
      const saved = await surveyService.saveSurvey(workspaceId, taskId, payload);
      setSurvey(saved);
      lastSavedPayloadRef.current = JSON.stringify(payload);
      setSaveStatus("saved");
      toast.success(t("tasks.survey.savedSuccess"));
    } catch {
      setSaveStatus("error");
      toast.error(t("tasks.survey.saveError"));
    } finally {
      setSaving(false);
    }
  };

  // Debounced auto-save (1500ms)
  useEffect(() => {
    if (loading || isInitialLoadRef.current) {
      if (!loading && isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }
      return;
    }

    if (questions.length === 0) {
      return;
    }

    const payload = buildSurveyPayload(
      formName,
      title,
      description,
      questions,
      t("tasks.survey.questionTitlePlaceholder"),
    );
    const payloadStr = JSON.stringify(payload);
    if (payloadStr === lastSavedPayloadRef.current) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setSaveStatus("saving");
        const saved = await surveyService.saveSurvey(workspaceId, taskId, payload);
        setSurvey(saved);
        lastSavedPayloadRef.current = payloadStr;
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 1500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formName, title, description, questions, workspaceId, taskId, loading, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8 text-muted-foreground text-sm">
        <Spinner className="size-6 mr-2 text-brand-orange" />
        <span>{t("tasks.loading")}</span>
      </div>
    );
  }

  const isPublished = Boolean(survey?.publicLink || survey?.publicToken);
  const publicUrl = survey?.publicLink
    ? survey.publicLink
    : survey?.publicToken
      ? `${window.location.origin}/public/surveys/${survey.publicToken}`
      : "";

  return (
    <div className="min-h-screen bg-background">
      <SurveyEditorHeader
        formName={formName}
        onFormNameChange={setFormName}
        isPublished={isPublished}
        spreadsheetUrl={survey?.spreadsheetUrl}
        publicUrl={publicUrl}
        totalResponses={analysis?.totalResponses ?? 0}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={handleBack}
        onShare={() => setShareOpen(true)}
        onSave={() => void handleSave()}
        saving={saving}
        saveStatus={saveStatus}
      />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        {activeTab === "questions" ? (
          <SurveyQuestionsView
            title={title}
            description={description}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            questions={questions}
            activeQuestionId={activeQuestionId}
            onSelectQuestion={setActiveQuestionId}
            onUpdateQuestion={handleUpdateQuestion}
            onDuplicateQuestion={handleDuplicateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onAddQuestion={handleAddQuestion}
            onSave={() => void handleSave()}
            saving={saving}
            isPublished={isPublished}
          />
        ) : (
          <SurveyAnalysisView workspaceId={workspaceId} taskId={taskId} />
        )}
      </main>

      {isPublished && (
        <SurveyShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          surveyTitle={title || formName}
          publicUrl={publicUrl}
          spreadsheetUrl={survey?.spreadsheetUrl}
        />
      )}
    </div>
  );
}
