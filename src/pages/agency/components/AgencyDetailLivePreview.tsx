import React from "react";
import { FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { Eye, Globe, Phone, MapPin } from "lucide-react";
import { getLogoIcon } from "@/pages/agency/logoIcons";

interface AgencyDetailLivePreviewProps {
  effectiveBannerUrl?: string | null;
  effectiveLogoUrl?: string | null;
  name: string;
  tagline: string;
  category: string;
  companySize: string;
  foundedYear: string;
  logoIcon?: string;
  description: string;
  website: string;
  phone: string;
  location: string;
  facebookUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
}

export const AgencyDetailLivePreview: React.FC<AgencyDetailLivePreviewProps> = ({
  effectiveBannerUrl,
  effectiveLogoUrl,
  name,
  tagline,
  category,
  companySize,
  foundedYear,
  logoIcon,
  description,
  website,
  phone,
  location,
  facebookUrl,
  linkedinUrl,
  instagramUrl,
}) => {
  const { t } = useTranslation();
  const CurrentLogoIcon = getLogoIcon(logoIcon);

  return (
    <div className="border-border bg-card rounded-xl border p-4 lg:sticky lg:top-6 lg:col-span-5 max-h-[calc(100vh-5rem)] overflow-y-auto space-y-3 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
          <Eye className="text-brand-orange size-3.5" />
          {t("agency.create.previewTitle", "Xem trước hiển thị")}
        </span>
        <span className="bg-brand-orange/10 text-brand-orange rounded-full px-2.5 py-0.5 text-[11px] font-medium">
          {t("agency.create.previewBadge", "Live Preview")}
        </span>
      </div>

      {/* Inner Preview Card */}
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        {/* Cover Banner */}
        <div className="bg-muted/30 relative h-24 sm:h-28 w-full overflow-hidden">
          {effectiveBannerUrl ? (
            <img
              src={effectiveBannerUrl}
              alt={name || "Agency Banner"}
              className="size-full object-cover"
            />
          ) : (
            <div className="via-brand-orange/5 text-muted-foreground text-3xs flex size-full items-center justify-center bg-gradient-to-r from-orange-500/10 to-amber-500/10">
              {t("agency.detail.bannerEmptyLabel", "Chưa có ảnh bìa")}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-3.5 pt-0 space-y-3">
          {/* Avatar Logo + Title + Tagline */}
          <div className="flex items-start gap-3">
            <div className="relative z-10 -mt-7 shrink-0">
              <div className="border-card bg-background flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 shadow-xs">
                {effectiveLogoUrl ? (
                  <img
                    src={effectiveLogoUrl}
                    alt={name || "Agency Logo"}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="bg-brand-orange-soft text-brand-orange flex size-full items-center justify-center">
                    <CurrentLogoIcon className="size-7" />
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-0.5 pt-1">
              <h3 className="text-foreground truncate text-sm sm:text-base font-bold">
                {name.trim() || t("agency.create.previewNameFallback", "Tên Agency")}
              </h3>
              <p className="text-muted-foreground truncate text-xs">
                {tagline.trim() ||
                  t(
                    "agency.create.previewSubtitleFallback",
                    "Khẩu hiệu / Giới thiệu ngắn"
                  )}
              </p>
            </div>
          </div>

          {/* Badges */}
          {(category || companySize || foundedYear) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {category && (
                <span className="bg-brand-orange/10 text-brand-orange text-3xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-medium">
                  {t(`agency.category.${category}`)}
                </span>
              )}
              {companySize && (
                <span className="bg-muted text-muted-foreground text-3xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-medium">
                  {t(`agency.companySize.${companySize}`)}
                </span>
              )}
              {foundedYear && (
                <span className="bg-muted text-muted-foreground text-3xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-medium">
                  {t("agency.list.foundedIn", { year: foundedYear })}
                </span>
              )}
            </div>
          )}

          {/* Description preview */}
          <div className="border-border border-t pt-2.5">
            <h4 className="text-muted-foreground mb-1 text-[10px] font-semibold tracking-wider uppercase">
              {t("agency.create.previewAbout", "Giới thiệu")}
            </h4>
            {description.trim() ? (
              <div
                className="prose prose-sm dark:prose-invert text-foreground/80 line-clamp-3 text-xs leading-relaxed max-w-none"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="text-muted-foreground/60 text-3xs italic">
                {t("agency.create.emptyDescription", "Chưa có mô tả công ty")}
              </p>
            )}
          </div>

          {/* Contact info preview */}
          {(website || phone || location) && (
            <div className="border-border border-t pt-2.5 space-y-1.5">
              <h4 className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                {t("agency.create.previewContact", "Thông tin liên hệ")}
              </h4>
              <div className="space-y-1 text-xs">
                {website && (
                  <div className="flex items-center gap-2 truncate">
                    <Globe className="text-brand-orange size-3 shrink-0" />
                    <span className="text-foreground/80 truncate text-xs">
                      {website}
                    </span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="text-brand-orange size-3 shrink-0" />
                    <span className="text-foreground/80 text-xs">{phone}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="text-brand-orange size-3 shrink-0" />
                    <span className="text-foreground/80 truncate text-xs">
                      {location}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social badges preview */}
          {(facebookUrl || linkedinUrl || instagramUrl) && (
            <div className="border-border border-t pt-2.5 space-y-1.5">
              <h4 className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                {t("agency.create.previewSocial", "Mạng xã hội")}
              </h4>
              <div className="flex flex-wrap items-center gap-1.5">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
