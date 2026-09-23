import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tree, TreeNode } from "react-organizational-chart";
import { cn } from "@/lib/utils";
import { agencyService } from "@/services/agencyService";
import { workspaceService } from "@/services/workspaceService";
import type { AgencyMember } from "@/types/agency";
import type { MemberRole, Workspace, WorkspaceMember } from "@/types/workspace";

interface Props {
  agencyId: string;
}

interface NodeCardProps {
  name: string;
  role?: MemberRole | "OWNER";
  isRoot?: boolean;
}

function NodeCard({ name, role, isRoot }: NodeCardProps) {
  return (
    <div
      className={cn(
        "bg-card mx-auto flex w-fit max-w-56 min-w-40 flex-col items-center gap-1 rounded-xl border p-3 shadow-xs",
        isRoot && "border-brand-orange",
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          isRoot
            ? "bg-brand-orange text-white"
            : "bg-brand-orange-soft text-brand-orange",
        )}
      >
        {name.charAt(0).toUpperCase()}
      </div>
      <p className="w-full truncate text-center text-sm font-medium">{name}</p>
      {role && (
        <span className="text-muted-foreground bg-muted text-3xs rounded-full px-2 py-0.5 font-semibold">
          {role}
        </span>
      )}
    </div>
  );
}

export function AgencyOrgChart({ agencyId }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<AgencyMember | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [membersByWorkspace, setMembersByWorkspace] = useState<
    Record<string, WorkspaceMember[]>
  >({});
  const [unassigned, setUnassigned] = useState<AgencyMember[]>([]);

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
    <div className="overflow-x-auto pb-4">
      <Tree
        lineWidth="2px"
        lineColor="var(--border, #e5e7eb)"
        lineBorderRadius="8px"
        nodePadding="16px"
        label={<NodeCard name={owner.fullName || owner.email || "—"} isRoot />}
      >
        {workspaces.map((w) => (
          <TreeNode key={w.id} label={<NodeCard name={w.name} />}>
            {(membersByWorkspace[w.id] ?? []).map((m) => (
              <TreeNode
                key={m.id}
                label={
                  <NodeCard name={m.fullName || m.email || "—"} role={m.role} />
                }
              />
            ))}
          </TreeNode>
        ))}
        {unassigned.length > 0 && (
          <TreeNode
            label={<NodeCard name={t("agency.detail.orgChartUnassigned")} />}
          >
            {unassigned.map((m) => (
              <TreeNode
                key={m.id}
                label={<NodeCard name={m.fullName || m.email || "—"} />}
              />
            ))}
          </TreeNode>
        )}
      </Tree>
    </div>
  );
}

export default AgencyOrgChart;
