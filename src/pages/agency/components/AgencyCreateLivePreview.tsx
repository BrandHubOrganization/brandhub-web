import React from "react";
import { useTranslation } from "react-i18next";
import { ProfileBannerHeader } from "@/components/shared/ProfileBannerHeader";
import { Eye, Globe, Phone, MapPin, type LucideIcon } from "lucide-react";

interface AgencyCreateLivePreviewProps {
  effectiveBannerUrl?: string | null;
  effectiveLogoUrl?: string | null;
  name: string;
  tagline: string;
  category: string;
  companySize: string;
  foundedYear: string;
  brandColor: string;
  CurrentIcon: LucideIcon;
  description: string;
  website: string;
  phone: string;
  location: string;
  facebookUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
}

export const AgencyCreateLivePreview: React.FC<AgencyCreateLivePreviewProps> = ({
  effectiveBannerUrl,
  effectiveLogoUrl,
  name,
  tagline,
  category,
  companySize,
  foundedYear,
  brandColor,
  CurrentIcon,
  description,
  website,
  phone,
  location,
  facebookUrl,
  linkedinUrl,
  instagramUrl,
}) => {
  const { t } = useTranslation();

  return (
    <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-6 space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Eye className="size-3.5 text-brand-orange" />
          {t("agency.create.previewTitle")}
        </span>
        <span className="rounded-full bg-brand-orange/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-orange">
          {t("agency.create.previewBadge")}
        </span>
      </div>

      {/* Standardized Profile Header Card Preview */}
      <ProfileBannerHeader
        bannerUrl={effectiveBannerUrl || null}
        bannerEmptyLabel={t("agency.detail.bannerEmptyLabel")}
        canEditBanner={false}
        canEditLogo={false}
        title={name.trim() || t("agency.create.previewNameFallback")}
        subtitle={tagline.trim() || t("agency.create.previewSubtitleFallback")}
        badges={
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {category && (
              <span className="inline-flex items-center rounded-full bg-brand-orange/10 px-2.5 py-0.5 text-xs font-medium text-brand-orange">
                {t(`agency.category.${category}`)}
              </span>
            )}
            {companySize && (
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {t(`agency.companySize.${companySize}`)}
              </span>
            )}
            {foundedYear && (
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {t("agency.list.foundedIn", { year: foundedYear })}
              </span>
            )}
          </div>
        }
        logo={
          effectiveLogoUrl ? (
            <img
              src={effectiveLogoUrl}
              alt={name || "Agency Logo"}
              className="size-full object-cover"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center transition-colors text-white"
              style={{
                backgroundColor: brandColor || "#f05a28",
                color: "#ffffff",
              }}
            >
              <CurrentIcon
                className="size-10 sm:size-12 transition-transform text-white"
              />
            </div>
          )
        }
      >
        <div className="space-y-4 pt-2">
          {/* Description preview */}
          {description.trim() ? (
            <div className="border-t border-border pt-4">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                {t("agency.create.previewAbout")}
              </h4>
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-xs text-foreground/85 line-clamp-4 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>
          ) : (
            <div className="border-t border-border pt-3 text-center text-xs text-muted-foreground/60 italic">
              {t("agency.create.emptyDescription", "Chưa có mô tả công ty")}
            </div>
          )}

          {/* Contact info preview */}
          {(website || phone || location) && (
            <div className="border-t border-border pt-3 space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("agency.create.previewContact")}
              </h4>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {website && (
                  <div className="flex items-center gap-2 truncate">
                    <Globe className="size-3.5 shrink-0 text-brand-orange" />
                    <span className="truncate text-foreground/80">{website}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="size-3.5 shrink-0 text-brand-orange" />
                    <span className="text-foreground/80">{phone}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3.5 shrink-0 text-brand-orange" />
                    <span className="text-foreground/80">{location}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social badges preview */}
          {(facebookUrl || linkedinUrl || instagramUrl) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {facebookUrl && (
                <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                  Facebook
                </span>
              )}
              {linkedinUrl && (
                <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-600 dark:text-sky-400">
                  LinkedIn
                </span>
              )}
              {instagramUrl && (
                <span className="rounded-md bg-pink-500/10 px-2 py-0.5 text-[10px] font-medium text-pink-600 dark:text-pink-400">
                  Instagram
                </span>
              )}
            </div>
          )}
        </div>
      </ProfileBannerHeader>
    </div>
  );
};
