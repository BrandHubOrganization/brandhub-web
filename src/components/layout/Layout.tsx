import * as React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAgencyStore } from "@/store/agencyStore";
import { workspaceService } from "@/services/workspaceService";
import { userService } from "@/services/userService";
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
} from "lucide-react";
import type { Workspace } from "@/types/workspace";

const MOBILE_TABS = [
  { to: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { to: "/analytics", icon: BarChart3, labelKey: "nav.analytics" },
  { to: "/editor", icon: FileEdit, labelKey: "nav.editor" },
  { to: "/calendar", icon: CalendarDays, labelKey: "nav.calendar" },
  { to: "/workspace", icon: FolderOpen, labelKey: "nav.workspace" },
  { to: "/portal", icon: Users, labelKey: "nav.portal" },
];

export function Layout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const systemRole = useAuthStore((s) => s.systemRole);
  const setSystemRole = useAuthStore((s) => s.setSystemRole);

  const workspaces = useWorkspaceStore((s) => s.workspaceList);
  const currentAgencyId = useAgencyStore((s) => s.currentAgencyId);
  const setCurrentAgencyId = useAgencyStore((s) => s.setCurrentAgencyId);
  const agencyList = useAgencyStore((s) => s.agencyList);
  const fetchAgencies = useAgencyStore((s) => s.fetchAgencies);
  const agencyWorkspaces = React.useMemo(
    () =>
      currentAgencyId
        ? workspaces.filter((ws) => ws.agencyId === currentAgencyId)
        : [],
    [workspaces, currentAgencyId],
  );
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces);
  const memberRole = useWorkspaceStore((s) => s.currentMemberRole);
  const setCurrentMemberRole = useWorkspaceStore((s) => s.setCurrentMemberRole);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isDevSession = accessToken?.startsWith("dev-token-") ?? false;

  React.useEffect(() => {
    if (isDevSession) return;
    fetchWorkspaces();
    fetchAgencies();
  }, [fetchWorkspaces, fetchAgencies, isDevSession]);

  React.useEffect(() => {
    if (!user || isDevSession) return;
    userService
      .getProfile()
      .then(({ data }) => {
        const role = data.data.role;
        setSystemRole(role === "ADMIN" ? "ADMIN" : "USER");
      })
      .catch(() => setSystemRole(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const activeWorkspace: Workspace | null = React.useMemo(() => {
    if (agencyWorkspaces.length === 0) return null;
    return (
      agencyWorkspaces.find((ws) => ws.id === currentWorkspace?.id) ??
      agencyWorkspaces[0]
    );
  }, [agencyWorkspaces, currentWorkspace]);

  React.useEffect(() => {
    if (activeWorkspace && activeWorkspace.id !== currentWorkspace?.id) {
      setCurrentWorkspace(activeWorkspace);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace]);

  React.useEffect(() => {
    if (!activeWorkspace || !user || isDevSession) return;
    workspaceService
      .listMembers(activeWorkspace.id)
      .then(({ data }) => {
        const me = data.data.find((m) => m.userId === user.id);
        setCurrentMemberRole(me?.role ?? null);
      })
      .catch(() => setCurrentMemberRole(null));
  }, [activeWorkspace, user]);

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

  // Filter mobile tabs based on role
  const filteredMobileTabs = MOBILE_TABS.filter((tab) => {
    if (
      !activeWorkspace &&
      tab.to !== "/dashboard" &&
      tab.to !== "/workspace"
    ) {
      return false;
    }
    return canAccess(tab.to, systemRole, memberRole);
  });

  const handleSwitchWorkspace = (agencyIdArg: string, workspaceId: string) => {
    const ws = workspaces.find((w) => w.id === workspaceId);
    if (!ws) return;
    setCurrentAgencyId(agencyIdArg);
    setCurrentWorkspace(ws);
    navigate(`/workspaces/${workspaceId}/settings`);
  };

  const handleSwitchAgency = (agencyIdArg: string) => {
    setCurrentAgencyId(agencyIdArg);
    if (currentWorkspace?.agencyId !== agencyIdArg) {
      setCurrentWorkspace(null);
    }
    navigate(`/agency/${agencyIdArg}`);
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
        {filteredMobileTabs.slice(0, 5).map(({ to, icon: Icon, labelKey }) => {
          return (
            <NavLink
              key={to}
              to={to}
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
