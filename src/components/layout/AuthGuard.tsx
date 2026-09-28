import * as React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { userService } from "@/services/userService";
import { canAccess } from "@/routes/access";

export function AuthGuard() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const systemRole = useAuthStore((s) => s.systemRole);
  const setSystemRole = useAuthStore((s) => s.setSystemRole);
  const workspaceList = useWorkspaceStore((s) => s.workspaceList);
  const currentMemberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces);

  const accessToken = useAuthStore((s) => s.accessToken);
  const isDevSession = accessToken?.startsWith("dev-token-") ?? false;

  const [roleLoaded, setRoleLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (isDevSession) {
      setRoleLoaded(true);
      return;
    }
    setRoleLoaded(false);
    Promise.all([
      userService
        .getProfile()
        .then(({ data }) =>
          setSystemRole(data.data.role === "ADMIN" ? "ADMIN" : "USER"),
        )
        .catch(() => setSystemRole(null)),
      fetchWorkspaces(),
    ]).finally(() => setRoleLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  // Role phải theo ĐÚNG workspace trong URL (/workspaces/:id/...) khi có,
  // không phải workspace[0] bất kỳ — user có role khác nhau ở mỗi workspace.
  // myRole (từ GET /workspaces) đã có case OWNER qua agency ownership,
  // không cần fetch listMembers riêng (bug cũ: bỏ sót owner-thuần).
  // Các route thao tác trong 1 workspace cụ thể (/editor, /requests, ...)
  // giờ đều namespace /workspaces/:id/... nên rơi đúng nhánh trên. Fallback
  // currentMemberRole dưới đây chỉ còn phục vụ route KHÔNG gắn 1 workspace
  // cụ thể (/clients, /invitations, /portal, ...) — dùng workspaceList[0]
  // ở đây từng đá nhầm user về /dashboard khi workspace active không phải
  // workspace đầu tiên trong danh sách.
  const workspaceIdInUrl = location.pathname.match(
    /^\/workspaces\/([^/]+)/,
  )?.[1];
  const memberRole = workspaceIdInUrl
    ? (workspaceList.find((w) => w.id === workspaceIdInUrl)?.myRole ?? null)
    : currentMemberRole;

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
