import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AtSign,
  Bell,
  CheckCircle,
  ChevronDown,
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
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
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
} from "@/services/mock/mockNotificationService";

const NOTIFICATION_ICONS: Record<NotificationType, React.ElementType> = {
  APPROVAL_REQUEST: Clock,
  PUBLISH_SUCCESS: CheckCircle,
  PUBLISH_FAILED: XCircle,
  MENTION: AtSign,
  SYSTEM: Info,
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NAV_KEY_MAP: Record<string, string> = {
  dashboard: "nav.dashboard",
  workspace: "nav.workspace",
  workspaces: "nav.workspace",
  agency: "nav.agency",
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
  create: "nav.sections.create",
  "notification-settings": "nav.notificationSettings",
  security: "nav.security",
  profile: "nav.profile",
  "client-profile": "nav.clientProfile",
  video: "aiStudio.video.title",
  "change-password": "nav.changePassword",
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
  const { user, clearAuth } = useAuthStore();

  const username = user?.name || user?.email?.split("@")[0] || "User";

  const { theme, setTheme } = useTheme();
  const { i18n, t } = useTranslation();

  const [notifications, setNotifications] = React.useState<AppNotification[]>(
    [],
  );
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  React.useEffect(() => {
    let cancelled = false;
    getNotifications()
      .then((data) => {
        if (!cancelled) setNotifications(data);
      })
      .catch((err) => console.error("Failed to load notifications:", err));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleNotificationClick(n: AppNotification) {
    if (!n.isRead) {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, isRead: true } : item,
        ),
      );
      await markAsRead(n.id);
    }
    if (n.linkTo) navigate(n.linkTo);
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    await markAllAsRead();
  }

  const getBreadcrumbs = () => {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length === 0)
      return [{ label: t("nav.dashboard"), path: "/" }];

    const crumbs: { label: string; path: string }[] = [];
    segments.forEach((seg, idx) => {
      const path = "/" + segments.slice(0, idx + 1).join("/");
      if (UUID_REGEX.test(seg)) {
        // UUID: xác định đây là agency hay workspace dựa vào segment gốc
        // ("agency" hoặc "workspaces") thay vì chỉ tìm trong workspaces —
        // trước đây agency id không map được tên nên bị bỏ luôn khỏi breadcrumb.
        const root = segments[0];
        const entity =
          root === "agency"
            ? agencies.find((a) => a.id === seg)
            : workspaces.find((ws) => ws.id === seg);
        crumbs.push({ label: entity?.name ?? seg, path });
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
  const roleLabel = memberRole ? t(`workspace.roles.${memberRole}`) : null;

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
              <React.Fragment key={b.path}>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative size-8"
              title={t("nav.notifications")}
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
              {notifications.length === 0 && (
                <p className="text-muted-foreground px-2 py-4 text-center text-xs">
                  {t("notifications.empty")}
                </p>
              )}
              {notifications.map((n) => {
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

        <div className="bg-border mx-1 h-4 w-px" />

        {/* User → click thẳng vào Cài đặt, không qua dropdown */}
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
