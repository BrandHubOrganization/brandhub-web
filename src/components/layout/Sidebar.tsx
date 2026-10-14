import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { MemberRole, Workspace } from "@/types/workspace";
import type { Agency } from "@/types/agency";
import type { SystemRole } from "@/store/authStore";
import { canAccess } from "@/routes/access";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import {
  NAV_SECTIONS,
  type NavItem,
  type NavSection,
} from "./sidebar/sidebarNavConfig";
import {
  SidebarHoverPreview,
  type HoveredItemInfo,
} from "./sidebar/SidebarHoverPreview";
import { OrgSwitcherDropdown } from "./sidebar/OrgSwitcherDropdown";

export type { NavItem, NavSection };

interface SidebarProps {
  collapsed?: boolean;
  className?: string;
  role?: MemberRole | null;
  systemRole?: SystemRole | null;
  workspaces?: Workspace[];
  activeWorkspace?: Workspace | null;
  onSwitchWorkspace?: (agencyIdArg: string, workspaceId: string) => void;
  onMobileItemClick?: () => void;
  hasAgency?: boolean;
  agencyList?: Agency[];
  allWorkspaces?: Workspace[];
  currentAgencyId?: string | null;
  onSwitchAgency?: (id: string) => void;
  onLeaveAgency?: () => void;
  onLeaveWorkspace?: () => void;
  currentUserId?: string | null;
}

