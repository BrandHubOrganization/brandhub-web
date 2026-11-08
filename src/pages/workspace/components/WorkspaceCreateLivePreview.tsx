import { WorkspaceSocialLinks } from "@/pages/workspace/components/WorkspaceSocialLinks";
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

  // Filter non-empty industry fields
  const activeIndustryEntries = industryFields
    ? Object.entries(industryFields).filter(
        ([, val]) =>
          val !== undefined && val !== null && String(val).trim() !== "",
      )
    : [];

  return (
    <div className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-4 lg:col-span-5 lg:max-h-[calc(100dvh-7rem)] xl:col-span-5">
      {/* Top Preview Title Bar */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-1">
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
          <Eye className="text-brand-orange size-3.5" />
          {t("workspace.createPreview.title", "Xem trước không gian làm việc")}
        </span>
        <span className="bg-brand-orange-soft text-brand-orange text-2xs rounded-full px-2.5 py-0.5 font-semibold">
          {t("workspace.createPreview.badge", "Cập nhật trực tiếp")}
        </span>
      </div>

      {/* Main Preview Card */}
      <div
        role="region"
        aria-label={t(
          "workspace.createPreview.title",
          "Xem trước không gian làm việc",
        )}
        tabIndex={0}
        className="border-border bg-card min-h-0 rounded-2xl border shadow-xs lg:overflow-y-auto lg:overscroll-contain"
      >
        {/* 1. Cover Banner with dynamic brand color gradient */}
        <div
          className="relative h-24 w-full rounded-t-2xl transition-colors duration-300 lg:h-20"
          style={{
            background: brandColor
              ? `linear-gradient(135deg, ${brandColor}40 0%, ${brandColor}15 60%, hsl(var(--card)) 100%)`
              : "linear-gradient(135deg, hsl(var(--brand-orange)/0.25) 0%, hsl(var(--card)) 100%)",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(#00000010_1px,transparent_1px)] [background-size:12px_12px] opacity-40 dark:bg-[radial-gradient(#ffffff10_1px,transparent_1px)]" />
          {appliedTemplateName && (
            <div className="absolute top-3 right-3">
              <Badge
                variant="outline"
                className="bg-background/80 text-foreground text-3xs border-border/80 font-medium backdrop-blur-xs"
              >
                <Sparkles className="text-brand-orange mr-1 size-2.5" />
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
              className="border-card bg-card flex size-18 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 shadow-md transition-colors duration-300"
              style={{
                backgroundColor: brandColor || "#f05a28",
                color: "#ffffff",
              }}
            >
              {React.createElement(getLogoIcon(logoIcon), {
                className: "size-8 transition-transform",
              })}
            </div>

            {/* Quick stats tags */}
            <div className="flex flex-wrap items-center gap-1.5 pb-1">
              {assignMembers.length > 0 && (
                <span className="bg-muted text-muted-foreground text-3xs flex items-center gap-1 rounded-md px-2 py-0.5 font-medium">
                  <UserCheck className="text-brand-orange size-3" />
                  {assignMembers.length}{" "}
                  {t("workspace.createPreview.members", "thành viên")}
                </span>
              )}
              {clientEmails.length > 0 && (
                <span className="bg-muted text-muted-foreground text-3xs flex items-center gap-1 rounded-md px-2 py-0.5 font-medium">
                  <Mail className="text-brand-orange size-3" />
                  {clientEmails.length}{" "}
                  {t("workspace.createPreview.clients", "khách hàng")}
                </span>
              )}
            </div>
          </div>

          {/* Name & Tagline */}
          <div className="space-y-1">
            <h3 className="text-foreground text-base leading-tight font-bold break-words sm:text-lg">
              {name.trim() ||
                t(
                  "workspace.createPreview.nameFallback",
                  "Không gian làm việc mới",
                )}
            </h3>
            <p className="text-muted-foreground text-xs italic">
              {tagline.trim() ||
                t(
                  "workspace.createPreview.taglineFallback",
                  "Slogan / Khẩu hiệu thương hiệu",
                )}
            </p>
          </div>

          {/* Metadata Badges */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {industry && (
              <span className="bg-brand-orange-soft text-brand-orange text-2xs inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold">
                <Building2 className="size-3" />
                {t(`workspace.industry.${industry}`, {
                  defaultValue: industry,
                })}
              </span>
            )}
            {companySize && (
              <span className="bg-muted text-muted-foreground text-2xs inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium">
                <Users className="size-3" />
                {t(`agency.companySize.${companySize}`, {
                  defaultValue: companySize,
                })}
              </span>
            )}
            {foundedYear && (
              <span className="bg-muted text-muted-foreground text-2xs inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium">
                <Calendar className="size-3" />
                {foundedYear}
              </span>
            )}
          </div>

          {/* Description Section */}
          <div className="border-border mt-4 border-t pt-3.5">
            <h4 className="text-muted-foreground text-3xs mb-1.5 font-bold tracking-wider uppercase">
              {t("workspace.createPreview.about", "Giới thiệu")}
            </h4>
            {description.trim() ? (
              <div
                className="prose prose-sm dark:prose-invert text-foreground/85 line-clamp-4 max-w-none text-xs leading-relaxed"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="text-muted-foreground/60 text-xs italic">
                {t(
                  "workspace.createPreview.emptyDescription",
                  "Chưa có mô tả chi tiết.",
                )}
              </p>
            )}
          </div>

          {/* Contact Details Section */}
          {(website.trim() || phone.trim() || location.trim()) && (
            <div className="border-border mt-3.5 space-y-2 border-t pt-3">
              <h4 className="text-muted-foreground text-3xs font-bold tracking-wider uppercase">
                {t("workspace.createPreview.contact", "Thông tin liên hệ")}
              </h4>
              <div className="text-muted-foreground space-y-1.5 text-xs">
                {website.trim() && (
                  <div className="flex items-center gap-2 truncate">
                    <Globe className="text-brand-orange size-3.5 shrink-0" />
                    <span className="text-foreground/85 truncate">
                      {website}
                    </span>
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
          {(facebookUrl.trim() ||
            linkedinUrl.trim() ||
            instagramUrl.trim()) && (
            <div className="border-border mt-3.5 border-t pt-3">
              <h4 className="text-muted-foreground text-3xs mb-2 font-bold tracking-wider uppercase">
                {t("workspace.createPreview.social", "Mạng xã hội")}
              </h4>
              <WorkspaceSocialLinks
                facebookUrl={facebookUrl}
                linkedinUrl={linkedinUrl}
                instagramUrl={instagramUrl}
              />
            </div>
          )}

          {/* Industry Specific Fields Preview */}
          {activeIndustryEntries.length > 0 && (
            <div className="border-border mt-3.5 border-t pt-3">
              <h4 className="text-muted-foreground text-3xs mb-2 font-bold tracking-wider uppercase">
                {t(
                  "workspace.createPreview.industrySpecific",
                  "Thông tin đặc thù",
                )}
              </h4>
              <div className="text-2xs grid grid-cols-2 gap-2">
                {activeIndustryEntries.map(([key, val]) => (
                  <div
                    key={key}
                    className="bg-muted/40 border-border/50 rounded-lg border p-2"
                  >
                    <span className="text-muted-foreground text-3xs block truncate capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="text-foreground mt-0.5 block truncate font-medium">
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
