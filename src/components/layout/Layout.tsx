import * as React from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAgencyStore } from "@/store/agencyStore";
import { useClientProfileStore } from "@/store/clientProfileStore";
import { canAccess } from "@/routes/access";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  FolderOpen,
  FileEdit,
  CalendarDays,
  Users,
  BarChart3,
  MessageCircleMore,
  PackageCheck,
} from "lucide-react";
import type { MemberRole, Workspace } from "@/types/workspace";

const MOBILE_TABS = [
  { to: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  {
    to: "/media-package",
    icon: PackageCheck,
    labelKey: "nav.mediaPackages",
    workspaceScoped: true,
  },
  {
    to: "/chat",
    icon: MessageCircleMore,
    labelKey: "nav.chat",
    workspaceScoped: true,
  },
  { to: "/analytics", icon: BarChart3, labelKey: "nav.analytics" },
  {
    to: "/editor",
    icon: FileEdit,
    labelKey: "nav.editor",
    workspaceScoped: true,
  },
  {
    to: "/calendar",
    icon: CalendarDays,
    labelKey: "nav.calendar",
    workspaceScoped: true,
  },
  { to: "/workspace", icon: FolderOpen, labelKey: "nav.workspace" },
  {
    to: "/portal",
    icon: Users,
    labelKey: "nav.portal",
    workspaceScoped: true,
  },
];

export function Layout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const systemRole = useAuthStore((s) => s.systemRole);

  const workspaces = useWorkspaceStore((s) => s.workspaceList);
  const currentAgencyId = useAgencyStore((s) => s.currentAgencyId);
  const setCurrentAgencyId = useAgencyStore((s) => s.setCurrentAgencyId);
  const agencyList = useAgencyStore((s) => s.agencyList);

  // Vào thẳng URL /workspaces/:id/... (bookmark, refresh, quick-login) mà
  // chưa từng đi qua /agency picker → currentAgencyId chưa set → sidebar
  // tưởng "chưa chọn workspace nào", ẩn hết "overview"/"create", role
  // hiện "—". Tự đồng bộ currentAgencyId từ workspace theo URL khi lệch.
  const workspaceIdInUrl = location.pathname.match(
    /^\/workspaces\/([^/]+)/,
  )?.[1];
  const agencyIdCandidate = location.pathname.match(/^\/agency\/([^/]+)/)?.[1];
  React.useEffect(() => {
    if (!workspaceIdInUrl) return;
    const ws = workspaces.find((w) => w.id === workspaceIdInUrl);
    if (ws?.agencyId && ws.agencyId !== currentAgencyId) {
      setCurrentAgencyId(ws.agencyId);
    }
  }, [workspaceIdInUrl, workspaces, currentAgencyId, setCurrentAgencyId]);

  React.useEffect(() => {
    if (
      agencyIdCandidate &&
      agencyIdCandidate !== currentAgencyId &&
      agencyList.some((agency) => agency.id === agencyIdCandidate)
    ) {
      setCurrentAgencyId(agencyIdCandidate);
    }
  }, [agencyIdCandidate, agencyList, currentAgencyId, setCurrentAgencyId]);

  const agencyWorkspaces = React.useMemo(
    () =>
      currentAgencyId
        ? workspaces.filter((ws) => ws.agencyId === currentAgencyId)
        : [],
    [workspaces, currentAgencyId],
  );
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);
  const fetchClientProfileById = useClientProfileStore(
    (s) => s.fetchProfileById,
  );
  const resetClientProfile = useClientProfileStore((s) => s.reset);
  // URL /workspaces/:id/... là nguồn sự thật DUY NHẤT cho "đang ở workspace
  // nào" — không URL đó (vd /agency/:id) thì KHÔNG có workspace active,
  // dù currentWorkspace store còn giữ giá trị từ lần ghé workspace trước
  // đó trong cùng session (mới bắt được: login OWNER, click vào 1
  // workspace, quay lại /agency/:id vẫn hiện "Vai trò: Creator" của
  // workspace cũ vì code trước đây fallback arbitrary agencyWorkspaces[0]
  // bất kể route hiện tại có cần workspace context hay không).
  const activeWorkspace: Workspace | null = React.useMemo(() => {
    if (!workspaceIdInUrl) return null;
    return workspaces.find((ws) => ws.id === workspaceIdInUrl) ?? null;
  }, [workspaceIdInUrl, workspaces]);

  React.useEffect(() => {
    if (activeWorkspace && activeWorkspace.id !== currentWorkspace?.id) {
      setCurrentWorkspace(activeWorkspace);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace]);

  // WorkspaceResponse.myRole đã bao gồm case OWNER (qua agency ownership,
  // không có WorkspaceMember row riêng) — dùng trực tiếp, không tự fetch
  // listMembers rồi tìm theo userId (bug: bỏ sót owner thuần không có
  // WorkspaceMember row ở workspace đó → role về null → owner tự bị
  // chặn /social-accounts, /subscription/*, ẩn mục "manage").
  //
  // Owner gắn với AGENCY (agency.ownerId), không phải workspace — agency
  // chưa có workspace nào (hoặc chưa chọn workspace) vẫn phải hiện "Owner"
  // khi đang xem đúng agency đó. Trước đây memberRole chỉ đọc qua
  // activeWorkspace.myRole nên owner của agency rỗng bị hiện "—" — và tệ
  // hơn, agency MEMBER (không phải owner) cũng bị rỗng luôn dù backend đã
  // biết họ là MEMBER, chỉ vì FE tự suy ownerId thay vì đọc field có sẵn.
  // Đọc thẳng AgencyResponse.myRole (nguồn sự thật từ backend) thay vì tự
  // so ownerId === user.id.
  const currentAgency = agencyList.find((a) => a.id === currentAgencyId);
  const currentAgencyMyRole =
    currentAgency?.myRole ??
    (currentAgency && user?.id && currentAgency.ownerId === user.id ? "OWNER" : null);
  const memberRole: MemberRole | null =
    activeWorkspace?.myRole ??
    (currentAgencyMyRole === "OWNER" ? "OWNER" : null);

  // BA mới — 1 user có N ClientProfile, gắn theo TỪNG WORKSPACE (không phải
  // agency) qua activeWorkspace.clientProfileId. Trước đây fetch theo
  // currentAgencyId, giả định 1 profile dùng chung cả agency — sai vì user
  // có thể là client của agency đó với 2 profile khác nhau ở 2 workspace.
  React.useEffect(() => {
    if (memberRole !== "CLIENT" || !activeWorkspace?.clientProfileId) {
      resetClientProfile();
      return;
    }
    fetchClientProfileById(activeWorkspace.clientProfileId);
  }, [memberRole, activeWorkspace, fetchClientProfileById, resetClientProfile]);

  const currentRole = memberRole;

  // Sidebar collapse state loaded from localStorage
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    const saved = localStorage.getItem("brandhub_sidebar_collapsed");
    return saved === "true";
  });

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("brandhub_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Auto-collapse sidebar at window width < 1280px and desktop mode >= 768px
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280 && window.innerWidth >= 768) {
        setCollapsed(true);
      } else if (window.innerWidth >= 1280) {
        const saved = localStorage.getItem("brandhub_sidebar_collapsed");
        setCollapsed(saved === "true");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isPackageHardGated =
    (memberRole === "CLIENT" || memberRole === "MANAGER") &&
    !!activeWorkspace &&
    activeWorkspace.packageNegotiationStatus !== "APPROVED";

  // Filter mobile tabs based on role
  const filteredMobileTabs = MOBILE_TABS.filter((tab) => {
    if (
      !activeWorkspace &&
      tab.to !== "/dashboard" &&
      tab.to !== "/workspace"
    ) {
      return false;
    }
    if (isPackageHardGated) {
      return tab.to === "/media-package" || tab.to === "/chat";
    }
    return canAccess(tab.to, systemRole, memberRole);
  });

  const handleSwitchWorkspace = (agencyIdArg: string, workspaceId: string) => {
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (!ws) return;
    setCurrentAgencyId(agencyIdArg);
    setCurrentWorkspace(ws);
    // Giữ nguyên trang đang đứng (vd /editor, /calendar) khi đổi workspace
    // — chỉ khi đang thật sự đứng trong 1 trang /workspaces/:id/... nào đó.
    // Đang ở /agency/:id hay trang khác không-workspace-scoped thì phải về
    // /dashboard, không được ghép nguyên pathname cũ vào (workspaceIdInUrl
    // undefined nghĩa là không match — .replace() no-op trả nguyên chuỗi
    // gốc, không phải chuỗi rỗng, nên phải check tường minh, không dựa vào
    // kết quả replace).
    const suffix = workspaceIdInUrl
      ? location.pathname.replace(/^\/workspaces\/[^/]+/, "")
      : "";
    navigate(`/workspaces/${workspaceId}${suffix || "/dashboard"}`);
  };

  const handleSwitchAgency = (agencyIdArg: string) => {
    setCurrentAgencyId(agencyIdArg);
    if (currentWorkspace?.agencyId !== agencyIdArg) {
      setCurrentWorkspace(null);
    }
    navigate(`/agency/${agencyIdArg}`);
  };

  const handleLeaveAgency = () => {
    setCurrentAgencyId(null);
    setCurrentWorkspace(null);
    navigate("/agency");
  };

  const handleLeaveWorkspace = () => {
    const agencyId = currentWorkspace?.agencyId ?? currentAgencyId;
    setCurrentWorkspace(null);
    if (agencyId) {
      navigate(`/agency/${agencyId}`);
    } else {
      navigate("/agency");
    }
  };

  return (
    <div className="bg-background text-foreground flex h-screen w-screen overflow-hidden font-sans">
      {/* ── SIDEBAR (DESKTOP >= 768px) ── */}
      <aside className="hidden h-full shrink-0 md:block">
        <Sidebar
          collapsed={collapsed}
          role={currentRole}
          systemRole={systemRole}
          workspaces={agencyWorkspaces}
          activeWorkspace={activeWorkspace}
          onSwitchWorkspace={handleSwitchWorkspace}
          hasAgency={!!currentAgencyId}
          agencyList={agencyList}
          allWorkspaces={workspaces}
          currentAgencyId={currentAgencyId}
          onSwitchAgency={handleSwitchAgency}
          onLeaveAgency={handleLeaveAgency}
          onLeaveWorkspace={handleLeaveWorkspace}
          currentUserId={user?.id ?? null}
        />
      </aside>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar
          collapsed={collapsed}
          toggleCollapsed={toggleCollapsed}
          onMobileMenuOpen={() => setMobileOpen(true)}
          memberRole={memberRole}
          workspaces={workspaces}
          agencies={agencyList}
        />

        {/* Dynamic Mobile Sheet Drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[240px] border-0 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>{t("nav.navigationMenu")}</SheetTitle>
            </SheetHeader>
            <Sidebar
              collapsed={false}
              role={currentRole}
              systemRole={systemRole}
              workspaces={agencyWorkspaces}
              activeWorkspace={activeWorkspace}
              onSwitchWorkspace={handleSwitchWorkspace}
              onMobileItemClick={() => setMobileOpen(false)}
              hasAgency={!!currentAgencyId}
              agencyList={agencyList}
              allWorkspaces={workspaces}
              currentAgencyId={currentAgencyId}
              onSwitchAgency={handleSwitchAgency}
              onLeaveAgency={handleLeaveAgency}
              onLeaveWorkspace={handleLeaveWorkspace}
              currentUserId={user?.id ?? null}
            />
          </SheetContent>
        </Sheet>

        {/* Page Content Outlet */}
        <main className="bg-background flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* ── BOTTOM TAB BAR (MOBILE ONLY <= 768px) ── */}
      <div
        className="border-border pb-safe fixed right-0 bottom-0 left-0 z-40 flex h-16 items-center justify-around border-t md:hidden"
        style={{
          background: "hsl(var(--card, 0 0% 100%))",
          borderColor: "hsl(var(--border, 240 5.9% 90%))",
        }}
      >
        {filteredMobileTabs
          .slice(0, 5)
          .map(({ to, icon: Icon, labelKey, workspaceScoped }) => {
            const resolvedTo =
              workspaceScoped && activeWorkspace
                ? `/workspaces/${activeWorkspace.id}${to}`
                : to;
            return (
              <NavLink
                key={to}
                to={resolvedTo}
                end={to === "/"}
                className={({ isActive }) =>
                  `text-3xs flex w-12 cursor-pointer flex-col items-center justify-center gap-1 py-1.5 transition-colors ${
                    isActive
                      ? "text-brand-orange font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                <Icon className="size-5 shrink-0" />
                <span className="max-w-[55px] truncate">{t(labelKey)}</span>
              </NavLink>
            );
          })}
      </div>
    </div>
  );
}

export default Layout;
