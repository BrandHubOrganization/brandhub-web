import React from "react";
import { FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { ProfileBannerHeader } from "@/components/shared/ProfileBannerHeader";
import { DEFAULT_AGENCY_COVER } from "@/pages/agency/agencyDefaults";
import { Eye, Globe, Phone, MapPin, type LucideIcon } from "lucide-react";

interface AgencyCreateLivePreviewProps {
  effectiveBannerUrl?: string | null;
  effectiveLogoUrl?: string | null;
  name: string;
  tagline: string;
  category: string;
  companySize: string;
  foundedYear: string;
  CurrentIcon: LucideIcon;
  description: string;
  website: string;
  phone: string;
  location: string;
  facebookUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
}

export const AgencyCreateLivePreview: React.FC<
  AgencyCreateLivePreviewProps
> = ({
  effectiveBannerUrl,
  effectiveLogoUrl,
  name,
  tagline,
  category,
  companySize,
  foundedYear,
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
    <div className="space-y-3 lg:sticky lg:top-6 lg:col-span-5 xl:col-span-5">
      <div className="flex items-center justify-between px-1">
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
          <Eye className="text-brand-orange size-3.5" />
          {t("agency.create.previewTitle")}
        </span>
        <span className="bg-brand-orange/10 text-brand-orange rounded-full px-2.5 py-0.5 text-[11px] font-medium">
          {t("agency.create.previewBadge")}
        </span>
      </div>

      {/* Standardized Profile Header Card Preview */}
      <ProfileBannerHeader
        bannerUrl={effectiveBannerUrl || DEFAULT_AGENCY_COVER}
        bannerEmptyLabel={t("agency.detail.bannerEmptyLabel")}
        canEditBanner={false}
        canEditLogo={false}
        title={name.trim() || t("agency.create.previewNameFallback")}
        subtitle={tagline.trim() || t("agency.create.previewSubtitleFallback")}
        badges={
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {category && (
              <span className="bg-brand-orange/10 text-brand-orange inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                {t(`agency.category.${category}`)}
              </span>
            )}
            {companySize && (
              <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                {t(`agency.companySize.${companySize}`)}
              </span>
            )}
            {foundedYear && (
              <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
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
            <div className="bg-brand-orange flex size-full items-center justify-center text-white transition-colors">
              <CurrentIcon className="size-10 text-white transition-transform sm:size-12" />
            </div>
          )
        }
      >
        <div className="space-y-4 pt-2">
          {/* Description preview */}
          {description.trim() ? (
            <div className="border-border border-t pt-4">
              <h4 className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wider uppercase">
                {t("agency.create.previewAbout")}
              </h4>
              <div
                className="prose prose-sm dark:prose-invert text-foreground/85 line-clamp-4 max-w-none text-xs leading-relaxed"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>
          ) : (
            <div className="border-border text-muted-foreground/60 border-t pt-3 text-center text-xs italic">
              {t("agency.create.emptyDescription", "Chưa có mô tả công ty")}
            </div>
          )}

          {/* Contact info preview */}
          {(website || phone || location) && (
            <div className="border-border space-y-2 border-t pt-3">
              <h4 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                {t("agency.create.previewContact")}
              </h4>
              <div className="text-muted-foreground space-y-1.5 text-xs">
                {website && (
                  <div className="flex items-center gap-2 truncate">
                    <Globe className="text-brand-orange size-3.5 shrink-0" />
                    <span className="text-foreground/80 truncate">
                      {website}
                    </span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="text-brand-orange size-3.5 shrink-0" />
                    <span className="text-foreground/80">{phone}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="text-brand-orange size-3.5 shrink-0" />
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
                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                  <FaFacebook className="size-3" />
                  Facebook
                </span>
              )}
              {linkedinUrl && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-600 dark:text-sky-400">
                  <FaLinkedin className="size-3" />
                  LinkedIn
                </span>
              )}
              {instagramUrl && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-pink-500/10 px-2 py-0.5 text-[10px] font-medium text-pink-600 dark:text-pink-400">
                  <FaInstagram className="size-3" />
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
