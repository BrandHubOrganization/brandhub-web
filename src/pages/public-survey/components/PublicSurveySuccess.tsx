import { useTranslation } from "react-i18next";
import { stripHtmlTags } from "@/pages/tasks/components/survey/SurveyFormatText";

interface PublicSurveySuccessProps {
  title?: string;
  bannerUrl?: string;
  onReset: () => void;
}

export function PublicSurveySuccess({
  title,
  bannerUrl,
  onReset,
}: PublicSurveySuccessProps) {
  const { t } = useTranslation();
  const untitledFallback = t(
    "tasks.survey.public.untitledForm",
    "Biểu mẫu không có tiêu đề",
  );

  return (
    <div className="bg-background min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-xl space-y-5">
        {bannerUrl && (
          <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-xs">
            <img
              src={bannerUrl}
              alt={stripHtmlTags(title) || untitledFallback}
              className="h-36 w-full object-cover sm:h-48"
            />
          </div>
        )}

        {/* Main Success Card */}
        <div className="border-border bg-card relative overflow-hidden rounded-2xl border shadow-xs">
          <div className="bg-brand-orange h-3 w-full" />
          <div className="space-y-4 p-6 sm:p-8">
            <h1 className="text-foreground text-2xl font-bold tracking-tight break-words sm:text-3xl">
              {stripHtmlTags(title) || untitledFallback}
            </h1>
            <p className="text-foreground text-sm">
              {t(
                "tasks.survey.public.responseRecorded",
                "Câu trả lời của bạn đã được ghi nhận.",
              )}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onReset}
                className="text-brand-orange cursor-pointer text-sm transition-colors hover:underline"
              >
                {t("tasks.survey.public.submitAnother", "Gửi câu trả lời khác")}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-4 pb-8 text-center">
          <p className="text-2xs text-muted-foreground">
            {t(
              "tasks.survey.public.poweredBy",
              "Được hỗ trợ bởi BrandHub Workshop",
            )}
          </p>
        </footer>
      </div>
    </div>
  );
}
