import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SurveyHeaderCardProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export function SurveyHeaderCard({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: SurveyHeaderCardProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-border/80 border-t-8 border-t-brand-orange bg-card p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="space-y-2">
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={t("tasks.survey.titlePlaceholder")}
          className="text-lg sm:text-xl font-bold bg-transparent border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
        />
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={t("tasks.survey.descriptionPlaceholder")}
          rows={2}
          className="bg-transparent border-none px-0 shadow-none focus-visible:ring-0 text-sm text-muted-foreground resize-none"
        />
      </div>
    </div>
  );
}

