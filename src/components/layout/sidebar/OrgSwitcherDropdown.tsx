import * as React from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, FolderPlus } from "lucide-react";
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
import type { Agency } from "@/types/agency";
import type { Workspace } from "@/types/workspace";
import type { HoveredItemInfo } from "./SidebarHoverPreview";

export interface OrgSwitcherDropdownProps {
  collapsed: boolean;
  activeWorkspace: Workspace | null;
  currentAgencyId: string | null;
  currentAgencyName: string | null;
  agencyList: Agency[];
  allWorkspaces: Workspace[];
  clientWorkspaces: Workspace[];
  currentUserId?: string | null;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  handleMouseEnter: (e: React.MouseEvent<HTMLElement>, item: Omit<HoveredItemInfo, "rect">) => void;
  handleMouseLeave: () => void;
  clearHoveredItem: () => void;
  onSwitchAgency?: (agencyId: string) => void;
  onSwitchWorkspace?: (agencyId: string, workspaceId: string) => void;
}

export function OrgSwitcherDropdown({
  collapsed,
  activeWorkspace,
  currentAgencyId,
  currentAgencyName,
  agencyList,
  allWorkspaces,
  clientWorkspaces,
  currentUserId = null,
  dropdownOpen,
  setDropdownOpen,
  handleMouseEnter,
  handleMouseLeave,
  clearHoveredItem,
  onSwitchAgency,
  onSwitchWorkspace,
}: OrgSwitcherDropdownProps) {
  const { t } = useTranslation();

  return (
    <div
      className="shrink-0 border-b"
      style={{ borderColor: "hsl(var(--sidebar-border, 240 5% 15%))" }}
    >
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={(open) => {
          setDropdownOpen(open);
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
        <DropdownMenuContent
          align="start"
          className="ml-2 w-[220px]"
          onMouseLeave={clearHoveredItem}
        >
          <DropdownMenuLabel className="text-muted-foreground text-3xs tracking-wider uppercase">
            {t("nav.orgSwitcher.selectAgency")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {agencyList.length === 0 && (
            <p className="text-muted-foreground px-2 py-2 text-xs">
              {t("nav.orgSwitcher.noAgency")}
            </p>
          )}

          {/* Client workspaces (CLIENT-only) */}
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
                      setDropdownOpen(false);
                      if (ws.agencyId) onSwitchWorkspace?.(ws.agencyId, ws.id);
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

          {/* Agencies and nested workspaces */}
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
                    setDropdownOpen(false);
                    onSwitchAgency?.(agency.id);
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
                        setDropdownOpen(false);
                        onSwitchWorkspace?.(agency.id, ws.id);
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
                        onClick={() => {
                          clearHoveredItem();
                          setDropdownOpen(false);
                        }}
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
              onClick={() => {
                clearHoveredItem();
                setDropdownOpen(false);
              }}
              className="text-brand-orange flex cursor-pointer items-center gap-1.5 text-xs font-semibold"
            >
              <FolderPlus className="size-3.5" />
              {t("nav.orgSwitcher.createAgency")}
            </NavLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
