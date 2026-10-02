import * as React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAgencyStore } from "@/store/agencyStore";
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
  const currentAgencyId = useAgencyStore((s) => s.currentAgencyId);
  const agencyList = useAgencyStore((s) => s.agencyList);
  const fetchAgencies = useAgencyStore((s) => s.fetchAgencies);

  const accessToken = useAuthStore((s) => s.accessToken);
  const isDevSession = accessToken?.startsWith("dev-token-") ?? false;

  const [roleLoaded, setRoleLoaded] = React.useState(false);
  const bootstrappedUserIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated || !user) return;
    // React StrictMode replays effects in development. Keep bootstrap idempotent
    // so opening a workspace does not issue the same three requests twice.
    if (bootstrappedUserIdRef.current === user.id) return;
    bootstrappedUserIdRef.current = user.id;

    if (isDevSession) {
      // Dev quick-login vẫn cần agencyList để agencyFallbackRole (dưới)
      // hoạt động — thiếu bước này thì Owner/Member vào /reports, /clients
      // (agency-level, không qua workspace cụ thể) bị đá nhầm về /dashboard
      // vì agencyList rỗng lúc canAccess() chạy.
      Promise.all([fetchWorkspaces(), fetchAgencies()]).finally(() =>
        setRoleLoaded(true),
      );
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
      fetchAgencies(),
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
  const agencyIdCandidate = location.pathname.match(/^\/agency\/([^/]+)/)?.[1];
  const agencyIdInUrl = agencyList.some(
    (agency) => agency.id === agencyIdCandidate,
  )
    ? agencyIdCandidate
    : null;
  const agencyContextId = agencyIdInUrl ?? currentAgencyId;
  // Agency-level route (/reports, /clients, ...) truy cập KHÔNG qua 1
  // workspace cụ thể — currentMemberRole (workspace-scoped) luôn null ở đây,
  // đá nhầm agency Owner/Member về /dashboard dù access.ts cho phép
  // OWNER/MANAGER. Fallback: nếu chưa ở trong workspace nào VÀ agency hiện
  // tại có myRole, suy ra quyền tương đương cấp workspace — agency OWNER
  // xem như OWNER, agency MEMBER (nhân sự nội bộ, không phải CLIENT) xem
  // như MANAGER cho mục đích các trang quản lý cấp agency này.
  const agencyFallbackRole =
    !workspaceIdInUrl && !currentMemberRole && agencyContextId
      ? (() => {
          const myRole = agencyList.find(
            (a) => a.id === agencyContextId,
          )?.myRole;
          if (myRole === "OWNER") return "OWNER" as const;
          if (myRole === "MEMBER") return "MANAGER" as const;
          return null;
        })()
      : null;
  const isLegacyWorkspaceRoute = [
    "/requests",
    "/editor",
    "/templates",
    "/hashtag-groups",
    "/calendar",
    "/library",
    "/publish",
    "/portal",
    "/client-profile",
  ].some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(`${route}/`),
  );
  const legacyWorkspaceRole = isLegacyWorkspaceRoute
    ? (workspaceList.find((workspace) => workspace.agencyId === currentAgencyId)
        ?.myRole ??
      workspaceList[0]?.myRole ??
      null)
    : null;
  const checkWorkspaceMediaPackage = useWorkspaceStore(
    (s) => s.checkWorkspaceMediaPackage,
  );
  const checkedPackageWorkspaceIdsRef = React.useRef(new Set<string>());

  const workspaceInUrl = workspaceIdInUrl
    ? (workspaceList.find((w) => w.id === workspaceIdInUrl) ?? null)
    : null;

  const memberRole = workspaceIdInUrl
    ? (workspaceInUrl?.myRole ?? null)
    : (currentMemberRole ?? legacyWorkspaceRole ?? agencyFallbackRole);

  const isMediaPackageRoute =
    !!workspaceIdInUrl &&
    (location.pathname === `/workspaces/${workspaceIdInUrl}/media-package` ||
      location.pathname.startsWith(
        `/workspaces/${workspaceIdInUrl}/media-package/`,
      ));

  const isChatRoute =
    !!workspaceIdInUrl &&
    (location.pathname === `/workspaces/${workspaceIdInUrl}/chat` ||
      location.pathname.startsWith(`/workspaces/${workspaceIdInUrl}/chat/`));

  const isAllowedHardGateRoute = isMediaPackageRoute || isChatRoute;

  React.useEffect(() => {
    if (
      !roleLoaded ||
      !workspaceIdInUrl ||
      memberRole !== "CLIENT" ||
      !workspaceInUrl ||
      workspaceInUrl.packageNegotiationStatus !== undefined ||
      checkedPackageWorkspaceIdsRef.current.has(workspaceIdInUrl)
    ) {
      return;
    }
    // An API error must not immediately retrigger this effect forever. A fresh
    // page load can retry, while this mounted guard checks each workspace once.
    checkedPackageWorkspaceIdsRef.current.add(workspaceIdInUrl);
    void checkWorkspaceMediaPackage(workspaceIdInUrl);
  }, [
    roleLoaded,
    workspaceIdInUrl,
    memberRole,
    workspaceInUrl,
    checkWorkspaceMediaPackage,
  ]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!roleLoaded) {
    return null;
  }

  // Hard Gate: cho đến khi gói được cả hai bên chốt (APPROVED), Client chỉ
  // được truy cập /media-package và /chat. Các trang khác chuyển về negotiation.
  if (workspaceIdInUrl && memberRole === "CLIENT") {
    if (!isAllowedHardGateRoute) {
      if (workspaceInUrl?.packageNegotiationStatus === undefined) {
        return null;
      }
      if (workspaceInUrl.packageNegotiationStatus !== "APPROVED") {
        return (
          <Navigate
            to={`/workspaces/${workspaceIdInUrl}/media-package`}
            replace
          />
        );
      }
    }
  }

  if (!canAccess(location.pathname, systemRole, memberRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default AuthGuard;
