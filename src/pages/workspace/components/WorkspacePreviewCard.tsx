import { WorkspaceSocialLinks } from "@/pages/workspace/components/WorkspaceSocialLinks";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Calendar,
  Clock,
  Globe,
  Image as ImageIcon,
  MapPin,
  Phone,
  Repeat,
  Tag,
  Users,
} from "lucide-react";
import { getLogoIcon } from "@/pages/agency/logoIcons";
import type {
  CompanySize,
  ReportFrequency,
  WorkspaceIndustry,
} from "@/types/workspace";

function PreviewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-muted-foreground text-2xs font-medium tracking-wide">
          {label}
        </p>
        <p className="text-foreground text-xs leading-relaxed font-medium break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

interface Props {
  name: string;
  tagline?: string | null;
  description?: string | null;
  timezone?: string | null;
  logoUrl?: string | null;
  logoIcon?: string | null;
  bannerUrl?: string | null;
  brandColor?: string | null;
  foundedYear?: string | number | null;
  industry?: WorkspaceIndustry | null;
  companySize?: CompanySize | null;
  website?: string | null;
  phone?: string | null;
  location?: string | null;
  defaultPlatforms?: string[] | null;
  reportFrequency?: ReportFrequency | null;
  facebookUrl?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
}

/** Mini-mockup của giao diện hồ sơ workspace — dùng cho Live Preview ở trang
 * cài đặt workspace (cả chế độ xem lẫn chỉnh sửa) và xem trước mẫu. */
