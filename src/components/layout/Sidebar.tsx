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

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Tổng quan",
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/analytics", icon: BarChart3, label: "Analytics" },
    ],
  },
  {
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
    title: "Quản lý",
    items: [
      { to: "/clients", icon: Building2, label: "Brand Clients" },
      { to: "/workspace", icon: FolderOpen, label: "Workspaces" },
      { to: "/portal", icon: Users, label: "Client Portal" },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { to: "/admin", icon: ShieldAlert, label: "Admin Panel" },
    ],
  },
];

const WORKSPACES = [
  { name: "Nike Vietnam", code: "NK" },
  { name: "Heineken Campaign", code: "HN" },
  { name: "Sữa Hạt Organic", code: "SH" },
];

export interface SidebarProps {
  collapsed: boolean;
  role?: string;
  className?: string;
  onMobileItemClick?: () => void;
}

export function Sidebar({
  collapsed,
  role = "CONTENT_CREATOR",
  className,
  onMobileItemClick,
}: SidebarProps) {
  const [activeWorkspace, setActiveWorkspace] = React.useState(WORKSPACES[0]);

  // Filter sections and items based on role permission
  const filteredSections = NAV_SECTIONS.map((section) => {
    const items = section.items.filter((item) => {
      // BRAND_CLIENT cannot see workspaces or content editor
      if (role === "BRAND_CLIENT" && (item.to === "/workspace" || item.to === "/editor")) {
        return false;
      }
      // Only ADMIN can see Admin Panel
      if (item.to === "/admin" && role !== "ADMIN") {
        return false;
      }
      return true;
    });
    return { ...section, items };
  }).filter((section) => section.items.length > 0);

  return (
    <div
      className={cn(
        "flex flex-col h-full select-none transition-all duration-200",
        collapsed ? "w-[60px]" : "w-[220px]",
        className
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
          "flex h-14 items-center border-b px-3 shrink-0",
          collapsed ? "justify-center" : "gap-2.5"
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
            <line x1="5.8" y1="7" x2="3.5" y2="5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="10.2" y1="7" x2="12.5" y2="5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="5.8" y1="9" x2="3.5" y2="11" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="10.2" y1="9" x2="12.5" y2="11" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
        {!collapsed && (
          <span className="font-sans font-bold text-sm text-white tracking-tight">
            Brand<span style={{ color: "var(--brand-orange, #f05a28)" }}>Hub</span>
          </span>
        )}
      </div>

      {/* Workspace Selector Dropdown */}
      <div className="shrink-0 border-b" style={{ borderColor: "var(--sidebar-border, #27272a)" }}>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full text-left outline-none cursor-pointer">
            {collapsed ? (
              <div className="mx-auto my-3 flex size-8 items-center justify-center rounded-md bg-[#fff0eb] text-[#f05a28] font-bold text-xs">
                {activeWorkspace.code}
              </div>
            ) : (
              <div className="mx-3 my-3 flex items-center gap-2 rounded-md border border-border p-1.5 bg-muted/15 hover:bg-muted/30 transition-colors">
                <div className="flex size-7 items-center justify-center rounded-md bg-[#fff0eb] text-[#f05a28] font-bold text-xs shrink-0">
                  {activeWorkspace.code}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate leading-tight">
                    {activeWorkspace.name}
                  </span>
                  <span className="text-[9px] text-muted-foreground leading-none mt-0.5">Workspace</span>
                </div>
                <ChevronDown className="size-3.5 text-muted-foreground ml-auto shrink-0" />
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[180px] ml-2">
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Chọn Workspace
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {WORKSPACES.map((ws) => (
              <DropdownMenuItem
                key={ws.code}
                onClick={() => setActiveWorkspace(ws)}
                className={cn(
                  "text-xs cursor-pointer",
                  activeWorkspace.code === ws.code ? "text-[#f05a28] font-semibold" : ""
                )}
              >
                {ws.name} ({ws.code})
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nav List */}
      <nav className="flex flex-col gap-4 flex-1 overflow-y-auto p-2 pt-4">
        {filteredSections.map((section, idx) => (
          <div key={section.title} className="space-y-1">
            {!collapsed ? (
              <span className="px-2.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase block mb-1">
                {section.title}
              </span>
            ) : (
              idx > 0 && <div className="h-px bg-border my-2 mx-1 opacity-20" />
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
                      isActive ? "font-semibold" : "hover:text-white"
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
        className={cn("border-t p-2 flex flex-col gap-0.5", collapsed ? "items-center" : "")}
        style={{ borderColor: "var(--sidebar-border, #27272a)" }}
      >
        {!collapsed && (
          <div className="px-2.5 py-1 text-[10px] leading-snug text-muted-foreground">
            Vai trò:{" "}
            <span className="font-semibold text-white">
              {role === "ADMIN"
                ? "Admin"
                : role === "AGENCY_OWNER"
                ? "Agency Owner"
                : role === "ACCOUNT_MANAGER"
                ? "Account Manager (AM)"
                : role === "BRAND_CLIENT"
                ? "Brand Client"
                : "Creator"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
