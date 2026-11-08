import { useTranslation } from "react-i18next";
import {
  ArrowDown,
  ArrowUp,
  ChevronsDownUp,
  ChevronsUpDown,
  Copy,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SurveyFormattedInput } from "@/pages/tasks/components/survey/SurveyFormatText";
import { cn } from "@/lib/utils";

interface SurveyHeaderCardProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  totalSections?: number;
  isActive?: boolean;
  isCollapsed?: boolean;
  onSelect?: () => void;
  onToggleCollapse?: () => void;
  onDuplicateSection?: () => void;
  onMoveSection?: (direction: "up" | "down") => void;
  onDeleteSection?: () => void;
}

export function SurveyHeaderCard({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  totalSections = 1,
  isActive = false,
  isCollapsed = false,
  onSelect,
  onToggleCollapse,
  onDuplicateSection,
  onMoveSection,
  onDeleteSection,
}: SurveyHeaderCardProps) {
  const { t } = useTranslation();
  const hasMultipleSections = totalSections > 1;

  return (
    <div onClick={onSelect} onFocusCapture={onSelect}>
      {hasMultipleSections && (
        <div className="bg-brand-orange inline-flex items-center rounded-t-xl px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs">
          {t("tasks.survey.sectionBadge", {
            current: 1,
            total: totalSections,
          })}
        </div>
      )}
      <div
        className={cn(
          "border-border bg-card relative overflow-hidden border-x border-b shadow-2xs transition-all duration-150",
          hasMultipleSections ? "rounded-tr-xl rounded-b-xl" : "rounded-xl",
          isActive && "border-l-brand-orange border-l-4",
        )}
      >
        <div className="bg-brand-orange h-3 w-full" />
        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <SurveyFormattedInput
              value={title}
              onChange={onTitleChange}
              placeholder={t("tasks.survey.titlePlaceholder")}
              variant="underline"
              inputClassName="text-2xl sm:text-3xl font-normal text-foreground"
            />
            <div className="flex shrink-0 items-center gap-1 pt-0.5">
              {onToggleCollapse && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onToggleCollapse}
                  className="text-muted-foreground hover:text-foreground size-8"
                  title={
                    isCollapsed
                      ? t("tasks.survey.expandSection")
                      : t("tasks.survey.collapseSection")
                  }
                >
                  {isCollapsed ? (
                    <ChevronsUpDown className="size-4" />
                  ) : (
                    <ChevronsDownUp className="size-4" />
                  )}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground size-8"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem
                    onClick={onDuplicateSection}
                    className="cursor-pointer"
                  >
                    <Copy className="size-4" />
                    <span>{t("tasks.survey.duplicateSection")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="cursor-pointer">
                    <ArrowUp className="size-4" />
                    <span>{t("tasks.survey.moveSectionUp")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={!hasMultipleSections}
                    onClick={() => onMoveSection?.("down")}
                    className="cursor-pointer"
                  >
                    <ArrowDown className="size-4" />
                    <span>{t("tasks.survey.moveSectionDown")}</span>
                  </DropdownMenuItem>
                  {hasMultipleSections && onDeleteSection && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={onDeleteSection}
                        className="cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                        <span>{t("tasks.survey.deleteSection")}</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {!isCollapsed && (
            <SurveyFormattedInput
              value={description}
              onChange={onDescriptionChange}
              placeholder={t("tasks.survey.descriptionPlaceholder")}
              variant="underline"
              inputClassName="pb-1 text-sm text-muted-foreground"
            />
          )}
        </div>
      </div>
    </div>
  );
}
