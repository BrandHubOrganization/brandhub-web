import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { canAccess } from "@/routes/access";

export function AuthGuard() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const systemRole = useAuthStore((s) => s.systemRole);
  const memberRole = useWorkspaceStore((s) => s.currentMemberRole);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccess(location.pathname, systemRole, memberRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default AuthGuard;
