import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  Check,
  CloudUpload,
  FileText,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  FormattedText,
  stripHtmlTags,
} from "@/pages/tasks/components/survey/SurveyFormatText";
import type { SurveyQuestion } from "@/pages/tasks/types/survey";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_FILES =
  "image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip";

interface PublicQuestionCardProps {
  question: SurveyQuestion;
  index: number;
  value: string | string[] | undefined;
  error?: string;
  onTextChange: (questionId: string, val: string) => void;
  onSingleChoice: (questionId: string, val: string) => void;
  onMultipleChoiceToggle: (questionId: string, val: string) => void;
}

function LinearScaleQuestion({
  question,
  value,
  onSingleChoice,
}: Pick<PublicQuestionCardProps, "question" | "value" | "onSingleChoice">) {
  const minRaw = Number(question.options?.[0] ?? 1);
  const maxRaw = Number(question.options?.[1] ?? 5);
  const minVal = Number.isFinite(minRaw) ? Math.max(0, Math.min(1, minRaw)) : 1;
  const maxVal = Number.isFinite(maxRaw)
    ? Math.max(2, Math.min(10, maxRaw))
    : 5;
  const minLabel = question.options?.[2] || "";
  const maxLabel = question.options?.[3] || "";
  const numbers = Array.from(
    { length: maxVal - minVal + 1 },
    (_, i) => minVal + i,
  );

  return (
    <div className="flex items-end justify-between gap-2 overflow-x-auto py-3 sm:gap-4">
      {minLabel && (
        <span className="text-foreground max-w-[140px] shrink-0 truncate pb-0.5 text-xs sm:text-sm">
          {minLabel}
        </span>
      )}
      <div className="flex min-w-[220px] flex-1 items-center justify-around gap-2">
        {numbers.map((num) => {
          const isSelected = value === String(num);
          return (
            <button
              key={num}
              type="button"
              onClick={() => onSingleChoice(question.id, String(num))}
              className="group flex cursor-pointer flex-col items-center gap-3 px-1.5 py-1 focus:outline-none"
            >
              <span className="text-foreground text-xs font-normal sm:text-sm">
                {num}
              </span>
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border-2 transition-all",
                  isSelected
                    ? "border-brand-orange bg-brand-orange/10"
                    : "border-muted-foreground/60 group-hover:border-brand-orange/70",
                )}
              >
                {isSelected && (
                  <span className="bg-brand-orange size-2.5 rounded-full" />
                )}
              </span>
            </button>
          );
        })}
      </div>
      {maxLabel && (
        <span className="text-foreground max-w-[140px] shrink-0 truncate pb-0.5 text-right text-xs sm:text-sm">
          {maxLabel}
        </span>
      )}
    </div>
  );
}

