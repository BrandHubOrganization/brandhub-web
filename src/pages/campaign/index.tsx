import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { HelpHint } from "@/components/shared/HelpHint";
import { CampaignNextStep } from "@/pages/campaign/components/CampaignNextStep";
import { CampaignForm } from "@/pages/campaign/components/CampaignForm";
import { CampaignDetail } from "@/pages/campaign/components/CampaignDetail";
import { CampaignReview } from "@/pages/campaign/components/CampaignReview";
import { CampaignDelivery } from "@/pages/campaign/components/CampaignDelivery";
import { campaignService } from "@/pages/campaign/services/campaignService";
import type { Campaign, CampaignPlan } from "@/pages/campaign/types";
import type {
  PackageDeliverable,
  WorkspaceMediaPackage,
} from "@/pages/media-package/types/mediaPackage";

export default function CampaignPanel({
  selection,
  canManage,
}: {
  selection: WorkspaceMediaPackage;
  canManage: boolean;
}) {
  const { t } = useTranslation();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);
  const [taskCampaignId, setTaskCampaignId] = useState<string | null>(null);
  const onTasksAvailable = useCallback((id: string, available: boolean) => {
    setTaskCampaignId(available ? id : null);
  }, []);
  const terms = selection.finalTerms;
  const source = terms.offeringDetails as
    { deliverables?: PackageDeliverable[] } | undefined;
  const deliverables = source?.deliverables ?? [];
  const legacy = campaign
    ? !!campaign.allocationPeriod || !campaign.deliverablePlan.length
    : !deliverables.length ||
      (terms.offeringModel === "RETAINER" && terms.quantityBasis !== "TOTAL");
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await campaignService.list(selection.workspaceId);
        if (result.data.data.length > 1)
          throw new Error("Legacy duplicate campaigns require review");
        if (active) setCampaign(result.data.data[0] ?? null);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [selection.workspaceId, reload]);
  async function save(plan: CampaignPlan) {
    setSaving(true);
    try {
      const result = campaign
        ? await campaignService.update(selection.workspaceId, campaign, plan)
        : await campaignService.create(selection.workspaceId, plan);
      setCampaign(result.data.data);
      setEditing(false);
      toast.success(t("campaign.saved"));
    } catch (failure) {
      const code = isAxiosError(failure)
        ? failure.response?.data?.error?.code
        : undefined;
      const known = [
        "CAMPAIGN_ALREADY_EXISTS",
        "CAMPAIGN_VERSION_CONFLICT",
        "CAMPAIGN_LEGACY_TERMS",
        "CAMPAIGN_IMMUTABLE",
      ];
      toast.error(
        t(known.includes(code) ? `campaign.errors.${code}` : "campaign.error"),
      );
    } finally {
      setSaving(false);
    }
  }
  const refreshCampaign = useCallback((value?: Campaign) => {
    if (value) setCampaign(value);
    else {
      setLoading(true);
      setReload((current) => current + 1);
    }
  }, []);
  const stage = campaign?.status ?? "DRAFT";
  const stages = ["DRAFT", "APPROVED", "IN_PROGRESS", "COMPLETED"] as const;
  const currentStageIndex = stages.indexOf(stage);

  return (
    <section className="text-foreground space-y-4">
      <header className="border-border bg-card rounded-xl border p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-sm sm:gap-3">
            <div className="flex items-center gap-1.5 font-semibold tracking-tight">
              <span>{t("campaign.ui.stages")}</span>
              <HelpHint label={t("campaign.title")}>
                {t("campaign.description")}
              </HelpHint>
            </div>
            <div
              className="bg-border hidden h-4 w-px sm:block"
              aria-hidden="true"
            />
            <div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs">
              <span>{t("campaign.ui.sourcePackage")}:</span>
              <span className="text-foreground font-medium">
                {String(terms.name ?? selection.mediaPackage.name)}
              </span>
              <Badge
                variant="outline"
                className="px-1 py-0 text-[10px] font-normal"
              >
                v{campaign?.packageTermsVersion ?? selection.termsVersion}
              </Badge>
              <Link
                className="focus-visible:ring-ring hover:text-foreground ml-0.5 rounded-sm underline underline-offset-4 outline-none focus-visible:ring-2"
                to={`/workspaces/${selection.workspaceId}/media-package`}
              >
                {t("campaign.ui.viewPackage")}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={loading || saving || editing}
              onClick={() => {
                setLoading(true);
                setError(false);
                setReload((value) => value + 1);
              }}
            >
              {t("campaign.reload")}
            </Button>
            {canManage &&
              !legacy &&
              !editing &&
              (!campaign || campaign.status === "DRAFT") && (
                <Button
                  variant="orange"
                  size="sm"
                  disabled={loading || saving}
                  onClick={() => setEditing(true)}
                >
                  {t(campaign ? "campaign.edit" : "campaign.create")}
                </Button>
              )}
          </div>
        </div>
        {!loading && !error && (
          <nav
            aria-label={t("campaign.ui.stages")}
            className="no-scrollbar mt-3 overflow-x-auto py-1"
          >
            <ol className="flex min-w-[560px] items-center justify-between sm:min-w-0">
              {stages.map((status, index) => {
                const isCurrent = stage === status;
                const isCompleted = index < currentStageIndex;

                return (
                  <li
                    key={status}
                    aria-current={isCurrent ? "step" : undefined}
                    className="flex flex-1 items-center last:flex-none"
                  >
                    <div
                      className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs transition-all duration-200 sm:text-sm ${
                        isCurrent
                          ? "border-brand-orange bg-brand-orange/10 text-brand-orange ring-brand-orange/20 font-semibold shadow-xs ring-2"
                          : isCompleted
                            ? "border-brand-orange/40 bg-card text-foreground"
                            : "border-border/60 bg-muted/20 text-muted-foreground opacity-75"
                      }`}
                    >
                      <span
                        className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-200 ${
                          isCurrent
                            ? "bg-brand-orange ring-brand-orange/30 text-white shadow-xs ring-2"
                            : isCompleted
                              ? "bg-brand-orange text-white"
                              : "border-border bg-background text-muted-foreground border"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="size-3 stroke-[2.5]" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span className="font-medium whitespace-nowrap">
                        {t(`campaign.status.${status}`)}
                      </span>
                    </div>

                    {index < stages.length - 1 && (
                      <div
                        className={`mx-2 h-0.5 flex-1 rounded-full transition-colors duration-200 ${
                          index < currentStageIndex
                            ? "bg-brand-orange"
                            : isCurrent
                              ? "from-brand-orange to-border bg-gradient-to-r"
                              : "bg-border/60"
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
      </header>
      {loading && (
        <div role="status" className="flex justify-center p-10">
          <Spinner />
          <span className="sr-only">{t("campaign.reload")}</span>
        </div>
      )}
      {error && (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/5 rounded-xl border p-5 text-sm"
        >
          {t("campaign.error")}
        </p>
      )}
      {!loading && !error && (
        <>
          {campaign && !editing && (
            <CampaignNextStep
              campaign={campaign}
              workspaceId={selection.workspaceId}
              canManage={canManage}
              hasTasks={taskCampaignId === campaign.id}
            />
          )}
          {legacy && (
            <p
              role="alert"
              className="border-border rounded-xl border p-4 text-sm"
            >
              {t("campaign.errors.CAMPAIGN_LEGACY_TERMS")}
            </p>
          )}
          {!campaign && !editing && (
            <div className="border-border bg-muted/20 flex items-center gap-1 rounded-lg border border-dashed p-4 text-sm">
              <h3 className="font-medium">{t("campaign.empty")}</h3>
              <HelpHint label={t("campaign.empty")}>
                {t("campaign.ui.emptyHint")}
              </HelpHint>
            </div>
          )}
          {editing && (
            <CampaignForm
              campaign={campaign}
              deliverables={campaign?.deliverablePlan ?? deliverables}
              durationWeeks={
                typeof terms.durationWeeks === "number"
                  ? terms.durationWeeks
                  : null
              }
              saving={saving}
              onSave={save}
              onCancel={() => setEditing(false)}
            />
          )}
          {campaign && !editing && (
            <>
              <CampaignDetail campaign={campaign} />
              <CampaignReview
                workspaceId={selection.workspaceId}
                campaign={campaign}
                canManage={canManage}
                onApproved={setCampaign}
              />
              <CampaignDelivery
                key={campaign.id}
                workspaceId={selection.workspaceId}
                campaign={campaign}
                canManage={canManage}
                onChanged={refreshCampaign}
                onTasksAvailable={onTasksAvailable}
              />
            </>
          )}
        </>
      )}
    </section>
  );
}
