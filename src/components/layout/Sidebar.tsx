import * as React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  FileEdit,
  CalendarDays,
  Users,
  BarChart3,
  ShieldAlert,
  ChevronDown,
  Building2,
  FolderKanban,
  LayoutTemplate,
  Hash,
  UserPlus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MemberRole, Workspace } from "@/types/workspace";
import type { SystemRole } from "@/store/authStore";
import { canAccess } from "@/routes/access";

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
}

interface NavSection {
  key: string;
  titleKey: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    key: "overview",
    titleKey: "nav.sections.overview",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
      { to: "/analytics", icon: BarChart3, labelKey: "nav.analytics" },
    ],
  },
  {
    key: "create",
    titleKey: "nav.sections.create",
    items: [
      { to: "/requests", icon: FileEdit, labelKey: "nav.requests" },
      { to: "/editor", icon: FileEdit, labelKey: "nav.editor" },
      { to: "/templates", icon: LayoutTemplate, labelKey: "nav.templates" },
      { to: "/hashtag-groups", icon: Hash, labelKey: "nav.hashtagGroups" },
      { to: "/calendar", icon: CalendarDays, labelKey: "nav.calendar" },
      { to: "/library", icon: FolderKanban, labelKey: "nav.library" },
    ],
  },
  {
    key: "manage",
    titleKey: "nav.sections.manage",
    items: [
      { to: "/clients", icon: Building2, labelKey: "nav.clients" },
      { to: "/workspace", icon: FolderOpen, labelKey: "nav.workspace" },
      { to: "/portal", icon: Users, labelKey: "nav.portal" },
    ],
  },
  {
    key: "system",
    titleKey: "nav.sections.system",
    items: [{ to: "/admin", icon: ShieldAlert, labelKey: "nav.admin" }],
  },
];

export interface SidebarProps {
  collapsed: boolean;
  role?: MemberRole | null;
  systemRole?: SystemRole | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  onSwitchWorkspace: (workspaceId: string) => void;
  className?: string;
  onMobileItemClick?: () => void;
}

