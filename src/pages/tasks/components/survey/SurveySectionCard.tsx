import { useTranslation } from "react-i18next";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChevronsDownUp,
  ChevronsUpDown,
  CornerDownRight,
  CornerLeftUp,
  Copy,
  MoreVertical,
  Send,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectMenu, type SelectMenuOption } from "@/components/ui/select-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  stripHtmlTags,
  SurveyFormattedInput,
} from "@/pages/tasks/components/survey/SurveyFormatText";
import type { SurveySectionGroup } from "@/pages/tasks/types/survey";
import { cn } from "@/lib/utils";

interface SurveySectionCardProps {
  sectionIndex: number;
  totalSections: number;
  title: string;
  description?: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  onSelect?: () => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onToggleCollapse?: () => void;
  onDuplicateSection?: () => void;
  onMoveSection?: (direction: "up" | "down") => void;
  onMergeSection?: () => void;
  onDelete: () => void;
}

export function SurveySectionCard({
  sectionIndex,
  totalSections,
  title,
  description = "",
  isActive = false,
  isCollapsed = false,
  onSelect,
  onTitleChange,
  onDescriptionChange,
  onToggleCollapse,
  onDuplicateSection,
  onMoveSection,
  onMergeSection,
  onDelete,
}: SurveySectionCardProps) {
  const { t } = useTranslation();
  const isLast = sectionIndex >= totalSections;

  return (
    <div onClick={onSelect} onFocusCapture={onSelect}>
      <div className="bg-brand-orange inline-flex items-center rounded-t-xl px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs">
        {t("tasks.survey.sectionBadge", {
          current: sectionIndex,
          total: totalSections,
        })}
      </div>
      <div
        className={cn(
          "border-border bg-card relative overflow-hidden rounded-tr-xl rounded-b-xl border-x border-b shadow-2xs transition-all duration-150",
          isActive && "border-l-brand-orange border-l-4",
        )}
      >
        <div className="bg-brand-orange h-3 w-full" />
        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <SurveyFormattedInput
              value={title}
              onChange={onTitleChange}
              placeholder={t("tasks.survey.sectionTitlePlaceholder")}
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
                  <DropdownMenuItem
                    disabled={sectionIndex <= 1}
                    onClick={() => onMoveSection?.("up")}
                    className="cursor-pointer"
                  >
                    <ArrowUp className="size-4" />
                    <span>{t("tasks.survey.moveSectionUp")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={isLast}
                    onClick={() => onMoveSection?.("down")}
                    className="cursor-pointer"
                  >
                    <ArrowDown className="size-4" />
                    <span>{t("tasks.survey.moveSectionDown")}</span>
                  </DropdownMenuItem>
                  {onMergeSection && (
                    <DropdownMenuItem
                      onClick={onMergeSection}
                      className="cursor-pointer"
                    >
                      <CornerLeftUp className="size-4" />
                      <span>{t("tasks.survey.mergeWithAbove")}</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={onDelete}
                    className="cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                    <span>{t("tasks.survey.deleteSection")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {!isCollapsed && (
            <SurveyFormattedInput
              value={description}
              onChange={onDescriptionChange}
              placeholder={t("tasks.survey.sectionDescPlaceholder")}
              variant="underline"
              inputClassName="pb-1 text-sm text-muted-foreground"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function buildSectionTargetOptions(
  sections: SurveySectionGroup[],
  t: (k: string, opts?: Record<string, unknown>) => string,
  excludeSectionId?: string,
): SelectMenuOption[] {
  return [
    {
      value: "NEXT",
      label: t("tasks.survey.continueToNextSection"),
      icon: <ArrowRight className="size-3.5" />,
    },
    ...sections
      .filter((sec) => sec.id !== excludeSectionId)
      .map((sec) => ({
        value: sec.id,
        label: t("tasks.survey.goToSection", {
          index: sec.sectionIndex,
          title:
            stripHtmlTags(sec.title) || t("tasks.survey.defaultSectionTitle"),
        }),
        icon: <CornerDownRight className="size-3.5" />,
      })),
    {
      value: "SUBMIT",
      label: t("tasks.survey.submitFormTarget"),
      icon: <Send className="size-3.5" />,
    },
  ];
}

export function SurveySectionAfterRow(p: {
  section: SurveySectionGroup;
  sections: SurveySectionGroup[];
  onUpdateNext: (section: SurveySectionGroup, nextId: string) => void;
}) {
  const { t } = useTranslation();
  const options = buildSectionTargetOptions(p.sections, t, p.section.id);
  const label = t("tasks.survey.afterSection", {
    index: p.section.sectionIndex,
  });

  return (
    <div className="border-border/80 bg-card/80 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-xs shadow-2xs">
      <div className="text-muted-foreground flex items-center gap-2 font-medium">
        <CornerDownRight className="text-brand-orange size-3.5" />
        <span>{label}</span>
      </div>
      <SelectMenu
        value={p.section.nextSectionId || "NEXT"}
        onChange={(val) => p.onUpdateNext(p.section, val)}
        options={options}
        ariaLabel={label}
        className="bg-background h-8 w-full font-medium sm:w-80"
      />
    </div>
  );
}
