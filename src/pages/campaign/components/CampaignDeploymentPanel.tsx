import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, Circle, Rocket } from "lucide-react";
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
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  onChanged,
}: {
  workspaceId: string;
  campaign: Campaign;
  data?: TimelineView;
  canDeploy: boolean;
  canManage: boolean;
  blocked: boolean;
  onChanged: () => void;
}) {
  const { t } = useTranslation();
  const [confirm, setConfirm] = useState(false);
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showConditions = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setConditionsOpen(true);
  };
  const hideConditions = () => {
    closeTimer.current = setTimeout(() => setConditionsOpen(false), 180);
  };
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );
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
    <>
      <Popover open={conditionsOpen} onOpenChange={setConditionsOpen}>
        <PopoverAnchor asChild>
          <div
            className="flex items-center gap-1"
            onMouseEnter={showConditions}
            onMouseLeave={hideConditions}
          >
            {canManage && ["DRAFT", "APPROVED"].includes(campaign.status) && (
              <Button
                variant="orange"
                size="sm"
                className="gap-2 text-xs"
                disabled={
                  !canDeploy ||
                  blocked ||
                  count !== conditions.length ||
                  deploy.isPending ||
                  query.isPending ||
                  query.isError ||
                  deployment?.status === "PENDING"
                }
                onFocus={showConditions}
                onClick={() => {
                  setConditionsOpen(false);
                  setConfirm(true);
                }}
              >
                <Rocket className="size-3.5" />
                {deployment?.status === "PENDING"
                  ? t("campaign.timeline.deploying")
                  : t("campaign.timeline.deploy")}
                <span className="rounded bg-white/15 px-1 text-[10px]">
                  {count}/{conditions.length}
                </span>
              </Button>
            )}
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="size-8"
                aria-label={t("campaign.timeline.prerequisites")}
              >
                <ChevronDown className="size-3.5" />
              </Button>
            </PopoverTrigger>
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="end"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onMouseEnter={showConditions}
          onMouseLeave={hideConditions}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xs font-semibold">
              {t("campaign.timeline.prerequisites")}
            </h2>
            <span className="text-muted-foreground text-xs">
              {count}/{conditions.length}
            </span>
          </div>
          <ul className="mt-3 space-y-2.5">
            {conditions.map(([label, ready]) => (
              <li key={label} className="flex gap-2 text-xs">
                {ready ? (
                  <Check
                    aria-hidden
                    className="text-brand-orange size-3.5 shrink-0"
                  />
                ) : (
                  <Circle
                    aria-hidden
                    className="text-muted-foreground size-3.5 shrink-0"
                  />
                )}
                <span>{label}</span>
              </li>
            ))}
          </ul>
          {query.isError && (
            <p role="alert" className="text-destructive mt-3 text-xs">
              {t("campaign.error")}
            </p>
          )}
          {deployment?.status === "FAILED" && (
            <p role="alert" className="text-destructive mt-3 text-xs">
              {t("campaign.timeline.deploymentFailed")}
            </p>
          )}
          {blocked && (
            <p className="text-muted-foreground mt-3 text-xs">
              {t("campaign.timeline.unsaved")}
            </p>
          )}
        </PopoverContent>
      </Popover>
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
    </>
  );
}
