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

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface NavSection {
  key: string;
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    key: "overview",
    title: "Tổng quan",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/analytics", icon: BarChart3, label: "Analytics" },
    ],
  },
  {
    key: "create",
    title: "Sáng tạo",
    items: [
      { to: "/requests", icon: FileEdit, label: "Content Requests" },
      { to: "/editor", icon: FileEdit, label: "Content Editor" },
      { to: "/templates", icon: LayoutTemplate, label: "Post Templates" },
      { to: "/hashtag-groups", icon: Hash, label: "Hashtag Groups" },
      { to: "/calendar", icon: CalendarDays, label: "Calendar" },
      { to: "/library", icon: FolderKanban, label: "Content Library" },
    ],
  },
  {
    key: "manage",
    title: "Quản lý",
    items: [
      { to: "/clients", icon: Building2, label: "Brand Clients" },
      { to: "/workspace", icon: FolderOpen, label: "Workspaces" },
      { to: "/portal", icon: Users, label: "Client Portal" },
    ],
  },
  {
    key: "system",
    title: "Hệ thống",
    items: [{ to: "/admin", icon: ShieldAlert, label: "Admin Panel" }],
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
  // Filter sections and items based on role permission
  const filteredSections = NAV_SECTIONS.map((section) => {
    let items = section.items.filter((item) => {
      // CLIENT cannot see workspaces or content editor
      if (
        role === "CLIENT" &&
        (item.to === "/workspace" || item.to === "/editor")
      ) {
        return false;
      }
      // OWNER manages the business, doesn't create content directly
      if (
        role === "OWNER" &&
        (item.to === "/editor" || item.to === "/calendar")
      ) {
        return false;
      }
      // Only system ADMIN can see Admin Panel — independent of workspace MemberRole
      if (item.to === "/admin" && systemRole !== "ADMIN") {
        return false;
      }
      return true;
    });

    // Members link needs a dynamic workspaceId path — only add once a
    // workspace is active, and only for roles that manage membership.
    if (
      section.key === "manage" &&
      activeWorkspace &&
      (role === "OWNER" || role === "ACCOUNT")
    ) {
      items = [
        ...items,
        {
          to: `/workspaces/${activeWorkspace.id}/members`,
          icon: UserPlus,
          label: "Members",
        },
      ];
    }

    // Overview link is workspace-independent — shown for OWNER/ACCOUNT even
    // without an active workspace, since it aggregates across all of them.
    if (
      section.key === "overview" &&
      (role === "OWNER" || role === "ACCOUNT")
    ) {
      items = [
        { to: "/analytics/overview", icon: Building2, label: "Overview" },
        ...items,
      ];
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
              <div className="mx-auto my-3 flex size-8 items-center justify-center rounded-md bg-[#fff0eb] text-xs font-bold text-[#f05a28]">
                {activeWorkspace?.name.charAt(0).toUpperCase() ?? "?"}
              </div>
            ) : (
              <div className="border-border bg-muted/15 hover:bg-muted/30 mx-3 my-3 flex items-center gap-2 rounded-md border p-1.5 transition-colors">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#fff0eb] text-xs font-bold text-[#f05a28]">
                  {activeWorkspace?.name.charAt(0).toUpperCase() ?? "?"}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-xs leading-tight font-semibold text-white">
                    {activeWorkspace?.name ?? "No workspace"}
                  </span>
                  <span className="text-muted-foreground mt-0.5 text-[9px] leading-none">
                    Workspace
                  </span>
                </div>
                <ChevronDown className="text-muted-foreground ml-auto size-3.5 shrink-0" />
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="ml-2 w-[180px]">
            <DropdownMenuLabel className="text-muted-foreground text-[10px] tracking-wider uppercase">
              Chọn Workspace
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => onSwitchWorkspace(ws.id)}
                className={cn(
                  "cursor-pointer text-xs",
                  activeWorkspace?.id === ws.id
                    ? "font-semibold text-[#f05a28]"
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
              <span className="text-muted-foreground mb-1 block px-2.5 text-[10px] font-bold tracking-wider uppercase">
                {section.title}
              </span>
            ) : (
              idx > 0 && <div className="bg-border mx-1 my-2 h-px opacity-20" />
            )}

            <div className="space-y-0.5">
              {section.items.map(({ to, icon: Icon, label }) => (
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
                  title={collapsed ? label : undefined}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span>{label}</span>}
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
          <div className="text-muted-foreground px-2.5 py-1 text-[10px] leading-snug">
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
