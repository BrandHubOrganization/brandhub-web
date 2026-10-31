import type { MouseEvent } from "react";
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

export function CampaignNextStep({
  campaign,
  workspaceId,
  canManage,
}: {
  campaign: Campaign;
  workspaceId: string;
  canManage: boolean;
}) {
  const { t } = useTranslation();
  const stage = campaign.status;

  const scrollToSection = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (
      e.button === 0 &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.altKey
    ) {
      const element = document.getElementById(id);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const guidanceText = t(
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
          className="min-w-0 max-w-[280px] truncate text-xs sm:max-w-[380px] md:max-w-[450px] lg:max-w-[550px] xl:max-w-[650px]"
          title={guidanceText}
        >
          <span className="font-semibold text-foreground">
            {t("campaign.ux.nextStep")}:
          </span>
          <span className="text-muted-foreground ml-1.5">
            {guidanceText}
          </span>
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
            onClick={(e) => scrollToSection(e, "campaign-plan")}
            className="group border-border/80 bg-background/90 text-muted-foreground hover:border-brand-orange/40 hover:bg-brand-orange-soft/40 hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium shadow-2xs transition-all duration-150 focus-visible:ring-2 focus-visible:outline-hidden"
          >
            <FileText className="text-muted-foreground group-hover:text-foreground size-3.5 transition-colors" />
            <span>{t("campaign.ux.plan")}</span>
          </a>

          <a
            href="#campaign-review"
            onClick={(e) => scrollToSection(e, "campaign-review")}
            className={`group focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all duration-150 focus-visible:ring-2 focus-visible:outline-hidden ${
              stage === "DRAFT"
                ? "border-brand-orange bg-brand-orange/15 text-brand-orange hover:bg-brand-orange/20 font-semibold shadow-2xs"
                : "border-border/80 bg-background/90 text-muted-foreground hover:border-brand-orange/40 hover:bg-brand-orange-soft/40 hover:text-foreground font-medium shadow-2xs"
            }`}
          >
            {stage === "DRAFT" && (
              <span className="bg-brand-orange size-1.5 shrink-0 animate-pulse rounded-full" />
            )}
            <MessageSquareCheck
              className={`size-3.5 transition-colors ${
                stage === "DRAFT"
                  ? "text-brand-orange"
                  : "text-muted-foreground group-hover:text-foreground"
              }`}
            />
            <span>{t("campaign.review.title")}</span>
          </a>

          {stage !== "DRAFT" && (
            <a
              href="#campaign-delivery"
              onClick={(e) => scrollToSection(e, "campaign-delivery")}
              className={`group focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all duration-150 focus-visible:ring-2 focus-visible:outline-hidden ${
                stage === "APPROVED" || stage === "IN_PROGRESS"
                  ? "border-brand-orange bg-brand-orange/15 text-brand-orange hover:bg-brand-orange/20 font-semibold shadow-2xs"
                  : "border-border/80 bg-background/90 text-muted-foreground hover:border-brand-orange/40 hover:bg-brand-orange-soft/40 hover:text-foreground font-medium shadow-2xs"
              }`}
            >
              {(stage === "APPROVED" || stage === "IN_PROGRESS") && (
                <span className="bg-brand-orange size-1.5 shrink-0 animate-pulse rounded-full" />
              )}
              <Rocket
                className={`size-3.5 transition-colors ${
                  stage === "APPROVED" || stage === "IN_PROGRESS"
                    ? "text-brand-orange"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              <span>{t("campaign.delivery.title")}</span>
            </a>
          )}
        </nav>

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
      </div>
    </div>
  );
}
