import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  return (
    <section className="border-border bg-card space-y-4 rounded-xl border p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-semibold">{t("campaign.ux.nextStep")}</h3>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          {t(
            `campaign.ux.${!canManage && (stage === "APPROVED" || stage === "IN_PROGRESS") ? "clientGuidance" : "guidance"}.${stage}`,
          )}
        </p>
      </div>
      <nav
        aria-label={t("campaign.ux.sections")}
        className="flex flex-wrap gap-2"
      >
        <Button variant="outline" size="sm" asChild>
          <a href="#campaign-plan">{t("campaign.ux.plan")}</a>
        </Button>
        <Button
          variant={stage === "DRAFT" ? "orange" : "outline"}
          size="sm"
          asChild
        >
          <a href="#campaign-review">{t("campaign.review.title")}</a>
        </Button>
        {stage !== "DRAFT" && (
          <Button
            variant={stage === "APPROVED" ? "orange" : "outline"}
            size="sm"
            asChild
          >
            <a href="#campaign-delivery">{t("campaign.delivery.title")}</a>
          </Button>
        )}
        <Button
          variant={
            stage === "IN_PROGRESS" || stage === "COMPLETED"
              ? "orange"
              : "outline"
          }
          size="sm"
          asChild
        >
          <Link to={`/workspaces/${workspaceId}/tasks`}>
            {t("campaign.ux.openTasks")}
          </Link>
        </Button>
      </nav>
    </section>
  );
}
