import {
  groupSurveySections,
  type SurveyQuestion,
  type SurveySectionGroup,
} from "@/pages/tasks/types/survey";

export interface SectionTransformResult {
  title: string;
  description: string;
  questions: SurveyQuestion[];
  activeQuestionId?: string | null;
}

export function rebuildFromSections(sections: SurveySectionGroup[]): SectionTransformResult {
  const root = sections[0];
  const nextQuestions: SurveyQuestion[] = [];

  root.items.forEach((item, idx) => {
    nextQuestions.push({
      ...item.question,
      nextSectionId: idx === 0 && root.nextSectionId && root.nextSectionId !== "NEXT" ? root.nextSectionId : undefined,
    });
  });

  sections.slice(1).forEach((sec) => {
    nextQuestions.push({
      id: sec.isRoot ? "sec_" + Math.random().toString(36).slice(2, 9) : sec.id,
      type: "SECTION_HEADER",
      label: sec.title,
      description: sec.description,
      nextSectionId: sec.nextSectionId && sec.nextSectionId !== "NEXT" ? sec.nextSectionId : undefined,
    });
    sec.items.forEach((item) => {
      nextQuestions.push({ ...item.question, nextSectionId: undefined });
    });
  });

  return {
    title: root.title,
    description: root.description || "",
    questions: nextQuestions,
  };
}

export function duplicateSectionInForm(
  title: string,
  description: string,
  questions: SurveyQuestion[],
  sectionIdx: number,
  defaultSectionTitle: string,
): SectionTransformResult {
  const sections = groupSurveySections(title, description, questions);
  const target = sections[sectionIdx];
  if (!target) return { title, description, questions };

  const clonedItems = target.items.map((item, idx) => ({
    question: {
      ...item.question,
      id: "q_" + Math.random().toString(36).slice(2, 9),
      options: item.question.options ? [...item.question.options] : undefined,
      optionTargets: item.question.optionTargets ? { ...item.question.optionTargets } : undefined,
      nextSectionId: undefined,
    },
    flatIndex: idx,
    questionNumber: idx + 1,
  }));

  const clonedSection: SurveySectionGroup = {
    id: "sec_" + Math.random().toString(36).slice(2, 9),
    sectionIndex: sectionIdx + 2,
    title: target.title || defaultSectionTitle,
    description: target.description,
    isRoot: false,
    nextSectionId: target.nextSectionId,
    items: clonedItems,
  };

  const nextSections = [
    ...sections.slice(0, sectionIdx + 1),
    clonedSection,
    ...sections.slice(sectionIdx + 1),
  ];
  const rebuilt = rebuildFromSections(nextSections);
  return { ...rebuilt, activeQuestionId: clonedItems[0]?.question.id ?? null };
}

export function moveSectionInForm(
  title: string,
  description: string,
  questions: SurveyQuestion[],
  sectionIdx: number,
  direction: "up" | "down",
): SectionTransformResult {
  const sections = groupSurveySections(title, description, questions);
  const targetIdx = direction === "up" ? sectionIdx - 1 : sectionIdx + 1;
  if (targetIdx < 0 || targetIdx >= sections.length) {
    return { title, description, questions };
  }
  const reordered = [...sections];
  const [moved] = reordered.splice(sectionIdx, 1);
  reordered.splice(targetIdx, 0, moved);
  return rebuildFromSections(reordered);
}

export function deleteEntireSectionInForm(
  title: string,
  description: string,
  questions: SurveyQuestion[],
  sectionIdx: number,
  createFallbackQ: () => SurveyQuestion,
): SectionTransformResult | null {
  const sections = groupSurveySections(title, description, questions);
  if (sections.length <= 1) return null;
  const remaining = sections.filter((_, idx) => idx !== sectionIdx);
  const rebuilt = rebuildFromSections(remaining);
  if (rebuilt.questions.filter((q) => q.type !== "SECTION_HEADER").length === 0) {
    rebuilt.questions.push(createFallbackQ());
  }
  const firstQ = rebuilt.questions.find((q) => q.type !== "SECTION_HEADER");
  return { ...rebuilt, activeQuestionId: firstQ?.id ?? null };
}
