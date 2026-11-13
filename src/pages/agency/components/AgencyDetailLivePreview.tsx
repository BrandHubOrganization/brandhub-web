import React from "react";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import { AgencyProfileCard } from "./AgencyProfileCard";

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

export const AgencyDetailLivePreview: React.FC<
  AgencyDetailLivePreviewProps
> = ({
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

  return (
    <div className="border-border bg-card max-h-[calc(100vh-5rem)] space-y-3 overflow-y-auto rounded-xl border p-4 shadow-xs lg:sticky lg:top-6 lg:col-span-5">
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

      <AgencyProfileCard
        compact
        profile={{
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
          bannerUrl: effectiveBannerUrl,
          logoUrl: effectiveLogoUrl,
        }}
      />
    </div>
  );
};
