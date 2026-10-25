import { useTranslation } from "react-i18next";
import { Globe, MapPin, Phone, Users } from "lucide-react";
import type { CompanySize, ReportFrequency, WorkspaceIndustry } from "@/types/workspace";

interface WorkspaceInfoViewProps {
  website?: string;
  phone?: string;
  location?: string;
  companySize?: CompanySize | "";
  industry?: WorkspaceIndustry | "";
  timezone: string;
  defaultPlatforms: string[];
  reportFrequency?: ReportFrequency | null;
}

export function WorkspaceInfoView({
  website,
  phone,
  location,
  companySize,
  industry,
  timezone,
  defaultPlatforms,
  reportFrequency,
}: WorkspaceInfoViewProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-sm">
          <Globe className="text-muted-foreground size-4 shrink-0" />
          <span className="truncate">{website || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="text-muted-foreground size-4 shrink-0" />
          <span>{phone || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="text-muted-foreground size-4 shrink-0" />
          <span>{location || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="text-muted-foreground size-4 shrink-0" />
          <span>
            {companySize ? t(`agency.companySize.${companySize}`) : "—"}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">
            {t("workspace.create.industryLabel")}:{" "}
          </span>
          {industry ? t(`workspace.industry.${industry}`) : "—"}
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">
            {t("workspace.settings.timezoneLabel")}:{" "}
          </span>
          {timezone}
        </div>
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
    </>
  );
}
