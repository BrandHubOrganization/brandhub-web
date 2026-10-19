import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";
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
  return (
    <section className="text-foreground space-y-4">
      <header className="border-border bg-card rounded-xl border p-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-1 text-sm font-medium">
            {t("campaign.ui.stages")}
            <HelpHint label={t("campaign.title")}>
              {t("campaign.description")}
            </HelpHint>
          </div>
          <Button
            variant="outline"
            disabled={loading || saving || editing}
            onClick={() => {
              setLoading(true);
              setError(false);
              setReload((value) => value + 1);
            }}
          >
            {t("campaign.reload")}
          </Button>
        </div>
        {!loading && !error && (
          <ol
            aria-label={t("campaign.ui.stages")}
            className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4"
          >
            {stages.map((status, index) => (
              <li
                key={status}
                aria-current={stage === status ? "step" : undefined}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${stage === status ? "border-brand-orange bg-brand-orange-soft font-medium" : "border-border text-muted-foreground"}`}
              >
                <span className="bg-background flex size-6 shrink-0 items-center justify-center rounded-full text-xs">
                  {index + 1}
                </span>
                {t(`campaign.status.${status}`)}
              </li>
            ))}
          </ol>
        )}
      </header>
      <div className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs">
            {t("campaign.ui.sourcePackage")}
          </p>
          <p className="mt-1 font-medium break-words">
            {String(terms.name ?? selection.mediaPackage.name)}{" "}
            <Badge variant="outline">
              v{campaign?.packageTermsVersion ?? selection.termsVersion}
            </Badge>
          </p>
        </div>
        <Link
          className="focus-visible:ring-ring rounded-sm text-sm underline underline-offset-4 outline-none focus-visible:ring-2"
          to={`/workspaces/${selection.workspaceId}/media-package`}
        >
          {t("campaign.ui.viewPackage")}
        </Link>
      </div>
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
          {canManage && !legacy && !editing && (
            <div className="flex flex-col items-end gap-2">
              <Button
                variant="orange"
                disabled={!!campaign && campaign.status !== "DRAFT"}
                aria-describedby={
                  campaign && campaign.status !== "DRAFT"
                    ? "campaign-edit-lock"
                    : undefined
                }
                onClick={() => setEditing(true)}
              >
                {t(campaign ? "campaign.edit" : "campaign.create")}
              </Button>
              {campaign && campaign.status !== "DRAFT" && (
                <p
                  id="campaign-edit-lock"
                  className="text-muted-foreground max-w-xl text-sm leading-6"
                >
                  {t("campaign.ui.editLocked")}
                </p>
              )}
            </div>
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
                workspaceId={selection.workspaceId}
                campaign={campaign}
                canManage={canManage}
                onChanged={refreshCampaign}
              />
            </>
          )}
        </>
      )}
    </section>
  );
}
