import * as React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileEdit,
  CalendarDays,
  Users,
  BarChart3,
  ShieldAlert,
  ChevronDown,
  FolderKanban,
  FolderPlus,
  LayoutTemplate,
  Hash,
  UserPlus,
  Mail,
  Send,
  Link2,
  CreditCard,
  Sparkles,
  Building2,
  FileBarChart,
  User,
  Inbox,
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
import type { Agency } from "@/types/agency";
import type { SystemRole } from "@/store/authStore";
import { canAccess } from "@/routes/access";

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  /** Chỉ hiện khi role hiện tại là CLIENT — cần currentAgencyId để build URL. */
  clientOnly?: boolean;
  /** URL cần currentAgencyId để build (thay {agencyId} trong `to`) — ẩn nếu chưa có agency active. */
  agencyScoped?: boolean;
  /** Ẩn hẳn với role CLIENT (client không phải nhân sự agency nội bộ). */
  hiddenForClient?: boolean;
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
      { to: "/publish", icon: Send, labelKey: "nav.publish" },
    ],
  },
  {
    key: "manage",
    titleKey: "nav.sections.manage",
    items: [
      {
        to: "/agency/{agencyId}",
        icon: Building2,
        labelKey: "nav.agencySub.profile",
        agencyScoped: true,
        hiddenForClient: true,
      },
      {
        to: "/agency/{agencyId}/members",
        icon: Users,
        labelKey: "nav.agencySub.members",
        agencyScoped: true,
        hiddenForClient: true,
      },
      {
        to: "/agency/{agencyId}/stats",
        icon: BarChart3,
        labelKey: "nav.agencySub.stats",
        agencyScoped: true,
        hiddenForClient: true,
      },
      {
        to: "/agency/invitations",
        icon: Inbox,
        labelKey: "nav.agencyInvitationInbox",
        hiddenForClient: true,
      },
      { to: "/invitations", icon: Mail, labelKey: "nav.invitations" },
      { to: "/clients", icon: Building2, labelKey: "nav.clients" },
      { to: "/portal", icon: Users, labelKey: "nav.portal" },
      {
        to: "/client-profile",
        icon: User,
        labelKey: "nav.clientProfile",
        clientOnly: true,
      },
      {
        to: "/social-accounts",
        icon: Link2,
        labelKey: "nav.socialAccounts",
      },
      {
        to: "/subscription/plans",
        icon: CreditCard,
        labelKey: "nav.subscription",
      },
      {
        to: "/ai-studio/ambassadors",
        icon: Sparkles,
        labelKey: "nav.aiStudio",
      },
      { to: "/reports", icon: FileBarChart, labelKey: "nav.reports" },
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
  onSwitchWorkspace: (agencyId: string, workspaceId: string) => void;
  className?: string;
  onMobileItemClick?: () => void;
  /** Đang chọn 1 agency cụ thể hay chưa — chưa chọn agency thì không có
   * ngữ cảnh để lọc workspace, nên ẩn hẳn ô chọn workspace. */
  hasAgency?: boolean;
  /** Toàn bộ agency user thuộc về, để build dropdown lồng nhau agency→workspace. */
  agencyList: Agency[];
  /** Toàn bộ workspace (không lọc theo agency), để nhóm theo từng agency trong dropdown. */
  allWorkspaces: Workspace[];
  currentAgencyId: string | null;
  onSwitchAgency: (agencyId: string) => void;
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
  hasAgency = false,
  agencyList,
  allWorkspaces,
  currentAgencyId,
  onSwitchAgency,
}: SidebarProps) {
  const { t } = useTranslation();
  const [expandedAgencyId, setExpandedAgencyId] = React.useState<string | null>(
    currentAgencyId,
  );
  const currentAgencyName =
    agencyList.find((a) => a.id === currentAgencyId)?.name ?? null;
  // Filter sections and items based on role permission
  const filteredSections = NAV_SECTIONS.map((section) => {
    const items = section.items
      .filter((item) => canAccess(item.to, systemRole, role))
      .filter((item) => !item.hiddenForClient || role !== "CLIENT")
      .filter((item) => !item.clientOnly || role === "CLIENT")
      .filter((item) => !item.agencyScoped || currentAgencyId)
      .map((item) => {
        if (item.clientOnly && currentAgencyId) {
          return { ...item, to: `/client-profile?agencyId=${currentAgencyId}` };
        }
        if (item.agencyScoped && currentAgencyId) {
          return {
            ...item,
            to: item.to.replace("{agencyId}", currentAgencyId),
          };
        }
        return item;
      });

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
        background: "hsl(var(--sidebar, 240 6% 4%))",
        color: "hsl(var(--sidebar-foreground, 0 0% 98%))",
        borderRight: "1px solid hsl(var(--sidebar-border, 240 5% 15%))",
      }}
    >
      {/* Logo Area */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b px-3",
          collapsed ? "justify-center" : "gap-2.5",
        )}
        style={{ borderColor: "hsl(var(--sidebar-border, 240 5% 15%))" }}
      >
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          style={{ background: "hsl(var(--brand-orange, 15 88% 55%))" }}
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
            <span style={{ color: "hsl(var(--brand-orange, 15 88% 55%))" }}>
              Hub
            </span>
          </span>
        )}
      </div>

      {/* Agency → Workspace switcher — 1 dropdown lồng nhau, luôn hiện để có nơi tạo mới. */}
      <div
        className="shrink-0 border-b"
        style={{ borderColor: "hsl(var(--sidebar-border, 240 5% 15%))" }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full cursor-pointer text-left outline-none">
            {collapsed ? (
              <div className="bg-brand-orange-soft text-brand-orange mx-auto my-3 flex size-8 items-center justify-center rounded-md text-xs font-bold">
                {(activeWorkspace?.name ?? currentAgencyName)
                  ?.charAt(0)
                  .toUpperCase() ?? "?"}
              </div>
            ) : (
              <div className="border-border bg-muted/15 hover:bg-muted/30 mx-3 my-3 flex items-center gap-2 rounded-md border p-1.5 transition-colors">
                <div className="bg-brand-orange-soft text-brand-orange flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold">
                  {(activeWorkspace?.name ?? currentAgencyName)
                    ?.charAt(0)
                    .toUpperCase() ?? "?"}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-xs leading-tight font-semibold text-white">
                    {activeWorkspace?.name ??
                      currentAgencyName ??
                      t("nav.orgSwitcher.placeholder")}
                  </span>
                  <span className="text-muted-foreground text-3xs mt-0.5 truncate leading-none">
                    {activeWorkspace
                      ? currentAgencyName
                      : t("nav.orgSwitcher.label")}
                  </span>
                </div>
                <ChevronDown className="text-muted-foreground ml-auto size-3.5 shrink-0" />
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="ml-2 w-[220px]">
            <DropdownMenuLabel className="text-muted-foreground text-3xs tracking-wider uppercase">
              {t("nav.orgSwitcher.selectAgency")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {agencyList.length === 0 && (
              <p className="text-muted-foreground px-2 py-2 text-xs">
                {t("nav.orgSwitcher.noAgency")}
              </p>
            )}
            {agencyList.map((agency) => {
              const agencyWs = allWorkspaces.filter(
                (ws) => ws.agencyId === agency.id,
              );
              const isExpanded = expandedAgencyId === agency.id;
              return (
                <div key={agency.id}>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setExpandedAgencyId(isExpanded ? null : agency.id);
                    }}
                    className={cn(
                      "cursor-pointer justify-between text-xs",
                      currentAgencyId === agency.id
                        ? "text-brand-orange font-semibold"
                        : "",
                    )}
                  >
                    <span className="truncate">{agency.name}</span>
                    <ChevronDown
                      className={cn(
                        "size-3.5 shrink-0 transition-transform",
                        isExpanded ? "rotate-180" : "",
                      )}
                    />
                  </DropdownMenuItem>
                  {isExpanded && (
                    <div className="border-border ml-3 border-l pl-2">
                      {agencyWs.length === 0 && (
                        <p className="text-muted-foreground text-3xs px-2 py-1.5">
                          {t("nav.orgSwitcher.noWorkspace")}
                        </p>
                      )}
                      {agencyWs.map((ws) => (
                        <DropdownMenuItem
                          key={ws.id}
                          onClick={() => onSwitchWorkspace(agency.id, ws.id)}
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
                      <DropdownMenuItem
                        onClick={() => onSwitchAgency(agency.id)}
                        className="text-muted-foreground text-3xs cursor-pointer italic"
                      >
                        {t("nav.orgSwitcher.viewAgency")}
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <NavLink
                          to={`/workspaces/create?agencyId=${agency.id}`}
                          className="text-brand-orange text-3xs flex cursor-pointer items-center gap-1.5 font-semibold"
                        >
                          <FolderPlus className="size-3" />
                          {t("nav.orgSwitcher.createWorkspace")}
                        </NavLink>
                      </DropdownMenuItem>
                    </div>
                  )}
                </div>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink
                to="/agency/create"
                className="text-brand-orange flex cursor-pointer items-center gap-1.5 text-xs font-semibold"
              >
                <FolderPlus className="size-3.5" />
                {t("nav.orgSwitcher.createAgency")}
              </NavLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nav List */}
      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-2 pt-4">
        {filteredSections.map((section, idx) => (
          <div key={section.key} className="space-y-1">
            {!collapsed ? (
              <span className="text-muted-foreground text-3xs mb-1 block px-2.5 font-bold tracking-wider uppercase">
                {t(section.titleKey)}
              </span>
            ) : (
              idx > 0 && <div className="bg-border mx-1 my-2 h-px opacity-20" />
            )}

            <div className="space-y-0.5">
              {section.items.map(({ to, icon: Icon, labelKey }) => {
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end
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
                            background: "hsl(var(--brand-orange, 15 88% 55%))",
                            color: "#ffffff",
                          }
                        : {
                            color: "hsl(var(--sidebar-foreground, 0 0% 98%))",
                          }
                    }
                    title={collapsed ? t(labelKey) : undefined}
                  >
                    <Icon className="size-4 shrink-0" />
                    {!collapsed && <span>{t(labelKey)}</span>}
                  </NavLink>
                );
              })}
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
        style={{ borderColor: "hsl(var(--sidebar-border, 240 5% 15%))" }}
      >
        {!collapsed && (
          <div className="text-muted-foreground text-3xs px-2.5 py-1 leading-snug">
            {t("nav.roleLabelPrefix")}{" "}
            <span className="font-semibold text-white">
              {role ? t(`workspace.roles.${role}`) : "—"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
