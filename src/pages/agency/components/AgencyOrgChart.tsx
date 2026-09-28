import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { agencyService } from "@/services/agencyService";
import { workspaceService } from "@/services/workspaceService";
import {
  MemberProfileDrawer,
  type MemberProfileTarget,
} from "./MemberProfileDrawer";
import type { AgencyMember } from "@/types/agency";
import type { MemberRole, Workspace, WorkspaceMember } from "@/types/workspace";

interface Props {
  agencyId: string;
}

interface NodeCardProps {
  name: string;
  role?: MemberRole | "OWNER";
  isRoot?: boolean;
  onClick?: () => void;
}

function NodeCard({ name, role, isRoot, onClick }: NodeCardProps) {
  const card = (
    <div
      className={cn(
        "bg-card flex w-fit min-w-40 items-center gap-2 rounded-xl border p-2.5 shadow-xs",
        isRoot && "border-brand-orange",
        onClick && "hover:border-brand-orange/50 transition-colors",
      )}
    >
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          isRoot
            ? "bg-brand-orange text-white"
            : "bg-brand-orange-soft text-brand-orange",
        )}
      >
        {name.charAt(0).toUpperCase()}
      </div>
      <p className="max-w-56 truncate text-sm font-medium">{name}</p>
      {role && (
        <span className="text-muted-foreground bg-muted text-3xs shrink-0 rounded-full px-2 py-0.5 font-semibold">
          {role}
        </span>
      )}
    </div>
  );
  if (!onClick) return card;
  return (
    <button type="button" onClick={onClick} className="cursor-pointer">
      {card}
    </button>
  );
}

// Cây phân cấp vẽ tay bằng border (đường nối) — thay cho
// react-organizational-chart's Tree ngang cũ (bắt cuộn ngang liên tục).
// Cấp member (trong 1 workspace) xếp DỌC, nối bằng border-left.
function Branch({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border ml-3.5 space-y-2 border-l-2 pt-2 pl-4">
      {children}
    </div>
  );
}

// Cấp workspace xếp NGANG cạnh nhau (flex-wrap), mỗi workspace 1 cột dọc
// riêng — tận dụng bề ngang, đỡ list dài lê thê khi nhiều workspace.
function WorkspaceRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border ml-3.5 flex flex-wrap gap-4 border-l-2 pt-2 pl-4">
      {children}
    </div>
  );
}

export function AgencyOrgChart({ agencyId }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<AgencyMember | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [membersByWorkspace, setMembersByWorkspace] = useState<
    Record<string, WorkspaceMember[]>
  >({});
  const [unassigned, setUnassigned] = useState<AgencyMember[]>([]);
  const [profileTarget, setProfileTarget] =
    useState<MemberProfileTarget | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      agencyService.listMembers(agencyId),
      workspaceService.list(),
    ]).then(async ([membersRes, workspacesRes]) => {
      if (cancelled) return;
      const agencyMembers = membersRes.data.data;
      const agencyWorkspaces = workspacesRes.data.data.filter(
        (w) => w.agencyId === agencyId,
      );
      setOwner(agencyMembers.find((m) => m.role === "OWNER") ?? null);
      setWorkspaces(agencyWorkspaces);

      const results = await Promise.all(
        agencyWorkspaces.map((w) => workspaceService.listMembers(w.id)),
      );
      if (cancelled) return;

      const byWorkspace: Record<string, WorkspaceMember[]> = {};
      const assignedUserIds = new Set<string>();
      agencyWorkspaces.forEach((w, idx) => {
        const wsMembers = results[idx].data.data;
        byWorkspace[w.id] = wsMembers;
        wsMembers.forEach((m) => {
          if (m.userId) assignedUserIds.add(m.userId);
        });
      });
      setMembersByWorkspace(byWorkspace);
      setUnassigned(
        agencyMembers.filter(
          (m) => m.role !== "OWNER" && !assignedUserIds.has(m.userId),
        ),
      );
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [agencyId]);

  if (loading) return null;
  if (!owner) return null;

  return (
    <div>
      <NodeCard
        name={owner.fullName || owner.email || "—"}
        isRoot
        onClick={() =>
          setProfileTarget({
            userId: owner.userId,
            displayName: owner.fullName || owner.email || "—",
            email: owner.email || "—",
            avatarUrl: owner.avatarUrl,
            role: owner.role,
            joinedAt: owner.joinedAt,
          })
        }
      />

      <WorkspaceRow>
        {workspaces.map((w) => (
          <div key={w.id} className="w-fit">
            <NodeCard
              name={w.name}
              onClick={() => navigate(`/workspaces/${w.id}/settings`)}
            />
            {(membersByWorkspace[w.id] ?? []).length > 0 && (
              <Branch>
                {(membersByWorkspace[w.id] ?? []).map((m) => (
                  <NodeCard
                    key={m.id}
                    name={m.fullName || m.email || "—"}
                    role={m.role}
                    onClick={
                      m.userId
                        ? () =>
                            setProfileTarget({
                              userId: m.userId!,
                              displayName: m.fullName || m.email || "—",
                              email: m.email || "—",
                              avatarUrl: null,
                              role: m.role,
                              joinedAt: m.joinedAt,
                            })
                        : undefined
                    }
                  />
                ))}
              </Branch>
            )}
          </div>
        ))}

        {unassigned.length > 0 && (
          <div className="w-fit">
            <NodeCard name={t("agency.detail.orgChartUnassigned")} />
            <Branch>
              {unassigned.map((m) => (
                <NodeCard
                  key={m.id}
                  name={m.fullName || m.email || "—"}
                  onClick={() =>
                    setProfileTarget({
                      userId: m.userId,
                      displayName: m.fullName || m.email || "—",
                      email: m.email || "—",
                      avatarUrl: m.avatarUrl,
                      role: m.role,
                      joinedAt: m.joinedAt,
                    })
                  }
                />
              ))}
            </Branch>
          </div>
        )}
      </WorkspaceRow>

      <MemberProfileDrawer
        agencyId={agencyId}
        member={profileTarget}
        onOpenChange={(open) => !open && setProfileTarget(null)}
      />
    </div>
  );
}

export default AgencyOrgChart;
