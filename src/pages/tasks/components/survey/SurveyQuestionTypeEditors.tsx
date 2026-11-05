import { useState, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Circle,
  Square,
  Star,
  X,
  CloudUpload,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select-menu";
import { buildSectionTargetOptions } from "@/pages/tasks/components/survey/SurveySectionCard";
import {
  deleteSurveyOption,
  moveSurveyOption,
  type SurveyQuestion,
  type SurveySectionGroup,
} from "@/pages/tasks/types/survey";
import { cn } from "@/lib/utils";

const toScaleOpt = (v: number): SelectMenuOption => ({
  value: String(v),
  label: String(v),
});
const MIN_SCALE_OPTIONS = [0, 1].map(toScaleOpt);
const MAX_SCALE_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10].map(toScaleOpt);

export function QuestionOptionsEditor(p: {
  question: SurveyQuestion;
  sections?: SurveySectionGroup[];
  showBranching: boolean;
  onUpdate: (u: Partial<SurveyQuestion>) => void;
}) {
  const { t } = useTranslation();
  const [grabbedIdx, setGrabbedIdx] = useState<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dropOverIdx, setDropOverIdx] = useState<number | null>(null);
  const { question, sections, showBranching, onUpdate } = p;
  const options = question.options ?? [];
  const branchOptions = buildSectionTargetOptions(sections ?? [], t);

  const clearDrag = () => (
    setGrabbedIdx(null),
    setDraggedIdx(null),
    setDropOverIdx(null)
  );

  const handleDragOver = (e: DragEvent<HTMLDivElement>, idx: number) => {
    if (draggedIdx === null) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (dropOverIdx !== idx) setDropOverIdx(idx);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, idx: number) => {
    if (draggedIdx === null) return;
    e.preventDefault();
    e.stopPropagation();
    const u = moveSurveyOption(question, draggedIdx, idx);
    if (u) onUpdate(u);
    clearDrag();
  };

  return (
    <div className="space-y-2.5 pt-1">
      {options.map((opt, idx) => (
        <div
          key={idx}
          draggable={grabbedIdx === idx}
          onDragStart={(e) => (
            e.stopPropagation(),
            (e.dataTransfer.effectAllowed = "move"),
            e.dataTransfer.setData("text/plain", String(idx)),
            setDraggedIdx(idx)
          )}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDragLeave={(e) => (
            e.stopPropagation(),
            dropOverIdx === idx && setDropOverIdx(null)
          )}
          onDrop={(e) => handleDrop(e, idx)}
          onDragEnd={(e) => (e.stopPropagation(), clearDrag())}
          className={cn(
            "group flex flex-wrap items-center gap-2 rounded-lg transition-all sm:flex-nowrap",
            draggedIdx === idx && "opacity-45",
            dropOverIdx === idx &&
              draggedIdx !== idx &&
              "ring-brand-orange/50 bg-brand-orange/5 ring-1",
          )}
        >
          <span
            onMouseDown={() => setGrabbedIdx(idx)}
            onMouseUp={() => setGrabbedIdx(null)}
            className="flex items-center select-none"
          >
            <GripVertical className="text-muted-foreground/30 group-hover:text-muted-foreground size-3.5 shrink-0 cursor-grab active:cursor-grabbing" />
          </span>
          {question.type === "MULTIPLE_CHOICE" && (
            <Circle className="text-muted-foreground/50 size-4 shrink-0" />
          )}
          {question.type === "CHECKBOX" && (
            <Square className="text-muted-foreground/50 size-4 shrink-0" />
          )}
          {question.type === "DROPDOWN" && (
            <span className="text-muted-foreground w-5 shrink-0 text-right font-mono text-xs font-medium">
              {idx + 1}.
            </span>
          )}
          <Input
            value={opt}
            onChange={(e) =>
              onUpdate({
                options: options.map((o, i) =>
                  i === idx ? e.target.value : o,
                ),
              })
            }
            placeholder={t("tasks.survey.optionPlaceholder", {
              index: idx + 1,
            })}
            className="border-border/60 hover:border-border hover:bg-muted/20 focus:border-brand-orange/60 focus:bg-background h-8 min-w-[140px] flex-1 bg-transparent text-xs transition-colors"
          />
          {showBranching && sections && sections.length > 1 && (
            <SelectMenu
              value={question.optionTargets?.[String(idx)] || "NEXT"}
              onChange={(target) =>
                onUpdate({
                  optionTargets: {
                    ...question.optionTargets,
                    [String(idx)]: target,
                  },
                })
              }
              options={branchOptions}
              ariaLabel={t("tasks.survey.branchByAnswer")}
              className="bg-background h-8 w-52 shrink-0 font-medium shadow-2xs sm:w-64"
            />
          )}
          {options.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                const u = deleteSurveyOption(question, idx);
                if (u) onUpdate(u);
              }}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-7 shrink-0 transition-colors"
              title={t("tasks.survey.removeOption")}
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          onUpdate({
            options: [
              ...options,
              t("tasks.survey.optionPlaceholder", {
                index: options.length + 1,
              }),
            ],
          })
        }
        className="text-brand-orange hover:bg-brand-orange/10 hover:text-brand-orange h-8 gap-1.5 px-2 text-xs"
      >
        <Plus className="size-3.5" />
        <span>{t("tasks.survey.addOption")}</span>
      </Button>
    </div>
  );
}

