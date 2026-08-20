import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Globe,
  LogOut,
  Mail,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  Sun,
  User as UserIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
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

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NAV_KEY_MAP: Record<string, string> = {
  workspace: "nav.workspace",
  workspaces: "nav.workspace",
  portal: "nav.portal",
  editor: "nav.editor",
  calendar: "nav.calendar",
  analytics: "nav.analytics",
  admin: "nav.admin",
  settings: "nav.settings",
  members: "workspace.members.title",
  invitations: "nav.invitations",
};

export interface NavbarProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
  onMobileMenuOpen: () => void;
  memberRole: MemberRole | null;
  workspaces: Workspace[];
}

export function Navbar({
  collapsed,
  toggleCollapsed,
  onMobileMenuOpen,
  memberRole,
  workspaces,
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();

  const username = user?.name || user?.email?.split("@")[0] || "User";

  const { theme, setTheme } = useTheme();
  const { i18n, t } = useTranslation();

  const [hasUnreadNotification, setHasUnreadNotification] =
    React.useState(true);

  const getBreadcrumbs = () => {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length === 0)
      return [{ label: t("nav.dashboard"), path: "/" }];

    const crumbs: { label: string; path: string }[] = [];
    segments.forEach((seg, idx) => {
      const path = "/" + segments.slice(0, idx + 1).join("/");
      if (UUID_REGEX.test(seg)) {
        const workspace = workspaces.find((ws) => ws.id === seg);
        if (workspace) crumbs.push({ label: workspace.name, path });
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
    clearAuth();
    navigate("/login");
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === "vi" ? "en" : "vi";
    i18n.changeLanguage(nextLang);
  };

  const breadcrumbs = getBreadcrumbs();
  const roleLabel = memberRole
    ? t(`workspace.roles.${memberRole}`)
    : t("workspace.noRole", { defaultValue: "—" });

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
          title="Open Menu"
        >
          <Menu className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hidden size-8 md:flex"
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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
        {/* Real Member Role Badge for the active workspace */}
        <div
          className="flex h-8 items-center gap-1.5 rounded-md border border-dashed px-2.5 text-xs font-semibold select-none"
          style={{
            borderColor: "var(--brand-orange, #f05a28)",
            color: "var(--brand-orange, #f05a28)",
            background: "var(--brand-orange-soft, #fff0eb)",
          }}
          title="Vai trò thực tế từ Hệ thống Database"
        >
          <Shield className="size-3.5 shrink-0" />
          <span className="hidden sm:inline">Role: {roleLabel}</span>
          <span className="sm:hidden">{roleLabel.split(" ")[0]}</span>
        </div>

        {/* Language Switcher */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="h-8 gap-1.5 px-2 text-xs font-medium"
          title="Switch Language"
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
          title="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="size-4 text-amber-400" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative size-8"
          onClick={() => setHasUnreadNotification(false)}
          title={t("nav.notifications")}
        >
          <Bell className="size-4" />
          {hasUnreadNotification && (
            <span className="bg-brand-orange absolute top-1.5 right-1.5 size-2 rounded-full" />
          )}
        </Button>

        <div className="bg-border mx-1 h-4 w-px" />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 outline-none">
            <div className="bg-brand-orange-soft text-brand-orange border-brand-orange/20 flex size-7 items-center justify-center rounded-full border text-xs font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="text-foreground hidden max-w-[120px] truncate text-xs font-semibold sm:inline">
              {username}
            </span>
            <ChevronDown className="text-muted-foreground size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs leading-none font-medium">{username}</p>
                <p className="text-muted-foreground text-2xs leading-none">
                  {user?.email || t("nav.noEmail")}
                </p>
                <p className="text-brand-orange text-3xs pt-1 leading-none font-bold">
                  {roleLabel}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-xs"
              onClick={() => navigate("/invitations")}
            >
              <Mail className="text-muted-foreground size-3.5" />
              {t("nav.invitations")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/change-password")}
              className="cursor-pointer gap-2 text-xs"
            >
              <UserIcon className="text-muted-foreground size-3.5" />
              Đổi mật khẩu
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-xs text-rose-500 focus:bg-rose-50 focus:text-rose-600 dark:focus:bg-rose-950/50"
            >
              <LogOut className="mr-2 size-3.5" />
              {t("nav.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default Navbar;
