import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FolderKanban, Layers, Users, Sparkles, PackageOpen } from "lucide-react";
import { StatCard } from "./StatCard";
import type { WorkspaceDashboard } from "@/types/workspace";
import type { Campaign } from "@/pages/campaign/types";
import type { TaskStatsSummary } from "../../types/dashboard";

interface WorkspaceKpiCardsProps {
  workspaceId: string;
  tasksTotal: number;
  tasksLength: number;
  taskStats: TaskStatsSummary;
  campaigns: Campaign[];
  campaignsLoading: boolean;
  campaignsError: boolean;
  dashboard: WorkspaceDashboard;
  packageStatus?: string;
  isClient: boolean;
}

export function WorkspaceKpiCards({
  workspaceId,
  tasksTotal,
  tasksLength,
  taskStats,
  campaigns,
  campaignsLoading,
  campaignsError,
  dashboard,
  packageStatus,
  isClient,
}: WorkspaceKpiCardsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Workspace Tasks */}
      <StatCard
        label={t("workspace.dashboard.tasksOverview")}
        value={tasksTotal || tasksLength}
        icon={FolderKanban}
        sublabel={
          tasksTotal > 0
            ? `${taskStats.inProgressCount} ${t("workspace.dashboard.tasksByStatus.inProgress")}, ${taskStats.reviewCount} ${t("workspace.dashboard.tasksByStatus.review")}`
            : t("workspace.dashboard.noTasks")
        }
        colorClass="text-blue-500"
        bgIconClass="bg-blue-500/10"
        onClick={() => workspaceId && navigate(`/workspaces/${workspaceId}/tasks`)}
      />

      {/* Card 2: Campaigns */}
      <StatCard
        label={t("workspace.dashboard.campaignsOverview")}
        value={
          campaignsLoading || campaignsError || campaigns.length > 1
            ? "—"
            : campaigns.length
        }
        icon={Layers}
        sublabel={
          !campaignsLoading && !campaignsError && campaigns.length === 1
            ? t(`campaign.status.${campaigns[0].status}`)
            : undefined
        }
        colorClass="text-brand-orange"
        bgIconClass="bg-brand-orange-soft"
        onClick={() => workspaceId && navigate(`/workspaces/${workspaceId}/campaigns`)}
      />

      {/* Card 3: Active Members */}
      {!isClient && (
        <StatCard
          label={t("workspace.dashboard.activeMembers")}
          value={dashboard.totalActiveMembers}
          icon={Users}
          sublabel={
            dashboard.membersByRole
              ? Object.entries(dashboard.membersByRole)
                  .map(([role, count]) => `${count} ${role}`)
                  .join(", ")
              : undefined
          }
          colorClass="text-emerald-500"
          bgIconClass="bg-emerald-500/10"
          onClick={() => workspaceId && navigate(`/workspaces/${workspaceId}/members`)}
        />
      )}

      {/* Card 4: Media Package / AI Credits */}
      {!isClient ? (
        <StatCard
          label={t("workspace.dashboard.agencyAiCredits", {
            month: dashboard.aiCreditMonth,
          })}
          value={dashboard.agencyAiCreditsUsedThisMonth ?? 0}
          icon={Sparkles}
          sublabel={
            t("workspace.dashboard.packageStatus") +
            ": " +
            (packageStatus || t("workspace.dashboard.noPackage"))
          }
          colorClass="text-purple-500"
          bgIconClass="bg-purple-500/10"
        />
      ) : (
        <StatCard
          label={t("workspace.dashboard.packageStatus")}
          value={packageStatus || t("workspace.dashboard.noPackage")}
          icon={PackageOpen}
          colorClass="text-purple-500"
          bgIconClass="bg-purple-500/10"
          onClick={() =>
            workspaceId && navigate(`/workspaces/${workspaceId}/media-package`)
          }
        />
      )}
    </div>
  );
}
