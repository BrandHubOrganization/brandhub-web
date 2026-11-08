import { useTranslation } from "react-i18next";
import { FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa6";
import {
  Calendar,
  Globe,
  Mail,
  MapPin,
  Phone,
  Receipt,
  User,
  Wallet,
} from "lucide-react";
import { ProfileBannerHeader } from "@/components/shared/ProfileBannerHeader";
import { BANNER_PRESETS } from "@/pages/agency/bannerPresets";
import { ClientProfileLogo } from "./ClientProfileLogo";
import type { ClientProfileFormValues } from "./ClientProfileForm";

interface ClientProfilePreviewProps {
  values: ClientProfileFormValues | null;
}

/**
 * Standardized Live Profile Preview for ClientProfile.
 * Matches CreateAgencyPage's ProfileBannerHeader preview layout.
 */
export function ClientProfilePreview({ values }: ClientProfilePreviewProps) {
  const { t } = useTranslation();
  const v = values;
  const name = v?.displayName?.trim() ?? "";
  const brandColor = v?.brandColor || "#f05a28";

  // Use dynamic banner from form values, fallback to default preset
  const bannerUrl = v?.bannerUrl || BANNER_PRESETS[0]?.url || null;

  return (
    <ProfileBannerHeader
      bannerUrl={bannerUrl}
      bannerEmptyLabel={t("agency.detail.bannerEmptyLabel", "Chưa có ảnh bìa")}
      canEditBanner={false}
      canEditLogo={false}
      title={name || t("clientProfile.preview.emptyName", "Tên thương hiệu")}
      subtitle={
        v?.tagline?.trim() ||
        v?.company?.trim() ||
        t("clientProfile.preview.emptyTagline", "Chưa có tagline")
      }
      badges={
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {v?.industry && (
            <span className="bg-brand-orange/10 text-brand-orange inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
              {t(`workspace.industry.${v.industry}`)}
            </span>
          )}
          {v?.companySize && (
            <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
              {t(`agency.companySize.${v.companySize}`)}
            </span>
          )}
          {v?.foundedYear && (
            <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
              <Calendar className="mr-1 size-3" />
              {t("clientProfile.preview.foundedPrefix", "Thành lập")}{" "}
              {v.foundedYear}
            </span>
          )}
          {v?.budgetRange && (
            <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
              <Wallet className="mr-1 size-3" />
              {t(`clientProfile.budgetRange.${v.budgetRange}`)}
            </span>
          )}
        </div>
      }
      logo={
        <ClientProfileLogo
          logoUrl={v?.logoUrl}
          displayName={name}
          brandColor={brandColor}
          className="size-full"
          iconClassName="size-10 sm:size-12"
        />
      }
    >
      <div className="space-y-4 pt-2">
        {/* Description preview */}
        {v?.description?.trim() ? (
          <div className="border-border border-t pt-4">
            <h4 className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wider uppercase">
              {t("clientProfile.descriptionLabel", "Mô tả công ty")}
            </h4>
            <p className="text-foreground/85 line-clamp-4 text-xs leading-relaxed whitespace-pre-line">
              {v.description.trim()}
            </p>
          </div>
        ) : (
          <div className="border-border text-muted-foreground/60 border-t pt-3 text-center text-xs italic">
            {t(
              "clientProfile.preview.emptyDescription",
              "Chưa có mô tả thương hiệu",
            )}
          </div>
        )}

        {/* Contact info preview */}
        {(v?.website ||
          v?.phone ||
          v?.contactEmail ||
          v?.contactName ||
          v?.location ||
          v?.address ||
          v?.taxCode) && (
          <div className="border-border space-y-2 border-t pt-3">
            <h4 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
              {t("clientProfile.preview.contactTitle", "Thông tin liên hệ")}
            </h4>
            <div className="text-muted-foreground space-y-1.5 text-xs">
              {v?.website && (
                <div className="flex items-center gap-2 truncate">
                  <Globe className="text-brand-orange size-3.5 shrink-0" />
                  <span className="text-foreground/80 truncate">
                    {v.website}
                  </span>
                </div>
              )}
              {v?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="text-brand-orange size-3.5 shrink-0" />
                  <span className="text-foreground/80">{v.phone}</span>
                </div>
              )}
              {v?.contactEmail && (
                <div className="flex items-center gap-2 truncate">
                  <Mail className="text-brand-orange size-3.5 shrink-0" />
                  <span className="text-foreground/80 truncate">
                    {v.contactEmail}
                  </span>
                </div>
              )}
              {v?.contactName && (
                <div className="flex items-center gap-2">
                  <User className="text-brand-orange size-3.5 shrink-0" />
                  <span className="text-foreground/80">{v.contactName}</span>
                </div>
              )}
              {(v?.address || v?.location) && (
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="text-brand-orange size-3.5 shrink-0" />
                  <span className="text-foreground/80 truncate">
                    {v.address || v.location}
                  </span>
                </div>
              )}
              {v?.taxCode && (
                <div className="flex items-center gap-2">
                  <Receipt className="text-brand-orange size-3.5 shrink-0" />
                  <span className="text-foreground/80">
                    {t("clientProfile.taxCodeLabel", "Mã số thuế")}: {v.taxCode}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social badges preview */}
        {(v?.facebook || v?.linkedin || v?.instagram) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {v.facebook && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                <FaFacebook className="size-3" />
                Facebook
              </span>
            )}
            {v.linkedin && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-600 dark:text-sky-400">
                <FaLinkedin className="size-3" />
                LinkedIn
              </span>
            )}
            {v.instagram && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-pink-500/10 px-2 py-0.5 text-[10px] font-medium text-pink-600 dark:text-pink-400">
                <FaInstagram className="size-3" />
                Instagram
              </span>
            )}
          </div>
        )}

        {/* Internal note if available */}
        {v?.note?.trim() && (
          <div className="border-border border-t pt-3">
            <div className="bg-muted/40 rounded-lg p-2.5 text-xs">
              <span className="text-muted-foreground mb-0.5 block text-[10px] font-semibold tracking-wider uppercase">
                {t("clientProfile.noteLabel", "Ghi chú")}:
              </span>
              <span className="text-foreground/80 italic">{v.note.trim()}</span>
            </div>
          </div>
        )}
      </div>
    </ProfileBannerHeader>
  );
}

export default ClientProfilePreview;
