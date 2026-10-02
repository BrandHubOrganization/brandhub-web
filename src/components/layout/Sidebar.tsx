import * as React from "react";
import * as ReactDOM from "react-dom";
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
  Send,
  Link2,
  CreditCard,
  Sparkles,
  Building2,
  FileBarChart,
  User,
  Inbox,
  UserCheck,
  Briefcase,
  Settings,
  ChevronLeft,
  MapPin,
  Globe,
  FolderOpen,
  Shield,
  Bell,
  Phone,
  Calendar,
  HelpCircle,
  BookOpen,
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
  /** Route agency-wide (đọc theo currentAgencyId, không mang workspaceId) —
   * ẩn khi đang trong 1 workspace cụ thể để tránh bấm nhầm rồi bị đẩy ra
   * khỏi ngữ cảnh workspace về agency. */
  hideInWorkspace?: boolean;
  /** Chỉ hiện khi CHƯA chọn agency nào (currentAgencyId null) — mục
   * user-level, không gắn agency/workspace cụ thể nào. */
  noAgencyOnly?: boolean;
  /** URL đổi theo activeWorkspace — thay {workspaceId} trong `to`. Khi
   * chưa có activeWorkspace, giữ nguyên `to` gốc (route agency-level, vd
   * /dashboard, /analytics landing chung). */
  workspaceScoped?: boolean;
  /** Route CHỈ tồn tại dạng /workspaces/:id/... — không có bản fallback ở
   * `to` gốc (khác /dashboard vẫn có cả 2 bản). Thiếu activeWorkspace thì
   * ẩn hẳn thay vì để `to` trỏ vào route đã bị xoá. */
  requiresWorkspace?: boolean;
  /** Ẩn khi đang chọn 1 agency cụ thể (currentAgencyId != null). Dùng cho
   * các mục thuộc "user module" (client-profiles, social-accounts, subscription,
   * client/invitations, ...) — không gắn với ngữ cảnh agency cụ thể nào,
   * chỉ hiện khi user chưa vào agency hoặc đang dùng tính năng cá nhân. */
  hideInAgency?: boolean;
  /** Mục con hiển thị thụt lề dưới item cha. Dùng cho các anchor trong cùng
   * 1 trang (vd 4 mục của /settings) — `to` gồm cả hash. */
  children?: { to: string; labelKey: string }[];
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
      {
        to: "/dashboard",
        icon: LayoutDashboard,
        labelKey: "nav.dashboard",
        workspaceScoped: true,
        // CLIENT thấy dashboard nhưng dashboard.tsx tự ẩn card nhạy cảm
        // (thành viên, đàm phán gói, AI credit nội bộ agency) qua isClient —
        // chỉ còn phần liên quan nội dung (campaign/content status, lịch đăng).
      },
      {
        to: "/analytics",
        icon: BarChart3,
        labelKey: "nav.analytics",
        // Merged into workspace Dashboard (StatCards + ChannelPerformanceChart
        // now render inline there) — keep this item for agency-level only,
        // hide once a workspace is active so it's not a duplicate link.
        hideInWorkspace: true,
      },
    ],
  },
  {
    key: "create",
    titleKey: "nav.sections.create",
    items: [
      {
        to: "/requests",
        icon: FileEdit,
        labelKey: "nav.requests",
        workspaceScoped: true,
        requiresWorkspace: true,
      },
      {
        to: "/editor",
        icon: FileEdit,
        labelKey: "nav.editor",
        workspaceScoped: true,
        requiresWorkspace: true,
      },
      {
        to: "/content-writing",
        icon: FileEdit,
        labelKey: "nav.contentWriting",
        workspaceScoped: true,
        requiresWorkspace: true,
      },
      {
        to: "/templates",
        icon: LayoutTemplate,
        labelKey: "nav.templates",
        workspaceScoped: true,
        requiresWorkspace: true,
      },
      {
        to: "/hashtag-groups",
        icon: Hash,
        labelKey: "nav.hashtagGroups",
        workspaceScoped: true,
        requiresWorkspace: true,
      },
      {
        to: "/calendar",
        icon: CalendarDays,
        labelKey: "nav.calendar",
        workspaceScoped: true,
        requiresWorkspace: true,
      },
      {
        to: "/library",
        icon: FolderKanban,
        labelKey: "nav.library",
        workspaceScoped: true,
        requiresWorkspace: true,
      },
      {
        to: "/publish",
        icon: Send,
        labelKey: "nav.publish",
        workspaceScoped: true,
        requiresWorkspace: true,
      },
    ],
  },
  {
    key: "agency",
    titleKey: "nav.sections.agency",
    items: [
      {
        to: "/agency/{agencyId}",
        icon: Building2,
        labelKey: "nav.agencySub.profile",
        agencyScoped: true,
        hiddenForClient: true,
        hideInWorkspace: true,
      },
      {
        to: "/agency/{agencyId}/members",
        icon: Users,
        labelKey: "nav.agencySub.members",
        agencyScoped: true,
        hiddenForClient: true,
        hideInWorkspace: true,
      },
      {
        to: "/agency/{agencyId}/roles",
        icon: Shield,
        labelKey: "nav.agencySub.roles",
        agencyScoped: true,
        hiddenForClient: true,
        hideInWorkspace: true,
      },
    ],
  },
  {
    key: "workspaceSettings",
    titleKey: "nav.sections.workspaceSettings",
    items: [
      {
        to: "/settings",
        icon: Settings,
        labelKey: "nav.workspaceSub.settings",
        workspaceScoped: true,
        requiresWorkspace: true,
        hiddenForClient: true,
      },
      {
        to: "/members",
        icon: Users,
        labelKey: "nav.workspaceSub.members",
        workspaceScoped: true,
        requiresWorkspace: true,
        hiddenForClient: true,
      },
      {
        to: "/clients",
        icon: Building2,
        labelKey: "nav.workspaceSub.clients",
        workspaceScoped: true,
        requiresWorkspace: true,
        hiddenForClient: true,
      },
      {
        to: "/client-profile",
        icon: User,
        labelKey: "nav.workspaceClientProfile",
        workspaceScoped: true,
        requiresWorkspace: true,
        clientOnly: true,
      },
      {
        to: "/portal",
        icon: Users,
        labelKey: "nav.portal",
        workspaceScoped: true,
        requiresWorkspace: true,
      },
    ],
  },
  {
    key: "lists",
    titleKey: "nav.sections.lists",
    items: [
      {
        to: "/agency",
        icon: Building2,
        labelKey: "nav.agencyList",
        hideInWorkspace: true,
        hideInAgency: true,
      },
      {
        to: "/workspace",
        icon: Briefcase,
        labelKey: "nav.workspaceList",
        hideInWorkspace: true,
      },
      {
        to: "/clients",
        icon: Building2,
        labelKey: "nav.clients",
        hideInWorkspace: true,
        hideInAgency: true,
      },
      {
        to: "/ai-studio/ambassadors",
        icon: Sparkles,
        labelKey: "nav.aiStudio",
        hideInWorkspace: true,
      },
      {
        to: "/reports",
        icon: FileBarChart,
        labelKey: "nav.reports",
        hideInWorkspace: true,
      },
    ],
  },
  {
    key: "invitations",
    titleKey: "nav.sections.invitations",
    items: [
      {
        to: "/agency/invitations",
        icon: Inbox,
        labelKey: "nav.agencyInvitationInbox",
        hiddenForClient: true,
        hideInWorkspace: true,
        hideInAgency: true,
      },
      {
        to: "/client/invitations",
        icon: UserCheck,
        labelKey: "nav.clientInvitations",
        hideInWorkspace: true,
        hideInAgency: true,
      },
    ],
  },
  {
    key: "settings",
    titleKey: "nav.sections.settings",
    items: [
      {
        to: "/settings/profile",
        icon: User,
        labelKey: "nav.profile",
        hideInWorkspace: true,
        hideInAgency: true,
      },
      {
        to: "/settings/security",
        icon: Shield,
        labelKey: "nav.security",
        hideInWorkspace: true,
        hideInAgency: true,
      },
      {
        to: "/settings/connections",
        icon: Link2,
        labelKey: "nav.connections",
        hideInWorkspace: true,
        hideInAgency: true,
      },
      {
        to: "/settings/notifications",
        icon: Bell,
        labelKey: "nav.notificationSettings",
        hideInWorkspace: true,
        hideInAgency: true,
      },
      {
        to: "/client-profiles",
        icon: User,
        labelKey: "nav.clientProfile",
        hideInWorkspace: true,
        hideInAgency: true,
      },
      {
        to: "/social-accounts",
        icon: Link2,
        labelKey: "nav.socialAccounts",
        hideInWorkspace: true,
        hideInAgency: true,
      },
      {
        to: "/subscription/plans",
        icon: CreditCard,
        labelKey: "nav.subscription",
        hideInWorkspace: true,
        hideInAgency: true,
      },
    ],
  },
  {
    key: "help",
    titleKey: "nav.sections.help",
    items: [
      {
        to: "/help/faq",
        icon: HelpCircle,
        labelKey: "nav.faq",
      },
      {
        to: "/help/guide",
        icon: BookOpen,
        labelKey: "nav.guide",
      },
    ],
  },
  {
    key: "system",
    titleKey: "nav.sections.system",
    items: [
      { to: "/admin", icon: ShieldAlert, labelKey: "nav.admin" },
      {
        to: "/admin/system-health",
        icon: ShieldAlert,
        labelKey: "monitoring.title",
      },
    ],
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
  /** Callback khi user bấm "Back" thoát khỏi agency context. */
  onLeaveAgency?: () => void;
  /** Callback khi user bấm "Back" thoát khỏi workspace context về agency. */
  onLeaveWorkspace?: () => void;
  /** So agency.ownerId để hiện badge "Owner" đúng agency mình sở hữu trong
   * dropdown — owner gắn theo agency, không phải theo workspace/role hiện
   * tại (agency chưa có workspace vẫn phải thấy mình là chủ). */
  currentUserId?: string | null;
}

