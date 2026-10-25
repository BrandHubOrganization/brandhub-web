import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Users,
  MessageCircleMore,
  Settings,
  FolderKanban,
  LogOut,
  BadgeCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Workspace } from "@/types/workspace";

interface WorkspaceDashboardHeaderProps {
  workspace: Workspace;
  workspaceId: string;
  currentMemberRole: string | null;
  isPackageApproved: boolean;
  isPackageNegotiating: boolean;
  packageStatus?: string;
  isManagerOrOwner: boolean;
  onOpenLeaveDialog: () => void;
}

export function WorkspaceDashboardHeader({
  workspace,
  workspaceId,
  currentMemberRole,
  isPackageApproved,
  isPackageNegotiating,
  packageStatus,
  isManagerOrOwner,
  onOpenLeaveDialog,
}: WorkspaceDashboardHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="border-border bg-card relative mb-6 overflow-hidden rounded-2xl border p-6 shadow-xs">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold shadow-xs select-none"
            style={{
              backgroundColor: workspace.brandColor
                ? `${workspace.brandColor}20`
                : "var(--brand-orange-soft)",
              color: workspace.brandColor || "var(--brand-orange)",
              border: `1.5px solid ${
                workspace.brandColor
                  ? `${workspace.brandColor}40`
                  : "var(--brand-orange)"
              }`,
            }}
          >
            {workspace.logoUrl ? (
              <img
                src={workspace.logoUrl}
                alt={workspace.name}
                className="size-full rounded-2xl object-cover"
              />
            ) : (
              <span>{workspace.name?.charAt(0)?.toUpperCase() || "W"}</span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-foreground text-xl font-bold sm:text-2xl">
                {workspace.name}
              </h1>
              {currentMemberRole && (
                <Badge
                  variant="outline"
                  className="border-brand-orange/30 bg-brand-orange-soft/50 text-brand-orange text-2xs font-semibold"
                >
                  {t("workspace.dashboard.roleInWorkspace")}: {currentMemberRole}
                </Badge>
              )}
              {isPackageApproved ? (
                <Badge className="text-2xs border-emerald-500/30 bg-emerald-500/15 text-emerald-600">
                  <BadgeCheck className="mr-1 size-3" />
                  {t("workspace.dashboard.packageApprovedTitle")}
                </Badge>
              ) : isPackageNegotiating ? (
                <Badge className="text-2xs border-amber-500/30 bg-amber-500/15 text-amber-600">
                  <Clock className="mr-1 size-3" />
                  {packageStatus}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-2xs">
                  {t("workspace.dashboard.noPackage")}
                </Badge>
              )}
            </div>

            <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              {workspace.tagline && (
                <span className="italic">"{workspace.tagline}"</span>
              )}
              {workspace.industry && (
                <span className="flex items-center gap-1">
                  <Building2 className="size-3.5" />
                  {t(`workspace.industry.${workspace.industry}`, {
                    defaultValue: workspace.industry,
                  })}
                </span>
              )}
              {workspace.companySize && (
                <span className="flex items-center gap-1">
                  <Users className="size-3.5" />
                  {workspace.companySize}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Header Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => navigate(`/workspaces/${workspaceId}/chat`)}
          >
            <MessageCircleMore className="size-4" />
            <span>{t("workspace.dashboard.chatWorkspace")}</span>
          </Button>
          {isManagerOrOwner && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => navigate(`/workspaces/${workspaceId}/settings`)}
            >
              <Settings className="size-4" />
              <span className="hidden sm:inline">
                {t("workspace.dashboard.workspaceSettings")}
              </span>
            </Button>
          )}
          <Button
            variant="orange"
            size="sm"
            className="gap-1.5"
            onClick={() => navigate(`/workspaces/${workspaceId}/tasks`)}
          >
            <FolderKanban className="size-4" />
            <span>{t("workspace.dashboard.tasksOverview")}</span>
          </Button>

          {currentMemberRole && currentMemberRole !== "OWNER" && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/50 dark:hover:bg-rose-950/40"
              onClick={onOpenLeaveDialog}
            >
              <LogOut className="size-4" />
              <span>{t("workspace.members.leaveButton", "Rời workspace")}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
