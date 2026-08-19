import type { TeamMemberStat } from "@/types/analytics";
import type { MemberRole } from "@/types/workspace";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ShieldCheck, FileCheck } from "lucide-react";

interface TeamStatsSectionProps {
  stats?: TeamMemberStat[];
  userRole?: MemberRole | null;
  isLoading: boolean;
}

export function TeamStatsSection({
  stats,
  userRole,
  isLoading,
}: TeamStatsSectionProps) {
  // Acceptance Criteria: Team stats section shows per-member post counts (OWNER/ACCOUNT view only)
  const canViewTeamStats = userRole === "OWNER" || userRole === "ACCOUNT";

  if (!canViewTeamStats) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="border-border bg-card space-y-4 rounded-xl border p-5">
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
    <div className="border-border bg-card space-y-4 rounded-xl border p-5">
      <div className="border-border flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-[#f05a28]" />
          <h3 className="text-foreground text-sm font-bold">
            Hiệu suất thành viên (Team Stats)
          </h3>
        </div>
        <span className="flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
          <ShieldCheck className="size-3" /> Chế độ Quản lý ({userRole})
        </span>
      </div>

      <div className="space-y-3.5">
        {stats.map((member) => {
          const rate =
            member.postCount > 0
              ? Math.round((member.publishedCount / member.postCount) * 100)
              : 0;
          return (
            <div key={member.memberId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="bg-muted flex size-6 items-center justify-center rounded-full text-[10px] font-bold">
                    {member.memberName.charAt(0)}
                  </div>
                  <span className="text-foreground font-semibold">
                    {member.memberName}
                  </span>
                  <span className="text-muted-foreground bg-muted py-0.2 rounded px-1.5 text-[10px]">
                    {member.role === "ACCOUNT" ? "AM" : "Creator"}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <span className="text-foreground flex items-center gap-1 font-medium">
                    <FileCheck className="size-3 text-emerald-500" />{" "}
                    {member.publishedCount}/{member.postCount} bài
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-[#f05a28] transition-all duration-300"
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