export function Sidebar({
  collapsed,
  role = null,
  systemRole = null,
  activeWorkspace,
  onSwitchWorkspace,
  className,
  onMobileItemClick,
  agencyList,
  allWorkspaces,
  currentAgencyId,
  onSwitchAgency,
  onLeaveAgency,
  onLeaveWorkspace,
  currentUserId = null,
}: SidebarProps) {
  const { t } = useTranslation();
  const currentAgencyName =
    agencyList.find((a) => a.id === currentAgencyId)?.name ?? null;
  const clientWorkspaces = allWorkspaces.filter((ws) => ws.myRole === "CLIENT");

  type HoveredItem =
    | { type: "agency"; id: string; rect: DOMRect }
    | { type: "workspace"; id: string; agencyId: string; rect: DOMRect }
    | null;
  const [hoveredItem, setHoveredItem] = React.useState<HoveredItem>(null);
  const hoverTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoveredItem = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoveredItem(null);
  };

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLElement>,
    item: { type: "agency"; id: string } | { type: "workspace"; id: string; agencyId: string },
  ) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    hoverTimerRef.current = setTimeout(() => {
      setHoveredItem({ ...item, rect });
    }, 180);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setHoveredItem(null), 100);
  };

  // Tự động ẩn preview card ngay khi chuyển workspace / agency
  React.useEffect(() => {
    clearHoveredItem();
  }, [activeWorkspace?.id, currentAgencyId]);

  // Data cho preview đang hover
  const hoveredAgency =
    hoveredItem?.type === "agency"
      ? agencyList.find((a) => a.id === hoveredItem.id)
      : hoveredItem?.type === "workspace"
        ? agencyList.find((a) => a.id === hoveredItem.agencyId)
        : null;
  const hoveredWorkspace =
    hoveredItem?.type === "workspace"
      ? allWorkspaces.find((w) => w.id === hoveredItem.id)
      : null;
  // ADMIN chỉ thao tác qua Admin Panel — không vận hành nội dung/workspace,
  // nên chỉ thấy mục "system". Ở agency-level (chưa chọn workspace cụ thể),
  // "create" và "workspaceSettings" ẩn vì cần ngữ cảnh 1 workspace cụ thể.
  const visibleSectionKeys: string[] | null =
    systemRole === "ADMIN"
      ? ["system"]
      : !activeWorkspace
        ? ["overview", "agency", "lists", "invitations", "settings"]
        : ["overview", "create", "workspaceSettings"];

  // Filter sections and items based on role permission
  const filteredSections = NAV_SECTIONS.filter(
    (section) =>
      !visibleSectionKeys || visibleSectionKeys.includes(section.key),
  )
    .map((section) => {
      const items = section.items
        .filter((item) => !item.hiddenForClient || role !== "CLIENT")
        .filter((item) => !item.clientOnly || role === "CLIENT")
        .filter((item) => !item.agencyScoped || currentAgencyId)
        .filter((item) => !item.hideInWorkspace || !activeWorkspace)
        .filter((item) => !item.noAgencyOnly || !currentAgencyId)
        .filter((item) => !item.hideInAgency || !currentAgencyId)
        // requiresWorkspace: route KHÔNG có bản fallback ở "to" gốc (khác
        // /dashboard, có cả bản agency-level lẫn /workspaces/:id/dashboard)
        // — thiếu activeWorkspace thì không build được URL hợp lệ, ẩn hẳn
        // thay vì để "to" trỏ vào route đã bị xoá.
        .filter((item) => !item.requiresWorkspace || activeWorkspace)
        .map((item) => {
          if (item.agencyScoped && currentAgencyId) {
            return {
              ...item,
              to: item.to.replace("{agencyId}", currentAgencyId),
            };
          }
          if (item.workspaceScoped && activeWorkspace) {
            return {
              ...item,
              to: `/workspaces/${activeWorkspace.id}${item.to}`,
            };
          }
          return item;
        })
        .filter((item) => canAccess(item.to, systemRole, role));

      return { ...section, items };
    })
    .filter((section) => section.items.length > 0);

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
        <DropdownMenu
          onOpenChange={(open) => {
            if (!open) {
              clearHoveredItem();
            }
          }}
        >
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
                      : currentAgencyId &&
                          agencyList.find((a) => a.id === currentAgencyId)
                            ?.ownerId === currentUserId
                        ? t("workspace.roles.OWNER")
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
            {/* CLIENT chỉ join workspace_members, không phải agency member —
                không gom theo agency, liệt kê thẳng để họ dễ hiểu. */}
            {clientWorkspaces.length > 0 && (
              <>
                <div className="border-border ml-1 border-l pl-2">
                  {clientWorkspaces.map((ws) => (
                    <DropdownMenuItem
                      key={ws.id}
                      onMouseEnter={(e) =>
                        ws.agencyId &&
                        handleMouseEnter(e, {
                          type: "workspace",
                          id: ws.id,
                          agencyId: ws.agencyId,
                        })
                      }
                      onMouseLeave={handleMouseLeave}
                      onClick={() => {
                        clearHoveredItem();
                        if (ws.agencyId) onSwitchWorkspace(ws.agencyId, ws.id);
                      }}
                      className={cn(
                        "cursor-pointer justify-between gap-2 text-xs",
                        activeWorkspace?.id === ws.id
                          ? "text-brand-orange font-semibold"
                          : "",
                      )}
                    >
                      <span className="truncate">{ws.name}</span>
                      <span className="text-muted-foreground text-3xs shrink-0 font-normal">
                        {t("workspace.roles.CLIENT")}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            {agencyList.map((agency) => {
              const agencyWs = allWorkspaces.filter(
                (ws) => ws.agencyId === agency.id,
              );
              return (
                <div key={agency.id}>
                  <DropdownMenuItem
                    onMouseEnter={(e) => handleMouseEnter(e, { type: "agency", id: agency.id })}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => {
                      clearHoveredItem();
                      onSwitchAgency(agency.id);
                    }}
                    className={cn(
                      "cursor-pointer justify-between text-xs",
                      currentAgencyId === agency.id && !activeWorkspace
                        ? "text-brand-orange font-semibold"
                        : "",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate">{agency.name}</span>
                      {agency.ownerId === currentUserId && (
                        <span className="text-brand-orange bg-brand-orange-soft text-3xs shrink-0 rounded px-1 py-0.5 leading-none font-semibold">
                          {t("workspace.roles.OWNER")}
                        </span>
                      )}
                    </span>
                  </DropdownMenuItem>

                  <div className="border-border ml-3 border-l pl-2">
                    {agencyWs.length === 0 && (
                      <p className="text-muted-foreground text-3xs px-2 py-1.5">
                        {t("nav.orgSwitcher.noWorkspace")}
                      </p>
                    )}
                    {agencyWs.map((ws) => (
                      <DropdownMenuItem
                        key={ws.id}
                        onMouseEnter={(e) =>
                          handleMouseEnter(e, {
                            type: "workspace",
                            id: ws.id,
                            agencyId: agency.id,
                          })
                        }
                        onMouseLeave={handleMouseLeave}
                        onClick={() => {
                          clearHoveredItem();
                          onSwitchWorkspace(agency.id, ws.id);
                        }}
                        className={cn(
                          "cursor-pointer justify-between gap-2 text-xs",
                          activeWorkspace?.id === ws.id
                            ? "text-brand-orange font-semibold"
                            : "",
                        )}
                      >
                        <span className="truncate">{ws.name}</span>
                        {ws.myRole && (
                          <span className="text-muted-foreground text-3xs shrink-0 font-normal">
                            {t(`workspace.roles.${ws.myRole}`)}
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))}
                    {agency.ownerId === currentUserId && (
                      <DropdownMenuItem asChild>
                        <NavLink
                          to={`/workspaces/create?agencyId=${agency.id}`}
                          onClick={clearHoveredItem}
                          className="text-brand-orange text-3xs flex cursor-pointer items-center gap-1.5 font-semibold"
                        >
                          <FolderPlus className="size-3" />
                          {t("nav.orgSwitcher.createWorkspace")}
                        </NavLink>
                      </DropdownMenuItem>
                    )}
                  </div>
                </div>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink
                to="/agency/create"
                onClick={clearHoveredItem}
                className="text-brand-orange flex cursor-pointer items-center gap-1.5 text-xs font-semibold"
              >
                <FolderPlus className="size-3.5" />
                {t("nav.orgSwitcher.createAgency")}
              </NavLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Single shared hover preview — dùng portal + fixed positioning để luôn nổi và đúng vị trí */}
        {hoveredAgency &&
          hoveredItem?.rect &&
          typeof document !== "undefined" &&
          ReactDOM.createPortal(
            <div
              className="bg-popover border-border pointer-events-none fixed z-100 w-72 overflow-hidden rounded-xl border shadow-2xl transition-all"
              style={{
                left: `${hoveredItem.rect.right + 10}px`,
                top: `${Math.min(
                  Math.max(hoveredItem.rect.top - 12, 10),
                  Math.max(10, window.innerHeight - 340),
                )}px`,
              }}
            >
              {/* Header color accent or mini banner */}
              <div
                className="h-2 w-full"
                style={{
                  background:
                    (hoveredWorkspace?.brandColor || hoveredAgency.brandColor) ??
                    "hsl(var(--brand-orange))",
                }}
              />

              <div className="space-y-3 p-3.5">
                {/* Brand & Identity */}
                <div className="flex items-start gap-3">
                  {hoveredWorkspace?.logoUrl || hoveredAgency.logoUrl ? (
                    <img
                      src={(hoveredWorkspace?.logoUrl || hoveredAgency.logoUrl)!}
                      alt={hoveredWorkspace ? hoveredWorkspace.name : hoveredAgency.name}
                      className="border-border size-10 shrink-0 rounded-lg border object-cover"
                    />
                  ) : (
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold shadow-xs"
                      style={{
                        background:
                          (hoveredWorkspace?.brandColor || hoveredAgency.brandColor)
                            ? `${hoveredWorkspace?.brandColor || hoveredAgency.brandColor}25`
                            : "hsl(var(--brand-orange-soft))",
                        color:
                          (hoveredWorkspace?.brandColor || hoveredAgency.brandColor) ??
                          "hsl(var(--brand-orange))",
                      }}
                    >
                      {(hoveredWorkspace ? hoveredWorkspace.name : hoveredAgency.name)
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-semibold leading-tight">
                      {hoveredWorkspace ? hoveredWorkspace.name : hoveredAgency.name}
                    </p>
                    <p className="text-muted-foreground text-3xs mt-1 truncate">
                      {hoveredWorkspace
                        ? `${t("workspace.list.parentAgency", "Công ty:")} ${hoveredAgency.name}`
                        : hoveredAgency.tagline || t("nav.orgSwitcher.selectAgency", "Công ty")}
                    </p>

                    {/* Role badge */}
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {hoveredWorkspace?.myRole ? (
                        <span className="text-brand-orange bg-brand-orange-soft text-3xs rounded px-1.5 py-0.5 font-medium">
                          {t(`workspace.roles.${hoveredWorkspace.myRole}`)}
                        </span>
                      ) : hoveredAgency.ownerId === currentUserId ? (
                        <span className="text-brand-orange bg-brand-orange-soft text-3xs rounded px-1.5 py-0.5 font-medium">
                          {t("workspace.roles.OWNER")}
                        </span>
                      ) : null}

                      {/* Industry / Category tag */}
                      {hoveredWorkspace?.industry ? (
                        <span className="text-muted-foreground bg-muted text-3xs rounded px-1.5 py-0.5">
                          {t(`workspace.industry.${hoveredWorkspace.industry}`)}
                        </span>
                      ) : hoveredAgency.category ? (
                        <span className="text-muted-foreground bg-muted text-3xs rounded px-1.5 py-0.5">
                          {t(`agency.category.${hoveredAgency.category}`)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Slogan / Description if available */}
                {(hoveredWorkspace?.tagline ||
                  hoveredWorkspace?.description ||
                  hoveredAgency.description) && (
                  <p className="text-muted-foreground text-3xs line-clamp-2 italic leading-relaxed">
                    {hoveredWorkspace?.tagline ||
                      hoveredWorkspace?.description ||
                      hoveredAgency.description}
                  </p>
                )}

                {/* Meta details list */}
                <div className="border-border/60 space-y-1.5 border-t pt-2.5 text-xs text-muted-foreground">
                  {/* Company Size */}
                  {(hoveredWorkspace?.companySize || hoveredAgency.companySize) && (
                    <div className="flex items-center gap-2">
                      <Users className="text-brand-orange size-3.5 shrink-0" />
                      <span className="text-3xs truncate">
                        {t(
                          `agency.companySize.${
                            hoveredWorkspace?.companySize || hoveredAgency.companySize
                          }`,
                        )}
                      </span>
                    </div>
                  )}

                  {/* Location */}
                  {(hoveredWorkspace?.location || hoveredAgency.location) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="text-brand-orange size-3.5 shrink-0" />
                      <span className="text-3xs truncate">
                        {hoveredWorkspace?.location || hoveredAgency.location}
                      </span>
                    </div>
                  )}

                  {/* Website */}
                  {(hoveredWorkspace?.website || hoveredAgency.website) && (
                    <div className="flex items-center gap-2">
                      <Globe className="text-brand-orange size-3.5 shrink-0" />
                      <span className="text-3xs truncate">
                        {hoveredWorkspace?.website || hoveredAgency.website}
                      </span>
                    </div>
                  )}

                  {/* Phone */}
                  {(hoveredWorkspace?.phone || hoveredAgency.phone) && (
                    <div className="flex items-center gap-2">
                      <Phone className="text-brand-orange size-3.5 shrink-0" />
                      <span className="text-3xs truncate">
                        {hoveredWorkspace?.phone || hoveredAgency.phone}
                      </span>
                    </div>
                  )}

                  {/* Founded year */}
                  {(hoveredWorkspace?.foundedYear || hoveredAgency.foundedYear) && (
                    <div className="flex items-center gap-2">
                      <Calendar className="text-brand-orange size-3.5 shrink-0" />
                      <span className="text-3xs truncate">
                        {t("agency.create.foundedYearLabel", "Năm thành lập")}:{" "}
                        {hoveredWorkspace?.foundedYear || hoveredAgency.foundedYear}
                      </span>
                    </div>
                  )}

                  {/* Workspaces count (Agency only) */}
                  {!hoveredWorkspace && (
                    <div className="flex items-center gap-2">
                      <FolderOpen className="text-brand-orange size-3.5 shrink-0" />
                      <span className="text-3xs truncate">
                        {allWorkspaces.filter((w) => w.agencyId === hoveredAgency.id).length}{" "}
                        {t("workspace.list.workspacesCount", "workspace")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>

      {/* Back button — thoát khỏi workspace context về agency */}
      {activeWorkspace && onLeaveWorkspace && (
        <div
          className="shrink-0 border-b px-2 py-1.5"
          style={{ borderColor: "hsl(var(--sidebar-border, 240 5% 15%))" }}
        >
          <button
            type="button"
            onClick={onLeaveWorkspace}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
              "text-muted-foreground hover:bg-muted/20 hover:text-white",
              collapsed ? "justify-center" : "",
            )}
            title={collapsed ? t("nav.leaveWorkspace", "Thoát workspace") : undefined}
          >
            <ChevronLeft className="size-3.5 shrink-0" />
            {!collapsed && (
              <span>{t("nav.leaveWorkspace", "Thoát workspace")}</span>
            )}
          </button>
        </div>
      )}

      {/* Back button — thoát khỏi agency context */}
      {currentAgencyId && !activeWorkspace && onLeaveAgency && (
        <div
          className="shrink-0 border-b px-2 py-1.5"
          style={{ borderColor: "hsl(var(--sidebar-border, 240 5% 15%))" }}
        >
          <button
            type="button"
            onClick={onLeaveAgency}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
              "text-muted-foreground hover:bg-muted/20 hover:text-white",
              collapsed ? "justify-center" : "",
            )}
            title={collapsed ? t("nav.leaveAgency", "Thoát agency") : undefined}
          >
            <ChevronLeft className="size-3.5 shrink-0" />
            {!collapsed && (
              <span>{t("nav.leaveAgency", "Thoát agency")}</span>
            )}
          </button>
        </div>
      )}

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
              {section.items.map(({ to, icon: Icon, labelKey, children }) => {
                return (
                  <div key={to}>
                    <NavLink
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
                              background:
                                "hsl(var(--brand-orange, 15 88% 55%))",
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
                    {!collapsed && children && (
                      <div className="mt-0.5 space-y-0.5">
                        {children.map((child) => (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            end
                            onClick={onMobileItemClick}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center gap-2 rounded-md py-1.5 pr-2.5 pl-7 text-xs transition-colors",
                                isActive
                                  ? "text-brand-orange font-semibold"
                                  : "hover:text-white",
                              )
                            }
                          >
                            <span className="size-1 shrink-0 rounded-full bg-current" />
                            <span className="truncate">
                              {t(child.labelKey)}
                            </span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
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
