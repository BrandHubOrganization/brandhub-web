import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { toast } from "sonner";
import { surveyService } from "@/services/surveyService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import {
  groupSurveySections,
  type SurveyModel,
  type SurveyQuestion,
  type SurveyAnalysis,
  type SurveySaveRequest,
  type SurveySectionGroup,
} from "@/pages/tasks/types/survey";
import {
  duplicateSectionInForm,
  moveSectionInForm,
  deleteEntireSectionInForm,
} from "@/pages/tasks/utils/surveySectionHelpers";
import { stripHtmlTags } from "@/pages/tasks/components/survey/SurveyFormatText";

const createDefaultQ = (t: TFunction): SurveyQuestion => ({
  id: "q_" + Math.random().toString(36).slice(2, 9),
  type: "MULTIPLE_CHOICE",
  label: "",
  timeSlot: "00:00",
  options: [t("tasks.survey.optionPlaceholder", { index: 1 }), t("tasks.survey.optionPlaceholder", { index: 2 })],
  required: true,
});

const buildSurveyPayload = (
  rawFormName: string,
  rawTitle: string,
  rawDescription: string,
  rawBannerUrl: string,
  rawQuestions: SurveyQuestion[],
  fallbackTitle: string,
  fallbackSectionTitle: string,
): SurveySaveRequest => ({
  formName: stripHtmlTags(rawFormName).trim() || stripHtmlTags(rawTitle).trim() || undefined,
  title: rawTitle.trim() || rawFormName.trim() || "Untitled form",
  description: rawDescription.trim() || undefined,
  bannerUrl: rawBannerUrl.trim() || undefined,
  questions: rawQuestions.map((q) => ({
    ...q,
    label: q.label.trim() || (q.type === "SECTION_HEADER" ? fallbackSectionTitle : fallbackTitle),
  })),
});

