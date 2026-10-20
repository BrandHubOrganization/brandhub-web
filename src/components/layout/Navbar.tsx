import { toast } from "sonner";
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AtSign,
  Bell,
  CheckCircle,
  Clock,
  Globe,
  Info,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Shield,
  Sun,
  XCircle,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { CrownIcon, type CrownIconHandle } from "@animateicons/react/lucide";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAgencyStore } from "@/store/agencyStore";
import { authService } from "@/services/authService";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MemberRole, Workspace } from "@/types/workspace";
import type { Agency } from "@/types/agency";
import type { AppNotification, NotificationType } from "@/types/notification";
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "@/services/notificationFeed";

const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
  APPROVAL_REQUEST: Clock,
  PUBLISH_SUCCESS: CheckCircle,
  PUBLISH_FAILED: XCircle,
  MENTION: AtSign,
  SYSTEM: Info,
};

// Legacy relative notification links that point at routes namespaced under
// /workspaces/:id/... — inject the active workspace id before navigating.
const WORKSPACE_SCOPED_LINKS = [
  "/requests",
  "/editor",
  "/templates",
  "/hashtag-groups",
  "/calendar",
  "/library",
  "/publish",
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NAV_KEY_MAP: Record<string, string> = {
  dashboard: "nav.dashboard",
  workspace: "nav.workspaceList",
  workspaces: "nav.workspaceList",
  agency: "nav.agencyList",
  portal: "nav.portal",
  editor: "nav.editor",
  calendar: "nav.calendar",
  analytics: "nav.analytics",
  admin: "nav.admin",
  settings: "nav.settings",
  members: "workspace.members.title",
  invitations: "nav.invitations",
  clients: "nav.clients",
  requests: "nav.requests",
  "task-approvals": "tasks.approvalPage.title",
  templates: "nav.templates",
  "hashtag-groups": "nav.hashtagGroups",
  library: "nav.library",
  "social-accounts": "nav.socialAccounts",
  publish: "nav.publish",
  subscription: "nav.subscription",
  plans: "subscription.plans.title",
  checkout: "subscription.checkout.title",
  invoices: "subscription.invoices.title",
  "ai-studio": "nav.aiStudio",
  ambassadors: "aiStudio.ambassadors.title",
  "knowledge-base": "aiStudio.knowledgeBase.title",
  trends: "aiStudio.trends.title",
  reports: "nav.reports",
  "client-profiles": "nav.clientProfile",
  "client-profile": "nav.clientProfile",
  create: "nav.create",
  "notification-settings": "nav.notificationSettings",
  security: "nav.security",
  profile: "nav.profile",
  "media-package": "nav.mediaPackages",
  "media-packages": "nav.manageMediaPackages",
  collaborators: "collaborators.title",
  stats: "nav.agencySub.stats",
  accept: "nav.accept",
  video: "aiStudio.video.title",
  "content-writing": "nav.contentWriting",
  client: "nav.clients",
};

const WORKSPACE_SECTION_ROOTS: Record<
  string,
  { labelKey: string; defaultPath: string }
> = {
  agency: { labelKey: "nav.agencyList", defaultPath: "/agency" },
  workspace: { labelKey: "nav.workspaceList", defaultPath: "/workspace" },
  "client-profiles": {
    labelKey: "nav.clientProfile",
    defaultPath: "/client-profiles",
  },
  clients: { labelKey: "nav.clients", defaultPath: "/clients" },
  reports: { labelKey: "nav.reports", defaultPath: "/reports" },
  "ai-studio": {
    labelKey: "nav.aiStudio",
    defaultPath: "/ai-studio/ambassadors",
  },
};

export interface NavbarProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
  onMobileMenuOpen: () => void;
  memberRole: MemberRole | null;
  workspaces: Workspace[];
  agencies: Agency[];
}

