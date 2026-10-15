import React from "react";
import { useTranslation } from "react-i18next";
import {
  Eye,
  Globe,
  Phone,
  MapPin,
  Building2,
  Users,
  Calendar,
  Sparkles,
  Mail,
  UserCheck,
} from "lucide-react";
import { getLogoIcon } from "@/pages/agency/logoIcons";
import { Badge } from "@/components/ui/badge";
import type { AssignEntry } from "@/services/workspaceService";

interface WorkspaceCreateLivePreviewProps {
  name: string;
  tagline: string;
  description: string;
  brandColor: string;
  logoIcon: string;
  foundedYear: string;
  industry: string;
  companySize: string;
  website: string;
  phone: string;
  location: string;
  facebookUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  industryFields?: Record<string, unknown>;
  assignMembers?: AssignEntry[];
  clientEmails?: string[];
  appliedTemplateName?: string | null;
}

export const WorkspaceCreateLivePreview: React.FC<
  WorkspaceCreateLivePreviewProps
> = ({
  name,
  tagline,
  description,
  brandColor = "#f05a28",
  logoIcon,
  foundedYear,
  industry,
  companySize,
  website,
  phone,
  location,
  facebookUrl,
  linkedinUrl,
  instagramUrl,
  industryFields,
  assignMembers = [],
  clientEmails = [],
  appliedTemplateName,
}) => {
  const { t } = useTranslation();
  const IconComponent = getLogoIcon(logoIcon);

  // Filter non-empty industry fields
  const activeIndustryEntries = industryFields
    ? Object.entries(industryFields).filter(
        ([, val]) => val !== undefined && val !== null && String(val).trim() !== "",
      )
    : [];

  return (
    <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-6 space-y-3">
      {/* Top Preview Title Bar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
          <Eye className="text-brand-orange size-3.5" />
          {t("workspace.createPreview.title", "Xem trước không gian làm việc")}
        </span>
        <span className="bg-brand-orange-soft text-brand-orange rounded-full px-2.5 py-0.5 text-2xs font-semibold">
          {t("workspace.createPreview.badge", "Cập nhật trực tiếp")}
        </span>
      </div>

      {/* Main Preview Card */}
      <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-xs transition-all">
        {/* 1. Cover Banner with dynamic brand color gradient */}
        <div
          className="relative h-28 sm:h-32 w-full transition-colors duration-300"
          style={{
            background: brandColor
              ? `linear-gradient(135deg, ${brandColor}40 0%, ${brandColor}15 60%, hsl(var(--card)) 100%)`
              : "linear-gradient(135deg, hsl(var(--brand-orange)/0.25) 0%, hsl(var(--card)) 100%)",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(#00000010_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
          {appliedTemplateName && (
            <div className="absolute top-3 right-3">
              <Badge
                variant="outline"
                className="bg-background/80 text-foreground backdrop-blur-xs text-3xs font-medium border-border/80"
              >
                <Sparkles className="mr-1 size-2.5 text-brand-orange" />
                {appliedTemplateName}
              </Badge>
            </div>
          )}
        </div>

        {/* 2. Header Content Area */}
        <div className="px-5 pb-5">
          {/* Overlapping Logo / Icon */}
          <div className="relative -mt-10 mb-3 flex items-end justify-between">
            <div
              className="size-18 shrink-0 overflow-hidden rounded-2xl border-4 border-card bg-card shadow-md flex items-center justify-center transition-colors duration-300"
              style={{
                backgroundColor: brandColor || "#f05a28",
                color: "#ffffff",
              }}
            >
              <IconComponent className="size-8 transition-transform" />
            </div>

            {/* Quick stats tags */}
            <div className="flex flex-wrap items-center gap-1.5 pb-1">
              {assignMembers.length > 0 && (
                <span className="bg-muted text-muted-foreground flex items-center gap-1 rounded-md px-2 py-0.5 text-3xs font-medium">
                  <UserCheck className="size-3 text-brand-orange" />
                  {assignMembers.length} {t("workspace.createPreview.members", "thành viên")}
                </span>
              )}
              {clientEmails.length > 0 && (
                <span className="bg-muted text-muted-foreground flex items-center gap-1 rounded-md px-2 py-0.5 text-3xs font-medium">
                  <Mail className="size-3 text-brand-orange" />
                  {clientEmails.length} {t("workspace.createPreview.clients", "khách hàng")}
                </span>
              )}
            </div>
          </div>

          {/* Name & Tagline */}
          <div className="space-y-1">
            <h3 className="text-foreground text-base sm:text-lg font-bold leading-tight break-words">
              {name.trim() || t("workspace.createPreview.nameFallback", "Không gian làm việc mới")}
            </h3>
            <p className="text-muted-foreground text-xs italic">
              {tagline.trim() || t("workspace.createPreview.taglineFallback", "Slogan / Khẩu hiệu thương hiệu")}
            </p>
          </div>

          {/* Metadata Badges */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {industry && (
              <span className="bg-brand-orange-soft text-brand-orange inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-2xs font-semibold">
                <Building2 className="size-3" />
                {t(`workspace.industry.${industry}`, { defaultValue: industry })}
              </span>
            )}
            {companySize && (
              <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-2xs font-medium">
                <Users className="size-3" />
                {t(`agency.companySize.${companySize}`, { defaultValue: companySize })}
              </span>
            )}
            {foundedYear && (
              <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-2xs font-medium">
                <Calendar className="size-3" />
                {foundedYear}
              </span>
            )}
          </div>

          {/* Description Section */}
          <div className="mt-4 border-t border-border pt-3.5">
            <h4 className="text-muted-foreground text-3xs font-bold uppercase tracking-wider mb-1.5">
              {t("workspace.createPreview.about", "Giới thiệu")}
            </h4>
            {description.trim() ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-xs text-foreground/85 line-clamp-4 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="text-muted-foreground/60 text-xs italic">
                {t("workspace.createPreview.emptyDescription", "Chưa có mô tả chi tiết.")}
              </p>
            )}
          </div>

          {/* Contact Details Section */}
          {(website.trim() || phone.trim() || location.trim()) && (
            <div className="mt-3.5 border-t border-border pt-3 space-y-2">
              <h4 className="text-muted-foreground text-3xs font-bold uppercase tracking-wider">
                {t("workspace.createPreview.contact", "Thông tin liên hệ")}
              </h4>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {website.trim() && (
                  <div className="flex items-center gap-2 truncate">
                    <Globe className="text-brand-orange size-3.5 shrink-0" />
                    <span className="text-foreground/85 truncate">{website}</span>
                  </div>
                )}
                {phone.trim() && (
                  <div className="flex items-center gap-2">
                    <Phone className="text-brand-orange size-3.5 shrink-0" />
                    <span className="text-foreground/85">{phone}</span>
                  </div>
                )}
                {location.trim() && (
                  <div className="flex items-center gap-2">
                    <MapPin className="text-brand-orange size-3.5 shrink-0" />
                    <span className="text-foreground/85">{location}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Links Badges */}
          {(facebookUrl.trim() || linkedinUrl.trim() || instagramUrl.trim()) && (
            <div className="mt-3.5 border-t border-border pt-3">
              <h4 className="text-muted-foreground text-3xs font-bold uppercase tracking-wider mb-2">
                {t("workspace.createPreview.social", "Mạng xã hội")}
              </h4>
              <div className="flex flex-wrap items-center gap-1.5">
                {facebookUrl.trim() && (
                  <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md px-2 py-0.5 text-3xs font-semibold">
                    Facebook
                  </span>
                )}
                {linkedinUrl.trim() && (
                  <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-md px-2 py-0.5 text-3xs font-semibold">
                    LinkedIn
                  </span>
                )}
                {instagramUrl.trim() && (
                  <span className="bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-md px-2 py-0.5 text-3xs font-semibold">
                    Instagram
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Industry Specific Fields Preview */}
          {activeIndustryEntries.length > 0 && (
            <div className="mt-3.5 border-t border-border pt-3">
              <h4 className="text-muted-foreground text-3xs font-bold uppercase tracking-wider mb-2">
                {t("workspace.createPreview.industrySpecific", "Thông tin đặc thù")}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-2xs">
                {activeIndustryEntries.map(([key, val]) => (
                  <div key={key} className="bg-muted/40 rounded-lg p-2 border border-border/50">
                    <span className="text-muted-foreground block text-3xs capitalize truncate">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="text-foreground font-medium truncate block mt-0.5">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCreateLivePreview;
