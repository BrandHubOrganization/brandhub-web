import * as ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import { MapPin, Globe, Phone, Calendar, Users, FolderOpen } from "lucide-react";
import type { Agency } from "@/types/agency";
import type { Workspace } from "@/types/workspace";

export interface HoveredItemInfo {
  type: "agency" | "workspace";
  id: string;
  agencyId?: string;
  rect: DOMRect;
}

export interface SidebarHoverPreviewProps {
  dropdownOpen: boolean;
  hoveredItem: HoveredItemInfo | null;
  hoveredAgency: Agency | null | undefined;
  hoveredWorkspace: Workspace | null | undefined;
  allWorkspaces: Workspace[];
  currentUserId?: string | null;
}

export function SidebarHoverPreview({
  dropdownOpen,
  hoveredItem,
  hoveredAgency,
  hoveredWorkspace,
  allWorkspaces,
  currentUserId = null,
}: SidebarHoverPreviewProps) {
  const { t } = useTranslation();

  if (
    !dropdownOpen ||
    !hoveredAgency ||
    !hoveredItem?.rect ||
    typeof document === "undefined"
  ) {
    return null;
  }

  const isWs = Boolean(hoveredWorkspace);
  const targetName = isWs ? hoveredWorkspace!.name : hoveredAgency.name;
  const targetBrandColor =
    (isWs ? hoveredWorkspace!.brandColor : hoveredAgency.brandColor) ||
    "#f05a28";
  const targetBannerUrl = isWs
    ? hoveredWorkspace!.bannerUrl
    : hoveredAgency.bannerUrl;
  const targetLogoUrl = isWs
    ? hoveredWorkspace!.logoUrl
    : hoveredAgency.logoUrl;
  const targetTagline = isWs
    ? hoveredWorkspace!.tagline || hoveredWorkspace!.description
    : hoveredAgency.description || hoveredAgency.tagline;
  const targetCompanySize = isWs
    ? hoveredWorkspace!.companySize
    : hoveredAgency.companySize;
  const targetLocation = isWs
    ? hoveredWorkspace!.location
    : hoveredAgency.location;
  const targetWebsite = isWs
    ? hoveredWorkspace!.website
    : hoveredAgency.website;
  const targetPhone = isWs
    ? hoveredWorkspace!.phone
    : hoveredAgency.phone;
  const targetFoundedYear = isWs
    ? hoveredWorkspace!.foundedYear
    : hoveredAgency.foundedYear;

  const subtitle = isWs
    ? `${t("workspace.list.parentAgency", "Công ty:")} ${hoveredAgency.name}`
    : hoveredAgency.tagline || t("nav.orgSwitcher.selectAgency", "Công ty");

  const roleBadge = isWs
    ? hoveredWorkspace!.myRole
      ? t(`workspace.roles.${hoveredWorkspace!.myRole}`)
      : null
    : hoveredAgency.ownerId === currentUserId
      ? t("workspace.roles.OWNER")
      : null;

  const categoryOrIndustry = isWs
    ? hoveredWorkspace!.industry
      ? t(`workspace.industry.${hoveredWorkspace!.industry}`)
      : null
    : hoveredAgency.category
      ? t(`agency.category.${hoveredAgency.category}`)
      : null;

  return ReactDOM.createPortal(
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
      {/* Top Cover Banner */}
      <div className="relative h-20 w-full shrink-0 overflow-hidden bg-muted/40">
        {targetBannerUrl ? (
          <img
            src={targetBannerUrl}
            alt=""
            className="size-full object-cover select-none"
          />
        ) : (
          <div
            className="size-full select-none"
            style={{
              background: `linear-gradient(135deg, ${targetBrandColor}40 0%, ${targetBrandColor}15 50%, ${targetBrandColor}05 100%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
      </div>

      <div className="px-3.5 pb-3.5 pt-0 space-y-2.5">
        {/* Overlapping Avatar + Badges */}
        <div className="relative -mt-6 mb-1.5 flex items-end justify-between gap-2">
          {targetLogoUrl ? (
            <img
              src={targetLogoUrl}
              alt={targetName}
              className="size-12 shrink-0 rounded-xl border-2 border-popover bg-card shadow-md object-cover"
            />
          ) : (
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-xl border-2 border-popover text-xs font-bold shadow-md select-none text-white"
              style={{
                backgroundColor: targetBrandColor || "#f05a28",
                color: "#ffffff",
              }}
            >
              {targetName.slice(0, 2).toUpperCase()}
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-end gap-1 shrink-0">
            {roleBadge && (
              <span className="text-brand-orange bg-brand-orange-soft text-3xs rounded px-1.5 py-0.5 font-semibold border border-brand-orange/20">
                {roleBadge}
              </span>
            )}
            {categoryOrIndustry && (
              <span className="text-muted-foreground bg-muted text-3xs rounded px-1.5 py-0.5 font-medium border border-border/60">
                {categoryOrIndustry}
              </span>
            )}
          </div>
        </div>

        {/* Name & Subtitle */}
        <div>
          <p className="text-foreground truncate text-sm font-semibold leading-tight">
            {targetName}
          </p>
          {subtitle && (
            <p className="text-muted-foreground text-3xs mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Slogan / Description if available */}
        {targetTagline && (
          <p className="text-muted-foreground text-3xs line-clamp-2 italic leading-relaxed">
            {targetTagline}
          </p>
        )}

        {/* Meta details list */}
        {(targetCompanySize ||
          targetLocation ||
          targetWebsite ||
          targetPhone ||
          targetFoundedYear ||
          (!isWs && hoveredAgency)) && (
          <div className="border-border/60 space-y-1.5 border-t pt-2 text-xs text-muted-foreground">
            {targetCompanySize && (
              <div className="flex items-center gap-2">
                <Users className="text-brand-orange size-3.5 shrink-0" />
                <span className="text-3xs truncate">
                  {t(
                    `agency.companySize.${targetCompanySize}`,
                    targetCompanySize,
                  )}
                </span>
              </div>
            )}

            {targetLocation && (
              <div className="flex items-center gap-2">
                <MapPin className="text-brand-orange size-3.5 shrink-0" />
                <span className="text-3xs truncate">
                  {targetLocation}
                </span>
              </div>
            )}

            {targetWebsite && (
              <div className="flex items-center gap-2">
                <Globe className="text-brand-orange size-3.5 shrink-0" />
                <span className="text-3xs truncate">
                  {targetWebsite}
                </span>
              </div>
            )}

            {targetPhone && (
              <div className="flex items-center gap-2">
                <Phone className="text-brand-orange size-3.5 shrink-0" />
                <span className="text-3xs truncate">
                  {targetPhone}
                </span>
              </div>
            )}

            {targetFoundedYear && (
              <div className="flex items-center gap-2">
                <Calendar className="text-brand-orange size-3.5 shrink-0" />
                <span className="text-3xs truncate">
                  {t(
                    "agency.create.foundedYearLabel",
                    "Năm thành lập",
                  )}
                  : {targetFoundedYear}
                </span>
              </div>
            )}

            {!isWs && hoveredAgency && (
              <div className="flex items-center gap-2">
                <FolderOpen className="text-brand-orange size-3.5 shrink-0" />
                <span className="text-3xs truncate">
                  {
                    allWorkspaces.filter(
                      (w) => w.agencyId === hoveredAgency.id,
                    ).length
                  }{" "}
                  {t("workspace.list.workspacesCount", "workspace")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
