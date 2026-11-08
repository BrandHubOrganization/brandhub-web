import { useTranslation } from "react-i18next";
import { WorkspaceSocialLinks } from "@/pages/workspace/components/WorkspaceSocialLinks";
import {
  Building2,
  Calendar,
  Clock,
  Globe,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import type {
  CompanySize,
  ReportFrequency,
  WorkspaceIndustry,
} from "@/types/workspace";

interface WorkspaceInfoViewProps {
  description?: string;
  foundedYear?: string | number | null;
  website?: string;
  phone?: string;
  location?: string;
  companySize?: CompanySize | "";
  industry?: WorkspaceIndustry | "";
  timezone: string;
  defaultPlatforms: string[];
  reportFrequency?: ReportFrequency | null;
  facebookUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
}

export function WorkspaceInfoView({
  description,
  foundedYear,
  website,
  phone,
  location,
  companySize,
  industry,
  timezone,
  defaultPlatforms,
  reportFrequency,
  facebookUrl,
  linkedinUrl,
  instagramUrl,
}: WorkspaceInfoViewProps) {
  const { t } = useTranslation();
  const yearStr =
    foundedYear !== undefined && foundedYear !== null
      ? String(foundedYear).trim()
      : "";
  const hasSocials = Boolean(
    facebookUrl?.trim() || linkedinUrl?.trim() || instagramUrl?.trim(),
  );

  return (
    <>
      {description?.trim() && (
        <div
          className="prose prose-sm dark:prose-invert text-muted-foreground max-w-none border-t pt-4 text-sm"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}

      <div className="border-border grid grid-cols-1 gap-x-5 gap-y-4 border-t pt-4 sm:grid-cols-2">
        {[
          {
            Icon: Globe,
            label: t("workspace.create.websiteLabel"),
            value: website,
          },
          {
            Icon: Phone,
            label: t("workspace.create.phoneLabel"),
            value: phone,
          },
          {
            Icon: MapPin,
            label: t("workspace.create.locationLabel"),
            value: location,
          },
          {
            Icon: Users,
            label: t("workspace.create.companySizeLabel"),
            value: companySize ? t(`agency.companySize.${companySize}`) : "",
          },
          {
            Icon: Building2,
            label: t("workspace.create.industryLabel"),
            value: industry ? t(`workspace.industry.${industry}`) : "",
          },
          {
            Icon: Clock,
            label: t("workspace.settings.timezoneLabel"),
            value: timezone,
          },
          ...(yearStr
            ? [
                {
                  Icon: Calendar,
                  label: t("workspace.create.foundedYearLabel"),
                  value: yearStr,
                },
              ]
            : []),
        ].map(({ Icon, label, value }) => (
          <div key={label} className="flex min-w-0 items-start gap-2.5">
            <Icon
              className="text-brand-orange mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0 space-y-0.5">
              <p className="text-muted-foreground text-2xs">{label}</p>
              <p className="text-foreground text-xs font-medium break-words">
                {value || "—"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide">
          {t("workspace.settings.defaultPlatformsLabel")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {defaultPlatforms.length > 0
            ? defaultPlatforms.map((p) => (
                <span
                  key={p}
                  className="bg-muted text-muted-foreground text-2xs rounded-full px-2 py-0.5 font-medium capitalize"
                >
                  {p}
                </span>
              ))
            : "—"}
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide">
          {t("workspace.settings.reportFrequencyLabel")}
        </p>
        <span className="text-sm">
          {reportFrequency
            ? t(`workspace.reportFrequency.${reportFrequency}`)
            : "—"}
        </span>
      </div>

      {hasSocials && (
        <div className="border-border space-y-2 border-t pt-4">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide">
            {t("workspace.createPreview.social")}
          </p>
          <WorkspaceSocialLinks
            facebookUrl={facebookUrl}
            linkedinUrl={linkedinUrl}
            instagramUrl={instagramUrl}
          />
        </div>
      )}
    </>
  );
}