export function QuestionLinearScaleEditor(p: {
  options: string[];
  onChangeOptions: (next: string[]) => void;
}) {
  const { t } = useTranslation();
  const [minVal = "1", maxVal = "5", minLabel = "", maxLabel = ""] = p.options;
  const updateAt = (index: number, value: string) =>
    p.onChangeOptions(
      [minVal, maxVal, minLabel, maxLabel].map((v, i) =>
        i === index ? value : v,
      ),
    );
  const minNum = Math.max(0, Math.min(1, Number(minVal) || 1));
  const maxNum = Math.max(2, Math.min(10, Number(maxVal) || 5));
  const numbers = Array.from(
    { length: maxNum - minNum + 1 },
    (_, i) => minNum + i,
  );

  return (
    <div className="space-y-3 pt-1">
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        <span className="text-muted-foreground font-medium">
          {t("tasks.survey.scaleFrom")}
        </span>
        <SelectMenu
          value={minVal}
          onChange={(val) => updateAt(0, val)}
          options={MIN_SCALE_OPTIONS}
          ariaLabel={t("tasks.survey.scaleFrom")}
          className="bg-background h-8 min-w-20 font-medium shadow-2xs"
        />
        <span className="text-muted-foreground font-medium">
          {t("tasks.survey.scaleTo")}
        </span>
        <SelectMenu
          value={maxVal}
          onChange={(val) => updateAt(1, val)}
          options={MAX_SCALE_OPTIONS}
          ariaLabel={t("tasks.survey.scaleTo")}
          className="bg-background h-8 min-w-20 font-medium shadow-2xs"
        />
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground w-5 shrink-0 text-right font-mono text-xs font-semibold">
            {minVal}
          </span>
          <Input
            value={minLabel}
            onChange={(e) => updateAt(2, e.target.value)}
            placeholder={t("tasks.survey.scaleMinLabelPlaceholder")}
            className="border-border/60 hover:border-border focus:border-brand-orange/60 h-8 text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground w-5 shrink-0 text-right font-mono text-xs font-semibold">
            {maxVal}
          </span>
          <Input
            value={maxLabel}
            onChange={(e) => updateAt(3, e.target.value)}
            placeholder={t("tasks.survey.scaleMaxLabelPlaceholder")}
            className="border-border/60 hover:border-border focus:border-brand-orange/60 h-8 text-xs"
          />
        </div>
      </div>
      <div className="border-border/50 flex items-end justify-between gap-2 overflow-x-auto border-t py-3 sm:gap-4">
        {minLabel && (
          <span className="text-foreground max-w-[140px] shrink-0 truncate pb-0.5 text-xs sm:text-sm">
            {minLabel}
          </span>
        )}
        <div className="flex min-w-[220px] flex-1 items-center justify-around gap-2">
          {numbers.map((num) => (
            <div
              key={num}
              className="flex flex-col items-center gap-3 px-1.5 py-1"
            >
              <span className="text-foreground text-xs font-normal sm:text-sm">
                {num}
              </span>
              <span className="border-muted-foreground/60 size-5 rounded-full border-2" />
            </div>
          ))}
        </div>
        {maxLabel && (
          <span className="text-foreground max-w-[140px] shrink-0 truncate pb-0.5 text-right text-xs sm:text-sm">
            {maxLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export function QuestionFileUploadEditor() {
  const { t } = useTranslation();
  return (
    <div className="border-border bg-muted/20 text-muted-foreground flex items-center gap-3 rounded-xl border border-dashed p-4 text-xs">
      <CloudUpload className="text-brand-orange size-5 shrink-0" />
      <span>{t("tasks.survey.fileUploadHint")}</span>
    </div>
  );
}

export function QuestionRatingEditor() {
  return (
    <div className="flex items-center justify-around gap-2 py-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <div key={star} className="flex flex-col items-center gap-2.5">
          <span className="text-foreground text-xs sm:text-sm">{star}</span>
          <Star className="text-muted-foreground/60 size-6" />
        </div>
      ))}
    </div>
  );
}
