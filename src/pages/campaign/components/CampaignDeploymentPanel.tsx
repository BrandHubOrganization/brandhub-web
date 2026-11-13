import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { ChevronDown, Rocket, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CallChip, HoldButton, StatusMark } from "@/components/micro";
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
  excludedSubtaskIds,
  onChanged,
}: {
  workspaceId: string;
  campaign: Campaign;
  data?: TimelineView;
  canDeploy: boolean;
  canManage: boolean;
  blocked: boolean;
  excludedSubtaskIds?: string[];
  onChanged: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState(false);
  const [revertOpen, setRevertOpen] = useState(false);
  const [revertError, setRevertError] = useState("");
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
    mutationFn: () =>
      campaignService.deploy(workspaceId, campaign, excludedSubtaskIds),
    onSuccess: async () => {
      setConfirm(false);
      await query.refetch();
      await queryClient.invalidateQueries({
        queryKey: ["campaign-deployment", workspaceId, campaign.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["package-preparation", workspaceId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["campaign-timeline", workspaceId, campaign.id],
      });
      onChanged();
    },
  });
  const canRevert =
    canManage &&
    campaign.status !== "COMPLETED" &&
    (campaign.status === "IN_PROGRESS" || !!deployment);
  const undeploy = useMutation({
    mutationFn: async (goToPackages: boolean) => {
      await campaignService.undeploy(workspaceId, campaign);
      return goToPackages;
    },
    onMutate: () => setRevertError(""),
    onSuccess: async (goToPackages) => {
      setRevertOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["campaign-deployment", workspaceId, campaign.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["package-preparation", workspaceId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["workspace-package", workspaceId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["campaign-timeline"],
        }),
      ]);
      onChanged();
      toast.success(
        t("campaign.timeline.undeploySuccess", {
          defaultValue:
            "Đã hủy triển khai chiến dịch. Bạn có thể chọn lại gói dịch vụ hoặc điều chỉnh kế hoạch.",
        }),
      );
      if (goToPackages) {
        navigate(`/workspaces/${workspaceId}/media-package`);
      }
    },
    onError: (failure) => {
      const code = isAxiosError(failure)
        ? failure.response?.data?.error?.code
        : undefined;
      if (code === "CAMPAIGN_REVERT_BLOCKED") {
        setRevertError(
          t("campaign.errors.CAMPAIGN_REVERT_BLOCKED", {
            defaultValue:
              "Không thể hủy triển khai vì đã có công việc đang chờ duyệt, đã hoàn tất hoặc gắn yêu cầu nội dung.",
          }),
        );
        return;
      }
      const key = typeof code === "string" ? `campaign.errors.${code}` : "";
      setRevertError(key && t(key) !== key ? t(key) : t("campaign.error"));
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
            {canRevert && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 border-rose-500/30 text-xs text-rose-700 hover:bg-rose-500/10 dark:text-rose-300"
                disabled={blocked || undeploy.isPending || query.isPending}
                onClick={() => {
                  setRevertError("");
                  setRevertOpen(true);
                }}
              >
                <RotateCcw className="size-3.5" />
                {t("campaign.timeline.undeploy", {
                  defaultValue: "Hủy triển khai",
                })}
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
            <CallChip
              state={
                deployment?.status === "FAILED"
                  ? "error"
                  : deployment?.status === "PENDING"
                    ? "pending"
                    : count === conditions.length
                      ? "success"
                      : "idle"
              }
              tone="orange"
              label={`${count}/${conditions.length}`}
            />
          </div>
          <ul className="mt-3 space-y-2.5">
            {conditions.map(([label, ready]) => (
              <li key={label} className="flex items-center gap-2 text-xs">
                <StatusMark
                  state={ready ? "success" : "idle"}
                  tone="orange"
                  size="xs"
                />
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
          {(excludedSubtaskIds?.length ?? 0) > 0 && (
            <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              {t("campaign.timeline.excludedSubtasksNotice", {
                count: excludedSubtaskIds!.length,
                defaultValue: `Đã bỏ chọn ${excludedSubtaskIds!.length} công việc con — các mục này sẽ không được tạo khi triển khai.`,
              })}
            </p>
          )}
          {deploy.isError && (
            <p role="alert" className="text-destructive text-xs">
              {t("campaign.error")}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              {t("campaign.timeline.cancel")}
            </Button>
            <HoldButton
              durationMs={850}
              loading={deploy.isPending}
              disabled={deploy.isPending || blocked}
              holdHint={t("campaign.timeline.holdToDeploy", {
                defaultValue: "Giữ để triển khai",
              })}
              onCommit={() => deploy.mutateAsync()}
            >
              {t("campaign.timeline.deploy")}
            </HoldButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={revertOpen}
        onOpenChange={(open) => {
          if (!undeploy.isPending) {
            setRevertOpen(open);
            if (!open) setRevertError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("campaign.timeline.undeployConfirmTitle", {
                defaultValue: "Hủy triển khai chiến dịch truyền thông?",
              })}
            </DialogTitle>
            <DialogDescription>
              {t("campaign.timeline.undeployConfirmDescription", {
                defaultValue:
                  "Chiến dịch sẽ quay về trạng thái Bản nháp và mở khóa phần Gói dịch vụ để bạn chọn gói khác hoặc điều chỉnh lại kế hoạch trước khi triển khai lại.",
              })}
            </DialogDescription>
          </DialogHeader>
          {revertError && (
            <p
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-xs"
            >
              {revertError}
            </p>
          )}
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={undeploy.isPending}
              onClick={() => setRevertOpen(false)}
            >
              {t("campaign.timeline.cancel", { defaultValue: "Đóng" })}
            </Button>
            <HoldButton
              tone="destructive"
              durationMs={850}
              loading={undeploy.isPending}
              disabled={undeploy.isPending}
              holdHint={t("campaign.timeline.holdToUndeploy", {
                defaultValue: "Giữ để hủy triển khai",
              })}
              onCommit={() => undeploy.mutateAsync(false)}
            >
              {t("campaign.timeline.undeployOnly", {
                defaultValue: "Hủy triển khai",
              })}
            </HoldButton>
            <HoldButton
              tone="orange"
              durationMs={850}
              loading={undeploy.isPending}
              disabled={undeploy.isPending}
              holdHint={t("campaign.timeline.holdToReselect", {
                defaultValue: "Giữ để hủy & chọn lại gói",
              })}
              onCommit={() => undeploy.mutateAsync(true)}
            >
              {t("campaign.timeline.undeployAndReselect", {
                defaultValue: "Hủy & Chọn lại gói dịch vụ",
              })}
            </HoldButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