export function useSurveyEditor(workspaceId: string, taskId: string) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const canEdit = useWorkspaceStore((s) => {
    const role = s.currentMemberRole || s.currentWorkspace?.myRole;
    return role === "MANAGER" || role === "CREATOR";
  });

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
  const [bannerUrl, setBannerUrl] = useState("");
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"questions" | "responses">("questions");
  const [shareOpen, setShareOpen] = useState(false);

  const getPayload = useCallback(
    (f = formName, ti = title, d = description, b = bannerUrl, qs = questions) =>
      buildSurveyPayload(f, ti, d, b, qs, t("tasks.survey.questionTitlePlaceholder"), t("tasks.survey.public.untitledSection")),
    [formName, title, description, bannerUrl, questions, t],
  );

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const [surveyRes, analysisRes] = await Promise.allSettled([
          surveyService.getSurvey(workspaceId, taskId),
          surveyService.getSurveyAnalysis(workspaceId, taskId),
        ]);
        if (!mounted) return;
        const data = surveyRes.status === "fulfilled" ? surveyRes.value : undefined;
        if (data) setSurvey(data);
        const fVal = data ? stripHtmlTags(data.formName || data.title || "") : "";
        const tVal = data?.title || "";
        const dVal = data?.description || "";
        const bVal = data?.bannerUrl || "";
        const qs = data?.questions?.length ? data.questions : [createDefaultQ(t)];
        setFormName(fVal);
        setTitle(tVal);
        setDescription(dVal);
        setBannerUrl(bVal);
        setQuestions(qs);
        setActiveQuestionId(qs[0].id);
        lastSavedPayloadRef.current = JSON.stringify(
          buildSurveyPayload(fVal, tVal, dVal, bVal, qs, t("tasks.survey.questionTitlePlaceholder"), t("tasks.survey.public.untitledSection")),
        );
        if (analysisRes.status === "fulfilled") setAnalysis(analysisRes.value);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void init();
    return () => { mounted = false; };
  }, [workspaceId, taskId, t]);

  const handleBack = useCallback(() => {
    navigate(`/workspaces/${encodeURIComponent(workspaceId)}/tasks?task=${encodeURIComponent(taskId)}`);
  }, [navigate, workspaceId, taskId]);

  const handleAddQuestion = (afterFlatIndex?: number) => {
    const newQ = { ...createDefaultQ(t), required: false };
    setQuestions((prev) =>
      afterFlatIndex === undefined
        ? [...prev, newQ]
        : [...prev.slice(0, afterFlatIndex + 1), newQ, ...prev.slice(afterFlatIndex + 1)],
    );
    setActiveQuestionId(newQ.id);
  };

  const handleAddSection = () => {
    const newSection: SurveyQuestion = {
      id: "sec_" + Math.random().toString(36).slice(2, 9),
      type: "SECTION_HEADER",
      label: t("tasks.survey.defaultSectionTitle", "Phần mới"),
      description: "",
    };
    const newQ = { ...createDefaultQ(t), required: false };
    setQuestions((prev) => [...prev, newSection, newQ]);
    setActiveQuestionId(newQ.id);
  };

  const handleMergeSection = (headerFlatIndex: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== headerFlatIndex));
  };

  const handleDuplicateSection = (sectionIdx: number) => {
    const res = duplicateSectionInForm(title, description, questions, sectionIdx, t("tasks.survey.defaultSectionTitle"));
    setTitle(res.title);
    setDescription(res.description);
    setQuestions(res.questions);
    if (res.activeQuestionId) setActiveQuestionId(res.activeQuestionId);
  };

  const handleMoveSection = (sectionIdx: number, direction: "up" | "down") => {
    const res = moveSectionInForm(title, description, questions, sectionIdx, direction);
    setTitle(res.title);
    setDescription(res.description);
    setQuestions(res.questions);
  };

  const handleDeleteSection = (sectionIdx: number) => {
    const res = deleteEntireSectionInForm(title, description, questions, sectionIdx, () => ({ ...createDefaultQ(t), required: false }));
    if (!res) return;
    setTitle(res.title);
    setDescription(res.description);
    setQuestions(res.questions);
    if (res.activeQuestionId !== undefined) setActiveQuestionId(res.activeQuestionId);
  };

  const handleDuplicateQuestion = (idx: number) => {
    const q = questions[idx];
    const clone: SurveyQuestion = {
      ...q, id: "q_" + Math.random().toString(36).slice(2, 9),
      options: q.options ? [...q.options] : undefined,
      optionTargets: q.optionTargets ? { ...q.optionTargets } : undefined,
      nextSectionId: undefined,
    };
    setQuestions((prev) => [...prev.slice(0, idx + 1), clone, ...prev.slice(idx + 1)]);
    setActiveQuestionId(clone.id);
  };

  const handleDeleteQuestion = (idx: number) => {
    if (questions.filter((q) => q.type !== "SECTION_HEADER").length <= 1) {
      toast.error(t("tasks.survey.emptyQuestions"));
      return;
    }
    const deletedQ = questions[idx];
    const firstHeaderIdx = questions.findIndex((q) => q.type === "SECTION_HEADER");
    const inheritedRootNext = firstHeaderIdx === -1 || idx < firstHeaderIdx ? deletedQ?.nextSectionId : undefined;
    const updated = questions.filter((_, i) => i !== idx);
    if (inheritedRootNext && updated.length > 0 && updated[0].type !== "SECTION_HEADER") {
      updated[0] = { ...updated[0], nextSectionId: inheritedRootNext };
    }
    setQuestions(updated);
    if (activeQuestionId === deletedQ?.id) {
      setActiveQuestionId(updated.find((q) => q.type !== "SECTION_HEADER")?.id || null);
    }
  };

  const handleUpdateQuestion = (idx: number, updates: Partial<SurveyQuestion>) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...updates } : q)));
  };

  const handleMoveQuestion = (fromFlatIndex: number, toFlatIndex: number) => {
    if (fromFlatIndex === toFlatIndex || fromFlatIndex < 0 || toFlatIndex < 0 || fromFlatIndex >= questions.length || toFlatIndex >= questions.length) return;
    const movedQuestion = questions[fromFlatIndex];
    if (!movedQuestion || movedQuestion.type === "SECTION_HEADER") return;
    const rootNext = groupSurveySections(title, description, questions)[0]?.nextSectionId;
    setQuestions((prev) => {
      const next = prev.map((q) => (q.type !== "SECTION_HEADER" && q.nextSectionId ? { ...q, nextSectionId: undefined } : q));
      const [moved] = next.splice(fromFlatIndex, 1);
      next.splice(toFlatIndex, 0, moved);
      if (rootNext && rootNext !== "NEXT" && next[0] && next[0].type !== "SECTION_HEADER") {
        next[0] = { ...next[0], nextSectionId: rootNext };
      }
      return next;
    });
    setActiveQuestionId(movedQuestion.id);
  };

  const handleUpdateSectionNext = (section: SurveySectionGroup, nextSectionId: string) => {
    if (!section.isRoot && section.headerFlatIndex !== undefined) {
      handleUpdateQuestion(section.headerFlatIndex, { nextSectionId });
      return;
    }
    if (section.isRoot && section.items.length > 0) {
      const firstIdx = section.items[0].flatIndex;
      const rootIndices = new Set(section.items.map((it) => it.flatIndex));
      setQuestions((prev) =>
        prev.map((q, i) =>
          i === firstIdx ? { ...q, nextSectionId } : rootIndices.has(i) && q.nextSectionId ? { ...q, nextSectionId: undefined } : q,
        ),
      );
    }
  };

  const handleSave = async () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = null;
    if (questions.filter((q) => q.type !== "SECTION_HEADER").length === 0) {
      toast.error(t("tasks.survey.emptyQuestions"));
      return;
    }
    try {
      setSaving(true);
      setSaveStatus("saving");
      const payload = getPayload();
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

  useEffect(() => {
    if (loading || isInitialLoadRef.current) {
      if (!loading && isInitialLoadRef.current) isInitialLoadRef.current = false;
      return;
    }
    if (!canEdit || questions.filter((q) => q.type !== "SECTION_HEADER").length === 0) return;
    const payload = getPayload();
    const payloadStr = JSON.stringify(payload);
    if (payloadStr === lastSavedPayloadRef.current) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
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
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [getPayload, questions, workspaceId, taskId, loading, canEdit]);

  const isPublished = Boolean(survey?.publicLink || survey?.publicToken);
  const publicUrl =
    survey?.publicLink ||
    (survey?.publicToken ? `${window.location.origin}/public/surveys/${survey.publicToken}` : "");

  return {
    loading, saving, saveStatus, activeTab, setActiveTab, shareOpen, setShareOpen,
    survey, analysis, formName, setFormName, title, setTitle, description, setDescription,
    bannerUrl, setBannerUrl, questions, activeQuestionId, setActiveQuestionId, isPublished, publicUrl, canEdit,
    handleBack, handleAddQuestion, handleAddSection, handleMergeSection, handleDuplicateSection,
    handleMoveSection, handleDeleteSection, handleUpdateSectionNext,
    handleDuplicateQuestion, handleDeleteQuestion, handleMoveQuestion, handleUpdateQuestion, handleSave,
  };
}
