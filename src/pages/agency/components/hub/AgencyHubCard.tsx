import { createElement } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  Calendar,
  ChevronDown,
  Eye,
  FolderKanban,
  Globe,
  Layers,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLogoIcon } from "@/pages/agency/logoIcons";
import { cn } from "@/lib/utils";
import { SpotlightCard } from "./SpotlightCard";
import type { Agency } from "@/types/agency";
import type { Workspace } from "@/types/workspace";

export interface AgencyHubCardProps {
  agency: Agency;
  workspaces: Workspace[];
  isExpanded: boolean;
  isOwner: boolean;
  onToggleExpand: (agencyId: string, e?: React.MouseEvent) => void;
  onSelectAgency: (agencyId: string) => void;
  /** Chuyển sang tab Không gian làm việc và lọc sẵn theo công ty này */
  onFilterWorkspacesByAgency?: (agencyId: string) => void;
}

export function AgencyHubCard({
  agency: a,
  workspaces: agencyWorkspaces,
  isExpanded,
  isOwner,
  onToggleExpand,
  onSelectAgency,
  onFilterWorkspacesByAgency,
}: AgencyHubCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const LogoIcon = getLogoIcon(a.logoIcon);
  const brandColor = a.brandColor || "#f05a28";
  const previewWorkspaces = agencyWorkspaces.slice(0, 2);
  const remainingCount = Math.max(
    0,
    agencyWorkspaces.length - previewWorkspaces.length,
  );

  const handleOpenProfile = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onSelectAgency(a.id);
    navigate(`/agency/${a.id}`);
  };

  const handleOpenMembers = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectAgency(a.id);
    navigate(`/agency/${a.id}/members`);
  };

  return (
    <SpotlightCard
      onClick={() => handleOpenProfile()}
      className={cn(
        "group flex h-full min-w-0 cursor-pointer flex-col",
        isExpanded && "ring-brand-orange/30 border-brand-orange/40 ring-1",
      )}
    >
      {/* Top Cover Banner */}
      <div className="bg-muted/40 relative h-28 w-full shrink-0 overflow-hidden">
        {a.bannerUrl ? (
          <img
            src={a.bannerUrl}
            alt=""
            className="size-full object-cover transition-transform duration-500 select-none group-hover:scale-105"
          />
        ) : (
          <div
            className="size-full select-none"
            style={{
              background: a.brandColor
                ? `linear-gradient(135deg, ${a.brandColor}38 0%, ${a.brandColor}15 50%, ${a.brandColor}08 100%)`
                : "linear-gradient(135deg, hsl(var(--brand-orange-soft, 15 100% 96%)) 0%, hsl(var(--muted)/0.25) 100%)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60" />
      </div>

      <div className="relative z-20 flex flex-1 flex-col justify-between px-5 pt-0 pb-5">
        {/* MAIN CONTENT: Thông tin Công ty (CHÍNH) */}
        <div>
          {/* Overlapping Avatar + Role Badge */}
          <div className="relative -mt-8 mb-3 flex items-end justify-between gap-3">
            {a.logoUrl &&
            !a.logoUrl.startsWith("seed:") &&
            !a.logoUrl.startsWith("icon:") ? (
              <img
                src={a.logoUrl}
                alt={a.name}
                className="border-card bg-card size-16 shrink-0 rounded-2xl border-4 object-cover shadow-md transition-transform duration-300 group-hover:scale-102"
              />
            ) : (
              <div
                className="border-card flex size-16 shrink-0 items-center justify-center rounded-2xl border-4 text-white shadow-md transition-transform duration-300 select-none group-hover:scale-102"
                style={{
                  backgroundColor: brandColor,
                  color: "#ffffff",
                }}
              >
                <LogoIcon className="size-6 text-white" />
              </div>
            )}

            <span
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-2xs",
                isOwner
                  ? "bg-brand-orange/10 text-brand-orange border-brand-orange/20"
                  : "bg-muted text-muted-foreground border-border/70",
              )}
            >
              {isOwner
                ? t("workspace.roles.OWNER", "Chủ sở hữu")
                : t("agency.list.memberBadge", "Thành viên")}
            </span>
          </div>

          {/* Agency Name & Tagline */}
          <div>
            <h3 className="text-foreground group-hover:text-brand-orange truncate text-sm font-semibold transition-colors sm:text-base">
              {a.name}
            </h3>
            <p className="text-muted-foreground mt-1 truncate text-xs">
              {a.tagline ||
                a.description ||
                t("agency.list.noDescription", "Chưa cập nhật mô tả công ty.")}
            </p>
          </div>

          {/* Category & Company Size Badges */}
          {(a.category || a.companySize) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {a.category && (
                <span className="bg-brand-orange/10 text-brand-orange border-brand-orange/15 rounded-full border px-2.5 py-0.5 text-[11px] font-medium">
                  {t(`agency.category.${a.category}`, a.category)}
                </span>
              )}
              {a.companySize && (
                <span className="bg-muted text-muted-foreground border-border/50 rounded-full border px-2.5 py-0.5 text-[11px] font-medium">
                  {t(`agency.companySize.${a.companySize}`, a.companySize)}
                </span>
              )}
            </div>
          )}

          {/* Metadata details */}
          <div className="text-muted-foreground mt-3 min-h-[4.5rem] space-y-1.5 text-xs">
            {a.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="text-brand-orange size-3.5 shrink-0" />
                <span className="truncate">{a.location}</span>
              </div>
            )}
            {a.website && (
              <div className="flex items-center gap-1.5">
                <Globe className="text-brand-orange size-3.5 shrink-0" />
                <a
                  href={
                    a.website.startsWith("http")
                      ? a.website
                      : `https://${a.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-foreground truncate hover:underline"
                >
                  {a.website}
                </a>
              </div>
            )}
            {a.foundedYear && (
              <div className="flex items-center gap-1.5">
                <Calendar className="text-brand-orange size-3.5 shrink-0" />
                <span>
                  {t("agency.list.foundedIn", { year: a.foundedYear })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: Nút hành động Công ty & Danh sách Workspace trực thuộc (PHỤ) */}
        <div>
          {/* Primary Company Action Buttons */}
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hover:border-brand-orange/50 hover:text-brand-orange hover:bg-brand-orange/[0.04] h-8.5 flex-1 cursor-pointer gap-1.5 text-xs"
              onClick={handleOpenProfile}
            >
              <Eye className="size-3.5" />
              {t("agency.list.viewProfile", "Xem hồ sơ")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hover:border-brand-orange/50 hover:text-brand-orange hover:bg-brand-orange/[0.04] h-8.5 flex-1 cursor-pointer gap-1.5 text-xs"
              onClick={handleOpenMembers}
            >
              <Users className="size-3.5" />
              {t("agency.list.manageMembers", "Quản lý thành viên")}
            </Button>
          </div>

          {/* SUB-SECTION: Danh sách các Workspace con (PHỤ) */}
          <div
            className="border-border mt-4 min-h-28 border-t pt-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => onToggleExpand(a.id, e)}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                isExpanded
                  ? "bg-brand-orange/10 text-brand-orange font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <div className="flex items-center gap-1.5">
                <FolderKanban className="text-brand-orange size-3.5" />
                <span>
                  {t(
                    "agency.list.affiliatedWorkspaces",
                    "Workspace trực thuộc",
                  )}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                    isExpanded
                      ? "bg-brand-orange/15 text-brand-orange border-brand-orange/30"
                      : "bg-card text-foreground border-border/80",
                  )}
                >
                  {agencyWorkspaces.length}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <span>
                  {isExpanded
                    ? t("agency.list.collapseWorkspaces", "Thu gọn")
                    : t("agency.list.viewWorkspaces", "Xem danh sách")}
                </span>
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform duration-200",
                    isExpanded && "rotate-180",
                  )}
                />
              </div>
            </button>

            {/* Compact preview pills when collapsed */}
            {!isExpanded && agencyWorkspaces.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 px-1">
                {previewWorkspaces.map((ws) => (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => navigate(`/workspaces/${ws.id}/dashboard`)}
                    title={ws.name}
                    className="border-border/70 bg-muted/40 hover:bg-brand-orange/10 hover:border-brand-orange/30 hover:text-brand-orange text-muted-foreground inline-flex max-w-[135px] cursor-pointer items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] transition-colors"
                  >
                    {ws.logoUrl ? (
                      <img
                        src={ws.logoUrl}
                        alt=""
                        className="size-3.5 shrink-0 rounded-xs object-cover"
                      />
                    ) : (
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor: ws.brandColor || "#f05a28",
                        }}
                      />
                    )}
                    <span className="truncate font-medium">{ws.name}</span>
                  </button>
                ))}
                {remainingCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => onToggleExpand(a.id, e)}
                    className="bg-muted/70 hover:bg-brand-orange/10 hover:text-brand-orange text-muted-foreground cursor-pointer rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition-colors"
                  >
                    {t("agency.list.showMoreWorkspaces", {
                      count: agencyWorkspaces.length,
                      remaining: remainingCount,
                      defaultValue: `Xem tất cả ${agencyWorkspaces.length} workspace (+${remainingCount})`,
                    })}
                  </button>
                )}
              </div>
            )}

            {/* Animated Expanded Workspaces Drawer */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="bg-muted/30 border-border/60 mt-2 space-y-2 rounded-xl border p-2.5">
                    {agencyWorkspaces.length === 0 ? (
                      <div className="py-3 text-center">
                        <p className="text-muted-foreground text-xs italic">
                          {t(
                            "agency.list.noWorkspacesYet",
                            "Chưa có workspace nào",
                          )}
                        </p>
                        {isOwner && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/workspaces/create?agencyId=${a.id}`)
                            }
                            className="text-brand-orange hover:text-brand-orange border-brand-orange/30 hover:bg-brand-orange/10 mt-2 h-7 cursor-pointer gap-1 text-xs"
                          >
                            <Plus className="size-3" />
                            {t(
                              "agency.list.createFirstWorkspace",
                              "Tạo workspace đầu tiên",
                            )}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
                          {agencyWorkspaces.map((ws) => (
                            <div
                              key={ws.id}
                              onClick={() =>
                                navigate(`/workspaces/${ws.id}/dashboard`)
                              }
                              className="border-border/80 bg-card hover:border-brand-orange/50 hover:bg-muted/50 group/ws flex cursor-pointer items-center justify-between gap-2 rounded-lg border p-2 text-xs shadow-2xs transition-colors"
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                {ws.logoUrl ? (
                                  <img
                                    src={ws.logoUrl}
                                    alt={ws.name}
                                    className="border-border size-6 shrink-0 rounded-md border object-cover"
                                  />
                                ) : (
                                  <div
                                    className="flex size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white"
                                    style={{
                                      backgroundColor:
                                        ws.brandColor || "#f05a28",
                                    }}
                                  >
                                    {ws.logoIcon
                                      ? createElement(
                                          getLogoIcon(ws.logoIcon),
                                          {
                                            className: "size-3.5 text-white",
                                          },
                                        )
                                      : ws.name.slice(0, 1).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-foreground group-hover/ws:text-brand-orange truncate font-medium transition-colors">
                                    {ws.name}
                                  </p>
                                  {ws.industry && (
                                    <p className="text-muted-foreground truncate text-[10px]">
                                      {t(
                                        `workspace.industry.${ws.industry}`,
                                        ws.industry,
                                      )}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-1.5">
                                {ws.myRole && (
                                  <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[9px] font-medium">
                                    {t(
                                      `workspace.roles.${ws.myRole}`,
                                      ws.myRole,
                                    )}
                                  </span>
                                )}
                                <ArrowUpRight className="text-muted-foreground group-hover/ws:text-brand-orange size-3.5 transition-colors" />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-border/50 flex items-center gap-1.5 border-t pt-1">
                          {onFilterWorkspacesByAgency && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onFilterWorkspacesByAgency(a.id)}
                              className="text-muted-foreground hover:text-foreground hover:bg-muted h-7 flex-1 cursor-pointer gap-1 px-2 text-[11px] font-medium"
                            >
                              <Layers className="text-brand-orange size-3 shrink-0" />
                              <span className="truncate">
                                {t(
                                  "agency.list.filterInWorkspaceTab",
                                  "Xem dạng thẻ Workspace",
                                )}
                              </span>
                            </Button>
                          )}
                          {isOwner && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(`/workspaces/create?agencyId=${a.id}`)
                              }
                              className="text-brand-orange hover:bg-brand-orange/10 h-7 flex-1 cursor-pointer gap-1 px-2 text-[11px] font-medium"
                            >
                              <Plus className="size-3 shrink-0" />
                              <span className="truncate">
                                {t(
                                  "agency.list.createWorkspace",
                                  "Tạo workspace",
                                )}
                              </span>
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}

export default AgencyHubCard;
