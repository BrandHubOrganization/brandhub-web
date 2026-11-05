import { useState, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { Layers, Plus, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SurveyBannerCard } from "@/pages/tasks/components/survey/SurveyBannerCard";
import { SurveyHeaderCard } from "@/pages/tasks/components/survey/SurveyHeaderCard";
import {
  SurveySectionAfterRow,
  SurveySectionCard,
} from "@/pages/tasks/components/survey/SurveySectionCard";
import { SurveyQuestionItem } from "@/pages/tasks/components/survey/SurveyQuestionItem";
import {
  groupSurveySections,
  type SurveyQuestion,
  type SurveySectionGroup,
} from "@/pages/tasks/types/survey";
import { cn } from "@/lib/utils";

export interface SurveyQuestionsViewProps {
  title: string;
  description: string;
  bannerUrl: string;
  onTitleChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onBannerChange: (val: string) => void;
  questions: SurveyQuestion[];
  activeQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  onUpdateQuestion: (index: number, updates: Partial<SurveyQuestion>) => void;
  onDuplicateQuestion: (index: number) => void;
  onDeleteQuestion: (index: number) => void;
  onMoveQuestion: (fromFlatIndex: number, toFlatIndex: number) => void;
  onAddQuestion: (afterFlatIndex?: number) => void;
  onAddSection: () => void;
  onMergeSection: (headerFlatIndex: number) => void;
  onDuplicateSection: (sectionIdx: number) => void;
  onMoveSection: (sectionIdx: number, direction: "up" | "down") => void;
  onDeleteSection: (sectionIdx: number) => void;
  onUpdateSectionNext: (
    section: SurveySectionGroup,
    nextSectionId: string,
  ) => void;
  onSave: () => void;
  saving: boolean;
  isPublished: boolean;
}

export function SurveyQuestionsView(p: SurveyQuestionsViewProps) {
  const { t } = useTranslation();
  const sections = groupSurveySections(p.title, p.description, p.questions);
  const totalSections = sections.length;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    flatIndex: number;
    position: "before" | "after";
  } | null>(null);
  const [emptyDropId, setEmptyDropId] = useState<string | null>(null);

  const toggleCollapse = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const resetDrag = () => (
    setDragIdx(null),
    setDropTarget(null),
    setEmptyDropId(null)
  );

  const commitDrop = (e: DragEvent<HTMLDivElement>, raw: number) => {
    if (dragIdx === null) return;
    e.preventDefault();
    p.onMoveQuestion(dragIdx, dragIdx < raw ? raw - 1 : raw);
    resetDrag();
  };

  const handleItemDragOver = (
    e: DragEvent<HTMLDivElement>,
    flatIndex: number,
  ) => {
    if (dragIdx === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const position: "before" | "after" =
      e.clientY < rect.top + rect.height / 2 ? "before" : "after";
    if (
      dropTarget?.flatIndex !== flatIndex ||
      dropTarget?.position !== position
    ) {
      setDropTarget({ flatIndex, position });
    }
    if (emptyDropId) setEmptyDropId(null);
  };

  const SaveIcon = p.saving ? Spinner : p.isPublished ? Save : Send;
  const saveKey = p.saving
    ? "tasks.survey.saving"
    : p.isPublished
      ? "tasks.survey.saveButton"
      : "tasks.survey.publishButton";

  return (
    <div className="space-y-6">
      <SurveyBannerCard
        bannerUrl={p.bannerUrl}
        onBannerChange={p.onBannerChange}
      />

      {sections.map((section, secIdx) => {
        const isCollapsed = Boolean(collapsed[section.id]);
        const hdrIdx = section.headerFlatIndex;
        const lastFlatIndex =
          section.items.length > 0
            ? section.items[section.items.length - 1].flatIndex
            : (hdrIdx ?? -1);
        const sharedSecProps = {
          totalSections,
          isActive: p.activeQuestionId === section.id,
          isCollapsed,
          onSelect: () => p.onSelectQuestion(section.id),
          onToggleCollapse: () => toggleCollapse(section.id),
          onDuplicateSection: () => p.onDuplicateSection(secIdx),
          onMoveSection: (dir: "up" | "down") => p.onMoveSection(secIdx, dir),
        };

        return (
          <div
            key={section.id}
            className="space-y-4"
            onDragOver={(e) => {
              if (dragIdx === null || section.items.length > 0) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (emptyDropId !== section.id) setEmptyDropId(section.id);
              if (dropTarget) setDropTarget(null);
            }}
            onDragLeave={() =>
              emptyDropId === section.id && setEmptyDropId(null)
            }
            onDrop={(e) =>
              section.items.length === 0 && commitDrop(e, (hdrIdx ?? -1) + 1)
            }
          >
            {section.isRoot ? (
              <SurveyHeaderCard
                {...sharedSecProps}
                title={p.title}
                description={p.description}
                onTitleChange={p.onTitleChange}
                onDescriptionChange={p.onDescriptionChange}
                onDeleteSection={() => p.onDeleteSection(secIdx)}
              />
            ) : (
              <SurveySectionCard
                {...sharedSecProps}
                sectionIndex={section.sectionIndex}
                title={section.title}
                description={section.description}
                onTitleChange={(label) =>
                  hdrIdx !== undefined && p.onUpdateQuestion(hdrIdx, { label })
                }
                onDescriptionChange={(description) =>
                  hdrIdx !== undefined &&
                  p.onUpdateQuestion(hdrIdx, { description })
                }
                onMergeSection={() =>
                  hdrIdx !== undefined && p.onMergeSection(hdrIdx)
                }
                onDelete={() => p.onDeleteSection(secIdx)}
              />
            )}

            <div
              className={cn(
                isCollapsed ? "space-y-2.5" : "space-y-4",
                section.items.length === 0 &&
                  dragIdx !== null &&
                  "min-h-14 rounded-xl border-2 border-dashed p-3 transition-colors",
                section.items.length === 0 && emptyDropId === section.id
                  ? "border-brand-orange bg-brand-orange/5"
                  : section.items.length === 0 && dragIdx !== null
                    ? "border-border/70 bg-muted/20"
                    : "",
              )}
            >
              {section.items.map((item) => {
                const isTarget =
                  dropTarget?.flatIndex === item.flatIndex &&
                  dragIdx !== item.flatIndex;
                return (
                  <SurveyQuestionItem
                    key={item.question.id}
                    question={item.question}
                    sections={sections}
                    isActive={p.activeQuestionId === item.question.id}
                    isCollapsed={isCollapsed}
                    isDragging={dragIdx === item.flatIndex}
                    isDropTarget={isTarget}
                    dropPosition={isTarget ? dropTarget.position : null}
                    onSelect={() => p.onSelectQuestion(item.question.id)}
                    onUpdate={(u) => p.onUpdateQuestion(item.flatIndex, u)}
                    onDuplicate={() => p.onDuplicateQuestion(item.flatIndex)}
                    onDelete={() => p.onDeleteQuestion(item.flatIndex)}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData(
                        "text/plain",
                        String(item.flatIndex),
                      );
                      setDragIdx(item.flatIndex);
                    }}
                    onDragOver={(e) => handleItemDragOver(e, item.flatIndex)}
                    onDragLeave={() =>
                      dropTarget?.flatIndex === item.flatIndex &&
                      setDropTarget(null)
                    }
                    onDrop={(e) => {
                      const pos =
                        dropTarget?.flatIndex === item.flatIndex
                          ? dropTarget.position
                          : "after";
                      commitDrop(
                        e,
                        pos === "after" ? item.flatIndex + 1 : item.flatIndex,
                      );
                    }}
                    onDragEnd={resetDrag}
                  />
                );
              })}
            </div>

            {secIdx < totalSections - 1 && (
              <div className="flex items-center pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => p.onAddQuestion(lastFlatIndex)}
                  className="border-border/80 text-muted-foreground hover:border-brand-orange/60 hover:text-brand-orange gap-1.5 border-dashed text-xs"
                >
                  <Plus className="size-3.5" />
                  <span>{t("tasks.survey.addQuestionToSection")}</span>
                </Button>
              </div>
            )}

            {totalSections > 1 && (
              <SurveySectionAfterRow
                section={section}
                sections={sections}
                onUpdateNext={p.onUpdateSectionNext}
              />
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => p.onAddQuestion()}
            className="border-border/80 hover:border-brand-orange/60 hover:text-brand-orange gap-2"
          >
            <Plus className="size-4" />
            <span>{t("tasks.survey.addQuestion")}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={p.onAddSection}
            className="border-border/80 hover:border-brand-orange/60 hover:text-brand-orange gap-2"
          >
            <Layers className="size-4" />
            <span>{t("tasks.survey.addSection")}</span>
          </Button>
        </div>

        <Button
          type="button"
          variant="orange"
          onClick={p.onSave}
          disabled={p.saving}
          className="gap-2 shadow-xs"
        >
          <SaveIcon className="size-4" />
          <span>{t(saveKey)}</span>
        </Button>
      </div>
    </div>
  );
}