export function WorkspacePreviewCard({
  name,
  tagline,
  description,
  timezone,
  logoUrl,
  logoIcon,
  bannerUrl,
  brandColor,
  foundedYear,
  industry,
  companySize,
  website,
  phone,
  location,
  defaultPlatforms,
  reportFrequency,
  facebookUrl,
  linkedinUrl,
  instagramUrl,
}: Props) {
  const { t } = useTranslation();
  const hasMetadataRows = Boolean(
    industry ||
    companySize ||
    website?.trim() ||
    phone?.trim() ||
    location?.trim(),
  );
  const yearStr =
    foundedYear !== undefined && foundedYear !== null
      ? String(foundedYear).trim()
      : "";
  const hasSocials = Boolean(
    facebookUrl?.trim() || linkedinUrl?.trim() || instagramUrl?.trim(),
  );

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border shadow-xs">
      {/* 1. Cover Banner Area */}
      <div className="bg-muted/40 relative h-28 w-full overflow-hidden sm:h-32">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt=""
            className="size-full object-cover select-none"
          />
        ) : (
          <div
            className="text-muted-foreground/60 text-2xs flex size-full items-center justify-center select-none"
            style={{
              background: brandColor
                ? `linear-gradient(135deg, ${brandColor}25 0%, ${brandColor}0a 100%)`
                : "linear-gradient(135deg, hsl(var(--muted)/0.6) 0%, hsl(var(--muted)/0.2) 100%)",
            }}
          >
            <div className="flex items-center gap-1.5 opacity-60">
              <ImageIcon className="size-3.5" />
              <span className="text-3xs italic">
                {t("workspace.settings.bannerEmptyLabel", "Chưa có ảnh bìa")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Header Content (Logo overlapping banner + Title block) */}
      <div className="px-4 pb-4">
        <div className="relative -mt-9 mb-2.5 flex items-end justify-between gap-2">
          <div className="border-card bg-card flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 shadow-md">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="size-full object-cover" />
            ) : logoIcon ? (
              <div
                className="flex size-full items-center justify-center text-white"
                style={{
                  background: brandColor || "#f05a28",
                  color: "#ffffff",
                }}
              >
                {React.createElement(getLogoIcon(logoIcon), {
                  className: "size-7 text-white",
                })}
              </div>
            ) : (
              <div
                className="flex size-full items-center justify-center text-lg font-bold text-white"
                style={{
                  background: brandColor || "#f05a28",
                  color: "#ffffff",
                }}
              >
                {name ? (
                  name.charAt(0).toUpperCase()
                ) : (
                  <Building2 className="size-6 text-white" />
                )}
              </div>
            )}
          </div>

          {/* Quick pills: Founded Year / Report Frequency */}
          {(yearStr || reportFrequency) && (
            <div className="flex flex-wrap items-center justify-end gap-1.5 pb-1">
              {yearStr && (
                <span className="bg-muted text-muted-foreground text-3xs inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium">
                  <Calendar className="size-3" />
                  {yearStr}
                </span>
              )}
              {reportFrequency && (
                <span className="bg-brand-orange/10 text-brand-orange text-3xs inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium">
                  <Repeat className="size-3" />
                  {t(`workspace.reportFrequency.${reportFrequency}`)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Workspace Title, Tagline & Timezone */}
        <div className="mb-3.5 space-y-1">
          <h4 className="text-foreground text-sm leading-snug font-bold break-words">
            {name || t("workspace.settings.preview.emptyName")}
          </h4>
          {tagline?.trim() ? (
            <p className="text-muted-foreground text-xs break-words italic">
              {tagline.trim()}
            </p>
          ) : null}
          {timezone ? (
            <p className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
              <Clock className="size-3 shrink-0" />
              <span>{timezone}</span>
            </p>
          ) : null}
        </div>

        {/* Description / About section */}
        {description?.trim() && (
          <div className="border-border/60 mb-3.5 border-t pt-3">
            <p className="text-muted-foreground text-3xs mb-1 font-semibold tracking-wider uppercase">
              {t("workspace.createPreview.about", "Giới thiệu")}
            </p>
            <div
              className="prose prose-sm dark:prose-invert text-foreground/85 line-clamp-3 max-w-none text-xs leading-relaxed"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        )}

        {/* 3. Metadata details list */}
        {hasMetadataRows && (
          <div className="border-border/60 space-y-3.5 border-t pt-3.5 text-xs">
            {industry ? (
              <PreviewRow
                icon={Tag}
                label={t("workspace.create.industryLabel")}
                value={t(`workspace.industry.${industry}`)}
              />
            ) : null}
            {companySize ? (
              <PreviewRow
                icon={Users}
                label={t("workspace.create.companySizeLabel")}
                value={t(`agency.companySize.${companySize}`)}
              />
            ) : null}
            {website?.trim() ? (
              <PreviewRow
                icon={Globe}
                label={t("workspace.create.websiteLabel")}
                value={website.trim()}
              />
            ) : null}
            {phone?.trim() ? (
              <PreviewRow
                icon={Phone}
                label={t("workspace.create.phoneLabel")}
                value={phone.trim()}
              />
            ) : null}
            {location?.trim() ? (
              <PreviewRow
                icon={MapPin}
                label={t("workspace.create.locationLabel")}
                value={location.trim()}
              />
            ) : null}
          </div>
        )}

        {/* 4. Default platforms */}
        {defaultPlatforms && defaultPlatforms.length > 0 && (
          <div className="border-border/60 mt-3.5 space-y-1.5 border-t pt-3.5">
            <p className="text-muted-foreground text-3xs font-semibold tracking-wider uppercase">
              {t("workspace.settings.defaultPlatformsLabel")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {defaultPlatforms.map((p) => (
                <span
                  key={p}
                  className="bg-muted text-muted-foreground text-2xs rounded-full px-2 py-0.5 font-medium capitalize"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 5. Social links */}
        {hasSocials && (
          <div className="border-border/60 mt-3.5 space-y-1.5 border-t pt-3.5">
            <p className="text-muted-foreground text-3xs font-semibold tracking-wider uppercase">
              {t("workspace.createPreview.social", "Mạng xã hội")}
            </p>
            <WorkspaceSocialLinks
              facebookUrl={facebookUrl}
              linkedinUrl={linkedinUrl}
              instagramUrl={instagramUrl}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkspacePreviewCard;
