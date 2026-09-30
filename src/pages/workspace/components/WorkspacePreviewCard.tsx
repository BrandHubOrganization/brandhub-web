import { useTranslation } from "react-i18next";
import { Building2, Globe, MapPin, Phone, Tag, Users } from "lucide-react";
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
    <div className="flex items-start gap-2">
      <Icon className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-muted-foreground text-2xs">{label}</p>
        <p className="text-foreground truncate text-xs">{value}</p>
      </div>
    </div>
  );
}

interface Props {
  name: string;
  timezone?: string | null;
  logoUrl?: string | null;
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
  industry,
  companySize,
  website,
  phone,
  location,
  defaultPlatforms,
}: Props) {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex items-center gap-3">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            className="border-border size-14 shrink-0 rounded-full border object-cover"
          />
        ) : (
          <div className="bg-brand-orange-soft text-brand-orange flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-bold">
            {name ? (
              name.charAt(0).toUpperCase()
            ) : (
              <Building2 className="size-6" />
            )}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm font-semibold">
            {name || t("workspace.settings.preview.emptyName")}
          </p>
          {timezone ? (
            <p className="text-muted-foreground truncate text-xs">{timezone}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-4 space-y-3">
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
      {defaultPlatforms && defaultPlatforms.length > 0 && (
        <div className="border-border mt-4 flex flex-wrap gap-1.5 border-t pt-4">
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
  );
}

export default WorkspacePreviewCard;
