import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { workspaceService } from "@/services/workspaceService";
import { taskService } from "@/services/taskService";
import { campaignService } from "@/pages/campaign/services/campaignService";
import { requireApiData } from "@/lib/apiData";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { extractErrorMessage } from "@/utils/error";
import { getAnalyticsSummary } from "@/services/mock/mockAnalyticsService";
import type { WorkspaceDashboard } from "@/types/workspace";
import type { TaskListItem, TaskStatus } from "@/types/task";
import type { Campaign } from "@/pages/campaign/types";
import type { AnalyticsSummary } from "@/types/analytics";
import type { DashboardTabType, TaskStatsSummary } from "../types/dashboard";

export function useWorkspaceDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { id: workspaceId } = useParams<{ id: string }>();

  const activeTab: DashboardTabType =
    searchParams.get("tab") === "publishing" ? "publishing" : "overview";

  const handleTabChange = (tab: DashboardTabType) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === "overview") {
        next.delete("tab");
      } else {
        next.set("tab", tab);
      }
      return next;
    });
  };

  const currentMemberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const isClient = currentMemberRole === "CLIENT";
  const isManagerOrOwner =
    currentMemberRole === "MANAGER" || currentMemberRole === "OWNER";

  const [dashboard, setDashboard] = useState<WorkspaceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const loadedWorkspaceIdRef = useRef<string | null>(null);

  // Tasks Data
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [tasksTotal, setTasksTotal] = useState<number>(0);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Campaigns Data
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState(false);
  const [campaignsAttempt, setCampaignsAttempt] = useState(0);

  // Leave Workspace Dialog State
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handleLeave = async () => {
    if (!workspaceId) return;
    setLeaving(true);
    try {
      await workspaceService.leaveWorkspace(workspaceId);
      toast.success(
        t("workspace.members.leaveSuccess", "Bạn đã rời workspace thành công"),
      );
      setLeaveOpen(false);
      useWorkspaceStore.getState().setCurrentWorkspace(null);
      await useWorkspaceStore.getState().fetchWorkspaces();
      navigate("/workspace", { replace: true });
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("common.actionFailed")));
    } finally {
      setLeaving(false);
    }
  };

  // Fetch Dashboard
  useEffect(() => {
    if (!workspaceId) return;
    if (loadedWorkspaceIdRef.current === workspaceId) return;
    loadedWorkspaceIdRef.current = workspaceId;
    setLoading(true);

    workspaceService
      .getDashboard(workspaceId)
      .then(({ data }) => setDashboard(data.data))
      .catch((err: unknown) =>
        toast.error(
          extractErrorMessage(err, t("workspace.dashboard.loadError")),
        ),
      )
      .finally(() => setLoading(false));
  }, [workspaceId, t]);

  // Fetch Tasks
  useEffect(() => {
    if (!workspaceId) return;
    setTasksLoading(true);
    taskService
      .getWorkspaceTasks(workspaceId, {
        size: 5,
        sort: "createdAt",
        direction: "desc",
      })
      .then((res) => {
        setTasks(res.content || []);
        setTasksTotal(res.totalElements || 0);
      })
      .catch((err) => {
        console.warn("Failed to load workspace tasks:", err);
      })
      .finally(() => setTasksLoading(false));
  }, [workspaceId]);

  // Fetch Campaigns
  useEffect(() => {
    if (!workspaceId) return;
    let disposed = false;
    setCampaignsLoading(true);
    setCampaignsError(false);
    setCampaigns([]);
    campaignService
      .list(workspaceId)
      .then((res) => {
        if (!disposed) setCampaigns(requireApiData<Campaign[]>(res.data));
      })
      .catch((err) => {
        console.warn("Failed to load workspace campaigns:", err);
        if (!disposed) setCampaignsError(true);
      })
      .finally(() => {
        if (!disposed) setCampaignsLoading(false);
      });
    return () => {
      disposed = true;
    };
  }, [workspaceId, campaignsAttempt]);

  // Fetch Analytics
  useEffect(() => {
    getAnalyticsSummary().then(setAnalytics);
  }, []);

  // Compute Task Stats
  const taskStats = useMemo<TaskStatsSummary>(() => {
    let todoCount = 0;
    let inProgressCount = 0;
    let reviewCount = 0;
    let completedCount = 0;

    tasks.forEach((item) => {
      if (
        item.status === "BACKLOG" ||
        item.status === "DETAIL_IDENTIFIED" ||
        item.status === "ASSIGNED"
      ) {
        todoCount++;
      } else if (item.status === "IN_PROGRESS") {
        inProgressCount++;
      } else if (
        item.status === "QC_REVIEW" ||
        item.status === "MANAGER_REVIEW" ||
        item.status === "CLIENT_REVIEW"
      ) {
        reviewCount++;
      } else if (item.status === "COMPLETED") {
        completedCount++;
      }
    });

    return { todoCount, inProgressCount, reviewCount, completedCount };
  }, [tasks]);

  const packageStatus = dashboard?.packageNegotiationStatus;
  const isPackageApproved = packageStatus === "APPROVED";
  const isPackageNegotiating =
    packageStatus === "DRAFT" || packageStatus === "NEGOTIATING";

  return {
    workspaceId: workspaceId || "",
    activeTab,
    handleTabChange,
    dashboard,
    loading,
    analytics,
    tasks,
    tasksTotal,
    tasksLoading,
    taskStats,
    campaigns,
    campaignsLoading,
    campaignsError,
    campaignsAttempt,
    setCampaignsAttempt,
    leaveOpen,
    setLeaveOpen,
    leaving,
    handleLeave,
    currentMemberRole,
    isClient,
    isManagerOrOwner,
    packageStatus,
    isPackageApproved,
    isPackageNegotiating,
  };
}
