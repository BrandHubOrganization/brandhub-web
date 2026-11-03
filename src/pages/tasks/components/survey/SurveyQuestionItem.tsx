import { useTranslation } from "react-i18next";
import { PlusCircle, Copy, Trash2, Clock, Circle, Square, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { SurveyQuestion, SurveyQuestionType } from "@/pages/tasks/types/survey";
import { cn } from "@/lib/utils";

const QUESTION_TYPES: SurveyQuestionType[] = ["SHORT_TEXT", "LONG_TEXT", "MULTIPLE_CHOICE", "CHECKBOX", "RATING"];

interface SurveyQuestionItemProps {
  question: SurveyQuestion;
  isActive: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<SurveyQuestion>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function SurveyQuestionItem({
  question,
  isActive,
  onSelect,
  onUpdate,
  onDuplicate,
  onDelete,
}: SurveyQuestionItemProps) {
  const { t } = useTranslation();

  const handleTypeChange = (type: SurveyQuestionType) => {
    const updates: Partial<SurveyQuestion> = { type };
    if ((type === "MULTIPLE_CHOICE" || type === "CHECKBOX") && !question.options?.length) {
      updates.options = [t("tasks.survey.optionPlaceholder", { index: 1 }), t("tasks.survey.optionPlaceholder", { index: 2 })];
    }
    onUpdate(updates);
  };

  const handleAddOption = () => {
    const current = question.options ?? [];
    onUpdate({ options: [...current, t("tasks.survey.optionPlaceholder", { index: current.length + 1 })] });
  };

  const handleUpdateOption = (i: number, val: string) => {
    const next = [...(question.options ?? [])];
    next[i] = val;
    onUpdate({ options: next });
  };

  const handleDeleteOption = (i: number) => {
    if ((question.options?.length ?? 0) > 1) onUpdate({ options: question.options!.filter((_, idx) => idx !== i) });
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "rounded-xl border bg-card p-4 sm:p-5 shadow-2xs transition-all duration-150 space-y-4",
        isActive ? "border-l-4 border-l-brand-orange border-border ring-1 ring-brand-orange/20" : "border-border hover:border-border/80",
      )}
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Input
          value={question.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder={t("tasks.survey.questionTitlePlaceholder")}
          className="flex-1 font-medium text-sm sm:text-base bg-muted/30 border-border"
        />
        <div className="w-full sm:w-48 shrink-0">
          <Select value={question.type} onChange={(e) => handleTypeChange(e.target.value as SurveyQuestionType)}>
            {QUESTION_TYPES.map((type) => (
              <option key={type} value={type}>{t(`tasks.survey.types.${type}`)}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="pt-1">
        {question.type === "SHORT_TEXT" && (
          <div className="border-b border-border/80 pb-2 text-xs text-muted-foreground w-full max-w-sm">
            {t("tasks.survey.types.SHORT_TEXT")} (văn bản ngắn)
          </div>
        )}
        {question.type === "LONG_TEXT" && (
          <div className="border-b border-border/80 pb-6 text-xs text-muted-foreground w-full">
            {t("tasks.survey.types.LONG_TEXT")} (đoạn văn dài)
          </div>
        )}
        {(question.type === "MULTIPLE_CHOICE" || question.type === "CHECKBOX") && (
          <div className="space-y-2.5">
            {question.options?.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2 group">
                {question.type === "MULTIPLE_CHOICE" ? <Circle className="size-4 shrink-0 text-muted-foreground/60" /> : <Square className="size-4 shrink-0 text-muted-foreground/60" />}
                <Input
                  value={opt}
                  onChange={(e) => handleUpdateOption(idx, e.target.value)}
                  placeholder={t("tasks.survey.optionPlaceholder", { index: idx + 1 })}
                  className="h-8 text-xs bg-muted/20 border-border/70 flex-1"
                />
                {question.options && question.options.length > 1 && (
                  <button type="button" onClick={() => handleDeleteOption(idx)} className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-muted/80 transition-colors" title={t("tasks.survey.removeOption")}>
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={handleAddOption} className="text-xs text-brand-orange hover:text-brand-orange/90 hover:bg-brand-orange/10 h-8 gap-1.5 px-2">
              <PlusCircle className="size-3.5" />
              <span>{t("tasks.survey.addOption")}</span>
            </Button>
          </div>
        )}
        {question.type === "RATING" && (
          <div className="flex items-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <div key={star} className="flex flex-col items-center gap-1">
                <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted/30 text-xs font-semibold text-muted-foreground">{star}</div>
                <Star className="size-3.5 text-brand-orange fill-brand-orange" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
        <div className="flex items-center gap-1.5 bg-muted/40 border border-border/70 rounded-md px-2 py-1">
          <Clock className="size-3.5 text-muted-foreground" />
          <span className="text-2xs font-medium text-muted-foreground">{t("tasks.survey.timeSlot")}:</span>
          <input type="text" value={question.timeSlot || ""} onChange={(e) => onUpdate({ timeSlot: e.target.value })} placeholder={t("tasks.survey.timeSlotPlaceholder")} className="w-20 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/50" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-2 border-r border-border/60">
            <span className="text-xs text-muted-foreground select-none">{t("tasks.survey.required")}</span>
            <Switch checked={Boolean(question.required)} onCheckedChange={(checked) => onUpdate({ required: checked })} />
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onDuplicate} className="size-8 text-muted-foreground hover:text-foreground" title={t("tasks.survey.duplicate")}><Copy className="size-4" /></Button>
          <Button type="button" variant="ghost" size="icon" onClick={onDelete} className="size-8 text-muted-foreground hover:text-destructive" title={t("tasks.survey.delete")}><Trash2 className="size-4" /></Button>
        </div>
      </div>
    </div>
  );
}
