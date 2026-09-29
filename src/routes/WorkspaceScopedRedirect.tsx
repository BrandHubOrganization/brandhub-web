import { Navigate } from "react-router-dom";
import { useAgencyStore } from "@/store/agencyStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

interface WorkspaceScopedRedirectProps {
  destination: string;
}

/**
 * Keeps old, unscoped bookmarks working after editor routes became workspace
 * scoped. Prefer the selected workspace, then one from the selected agency.
 */
export function WorkspaceScopedRedirect({
  destination,
}: WorkspaceScopedRedirectProps) {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const workspaceList = useWorkspaceStore((state) => state.workspaceList);
  const currentAgencyId = useAgencyStore((state) => state.currentAgencyId);

  const workspace =
    currentWorkspace ??
    workspaceList.find((item) => item.agencyId === currentAgencyId) ??
    workspaceList[0];

  if (!workspace) {
    return <Navigate to="/workspace" replace />;
  }

  return (
    <Navigate
      to={`/workspaces/${workspace.id}/${destination.replace(/^\//, "")}`}
      replace
    />
  );
}
