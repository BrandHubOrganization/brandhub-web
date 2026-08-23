import * as React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { workspaceService } from "@/services/workspaceService";
import { userService } from "@/services/userService";
import { canAccess } from "@/routes/access";

export function AuthGuard() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const systemRole = useAuthStore((s) => s.systemRole);
  const setSystemRole = useAuthStore((s) => s.setSystemRole);
  const memberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const setCurrentMemberRole = useWorkspaceStore((s) => s.setCurrentMemberRole);

  const [roleLoaded, setRoleLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated || !user) return;
    setRoleLoaded(false);
    Promise.all([
      userService
        .getProfile()
        .then(({ data }) =>
          setSystemRole(data.data.role === "ADMIN" ? "ADMIN" : "USER"),
        )
        .catch(() => setSystemRole(null)),
      workspaceService
        .list()
        .then(({ data }) => {
          const ws = data.data[0];
          if (!ws) return setCurrentMemberRole(null);
          return workspaceService
            .listMembers(ws.id)
            .then(({ data: membersRes }) => {
              const me = membersRes.data.find((m) => m.userId === user.id);
              setCurrentMemberRole(me?.role ?? null);
            });
        })
        .catch(() => setCurrentMemberRole(null)),
    ]).finally(() => setRoleLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!roleLoaded) {
    return null;
  }

  if (!canAccess(location.pathname, systemRole, memberRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default AuthGuard;