export function Navbar({
  collapsed,
  toggleCollapsed,
  onMobileMenuOpen,
  memberRole,
  workspaces,
  agencies,
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth, systemRole } = useAuthStore();
  const isAdmin = systemRole === "ADMIN";
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const currentAgencyId = useAgencyStore((s) => s.currentAgencyId);
  const currentAgency = useAgencyStore((s) =>
    s.agencyList.find((agency) => agency.id === s.currentAgencyId),
  );
  const canUpgradeAgency = !isAdmin && currentAgencyId !== null && currentAgency?.myRole === "OWNER";
  const crownRef = React.useRef<CrownIconHandle>(null);

  const username = user?.name || user?.email?.split("@")[0] || "User";

  const { theme, setTheme } = useTheme();
  const { i18n, t } = useTranslation();

  const [notifications, setNotifications] = React.useState<AppNotification[]>(
    [],
  );
  const [notificationsError, setNotificationsError] = React.useState(false);
  const [notificationsLoading, setNotificationsLoading] = React.useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const refreshNotifications = React.useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError(false);
    try {
      setNotifications(await getNotifications());
    } catch {
      setNotificationsError(true);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isAdmin) return;
    let cancelled = false;
    const refresh = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const data = await getNotifications();
        if (!cancelled) {
          setNotifications(data);
          setNotificationsError(false);
        }
      } catch {
        if (!cancelled) setNotificationsError(true);
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [isAdmin]);

  async function handleNotificationClick(n: AppNotification) {
    if (!n.isRead) {
      try {
        await markAsRead(n.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === n.id ? { ...item, isRead: true } : item,
          ),
        );
      } catch {
        toast.error(t("notifications.readError"));
        return;
      }
    }
    if (n.linkTo && /^https?:\/\//.test(n.linkTo)) {
      window.open(n.linkTo, "_blank", "noopener,noreferrer");
    } else if (n.linkTo) {
      const resolvedLink =
        currentWorkspace && WORKSPACE_SCOPED_LINKS.includes(n.linkTo)
          ? `/workspaces/${currentWorkspace.id}${n.linkTo}`
          : n.linkTo;
      navigate(resolvedLink);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true })),
      );
    } catch {
      toast.error(t("notifications.readError"));
    }
  }

  const getBreadcrumbs = () => {
    if (isAdmin && location.pathname === "/admin") {
      const requested =
        new URLSearchParams(location.search).get("view") || "overview";
      const view = [
        "overview",
        "users",
        "moderation",
        "revenue",
        "email",
        "reports",
      ].includes(requested)
        ? requested
        : "overview";
      return [
        { label: t("admin.navigation.workspace"), path: "/admin" },
        { label: t(`admin.navigation.${view}`), path: `/admin?view=${view}` },
      ];
    }
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length === 0)
      return [{ label: t("nav.dashboard"), path: "/" }];

    const crumbs: { label: string; path: string }[] = [];
    segments.forEach((seg, idx) => {
      const path = "/" + segments.slice(0, idx + 1).join("/");
      if (UUID_REGEX.test(seg)) {
        // UUID: xác định đây là agency hay workspace dựa vào segment gốc
        const root = segments[0];
        if (root === "workspaces") {
          // Workspace luôn thuộc 1 agency — chèn crumb agency (có link) trước
          // tên workspace để đi đúng phân cấp Agency → Workspace → Dashboard.
          const ws = workspaces.find((w) => w.id === seg);
          if (ws?.agencyId) {
            const agency = agencies.find((a) => a.id === ws.agencyId);
            crumbs.push({
              label: agency?.name ?? t("nav.agencyList"),
              path: `/agency/${ws.agencyId}`,
            });
          }
          crumbs.push({ label: ws?.name ?? seg, path });
          return;
        }
        // Agency UUID
        const entity = agencies.find((a) => a.id === seg);
        crumbs.push({ label: entity?.name ?? seg, path });
        return;
      }
      // "workspaces" root: đã được thay bằng crumb agency ở trên
      if (idx === 0 && seg === "workspaces") return;
      // Các trang thuộc nhóm "Không gian làm việc" (nav.sections.lists)
      if (idx === 0 && WORKSPACE_SECTION_ROOTS[seg]) {
        const item = WORKSPACE_SECTION_ROOTS[seg];
        crumbs.push({ label: t("nav.sections.lists"), path: item.defaultPath });
        crumbs.push({ label: t(item.labelKey), path: item.defaultPath });
        return;
      }
      // Bỏ qua "client" segment giữa đường (vd /client/invitations)
      // để không hiện crumb thừa "Clients"
      if (seg === "client" && idx === 0) {
        crumbs.push({ label: t("nav.clients"), path: "/clients" });
        return;
      }
      const navKey = NAV_KEY_MAP[seg];
      const label = navKey
        ? t(navKey)
        : seg.charAt(0).toUpperCase() + seg.slice(1);
      crumbs.push({ label, path });
    });
    return crumbs;
  };

  const handleLogout = () => {
    // FR 3.2.8: blacklist token server-side (BR-14). Best-effort — clear
    // local state regardless of API outcome (token may already be expired).
    authService.logout().catch(() => {});
    clearAuth();
    navigate("/login");
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === "vi" ? "en" : "vi";
    i18n.changeLanguage(nextLang);
  };

  const breadcrumbs = getBreadcrumbs();
  const roleLabel =
    !isAdmin && memberRole ? t(`workspace.roles.${memberRole}`) : null;

  return (
    <header
      className="bg-card border-border flex h-14 w-full items-center justify-between border-b px-4 transition-all"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* Left: Mobile Menu & Sidebar Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 md:hidden"
          onClick={onMobileMenuOpen}
          title={t("nav.openMenu")}
        >
          <Menu className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hidden size-8 md:flex"
          onClick={toggleCollapsed}
          title={collapsed ? t("nav.expandSidebar") : t("nav.collapseSidebar")}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>

        <nav className="text-muted-foreground hidden items-center gap-1.5 text-xs sm:flex">
          {breadcrumbs.map((b, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={`${b.path}-${idx}`}>
                {idx > 0 && <span className="text-muted-foreground/40">/</span>}
                <span
                  className={cn(
                    "transition-colors",
                    isLast
                      ? "text-foreground font-semibold"
                      : "hover:text-foreground cursor-pointer",
                  )}
                  onClick={() => !isLast && navigate(b.path)}
                >
                  {b.label}
                </span>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Real Role Badge (Read-only), Language, Theme, Notifications & User Dropdown */}
      <div className="flex items-center gap-2">
        {/* Real Member Role Badge — only shown once inside a workspace */}
        {roleLabel && (
          <div
            className="flex h-8 items-center gap-1.5 rounded-md border border-dashed px-2.5 text-xs font-semibold select-none"
            style={{
              borderColor: "hsl(var(--brand-orange, 15 88% 55%))",
              color: "hsl(var(--brand-orange, 15 88% 55%))",
              background: "hsl(var(--brand-orange-soft, 15 100% 96%))",
            }}
            title={t("nav.realRoleTitle")}
          >
            <Shield className="size-3.5 shrink-0" />
            <span className="hidden sm:inline">
              {t("nav.roleLabel", { role: roleLabel })}
            </span>
            <span className="sm:hidden">{roleLabel.split(" ")[0]}</span>
          </div>
        )}

        {/* Language Switcher */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="h-8 gap-1.5 px-2 text-xs font-medium"
          title={t("nav.switchLanguage")}
        >
          <Globe className="size-3.5" />
          <span className="uppercase">{i18n.language || "vi"}</span>
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={t("nav.toggleTheme")}
        >
          {theme === "dark" ? (
            <Sun className="size-4 text-amber-400" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>

        {/* Notification Bell */}
        {!isAdmin && (
          <DropdownMenu
            onOpenChange={(open) => {
              if (open) void refreshNotifications();
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative size-8"
                title={t("nav.notifications")}
                aria-label={t("nav.notifications")}
              >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="bg-brand-orange text-2xs absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0 text-xs font-semibold">
                  {t("notifications.title")}
                </DropdownMenuLabel>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-brand-orange text-2xs font-medium hover:underline"
                  >
                    {t("notifications.markAllRead")}
                  </button>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notificationsLoading && (
                  <p
                    role="status"
                    className="text-muted-foreground px-2 py-4 text-xs"
                  >
                    {t("notifications.loading")}
                  </p>
                )}
                {notificationsError && (
                  <div role="alert" className="space-y-2 px-2 py-4 text-xs">
                    <p className="text-destructive">
                      {t("notifications.loadError")}
                    </p>
                    <button
                      type="button"
                      onClick={() => void refreshNotifications()}
                      className="text-brand-orange underline"
                    >
                      {t("notifications.retry")}
                    </button>
                  </div>
                )}
                {!notificationsLoading &&
                  !notificationsError &&
                  notifications.length === 0 && (
                    <p className="text-muted-foreground px-2 py-4 text-center text-xs">
                      {t("notifications.empty")}
                    </p>
                  )}
                {!notificationsLoading &&
                  !notificationsError &&
                  notifications.map((n) => {
                    const Icon = NOTIFICATION_ICONS[n.type];
                    return (
                      <DropdownMenuItem
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={cn(
                          "cursor-pointer items-start gap-2 py-2 text-xs",
                          !n.isRead && "bg-muted/40",
                        )}
                      >
                        <Icon className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                        <div className="flex-1 space-y-0.5">
                          <p
                            className={cn(
                              "font-medium",
                              n.isRead
                                ? "text-muted-foreground"
                                : "text-foreground",
                            )}
                          >
                            {n.title}
                          </p>
                          <p className="text-muted-foreground text-2xs">
                            {n.message}
                          </p>
                        </div>
                        {!n.isRead && (
                          <span className="bg-brand-orange mt-1 size-1.5 shrink-0 rounded-full" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate("/notification-settings")}
                className="cursor-pointer justify-center gap-1.5 text-xs font-medium"
              >
                <Settings className="size-3.5" />
                {t("notifications.viewSettings")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {canUpgradeAgency && (
          <Button
            variant="ghost"
            size="icon"
            className="group relative size-8 text-amber-500 hover:bg-amber-500/10 hover:text-amber-600 dark:text-amber-400 dark:hover:bg-amber-400/15 dark:hover:text-amber-300 transition-colors"
            onMouseEnter={() => crownRef.current?.startAnimation()}
            onMouseLeave={() => crownRef.current?.stopAnimation()}
            onClick={() => navigate("/subscription/plans")}
            title={t("subscription.plans.upgrade")}
            aria-label={t("subscription.plans.upgrade")}
            data-testid="agency-upgrade-button"
          >
            <CrownIcon
              ref={crownRef}
              size={18}
              duration={1}
              color="#f59e0b"
              className="dark:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            />
          </Button>
        )}

        <div className="bg-border mx-1 h-4 w-px" />

        {/* User → click thẳng vào Cài đặt */}
        <button
          type="button"
          onClick={() => navigate("/settings")}
          title={t("nav.settings")}
          className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 transition-colors outline-none"
        >
          <div className="bg-brand-orange-soft text-brand-orange border-brand-orange/20 flex size-7 items-center justify-center rounded-full border text-xs font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
          <span className="text-foreground hidden max-w-[120px] truncate text-xs font-semibold sm:inline">
            {username}
          </span>
          <Settings className="text-muted-foreground size-3.5 shrink-0" />
        </button>

        {/* Trợ giúp & Hướng dẫn Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground size-8 cursor-pointer"
              title={t("nav.sections.help", "Trợ giúp & Hướng dẫn")}
            >
              <HelpCircle className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1">
            <DropdownMenuLabel className="text-muted-foreground text-3xs px-2 py-1.5 font-semibold tracking-wider uppercase">
              {t("nav.sections.help", "Trợ giúp & Hướng dẫn")}
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigate("/help/faq")}
              className="cursor-pointer gap-2 py-2 text-xs"
            >
              <HelpCircle className="text-brand-orange size-4" />
              <div>
                <p className="text-foreground font-medium">
                  {t("nav.faq", "Hỏi đáp (FAQ)")}
                </p>
                <p className="text-muted-foreground text-3xs">
                  Câu hỏi thường gặp & giải đáp
                </p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/help/guide")}
              className="cursor-pointer gap-2 py-2 text-xs"
            >
              <BookOpen className="text-brand-orange size-4" />
              <div>
                <p className="text-foreground font-medium">
                  {t("nav.guide", "Cẩm nang hướng dẫn")}
                </p>
                <p className="text-muted-foreground text-3xs">
                  Tài liệu kiến trúc & quản trị
                </p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
          onClick={handleLogout}
          title={t("nav.logout")}
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}

export default Navbar;
