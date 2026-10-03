import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { MemberRole, Workspace } from "@/types/workspace";
import type { Agency } from "@/types/agency";
import type { SystemRole } from "@/store/authStore";
import { canAccess } from "@/routes/access";
import { NAV_SECTIONS, type NavItem, type NavSection } from "./sidebar/sidebarNavConfig";
import { SidebarHoverPreview, type HoveredItemInfo } from "./sidebar/SidebarHoverPreview";
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
  const [hoveredItem, setHoveredItem] = React.useState<HoveredItemInfo | null>(null);
  const hoverTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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
  }, [location.pathname, location.search, activeWorkspace?.id, currentAgencyId, clearHoveredItem]);

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

  // ADMIN chỉ thao tác qua Admin Panel — không vận hành nội dung/workspace,
  // nên chỉ thấy mục "system". Ở agency-level (chưa chọn workspace cụ thể),
  // "create" và "workspaceSettings" ẩn vì cần ngữ cảnh 1 workspace cụ thể.
  // Trước khi duyệt gói, Manager vẫn quản lý được thiết lập Workspace.
  const visibleSectionKeys: string[] | null =
    systemRole === "ADMIN"
      ? ["system"]
      : !activeWorkspace
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

      {/* Agency → Workspace switcher dropdown */}
      <OrgSwitcherDropdown
        collapsed={collapsed}
        activeWorkspace={activeWorkspace ?? null}
        currentAgencyId={currentAgencyId}
        currentAgencyName={currentAgencyName}
        agencyList={agencyList}
        allWorkspaces={allWorkspaces}
        clientWorkspaces={clientWorkspaces}
        currentUserId={currentUserId}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        handleMouseEnter={handleMouseEnter}
        handleMouseLeave={handleMouseLeave}
        clearHoveredItem={clearHoveredItem}
        onSwitchAgency={onSwitchAgency}
        onSwitchWorkspace={onSwitchWorkspace}
      />

      {/* Shared hover preview popup portal */}
      <SidebarHoverPreview
        dropdownOpen={dropdownOpen}
        hoveredItem={hoveredItem}
        hoveredAgency={hoveredAgency}
        hoveredWorkspace={hoveredWorkspace}
        allWorkspaces={allWorkspaces}
        currentUserId={currentUserId}
      />

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
