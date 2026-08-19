import type { TeamMemberStat } from "@/types/analytics";
import type { UserRole } from "@/types/user";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ShieldCheck, FileCheck } from "lucide-react";

interface TeamStatsSectionProps {
  stats?: TeamMemberStat[];
  userRole?: UserRole;
  isLoading: boolean;
}

export function TeamStatsSection({ stats, userRole, isLoading }: TeamStatsSectionProps) {
  // Acceptance Criteria: Team stats section shows per-member post counts (AGENCY_OWNER/ACCOUNT_MANAGER view only)
  const canViewTeamStats = userRole === "AGENCY_OWNER" || userRole === "ACCOUNT_MANAGER";

  if (!canViewTeamStats) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-[#f05a28]" />
          <h3 className="text-sm font-bold text-foreground">Hiệu suất thành viên (Team Stats)</h3>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <ShieldCheck className="size-3" /> Chế độ Quản lý ({userRole})
        </span>
      </div>

      <div className="space-y-3.5">
        {stats.map((member) => {
          const rate = member.postCount > 0 ? Math.round((member.publishedCount / member.postCount) * 100) : 0;
          return (
            <div key={member.memberId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                    {member.memberName.charAt(0)}
                  </div>
                  <span className="font-semibold text-foreground">{member.memberName}</span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                    {member.role === "ACCOUNT_MANAGER" ? "AM" : "Creator"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <FileCheck className="size-3 text-emerald-500" /> {member.publishedCount}/{member.postCount} bài
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#f05a28] rounded-full transition-all duration-300"
                  style={{ width: `${rate}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
