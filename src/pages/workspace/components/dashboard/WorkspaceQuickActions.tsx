import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MessageCircleMore,
  FolderKanban,
  PackageOpen,
  FileEdit,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkspaceQuickActionsProps {
  workspaceId: string;
  isManagerOrOwner: boolean;
  isClient: boolean;
  membersByRole?: Record<string, number>;
}

export function WorkspaceQuickActions({
  workspaceId,
  isManagerOrOwner,
  isClient,
  membersByRole,
}: WorkspaceQuickActionsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Quick Shortcuts */}
      <div className="border-border bg-card rounded-2xl border p-5 shadow-xs">
        <h3 className="text-foreground mb-4 font-semibold">
          {t("workspace.dashboard.quickActions")}
        </h3>
        <div className="grid grid-cols-1 gap-2.5">
          {workspaceId && (
            <>
              <button
                type="button"
                onClick={() => navigate(`/workspaces/${workspaceId}/chat`)}
                className="border-border hover:border-brand-orange/40 hover:bg-muted/40 flex items-center justify-between rounded-xl border p-3 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                    <MessageCircleMore className="size-4" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {t("workspace.dashboard.chatWorkspace")}
                    </p>
                    <p className="text-muted-foreground text-2xs">
                      Trao đổi công việc nội bộ và Client
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground size-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate(`/workspaces/${workspaceId}/tasks`)}
                className="border-border hover:border-brand-orange/40 hover:bg-muted/40 flex items-center justify-between rounded-xl border p-3 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-brand-orange-soft text-brand-orange flex size-8 items-center justify-center rounded-lg">
                    <FolderKanban className="size-4" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {t("workspace.dashboard.tasksOverview")}
                    </p>
                    <p className="text-muted-foreground text-2xs">
                      Quản lý tiến độ công việc và phân công
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground size-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(`/workspaces/${workspaceId}/media-package`)
                }
                className="border-border hover:border-brand-orange/40 hover:bg-muted/40 flex items-center justify-between rounded-xl border p-3 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                    <PackageOpen className="size-4" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {t("nav.mediaPackages")}
                    </p>
                    <p className="text-muted-foreground text-2xs">
                      Điều khoản gói và phê duyệt hai bên
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground size-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(`/workspaces/${workspaceId}/content-writing`)
                }
                className="border-border hover:border-brand-orange/40 hover:bg-muted/40 flex items-center justify-between rounded-xl border p-3 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <FileEdit className="size-4" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {t("workspace.dashboard.contentEditor")}
                    </p>
                    <p className="text-muted-foreground text-2xs">
                      Soạn thảo và cộng tác nội dung thời gian thực
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground size-4" />
              </button>

              {isManagerOrOwner && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/workspaces/${workspaceId}/settings`)
                  }
                  className="border-border hover:border-brand-orange/40 hover:bg-muted/40 flex items-center justify-between rounded-xl border p-3 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-slate-500/10 text-slate-600">
                      <Settings className="size-4" />
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        {t("workspace.dashboard.workspaceSettings")}
                      </p>
                      <p className="text-muted-foreground text-2xs">
                        Cấu hình nhận diện, múi giờ và thành viên
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-muted-foreground size-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Members by Role Breakdown */}
      {!isClient && (
        <div className="border-border bg-card rounded-2xl border p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-foreground font-semibold">
              {t("workspace.dashboard.membersByRole")}
            </h3>
            {workspaceId && (
              <Button
                variant="ghost"
                size="sm"
                className="text-brand-orange h-auto p-0 text-xs hover:underline"
                onClick={() => navigate(`/workspaces/${workspaceId}/members`)}
              >
                Quản lý
              </Button>
            )}
          </div>
          <ul className="space-y-2">
            {Object.entries(membersByRole || {}).map(([role, count]) => (
              <li
                key={role}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground flex items-center gap-2">
                  <span className="bg-brand-orange size-1.5 rounded-full" />
                  {role}
                </span>
                <span className="text-foreground font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
