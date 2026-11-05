import { useTranslation } from "react-i18next";
import { Layers, Sparkles } from "lucide-react";
import { FormattedText } from "@/pages/tasks/components/survey/SurveyFormatText";

interface PublicSurveyHeaderProps {
  title: string;
  description?: string;
  hasRequiredQuestions?: boolean;
  currentSectionIndex?: number;
  totalSections?: number;
  sectionTitle?: string;
  sectionDescription?: string;
  isRootSection?: boolean;
}

export function PublicSurveyHeader({
  title,
  description,
  hasRequiredQuestions,
  currentSectionIndex = 1,
  totalSections = 1,
  sectionTitle,
  sectionDescription,
  isRootSection = true,
}: PublicSurveyHeaderProps) {
  const { t } = useTranslation();
  const isMultiSection = totalSections > 1;
  const progressPercent = isMultiSection
    ? Math.min(100, Math.max(0, (currentSectionIndex / totalSections) * 100))
    : 100;

  return (
    <header className="border-border bg-card space-y-3.5 overflow-hidden rounded-2xl border p-5 shadow-xs sm:p-6">
      {isMultiSection && (
        <div className="space-y-2 pb-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-brand-orange flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="size-3.5" />
              <span>BrandHub Survey</span>
            </div>
            <span className="bg-brand-orange/10 text-brand-orange border-brand-orange/20 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
              <Layers className="size-3" />
              {t("tasks.survey.public.sectionProgress", {
                current: currentSectionIndex,
                total: totalSections,
                defaultValue: `Phần ${currentSectionIndex} / ${totalSections}`,
              })}
            </span>
          </div>
          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="bg-brand-orange h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {!isMultiSection && (
        <div className="text-brand-orange flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
          <Sparkles className="size-3.5" />
          <span>BrandHub Survey</span>
        </div>
      )}

      {isRootSection ? (
        <div className="space-y-2">
          <h1 className="text-foreground text-xl font-bold tracking-tight break-words sm:text-2xl">
            <FormattedText text={title} />
          </h1>
          {description && (
            <p className="text-muted-foreground text-sm leading-relaxed break-words whitespace-pre-wrap">
              <FormattedText text={description} />
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-muted-foreground truncate text-xs font-medium">
            <FormattedText text={title} />
          </p>
          <div className="border-brand-orange/30 bg-brand-orange/5 space-y-1.5 rounded-xl border-l-4 px-4 py-3">
            <h1 className="text-foreground text-lg font-bold tracking-tight break-words sm:text-xl">
              <FormattedText
                text={
                  sectionTitle ||
                  t("tasks.survey.public.untitledSection", "Phần tiếp theo")
                }
              />
            </h1>
            {sectionDescription && (
              <p className="text-muted-foreground text-xs leading-relaxed break-words whitespace-pre-wrap sm:text-sm">
                <FormattedText text={sectionDescription} />
              </p>
            )}
          </div>
        </div>
      )}

      {hasRequiredQuestions && (
        <div className="text-2xs text-muted-foreground border-border/60 flex items-center gap-1 border-t pt-2.5">
          <span className="text-destructive font-bold">*</span>
          <span>
            {t(
              "tasks.survey.public.requiredHint",
              "Các câu hỏi có dấu hoa thị (*) là bắt buộc",
            )}
          </span>
        </div>
      )}
    </header>
  );
}
