import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { CheckCircle2, Clock } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PackageTermsDiff } from "@/pages/media-package/components/PackageTermsDiff";
import { Button } from "@/components/ui/button";
import { campaignService } from "@/pages/campaign/services/campaignService";
import type {
  Campaign,
  CampaignReviewEvent,
  CampaignVersion,
} from "@/pages/campaign/types";

function comparison(data: Record<string, unknown>): Record<string, unknown> {
  let timeline: Record<string, unknown> = {};
  try {
    timeline =
      typeof data.timeline === "string"
        ? JSON.parse(data.timeline)
        : ((data.timeline ?? {}) as Record<string, unknown>);
  } catch {
    /* Legacy timeline remains absent from the presentation. */
  }
  return {
    name: data.name,
    strategyDetail: data.strategyDetail,
    brandGuideline: data.brandGuideline,
    ...timeline,
    workItems: data.workItems,
  };
}

export function CampaignReview({
  workspaceId,
  campaign,
  canManage,
  onApproved,
}: {
  workspaceId: string;
  campaign: Campaign;
  canManage: boolean;
  onApproved: (value: Campaign) => void;
}) {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<CampaignReviewEvent[]>([]);
  const [versions, setVersions] = useState<CampaignVersion[]>([]);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    Promise.all([
      campaignService.events(workspaceId, campaign.id),
      campaignService.versions(workspaceId, campaign.id),
    ])
      .then(([history, snapshots]) => {
        if (active) {
          setEvents(history.data.data);
          setVersions(snapshots.data.data);
        }
      })
      .catch(() => {
        if (active) toast.error(t("campaign.error"));
      });
    return () => {
      active = false;
    };
  }, [workspaceId, campaign.id, campaign.contentVersion, t]);
  const mine = canManage
    ? campaign.approvedByAgencyVersion === campaign.contentVersion
    : campaign.approvedByClientVersion === campaign.contentVersion;
  const latest = versions.find(
    (item) => item.contentVersion === (selected ?? campaign.contentVersion),
  );
  const previous = versions.find(
    (item) => item.contentVersion === (selected ?? campaign.contentVersion) - 1,
  );
  const currentData = latest
    ? (JSON.parse(latest.snapshot) as Record<string, unknown>)
    : null;
  const previousData = previous
    ? (JSON.parse(previous.snapshot) as Record<string, unknown>)
    : null;
  async function approve() {
    setBusy(true);
    try {
      const result = await campaignService.approve(workspaceId, campaign);
      onApproved(result.data.data);
      toast.success(t("campaign.review.approved"));
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  }
  async function sendFeedback() {
    if (!comment.trim()) return;
    setBusy(true);
    try {
      const result = await campaignService.feedback(
        workspaceId,
        campaign,
        comment.trim(),
      );
      setEvents((items) => [result.data.data, ...items]);
      setComment("");
      toast.success(t("campaign.review.sent"));
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  }
  function showError(error: unknown) {
    const code = isAxiosError(error)
      ? error.response?.data?.error?.code
      : undefined;
    toast.error(
      t(
        code === "CAMPAIGN_VERSION_CONFLICT"
          ? "campaign.errors.CAMPAIGN_VERSION_CONFLICT"
          : code === "CAMPAIGN_PLAN_INCOMPLETE"
            ? "campaign.errors.CAMPAIGN_PLAN_INCOMPLETE"
            : "campaign.error",
      ),
    );
  }
  return (
    <section className="border-border bg-card space-y-5 rounded-xl border p-4 sm:p-6">
      <div>
        <h3 className="text-lg font-semibold">{t("campaign.review.title")}</h3>
        <p className="text-muted-foreground mt-1 text-sm leading-6">
          {t("campaign.ui.approvalHint", { version: campaign.contentVersion })}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["agency", "client"] as const).map((side) => {
          const approved =
            (side === "agency"
              ? campaign.approvedByAgencyVersion
              : campaign.approvedByClientVersion) === campaign.contentVersion;
          const Icon = approved ? CheckCircle2 : Clock;
          return (
            <div
              key={side}
              className="border-border flex items-center gap-3 rounded-lg border p-4"
            >
              <Icon
                className={`size-5 shrink-0 ${approved ? "text-success" : "text-muted-foreground"}`}
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium">
                  {t(`campaign.review.${side}`)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {t(
                    approved
                      ? "campaign.review.done"
                      : "campaign.review.pending",
                  )}{" "}
                  · v{campaign.contentVersion}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {campaign.status === "DRAFT" && (
        <Button
          variant="orange"
          loading={busy}
          disabled={mine}
          onClick={() => void approve()}
        >
          {mine
            ? t("campaign.review.alreadyApproved")
            : t("campaign.review.approve")}
        </Button>
      )}
      {!canManage && campaign.status === "DRAFT" && (
        <div className="bg-muted/30 space-y-3 rounded-lg p-4">
          <label
            htmlFor="campaign-feedback"
            className="block text-sm font-medium"
          >
            {t("campaign.review.feedback")}
          </label>
          <Textarea
            id="campaign-feedback"
            rows={3}
            disabled={busy}
            maxLength={4000}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <Button
            variant="outline"
            loading={busy}
            disabled={!comment.trim()}
            onClick={() => void sendFeedback()}
          >
            {t("campaign.review.send")}
          </Button>
        </div>
      )}
      {events.length > 0 && (
        <details className="border-border rounded-lg border p-4">
          <summary className="focus-visible:ring-ring cursor-pointer rounded-sm text-sm font-medium outline-none focus-visible:ring-2">
            {t("campaign.review.history")} ({events.length})
          </summary>
          <ol className="divide-border mt-4 divide-y">
            {events.map((event) => (
              <li key={event.id} className="py-3 text-sm first:pt-0">
                <p className="font-medium">
                  {t(
                    event.actorSide === "AGENCY"
                      ? "campaign.review.agency"
                      : "campaign.review.client",
                  )}{" "}
                  · v{event.contentVersion} ·{" "}
                  {t(`campaign.review.${event.eventType}`)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {new Intl.DateTimeFormat(i18n.language, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(event.createdAt))}
                </p>
                {event.comment && (
                  <p className="mt-2 leading-6 break-words whitespace-pre-wrap">
                    {event.comment}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </details>
      )}
      {versions.length > 0 && (
        <div className="border-border space-y-3 border-t pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-sm font-semibold">
              {t("campaign.review.changes")}
            </h4>
            <Select
              aria-label={t("campaign.review.changes")}
              value={selected ?? campaign.contentVersion}
              onChange={(event) => setSelected(Number(event.target.value))}
              className="w-32"
            >
              {versions.map((item) => (
                <option key={item.id} value={item.contentVersion}>
                  v{item.contentVersion}
                </option>
              ))}
            </Select>
          </div>
          {selected != null && selected !== campaign.contentVersion && (
            <p className="text-muted-foreground text-xs leading-5">
              {t("campaign.ui.historicalVersion", {
                version: selected,
                current: campaign.contentVersion,
              })}
            </p>
          )}
          {currentData && previousData ? (
            <PackageTermsDiff
              before={comparison(previousData)}
              after={comparison(currentData)}
              title={t("campaign.review.changes")}
              beforeLabel={`v${(selected ?? campaign.contentVersion) - 1}`}
              afterLabel={`v${selected ?? campaign.contentVersion}`}
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              {t("campaign.ui.firstVersion")}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
