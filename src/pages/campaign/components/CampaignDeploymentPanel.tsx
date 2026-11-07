import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Circle, Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { campaignService } from "@/pages/campaign/services/campaignService";
import { parseTimeline } from "@/pages/campaign/utils/timelineDates";
import type { Campaign } from "@/pages/campaign/types";
import type { TimelineView } from "@/pages/campaign/types/campaignTimeline";
export function CampaignDeploymentPanel({
  workspaceId,
  campaign,
  data,
  canDeploy,
  canManage,
  blocked,
  canClose,
  onChanged,
  onClose,
}: {
  workspaceId: string;
  campaign: Campaign;
  data?: TimelineView;
  canDeploy: boolean;
  canManage: boolean;
  blocked: boolean;
  canClose: boolean;
  onChanged: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [confirm, setConfirm] = useState(false);
  const timeline = parseTimeline(campaign.timeline);
  const query = useQuery({
    queryKey: ["campaign-deployment", workspaceId, campaign.id],
    queryFn: async () =>
      (await campaignService.deployment(workspaceId, campaign.id)).data.data,
    refetchInterval: (q) => (q.state.data?.status === "PENDING" ? 2500 : false),
  });
  const deployment = query.data;
  useEffect(() => {
    if (
      deployment?.status === "SUCCEEDED" &&
      ["DRAFT", "APPROVED"].includes(campaign.status)
    )
      onChanged();
  }, [deployment?.status, campaign.status, onChanged]);
  const exact =
    !!data &&
    campaign.workItems.length > 0 &&
    campaign.workItems.every((w) =>
      data.rows.some((r) => r.campaignWorkItemId === w.id),
    );
  const conditions: [string, boolean][] = [
    [
      t("campaign.timeline.packageReady"),
      canDeploy ||
        campaign.status === "IN_PROGRESS" ||
        campaign.status === "COMPLETED",
    ],
    [
      t("campaign.timeline.campaignDates"),
      !!timeline.startDate &&
        !!timeline.endDate &&
        timeline.startDate <= timeline.endDate,
    ],
    [t("campaign.workItems"), exact],
    [
      t("campaign.timeline.taskDates"),
      exact && data!.rows.every((r) => !!r.dueDate),
    ],
  ];
  const count = conditions.filter(([, ready]) => ready).length;
  const deploy = useMutation({
    mutationFn: () => campaignService.deploy(workspaceId, campaign),
    onSuccess: async () => {
      setConfirm(false);
      await query.refetch();
      onChanged();
    },
  });
  return (
    <section className="border-border bg-card shrink-0 space-y-3 rounded-xl border p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold">
          {t("campaign.timeline.prerequisites")}
        </h2>
        <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px]">
          {count}/{conditions.length}
        </span>
      </div>
      <ul className="space-y-2.5">
        {conditions.map(([label, ready]) => (
          <li key={label} className="flex gap-2 text-[11px]">
            {ready ? (
              <Check className="text-brand-orange size-3.5 shrink-0" />
            ) : (
              <Circle className="text-muted-foreground size-3.5 shrink-0" />
            )}
            <span>{label}</span>
          </li>
        ))}
      </ul>
      {query.isError && (
        <p role="alert" className="text-destructive text-xs">
          {t("campaign.error")}
        </p>
      )}
      {deployment?.status === "FAILED" && (
        <p role="alert" className="text-destructive text-xs">
          {t("campaign.timeline.deploymentFailed")}
        </p>
      )}
      {canManage &&
        canDeploy &&
        ["DRAFT", "APPROVED"].includes(campaign.status) && (
          <Button
            variant="orange"
            size="sm"
            className="w-full text-xs"
            disabled={
              blocked ||
              count !== conditions.length ||
              deploy.isPending ||
              query.isPending ||
              query.isError ||
              deployment?.status === "PENDING"
            }
            onClick={() => setConfirm(true)}
          >
            <Rocket className="size-3.5" />
            {deployment?.status === "PENDING"
              ? t("campaign.timeline.deploying")
              : t("campaign.timeline.deploy")}
          </Button>
        )}
      {canClose && campaign.status === "IN_PROGRESS" && (
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs"
          onClick={onClose}
        >
          {t("campaign.timeline.closeCampaign")}
        </Button>
      )}
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("campaign.timeline.deployConfirm")}</DialogTitle>
            <DialogDescription>
              {t("campaign.timeline.deployDescription")}
            </DialogDescription>
          </DialogHeader>
          {deploy.isError && (
            <p role="alert" className="text-destructive text-xs">
              {t("campaign.error")}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              {t("campaign.timeline.cancel")}
            </Button>
            <Button
              variant="orange"
              disabled={deploy.isPending || blocked}
              onClick={() => deploy.mutate()}
            >
              {t("campaign.timeline.deploy")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
