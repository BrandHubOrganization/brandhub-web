import { useState, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  Copy,
  Trash2,
  Clock,
  Star,
  GripVertical,
  GitBranch,
  AlignLeft,
  FileText,
  CircleDot,
  CheckSquare,
  CircleChevronDown,
  CloudUpload,
  GitCommitHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select-menu";
import { Switch } from "@/components/ui/switch";
import type {
  SurveyQuestion,
  SurveyQuestionType,
  SurveySectionGroup,
} from "@/pages/tasks/types/survey";
import {
  FormattedText,
  SurveyFormattedInput,
} from "@/pages/tasks/components/survey/SurveyFormatText";
import {
  QuestionOptionsEditor,
  QuestionLinearScaleEditor,
  QuestionFileUploadEditor,
  QuestionRatingEditor,
} from "@/pages/tasks/components/survey/SurveyQuestionTypeEditors";
import { cn } from "@/lib/utils";

const TYPE_ITEMS: {
  type: SurveyQuestionType;
  Icon: typeof AlignLeft;
  div?: boolean;
}[] = [
  { type: "SHORT_TEXT", Icon: AlignLeft },
  { type: "LONG_TEXT", Icon: FileText },
  { type: "MULTIPLE_CHOICE", Icon: CircleDot, div: true },
  { type: "CHECKBOX", Icon: CheckSquare },
  { type: "DROPDOWN", Icon: CircleChevronDown },
  { type: "FILE_UPLOAD", Icon: CloudUpload, div: true },
  { type: "LINEAR_SCALE", Icon: GitCommitHorizontal, div: true },
  { type: "RATING", Icon: Star },
];

const OPTION_TYPES = new Set<SurveyQuestionType>([
  "MULTIPLE_CHOICE",
  "CHECKBOX",
  "DROPDOWN",
]);

export interface SurveyQuestionItemProps {
  question: SurveyQuestion;
  sections?: SurveySectionGroup[];
  isActive: boolean;
  isCollapsed?: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  dropPosition?: "before" | "after" | null;
  onSelect: () => void;
  onUpdate: (updates: Partial<SurveyQuestion>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave?: () => void;
  onDrop?: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
}

export function SurveyQuestionItem(p: SurveyQuestionItemProps) {
  const { t } = useTranslation();
  const [isGrabbed, setIsGrabbed] = useState(false);
  const { question, sections, isActive, onUpdate } = p;

  const canBranch =
    (question.type === "MULTIPLE_CHOICE" || question.type === "DROPDOWN") &&
    Boolean(sections && sections.length > 1);
  const hasBranching = Boolean(
    question.optionTargets && Object.keys(question.optionTargets).length > 0,
  );
  const typeOptions: SelectMenuOption[] = TYPE_ITEMS.map(
    ({ type, Icon, div }) => ({
      value: type,
      label: t(`tasks.survey.types.${type}`),
      icon: <Icon className="size-3.5" />,
      dividerBefore: div,
    }),
  );

  const handleTypeChange = (type: SurveyQuestionType) => {
    const u: Partial<SurveyQuestion> = { type };
    if (type === "LINEAR_SCALE") u.options = ["1", "5", "", ""];
    else if (
      OPTION_TYPES.has(type) &&
      (!OPTION_TYPES.has(question.type) || !question.options?.length)
    ) {
      u.options = [1, 2].map((index) =>
        t("tasks.survey.optionPlaceholder", { index }),
      );
    }
    if (type !== "MULTIPLE_CHOICE" && type !== "DROPDOWN")
      u.optionTargets = undefined;
    onUpdate(u);
  };

  return (
    <div
      draggable={isGrabbed}
      onClick={p.onSelect}
      onFocusCapture={p.onSelect}
      onDragStart={p.onDragStart}
      onDragOver={p.onDragOver}
      onDragLeave={p.onDragLeave}
      onDrop={p.onDrop}
      onDragEnd={() => (setIsGrabbed(false), p.onDragEnd?.())}
      className={cn(
        "bg-card cursor-pointer rounded-xl border shadow-2xs transition-all duration-150",
        p.isCollapsed ? "px-5 py-3.5" : "space-y-3.5 p-4 sm:p-5",
        isActive
          ? "border-border border-l-4 border-l-brand-orange shadow-sm"
          : "border-border hover:border-border/80",
        p.isDragging &&
          "border-brand-orange scale-[0.99] border-dashed opacity-45",
        p.isDropTarget &&
          p.dropPosition === "before" &&
          "ring-brand-orange/40 border-t-brand-orange border-t-4 ring-2",
        p.isDropTarget &&
          p.dropPosition === "after" &&
          "ring-brand-orange/40 border-b-brand-orange border-b-4 ring-2",
      )}
    >
      <div
        onMouseDown={() => setIsGrabbed(true)}
        onMouseUp={() => setIsGrabbed(false)}
        onMouseLeave={() => !p.isDragging && setIsGrabbed(false)}
        className={cn(
          "flex cursor-grab items-center justify-center transition-colors select-none active:cursor-grabbing",
          p.isCollapsed ? "-mt-2.5 mb-1 py-0.5" : "-mt-2 -mb-1 py-1",
          isActive
            ? "text-brand-orange"
            : "text-muted-foreground/40 hover:text-brand-orange",
        )}
      >
        <GripVertical className="size-4 rotate-90" />
      </div>
      {p.isCollapsed ? (
        <div className="text-foreground truncate text-sm font-normal">
          <FormattedText
            text={question.label || t("tasks.survey.questionTitlePlaceholder")}
          />
          {question.required && (
            <span className="text-destructive ml-1">*</span>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start">
            <SurveyFormattedInput
              value={question.label}
              onChange={(label) => onUpdate({ label })}
              placeholder={t("tasks.survey.questionTitlePlaceholder")}
              variant="box"
              className="flex-1"
              inputClassName="text-sm font-medium sm:text-base"
            />
            <div className="w-full shrink-0 sm:w-52">
              <SelectMenu
                value={question.type}
                onChange={(val) => handleTypeChange(val as SurveyQuestionType)}
                options={typeOptions}
                ariaLabel={t("tasks.survey.questionTitlePlaceholder")}
                className="bg-background h-9 w-full font-medium shadow-2xs"
              />
            </div>
          </div>
          <div className="pt-0.5">
            {(question.type === "SHORT_TEXT" ||
              question.type === "LONG_TEXT") && (
              <div
                className={cn(
                  "border-border/70 text-muted-foreground w-full border-b text-xs",
                  question.type === "SHORT_TEXT" ? "max-w-sm pb-2" : "pb-5",
                )}
              >
                {t(`tasks.survey.types.${question.type}`)}
              </div>
            )}
            {OPTION_TYPES.has(question.type) && (
              <QuestionOptionsEditor
                question={question}
                sections={sections}
                showBranching={canBranch && hasBranching}
                onUpdate={onUpdate}
              />
            )}
            {question.type === "FILE_UPLOAD" && <QuestionFileUploadEditor />}
            {question.type === "LINEAR_SCALE" && (
              <QuestionLinearScaleEditor
                options={question.options ?? ["1", "5", "", ""]}
                onChangeOptions={(options) => onUpdate({ options })}
              />
            )}
            {question.type === "RATING" && <QuestionRatingEditor />}
          </div>
          <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
            <div className="border-border/60 bg-muted/30 flex items-center gap-1.5 rounded-md border px-2.5 py-1">
              <Clock className="text-muted-foreground/70 size-3.5" />
              <span className="text-muted-foreground text-xs font-medium">
                {t("tasks.survey.timeSlot")}:
              </span>
              <input
                type="text"
                value={question.timeSlot || ""}
                onChange={(e) => onUpdate({ timeSlot: e.target.value })}
                placeholder={t("tasks.survey.timeSlotPlaceholder")}
                className="text-foreground placeholder:text-muted-foreground/50 w-20 bg-transparent text-xs outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {canBranch && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onUpdate({
                      optionTargets: hasBranching
                        ? undefined
                        : { "0": "NEXT" },
                    })
                  }
                  className={cn(
                    "h-7 gap-1.5 border px-2.5 text-xs transition-colors",
                    hasBranching
                      ? "border-brand-orange/40 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/15 hover:text-brand-orange"
                      : "text-muted-foreground hover:text-foreground border-transparent",
                  )}
                >
                  <GitBranch className="size-3.5" />
                  <span>{t("tasks.survey.branchByAnswer")}</span>
                </Button>
              )}
              <div className="border-border/60 flex items-center gap-2 border-r pr-2 sm:pr-3">
                <span className="text-muted-foreground text-xs select-none">
                  {t("tasks.survey.required")}
                </span>
                <Switch
                  checked={Boolean(question.required)}
                  onCheckedChange={(required) => onUpdate({ required })}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={p.onDuplicate}
                className="text-muted-foreground hover:text-foreground size-8"
                title={t("tasks.survey.duplicate")}
              >
                <Copy className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={p.onDelete}
                className="text-muted-foreground hover:text-destructive size-8"
                title={t("tasks.survey.delete")}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
