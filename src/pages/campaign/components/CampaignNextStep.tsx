import type { MouseEvent, KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Compass,
  FileText,
  MessageSquareCheck,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Campaign } from "@/pages/campaign/types";

export type CampaignTab = "plan" | "delivery" | "review";

export interface CampaignNextStepProps {
  campaign: Campaign;
  workspaceId: string;
  canManage: boolean;
  hasTasks: boolean;
  activeTab?: string;
  onSelectTab?: (tab: CampaignTab) => void;
}

export function CampaignNextStep({
  campaign,
  workspaceId,
  canManage,
  hasTasks,
  activeTab,
  onSelectTab,
}: CampaignNextStepProps) {
  const { t } = useTranslation();
  const stage = campaign.status;

  const handleTabClick = (
    e: MouseEvent<HTMLAnchorElement>,
    tab: CampaignTab,
    id: string,
  ) => {
    if (
      e.button === 0 &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.altKey
    ) {
      e.preventDefault();
      onSelectTab?.(tab);
      requestAnimationFrame(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLAnchorElement>,
    tab: CampaignTab,
    id: string,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectTab?.(tab);
      requestAnimationFrame(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  };

  const guidanceText =
    !hasTasks && stage === "IN_PROGRESS"
      ? t("campaign.ux.awaitingTasks")
      : t(
          `campaign.ux.${!canManage && (stage === "APPROVED" || stage === "IN_PROGRESS") ? "clientGuidance" : "guidance"}.${stage}`,
        );

  return (
    <div className="border-border/80 bg-card/90 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 shadow-2xs backdrop-blur-xs">
      {/* Left: Guidance info */}
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="bg-brand-orange-soft text-brand-orange flex size-7 shrink-0 items-center justify-center rounded-lg">
          <Compass className="size-4" />
        </div>
        <div
          className="max-w-[280px] min-w-0 truncate text-xs sm:max-w-[380px] md:max-w-[450px] lg:max-w-[550px] xl:max-w-[650px]"
          title={guidanceText}
        >
          <span className="text-foreground font-semibold">
            {t("campaign.ux.nextStep")}:
          </span>
          <span className="text-muted-foreground ml-1.5">{guidanceText}</span>
        </div>
      </div>

      {/* Right: Action pills & Button */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        <nav
          aria-label={t("campaign.ux.sections")}
          className="flex flex-wrap items-center gap-1.5 sm:gap-2"
        >
          <a
            href="#campaign-plan"
            role="button"
            tabIndex={0}
            onClick={(e) => handleTabClick(e, "plan", "campaign-plan")}
            onKeyDown={(e) => handleKeyDown(e, "plan", "campaign-plan")}
            aria-pressed={activeTab === "plan"}
            className={`group focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all duration-150 focus-visible:ring-2 focus-visible:outline-hidden ${
              activeTab === "plan"
                ? "border-brand-orange bg-brand-orange/15 text-brand-orange font-semibold shadow-2xs"
                : "border-border/80 bg-background/90 text-muted-foreground hover:border-brand-orange/40 hover:bg-brand-orange-soft/40 hover:text-foreground font-medium shadow-2xs"
            }`}
          >
            <FileText
              className={`size-3.5 transition-colors ${
                activeTab === "plan"
                  ? "text-brand-orange"
                  : "text-muted-foreground group-hover:text-foreground"
              }`}
            />
            <span>{t("campaign.ux.plan")}</span>
          </a>

          <a
            href="#campaign-review"
            role="button"
            tabIndex={0}
            onClick={(e) => handleTabClick(e, "review", "campaign-review")}
            onKeyDown={(e) => handleKeyDown(e, "review", "campaign-review")}
            aria-pressed={activeTab === "review"}
            className={`group focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all duration-150 focus-visible:ring-2 focus-visible:outline-hidden ${
              activeTab === "review"
                ? "border-brand-orange bg-brand-orange/15 text-brand-orange font-semibold shadow-2xs"
                : stage === "DRAFT"
                  ? "border-brand-orange bg-brand-orange/15 text-brand-orange hover:bg-brand-orange/20 font-semibold shadow-2xs"
                  : "border-border/80 bg-background/90 text-muted-foreground hover:border-brand-orange/40 hover:bg-brand-orange-soft/40 hover:text-foreground font-medium shadow-2xs"
            }`}
          >
            {stage === "DRAFT" && (
              <span className="bg-brand-orange size-1.5 shrink-0 animate-pulse rounded-full" />
            )}
            <MessageSquareCheck
              className={`size-3.5 transition-colors ${
                activeTab === "review" || stage === "DRAFT"
                  ? "text-brand-orange"
                  : "text-muted-foreground group-hover:text-foreground"
              }`}
            />
            <span>{t("campaign.review.title")}</span>
          </a>

          <a
            href="#campaign-delivery"
            role="button"
            tabIndex={0}
            onClick={(e) => handleTabClick(e, "delivery", "campaign-delivery")}
            onKeyDown={(e) => handleKeyDown(e, "delivery", "campaign-delivery")}
            aria-pressed={activeTab === "delivery"}
            className={`group focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all duration-150 focus-visible:ring-2 focus-visible:outline-hidden ${
              activeTab === "delivery"
                ? "border-brand-orange bg-brand-orange/15 text-brand-orange font-semibold shadow-2xs"
                : stage === "APPROVED" || stage === "IN_PROGRESS"
                  ? "border-brand-orange bg-brand-orange/15 text-brand-orange hover:bg-brand-orange/20 font-semibold shadow-2xs"
                  : "border-border/80 bg-background/90 text-muted-foreground hover:border-brand-orange/40 hover:bg-brand-orange-soft/40 hover:text-foreground font-medium shadow-2xs"
            }`}
          >
            {(stage === "APPROVED" || stage === "IN_PROGRESS") && (
              <span className="bg-brand-orange size-1.5 shrink-0 animate-pulse rounded-full" />
            )}
            <Rocket
              className={`size-3.5 transition-colors ${
                activeTab === "delivery" ||
                stage === "APPROVED" ||
                stage === "IN_PROGRESS"
                  ? "text-brand-orange"
                  : "text-muted-foreground group-hover:text-foreground"
              }`}
            />
            <span>{t("campaign.delivery.title")}</span>
          </a>
        </nav>

        {hasTasks && (
          <Button
            variant="orange"
            size="sm"
            className="h-8 gap-1.5 text-xs shadow-2xs"
            asChild
          >
            <Link to={`/workspaces/${workspaceId}/tasks`}>
              <span>{t("campaign.ux.openTasks")}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
