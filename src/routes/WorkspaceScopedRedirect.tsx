import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAgencyStore } from "@/store/agencyStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

interface WorkspaceScopedRedirectProps {
  destination: string;
  preserveSearch?: boolean;
}

/**
 * Keeps old, unscoped bookmarks working after editor routes became workspace
 * scoped. Prefer the selected workspace, then one from the selected agency.
 */
export function WorkspaceScopedRedirect({
  destination,
  preserveSearch = false,
}: WorkspaceScopedRedirectProps) {
  const location = useLocation();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const workspaceList = useWorkspaceStore((state) => state.workspaceList);
  const fetchWorkspaces = useWorkspaceStore((state) => state.fetchWorkspaces);
  const currentAgencyId = useAgencyStore((state) => state.currentAgencyId);
  const [checked, setChecked] = useState(
    () => Boolean(currentWorkspace) || workspaceList.length > 0,
  );

  useEffect(() => {
    if (currentWorkspace || workspaceList.length > 0) {
      setChecked(true);
      return;
    }
    let active = true;
    void fetchWorkspaces().finally(() => {
      if (active) setChecked(true);
    });
    return () => {
      active = false;
    };
  }, [currentWorkspace, workspaceList.length, fetchWorkspaces]);

  const workspace =
    currentWorkspace ??
    workspaceList.find((item) => item.agencyId === currentAgencyId) ??
    workspaceList[0];

  if (!workspace) {
    if (!checked) return null;
    return <Navigate to="/workspace" replace />;
  }

  const base = `/workspaces/${workspace.id}/${destination.replace(/^\//, "")}`;
  const target =
    preserveSearch && location.search && !base.includes("?")
      ? `${base}${location.search}`
      : base;

  return <Navigate to={target} replace />;
}
