import { useTranslation } from "react-i18next";
import { Building2, Globe, Image as ImageIcon, MapPin, Phone, Tag, Users } from "lucide-react";
import type { CompanySize, WorkspaceIndustry } from "@/types/workspace";

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
        <p className="text-muted-foreground text-2xs font-medium tracking-wide">{label}</p>
        <p className="text-foreground text-xs leading-relaxed break-words font-medium">{value}</p>
      </div>
    </div>
  );
}

interface Props {
  name: string;
  timezone?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  brandColor?: string | null;
  industry?: WorkspaceIndustry | null;
  companySize?: CompanySize | null;
  website?: string | null;
  phone?: string | null;
  location?: string | null;
  defaultPlatforms?: string[] | null;
}

/** Mini-mockup của giao diện workspace thật — dùng cho preview edit-mode
 * settings và preview mẫu trước khi áp dụng. */
export function WorkspacePreviewCard({
  name,
  timezone,
  logoUrl,
  bannerUrl,
  brandColor,
  industry,
  companySize,
  website,
  phone,
  location,
  defaultPlatforms,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      {/* 1. Cover Banner Area */}
      <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-muted/40">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt=""
            className="size-full object-cover select-none"
          />
        ) : (
          <div
            className="flex size-full items-center justify-center text-2xs text-muted-foreground/60 select-none"
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

      {/* 2. Header Content (Logo overlapping banner + spacious Title block) */}
      <div className="px-4 pb-4">
        {/* Logo / Avatar overlapping the banner */}
        <div className="relative -mt-9 mb-2.5 flex items-end justify-between">
          <div className="size-16 shrink-0 overflow-hidden rounded-2xl border-4 border-card bg-card shadow-md flex items-center justify-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="size-full object-cover"
              />
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
        </div>

        {/* Workspace Title & Timezone with full width and clear line spacing */}
        <div className="space-y-1 mb-3.5">
          <h4 className="text-foreground text-sm font-bold leading-snug break-words">
            {name || t("workspace.settings.preview.emptyName")}
          </h4>
          {timezone ? (
            <p className="text-muted-foreground text-xs font-medium">{timezone}</p>
          ) : null}
        </div>

        {/* 3. Metadata details list with comfortable row spacing */}
        <div className="space-y-3.5 border-t border-border/60 pt-3.5 text-xs">
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

        {/* 4. Default platforms */}
        {defaultPlatforms && defaultPlatforms.length > 0 && (
          <div className="border-border/60 mt-3.5 flex flex-wrap gap-1.5 border-t pt-3.5">
            {defaultPlatforms.map((p) => (
              <span
                key={p}
                className="bg-muted text-muted-foreground text-2xs rounded-full px-2 py-0.5 font-medium capitalize"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkspacePreviewCard;
