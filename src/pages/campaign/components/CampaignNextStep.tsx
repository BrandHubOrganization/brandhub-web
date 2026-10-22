import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Compass,
  FileText,
  MessageSquareCheck,
  Navigation,
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

  return (
    <section className="border-border bg-card/80 space-y-4 rounded-xl border p-4 shadow-2xs backdrop-blur-xs sm:p-5">
      <div className="flex items-start gap-3">
        <div className="bg-brand-orange-soft text-brand-orange mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
          <Compass className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold tracking-tight">
            {t("campaign.ux.nextStep")}
          </h3>
          <p className="text-muted-foreground mt-1 text-sm leading-6">
            {t(
              `campaign.ux.${!canManage && (stage === "APPROVED" || stage === "IN_PROGRESS") ? "clientGuidance" : "guidance"}.${stage}`,
            )}
          </p>
        </div>
      </div>

      <nav
        aria-label={t("campaign.ux.sections")}
        className="from-brand-orange/10 via-brand-orange/5 to-muted/20 border-brand-orange/30 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-gradient-to-r p-3 shadow-2xs sm:p-3.5"
      >
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <div className="text-foreground mr-1 flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
            <Navigation className="text-brand-orange size-4 shrink-0" />
          </div>
          <a
            href="#campaign-plan"
            onClick={(e) => scrollToSection(e, "campaign-plan")}
            className="group border-border/80 bg-background/90 text-muted-foreground hover:border-brand-orange/40 hover:bg-brand-orange-soft/40 hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-2xs transition-all duration-150 focus-visible:ring-2 focus-visible:outline-hidden"
          >
            <FileText className="text-muted-foreground group-hover:text-foreground size-3.5 transition-colors" />
            <span>{t("campaign.ux.plan")}</span>
          </a>

          <a
            href="#campaign-review"
            onClick={(e) => scrollToSection(e, "campaign-review")}
            className={`group focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all duration-150 focus-visible:ring-2 focus-visible:outline-hidden ${
              stage === "DRAFT"
                ? "border-brand-orange bg-brand-orange/15 text-brand-orange hover:bg-brand-orange/20 font-semibold shadow-xs"
                : "border-border/80 bg-background/90 text-muted-foreground hover:border-brand-orange/40 hover:bg-brand-orange-soft/40 hover:text-foreground shadow-2xs"
            }`}
          >
            {stage === "DRAFT" && (
              <span className="bg-brand-orange size-2 shrink-0 animate-pulse rounded-full" />
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
              className={`group focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all duration-150 focus-visible:ring-2 focus-visible:outline-hidden ${
                stage === "APPROVED" || stage === "IN_PROGRESS"
                  ? "border-brand-orange bg-brand-orange/15 text-brand-orange hover:bg-brand-orange/20 font-semibold shadow-xs"
                  : "border-border/80 bg-background/90 text-muted-foreground hover:border-brand-orange/40 hover:bg-brand-orange-soft/40 hover:text-foreground shadow-2xs"
              }`}
            >
              {(stage === "APPROVED" || stage === "IN_PROGRESS") && (
                <span className="bg-brand-orange size-2 shrink-0 animate-pulse rounded-full" />
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
        </div>

        <div className="ml-auto">
          <Button
            variant="orange"
            size="sm"
            className="gap-1.5 shadow-2xs"
            asChild
          >
            <Link to={`/workspaces/${workspaceId}/tasks`}>
              <span>{t("campaign.ux.openTasks")}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </nav>
    </section>
  );
}
