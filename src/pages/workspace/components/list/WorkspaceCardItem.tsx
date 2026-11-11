import { createElement } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import {
  ArrowUpRight,
  Building2,
  Calendar,
  Copy,
  Filter,
  Globe,
  LayoutDashboard,
  MapPin,
  Settings,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { SpotlightCard } from "@/pages/agency/components/hub/SpotlightCard";
import { getLogoIcon } from "@/pages/agency/logoIcons";
import type { Workspace } from "@/types/workspace";
import type { Agency } from "@/types/agency";

export interface WorkspaceCardItemProps {
  workspace: Workspace;
  parentAgency: Agency | null | undefined;
  currentUserId: string | undefined;
  onDuplicate: (ws: Workspace) => void;
  onFilterByAgency?: (agencyId: string) => void;
}

export function WorkspaceCardItem({
  workspace: ws,
  parentAgency,
  currentUserId,
  onDuplicate,
  onFilterByAgency,
}: WorkspaceCardItemProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const brandColor = ws.brandColor || "#f05a28";
  const agencyBrandColor = parentAgency?.brandColor || "#f05a28";
  const canManage = ws.myRole === "OWNER" || ws.myRole === "MANAGER";

  return (
    <SpotlightCard
      onClick={() => navigate(`/workspaces/${ws.id}/dashboard`)}
      className="group flex flex-col cursor-pointer"
    >
      {/* Top Cover Banner */}
      <div className="relative h-28 w-full shrink-0 overflow-hidden bg-muted/40">
        {ws.bannerUrl ? (
          <img
            src={ws.bannerUrl}
            alt=""
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"
          />
        ) : (
          <div
            className="size-full select-none"
            style={{
              background: brandColor
                ? `linear-gradient(135deg, ${brandColor}38 0%, ${brandColor}15 50%, ${brandColor}08 100%)`
                : "linear-gradient(135deg, hsl(var(--muted)/0.7) 0%, hsl(var(--muted)/0.25) 100%)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
      </div>

      <div className="px-5 pb-5 pt-0 flex-1 flex flex-col justify-between relative z-20">
        {/* Header info */}
        <div>
          {/* Overlapping Avatar + Role */}
          <div className="relative -mt-8 mb-3 flex items-end justify-between gap-3">
            {ws.logoUrl ? (
              <img
                src={ws.logoUrl}
                alt={ws.name}
                className="size-16 shrink-0 rounded-2xl object-cover border-4 border-card bg-card shadow-md transition-transform duration-300 group-hover:scale-102"
              />
            ) : (
              <div
                className="flex size-16 shrink-0 items-center justify-center rounded-2xl text-base font-bold border-4 border-card shadow-md select-none transition-transform duration-300 group-hover:scale-102 text-white"
                style={{
                  backgroundColor: brandColor || "#f05a28",
                  color: "#ffffff",
                }}
              >
                {ws.logoIcon ? (
                  createElement(getLogoIcon(ws.logoIcon), {
                    className: "size-6 text-white",
                  })
                ) : (
                  ws.name.slice(0, 2).toUpperCase()
                )}
              </div>
            )}

            {ws.myRole && (
              <span className="rounded-full bg-brand-orange/10 px-2.5 py-1 text-[11px] font-semibold text-brand-orange shrink-0 border border-brand-orange/20 shadow-2xs">
                {t(`workspace.roles.${ws.myRole}`, ws.myRole)}
              </span>
            )}
          </div>

          {/* Title & Tagline */}
          <div>
            <h3 className="truncate font-semibold text-sm sm:text-base text-foreground group-hover:text-brand-orange transition-colors">
              {ws.name}
            </h3>
            <p className="text-muted-foreground truncate text-xs mt-1">
              {ws.tagline || ws.description || "—"}
            </p>
          </div>

          {/* Khối "Thuộc công ty" (Refer Agency) */}
          <div className="mt-3">
            {parentAgency ? (
              <HoverCard openDelay={180} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/agency/${parentAgency.id}`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        e.preventDefault();
                        navigate(`/agency/${parentAgency.id}`);
                      }
                    }}
                    className="rounded-lg border border-border/70 bg-muted/35 px-2.5 py-1.5 transition-all hover:border-brand-orange/40 hover:bg-brand-orange/[0.04] group/agency flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {parentAgency.logoUrl ? (
                        <img
                          src={parentAgency.logoUrl}
                          alt={parentAgency.name}
                          className="size-5 rounded-md object-cover shrink-0 border border-border/60 bg-card"
                        />
                      ) : (
                        <div
                          className="flex size-5 shrink-0 items-center justify-center rounded-md text-white shadow-2xs"
                          style={{ backgroundColor: agencyBrandColor }}
                        >
                          {createElement(getLogoIcon(parentAgency.logoIcon), {
                            className: "size-3 text-white",
                          })}
                        </div>
                      )}
                      <div className="flex items-baseline gap-1 min-w-0">
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {t("workspace.list.belongsToAgency", "Thuộc công ty:")}
                        </span>
                        <span className="font-semibold text-xs text-foreground group-hover/agency:text-brand-orange truncate transition-colors">
                          {parentAgency.name}
                        </span>
                      </div>
                    </div>

                    <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground group-hover/agency:text-brand-orange group-hover/agency:translate-x-0.5 group-hover/agency:-translate-y-0.5 transition-transform" />
                  </div>
                </HoverCardTrigger>

                <HoverCardPrimitive.Portal>
                  <HoverCardContent
                    align="start"
                    sideOffset={8}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/agency/${parentAgency.id}`);
                    }}
                    className="w-72 p-3.5 cursor-pointer border-border/90 hover:border-brand-orange/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {parentAgency.logoUrl ? (
                        <img
                          src={parentAgency.logoUrl}
                          alt={parentAgency.name}
                          className="size-10 rounded-xl object-cover shrink-0 border border-border bg-card"
                        />
                      ) : (
                        <div
                          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs"
                          style={{ backgroundColor: agencyBrandColor }}
                        >
                          {createElement(getLogoIcon(parentAgency.logoIcon), {
                            className: "size-5 text-white",
                          })}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-orange">
                          {t("workspace.list.belongsToAgencyLabel", "Thuộc công ty:")}
                        </p>
                        <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate mt-0.5">
                          {parentAgency.name}
                        </h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                          {parentAgency.tagline ||
                            parentAgency.description ||
                            t(
                              "agency.list.noDescription",
                              "Chưa cập nhật mô tả công ty.",
                            )}
                        </p>
                      </div>
                    </div>

                    {(parentAgency.category ||
                      parentAgency.companySize ||
                      parentAgency.location) && (
                      <div className="mt-3 pt-2.5 border-t border-border/60 space-y-1.5 text-[11px]">
                        <div className="flex flex-wrap gap-1.5">
                          {parentAgency.category && (
                            <span className="rounded-full bg-brand-orange/10 px-2 py-0.5 text-[10px] font-medium text-brand-orange border border-brand-orange/20">
                              {t(
                                `agency.category.${parentAgency.category}`,
                                parentAgency.category,
                              )}
                            </span>
                          )}
                          {parentAgency.companySize && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/60">
                              {t(
                                `agency.companySize.${parentAgency.companySize}`,
                                parentAgency.companySize,
                              )}
                            </span>
                          )}
                        </div>
                        {parentAgency.location && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="size-3 shrink-0 text-brand-orange" />
                            <span className="truncate">
                              {parentAgency.location}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-orange">
                        {t("workspace.list.viewAgencyDetail", "Xem công ty")}
                        <ArrowUpRight className="size-3" />
                      </span>

                      {onFilterByAgency && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFilterByAgency(parentAgency.id);
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:border-brand-orange/40 hover:text-brand-orange transition-colors cursor-pointer"
                        >
                          <Filter className="size-2.5" />
                          {t("workspace.list.filterByThisAgency", "Lọc theo công ty này")}
                        </button>
                      )}
                    </div>
                  </HoverCardContent>
                </HoverCardPrimitive.Portal>
              </HoverCard>
            ) : (
              <div className="rounded-lg border border-border/60 bg-muted/25 px-2.5 py-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 className="size-3.5 shrink-0 text-muted-foreground/70" />
                <span className="text-[11px] text-muted-foreground">
                  {t("workspace.list.belongsToAgency", "Thuộc công ty:")}
                </span>
                <span className="italic text-muted-foreground/70 truncate text-xs">
                  {t("workspace.list.unknownAgency", "Chưa xác định")}
                </span>
              </div>
            )}
          </div>

          {/* Industry & Size Badges */}
          {(ws.industry || ws.companySize) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {ws.industry && (
                <span className="bg-brand-orange/10 text-brand-orange text-[11px] rounded-full px-2.5 py-0.5 font-medium border border-brand-orange/15">
                  {t(`workspace.industry.${ws.industry}`, ws.industry)}
                </span>
              )}
              {ws.companySize && (
                <span className="bg-muted text-muted-foreground text-[11px] rounded-full px-2.5 py-0.5 font-medium border border-border/50">
                  {t(`agency.companySize.${ws.companySize}`, ws.companySize)}
                </span>
              )}
            </div>
          )}

          {/* Metadata details */}
          <div className="text-muted-foreground mt-3 space-y-1.5 text-xs">
            {ws.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0 text-brand-orange" />
                <span className="truncate">{ws.location}</span>
              </div>
            )}
            {ws.website && (
              <div className="flex items-center gap-1.5">
                <Globe className="size-3.5 shrink-0 text-brand-orange" />
                <a
                  href={
                    ws.website.startsWith("http")
                      ? ws.website
                      : `https://${ws.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="truncate hover:underline hover:text-foreground"
                >
                  {ws.website}
                </a>
              </div>
            )}
            {ws.createdAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0 text-brand-orange" />
                <span>
                  {t("workspace.list.createdAt", {
                    date: new Date(ws.createdAt).toLocaleDateString(
                      i18n.language === "vi" ? "vi-VN" : "en-US",
                      { year: "numeric", month: "long" },
                    ),
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card Action Buttons */}
        <div
          className="mt-4 pt-3 border-t border-border/60 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="outline"
            size="sm"
            className="flex-1 cursor-pointer gap-1.5 text-xs h-8.5 hover:border-brand-orange/50 hover:text-brand-orange hover:bg-brand-orange/[0.04]"
            onClick={() => navigate(`/workspaces/${ws.id}/dashboard`)}
          >
            <LayoutDashboard className="size-3.5" />
            {t("workspace.list.enterDashboard", "Vào Dashboard")}
          </Button>

          {canManage && (
            <>
              <Button
                variant="outline"
                size="sm"
                title={t("workspace.list.settings", "Cài đặt")}
                className="size-8.5 p-0 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/40"
                onClick={() => navigate(`/workspaces/${ws.id}/settings`)}
              >
                <Settings className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                title={t("workspace.list.membersButton", "Thành viên")}
                className="size-8.5 p-0 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/40"
                onClick={() => navigate(`/workspaces/${ws.id}/members`)}
              >
                <Users className="size-3.5" />
              </Button>
            </>
          )}
          {parentAgency?.ownerId === currentUserId && (
            <Button
              variant="outline"
              size="sm"
              title={t("workspace.duplicate.title")}
              className="size-8.5 p-0 cursor-pointer"
              onClick={() => onDuplicate(ws)}
            >
              <Copy className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}