function FileUploadQuestion({
  question,
  value,
  onTextChange,
}: Pick<PublicQuestionCardProps, "question" | "value" | "onTextChange">) {
  const { t } = useTranslation();
  const strVal = typeof value === "string" ? value : "";

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(
        t(
          "tasks.survey.public.fileTooLarge",
          "Kích thước tệp vượt quá 5MB. Vui lòng chọn tệp nhỏ hơn hoặc dán link.",
        ),
      );
      return;
    }
    onTextChange(
      question.id,
      `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
    );
  };

  return (
    <div className="space-y-2.5 pt-1">
      <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
        <label className="border-brand-orange/50 bg-brand-orange/5 hover:bg-brand-orange/10 text-foreground inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3.5 py-2 text-xs font-medium transition-colors">
          <CloudUpload className="text-brand-orange size-4 shrink-0" />
          <span>
            {t(
              "tasks.survey.public.chooseFile",
              "Chọn tệp từ máy (tối đa 5MB)",
            )}
          </span>
          <input
            type="file"
            className="hidden"
            accept={ACCEPTED_FILES}
            onChange={handleFileSelect}
          />
        </label>
        <Input
          value={strVal}
          onChange={(e) => onTextChange(question.id, e.target.value)}
          placeholder={t(
            "tasks.survey.public.fileUrlPlaceholder",
            "Hoặc dán đường dẫn tệp (Google Drive, OneDrive, URL...)",
          )}
          className="border-border focus-visible:border-brand-orange focus-visible:ring-brand-orange focus-visible:ring-1"
        />
      </div>
      {strVal && (
        <div className="border-brand-orange/30 bg-brand-orange/5 flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="text-brand-orange size-4 shrink-0" />
            <span className="text-foreground truncate font-medium">
              {strVal}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onTextChange(question.id, "")}
            aria-label={t("tasks.survey.public.removeFile", "Gỡ tệp")}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer rounded-md p-1 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function ChoiceQuestions({
  question,
  value,
  onSingleChoice,
  onMultipleChoiceToggle,
}: Omit<PublicQuestionCardProps, "index" | "error" | "onTextChange">) {
  if (question.type === "MULTIPLE_CHOICE") {
    return (
      <div className="space-y-2">
        {question.options?.map((option, optIdx) => {
          const isSelected = value === option;
          return (
            <label
              key={optIdx}
              onClick={() => onSingleChoice(question.id, option)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all",
                isSelected
                  ? "border-brand-orange bg-brand-orange/5 text-foreground ring-brand-orange/20 font-medium shadow-2xs ring-1"
                  : "border-border hover:bg-muted/40 text-foreground/90",
              )}
            >
              <div
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                  isSelected
                    ? "border-brand-orange bg-brand-orange text-white"
                    : "border-muted-foreground/50",
                )}
              >
                {isSelected && (
                  <div className="size-1.5 rounded-full bg-white" />
                )}
              </div>
              <span className="text-xs sm:text-sm">{option}</span>
            </label>
          );
        })}
      </div>
    );
  }
  const checkedList = (value as string[]) || [];
  return (
    <div className="space-y-2">
      {question.options?.map((option, optIdx) => {
        const isChecked = checkedList.includes(option);
        return (
          <label
            key={optIdx}
            onClick={() => onMultipleChoiceToggle(question.id, option)}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all",
              isChecked
                ? "border-brand-orange bg-brand-orange/5 text-foreground ring-brand-orange/20 font-medium shadow-2xs ring-1"
                : "border-border hover:bg-muted/40 text-foreground/90",
            )}
          >
            <div
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                isChecked
                  ? "border-brand-orange bg-brand-orange text-white"
                  : "border-muted-foreground/50",
              )}
            >
              {isChecked && <Check className="size-3 stroke-[3]" />}
            </div>
            <span className="text-xs sm:text-sm">{option}</span>
          </label>
        );
      })}
    </div>
  );
}

export function PublicQuestionCard(props: PublicQuestionCardProps) {
  const {
    question,
    index,
    value,
    error,
    onTextChange,
    onSingleChoice,
    onMultipleChoiceToggle,
  } = props;
  const { t } = useTranslation();
  const hasError = Boolean(error);

  return (
    <div
      className={cn(
        "bg-card space-y-3.5 rounded-xl border p-4 shadow-xs transition-colors sm:p-5",
        hasError
          ? "border-destructive/80 ring-destructive/30 ring-1"
          : "border-border",
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-2xs bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 font-semibold">
            {String(index + 1).padStart(2, "0")}
          </span>
          {question.required && (
            <span className="text-2xs text-destructive font-medium">
              * {t("common.required", "Bắt buộc")}
            </span>
          )}
        </div>
        <h3 className="text-foreground text-sm leading-snug font-semibold sm:text-base">
          <FormattedText text={question.label} />
        </h3>
      </div>

      <div className="pt-0.5">
        {question.type === "SHORT_TEXT" && (
          <Input
            value={(value as string) || ""}
            onChange={(e) => onTextChange(question.id, e.target.value)}
            placeholder={t("tasks.survey.public.shortTextPlaceholder")}
            className="border-border focus-visible:border-brand-orange focus-visible:ring-brand-orange focus-visible:ring-1"
          />
        )}
        {question.type === "LONG_TEXT" && (
          <Textarea
            value={(value as string) || ""}
            onChange={(e) => onTextChange(question.id, e.target.value)}
            placeholder={t("tasks.survey.public.longTextPlaceholder")}
            rows={3}
            className="border-border focus-visible:border-brand-orange focus-visible:ring-brand-orange focus-visible:ring-1"
          />
        )}
        {(question.type === "MULTIPLE_CHOICE" ||
          question.type === "CHECKBOX") && (
          <ChoiceQuestions
            question={question}
            value={value}
            onSingleChoice={onSingleChoice}
            onMultipleChoiceToggle={onMultipleChoiceToggle}
          />
        )}
        {question.type === "DROPDOWN" && (
          <SelectMenu
            value={typeof value === "string" ? value : ""}
            onChange={(val) => onSingleChoice(question.id, val)}
            ariaLabel={stripHtmlTags(question.label)}
            className="w-full sm:w-80"
            options={[
              {
                value: "",
                label: t(
                  "tasks.survey.public.selectOptionPlaceholder",
                  "Chọn một câu trả lời",
                ),
              },
              ...(question.options || []).map((opt) => ({
                value: opt,
                label: opt,
              })),
            ]}
          />
        )}
        {question.type === "LINEAR_SCALE" && (
          <LinearScaleQuestion
            question={question}
            value={value}
            onSingleChoice={onSingleChoice}
          />
        )}
        {question.type === "FILE_UPLOAD" && (
          <FileUploadQuestion
            question={question}
            value={value}
            onTextChange={onTextChange}
          />
        )}
        {question.type === "RATING" && (
          <div className="flex items-center justify-around gap-2 py-3">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => onSingleChoice(question.id, String(score))}
                className="group flex cursor-pointer flex-col items-center gap-2.5 px-2 py-1 focus:outline-none"
              >
                <span className="text-foreground text-xs font-normal sm:text-sm">
                  {score}
                </span>
                <Star
                  className={cn(
                    "size-6 transition-transform group-hover:scale-110 sm:size-7",
                    Number(value || 0) >= score
                      ? "fill-brand-orange text-brand-orange"
                      : "text-muted-foreground/70 group-hover:text-brand-orange/70",
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {hasError && (
        <p className="text-destructive flex items-center gap-1.5 pt-1 text-xs">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