export function Sidebar({
  collapsed,
  role = null,
  systemRole = null,
  workspaces,
  activeWorkspace,
  onSwitchWorkspace,
  className,
  onMobileItemClick,
}: SidebarProps) {
  const { t } = useTranslation();
  // Filter sections and items based on role permission
  const filteredSections = NAV_SECTIONS.map((section) => {
    const items = section.items.filter((item) =>
      canAccess(item.to, systemRole, role),
    );

    // Members link needs a dynamic workspaceId path — only add once a
    // workspace is active, and only for roles that manage membership.
    if (
      section.key === "manage" &&
      activeWorkspace &&
      canAccess(`/workspaces/${activeWorkspace.id}/members`, systemRole, role)
    ) {
      items.push({
        to: `/workspaces/${activeWorkspace.id}/members`,
        icon: UserPlus,
        labelKey: "nav.members",
      });
    }

    return { ...section, items };
  }).filter((section) => section.items.length > 0);

  return (
    <div
      className={cn(
        "flex h-full flex-col transition-all duration-200 select-none",
        collapsed ? "w-[60px]" : "w-[220px]",
        className,
      )}
      style={{
        background: "var(--sidebar, #09090b)",
        color: "var(--sidebar-foreground, #fafafa)",
        borderRight: "1px solid var(--sidebar-border, #27272a)",
      }}
    >
      {/* Logo Area */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b px-3",
          collapsed ? "justify-center" : "gap-2.5",
        )}
        style={{ borderColor: "var(--sidebar-border, #27272a)" }}
      >
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          style={{ background: "var(--brand-orange, #f05a28)" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2.2" fill="white" />
            <circle cx="2.5" cy="4" r="1.5" fill="white" />
            <circle cx="13.5" cy="4" r="1.5" fill="white" />
            <circle cx="2.5" cy="12" r="1.5" fill="white" />
            <circle cx="13.5" cy="12" r="1.5" fill="white" />
            <line
              x1="5.8"
              y1="7"
              x2="3.5"
              y2="5"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="10.2"
              y1="7"
              x2="12.5"
              y2="5"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="5.8"
              y1="9"
              x2="3.5"
              y2="11"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="10.2"
              y1="9"
              x2="12.5"
              y2="11"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        {!collapsed && (
          <span className="font-sans text-sm font-bold tracking-tight text-white">
            Brand
            <span style={{ color: "var(--brand-orange, #f05a28)" }}>Hub</span>
          </span>
        )}
      </div>

      {/* Workspace Selector Dropdown */}
      <div
        className="shrink-0 border-b"
        style={{ borderColor: "var(--sidebar-border, #27272a)" }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full cursor-pointer text-left outline-none">
            {collapsed ? (
              <div className="mx-auto my-3 flex size-8 items-center justify-center bg-brand-orange-soft text-brand-orange rounded-md text-xs font-bold">
                {activeWorkspace?.name.charAt(0).toUpperCase() ?? "?"}
              </div>
            ) : (
              <div className="border-border bg-muted/15 hover:bg-muted/30 mx-3 my-3 flex items-center gap-2 rounded-md border p-1.5 transition-colors">
                <div className="flex size-7 shrink-0 items-center justify-center bg-brand-orange-soft text-brand-orange rounded-md text-xs font-bold">
                  {activeWorkspace?.name.charAt(0).toUpperCase() ?? "?"}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-xs leading-tight font-semibold text-white">
                    {activeWorkspace?.name ?? t("nav.workspaceSwitcher.noWorkspace")}
                  </span>
                  <span className="text-muted-foreground mt-0.5 text-3xs leading-none">
                    {t("nav.workspaceSwitcher.label")}
                  </span>
                </div>
                <ChevronDown className="text-muted-foreground ml-auto size-3.5 shrink-0" />
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="ml-2 w-[180px]">
            <DropdownMenuLabel className="text-muted-foreground text-3xs tracking-wider uppercase">
              {t("nav.workspaceSwitcher.selectWorkspace")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => onSwitchWorkspace(ws.id)}
                className={cn(
                  "cursor-pointer text-xs",
                  activeWorkspace?.id === ws.id
                    ? "text-brand-orange font-semibold"
                    : "",
                )}
              >
                {ws.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nav List */}
      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-2 pt-4">
        {filteredSections.map((section, idx) => (
          <div key={section.key} className="space-y-1">
            {!collapsed ? (
              <span className="text-muted-foreground mb-1 block px-2.5 text-3xs font-bold tracking-wider uppercase">
                {t(section.titleKey)}
              </span>
            ) : (
              idx > 0 && <div className="bg-border mx-1 my-2 h-px opacity-20" />
            )}

            <div className="space-y-0.5">
              {section.items.map(({ to, icon: Icon, labelKey }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  onClick={onMobileItemClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                      collapsed ? "justify-center" : "",
                      isActive ? "font-semibold" : "hover:text-white",
                    )
                  }
                  style={({ isActive }) =>
                    isActive
                      ? {
                          background: "var(--brand-orange, #f05a28)",
                          color: "#ffffff",
                        }
                      : { color: "var(--sidebar-foreground, #fafafa)" }
                  }
                  title={collapsed ? t(labelKey) : undefined}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span>{t(labelKey)}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom role indicator */}
      <div
        className={cn(
          "flex flex-col gap-0.5 border-t p-2",
          collapsed ? "items-center" : "",
        )}
        style={{ borderColor: "var(--sidebar-border, #27272a)" }}
      >
        {!collapsed && (
          <div className="text-muted-foreground px-2.5 py-1 text-3xs leading-snug">
            Vai trò:{" "}
            <span className="font-semibold text-white">
              {role === "OWNER"
                ? "Owner"
                : role === "ACCOUNT"
                  ? "Account Manager"
                  : role === "CREATOR"
                    ? "Creator"
                    : role === "VIEWER"
                      ? "Viewer"
                      : role === "CLIENT"
                        ? "Client"
                        : "—"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