export function Sidebar({
  collapsed = false,
  className,
  role,
  systemRole,
  activeWorkspace,
  onSwitchWorkspace,
  onMobileItemClick,
  agencyList = [],
  allWorkspaces = [],
  currentAgencyId = null,
  onSwitchAgency,
  onLeaveAgency,
  onLeaveWorkspace,
  currentUserId,
}: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();

  // State dropdown org switcher
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Agency đang active
  const currentAgency = React.useMemo(
    () => agencyList.find((a) => a.id === currentAgencyId) ?? null,
    [agencyList, currentAgencyId],
  );
  const currentAgencyName = currentAgency?.name ?? null;

  // Lọc workspaces thuộc agency hiện tại (hoặc client workspaces nếu có)
  const clientWorkspaces = React.useMemo(() => {
    if (currentAgencyId) {
      return allWorkspaces.filter((w) => w.agencyId === currentAgencyId);
    }
    return allWorkspaces;
  }, [allWorkspaces, currentAgencyId]);

  // State cho hover preview popup
  const [hoveredItem, setHoveredItem] = React.useState<HoveredItemInfo | null>(
    null,
  );
  const hoverTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clearHoveredItem = React.useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoveredItem(null);
  }, []);

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLElement>,
    item: Omit<HoveredItemInfo, "rect">,
  ) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    const target = e.currentTarget;
    hoverTimerRef.current = setTimeout(() => {
      const rect = target.getBoundingClientRect();
      setHoveredItem({ ...item, rect });
    }, 180);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setHoveredItem(null), 80);
  };

  // Tự động ẩn preview card & đóng dropdown ngay khi chuyển route, workspace hoặc agency
  React.useEffect(() => {
    clearHoveredItem();
    setDropdownOpen(false);
  }, [
    location.pathname,
    location.search,
    activeWorkspace?.id,
    currentAgencyId,
    clearHoveredItem,
  ]);

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

  const isPackageHardGated =
    (role === "CLIENT" || role === "MANAGER") &&
    !!activeWorkspace &&
    activeWorkspace.packageNegotiationStatus !== "APPROVED";

  if (systemRole === "ADMIN") {
    return (
      <AdminSidebar
        collapsed={collapsed}
        className={className}
        onMobileItemClick={onMobileItemClick}
      />
    );
  }

  // Ở agency-level, create và workspaceSettings cần ngữ cảnh Workspace.
  // Trước khi duyệt gói, Manager vẫn quản lý được thiết lập Workspace.
  const visibleSectionKeys: string[] | null = !activeWorkspace
    ? ["overview", "agency", "lists", "invitations", "settings"]
    : isPackageHardGated
      ? role === "MANAGER"
        ? ["overview", "workspaceSettings"]
        : ["overview"]
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
        .filter((item) => {
          if (!isPackageHardGated) return true;
          return (
            item.to === "/media-package" ||
            item.to === "/chat" ||
            (role === "MANAGER" &&
              ["/settings", "/members", "/clients"].includes(item.to))
          );
        })
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
        .filter((item) => canAccess(item.to, systemRole ?? null, role ?? null));

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
                      onClick={() =>
                        ws.agencyId && onSwitchWorkspace(ws.agencyId, ws.id)
                      }
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
                  <HoverCard openDelay={300} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <DropdownMenuItem
                        onClick={() => onSwitchAgency(agency.id)}
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
                    </HoverCardTrigger>
                    <HoverCardContent
                      side="right"
                      align="start"
                      className="w-64"
                    >
                      {/* Agency preview card */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5">
                          {agency.logoUrl ? (
                            <img
                              src={agency.logoUrl}
                              alt={agency.name}
                              className="border-border size-9 shrink-0 rounded-lg border object-cover"
                            />
                          ) : (
                            <div
                              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                              style={{
                                background: agency.brandColor
                                  ? `${agency.brandColor}20`
                                  : "hsl(var(--brand-orange-soft, 15 100% 96%))",
                                color:
                                  agency.brandColor ??
                                  "hsl(var(--brand-orange, 15 88% 55%))",
                              }}
                            >
                              {agency.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-xs leading-tight font-semibold">
                              {agency.name}
                            </p>
                            {agency.tagline && (
                              <p className="text-muted-foreground text-3xs mt-0.5 truncate">
                                {agency.tagline}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-3xs text-muted-foreground space-y-1">
                          {agency.category && (
                            <div className="flex items-center gap-1.5">
                              <Building2 className="text-brand-orange size-3 shrink-0" />
                              <span>
                                {t(`agency.category.${agency.category}`)}
                              </span>
                            </div>
                          )}
                          {agency.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="text-brand-orange size-3 shrink-0" />
                              <span className="truncate">
                                {agency.location}
                              </span>
                            </div>
                          )}
                          {agency.website && (
                            <div className="flex items-center gap-1.5">
                              <Globe className="text-brand-orange size-3 shrink-0" />
                              <span className="truncate">{agency.website}</span>
                            </div>
                          )}
                        </div>
                        <div className="border-border/50 flex items-center gap-2 border-t pt-1">
                          <span className="text-3xs text-muted-foreground">
                            <FolderOpen className="text-brand-orange mr-1 inline size-3" />
                            {agencyWs.length} workspace
                          </span>
                          {agency.ownerId === currentUserId && (
                            <span className="text-brand-orange bg-brand-orange/10 text-3xs rounded px-1.5 py-0.5 font-semibold">
                              {t("workspace.roles.OWNER")}
                            </span>
                          )}
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>

                  <div className="border-border ml-3 border-l pl-2">
                    {agencyWs.length === 0 && (
                      <p className="text-muted-foreground text-3xs px-2 py-1.5">
                        {t("nav.orgSwitcher.noWorkspace")}
                      </p>
                    )}
                    {agencyWs.map((ws) => (
                      <HoverCard key={ws.id} openDelay={300} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <DropdownMenuItem
                            onClick={() => onSwitchWorkspace(agency.id, ws.id)}
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
                        </HoverCardTrigger>
                        <HoverCardContent
                          side="right"
                          align="start"
                          className="w-56"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {ws.logoUrl ? (
                                <img
                                  src={ws.logoUrl}
                                  alt={ws.name}
                                  className="border-border size-7 shrink-0 rounded-md border object-cover"
                                />
                              ) : (
                                <div className="bg-brand-orange/10 text-brand-orange flex size-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold">
                                  {ws.name.slice(0, 1).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold">
                                  {ws.name}
                                </p>
                                {ws.myRole && (
                                  <p className="text-3xs text-muted-foreground mt-0.5">
                                    {t(`workspace.roles.${ws.myRole}`)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <p className="text-3xs text-muted-foreground">
                              {agency.name}
                            </p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                    {agency.ownerId === currentUserId && (
                      <DropdownMenuItem asChild>
                        <NavLink
                          to={`/workspaces/create?agencyId=${agency.id}`}
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
                className="text-brand-orange flex cursor-pointer items-center gap-1.5 text-xs font-semibold"
              >
                <FolderPlus className="size-3.5" />
                {t("nav.orgSwitcher.createAgency")}
              </NavLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
            title={
              collapsed ? t("nav.leaveWorkspace", "Thoát workspace") : undefined
            }
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
            {!collapsed && <span>{t("nav.leaveAgency", "Thoát agency")}</span>}
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
