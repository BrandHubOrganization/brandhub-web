import type React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlatformToggle } from "../PlatformToggle";
import { FrequencyToggle } from "../FrequencyToggle";
import { TimezoneSelect } from "../TimezoneSelect";
import { WorkspacePreviewCard } from "../WorkspacePreviewCard";
import {
  COMPANY_SIZES,
  WORKSPACE_INDUSTRIES,
} from "@/pages/workspace/constants";
import type { CompanySize, ReportFrequency, WorkspaceIndustry } from "@/types/workspace";

interface WorkspaceEditSectionProps {
  name: string;
  setName: (val: string) => void;
  timezone: string;
  setTimezone: (val: string) => void;
  defaultPlatforms: string[];
  toggleWorkspacePlatform: (platform: string) => void;
  reportFrequency: ReportFrequency | null;
  toggleReportFrequency: (freq: ReportFrequency) => void;
  industry: WorkspaceIndustry | "";
  setIndustry: (val: WorkspaceIndustry | "") => void;
  companySize: CompanySize | "";
  setCompanySize: (val: CompanySize | "") => void;
  website: string;
  setWebsite: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  // Preview
  logoUrl?: string | null;
  bannerUrl?: string | null;
  brandColor?: string | null;
}

export function WorkspaceEditSection({
  name,
  setName,
  timezone,
  setTimezone,
  defaultPlatforms,
  toggleWorkspacePlatform,
  reportFrequency,
  toggleReportFrequency,
  industry,
  setIndustry,
  companySize,
  setCompanySize,
  website,
  setWebsite,
  phone,
  setPhone,
  location,
  setLocation,
  saving,
  onSubmit,
  onCancel,
  logoUrl,
  bannerUrl,
  brandColor,
}: WorkspaceEditSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <form onSubmit={onSubmit} className="flex flex-col gap-4 lg:col-span-2">
        <Input
          label={t("workspace.settings.nameLabel")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TimezoneSelect value={timezone} onChange={setTimezone} />
        <PlatformToggle
          value={defaultPlatforms}
          onToggle={toggleWorkspacePlatform}
        />
        <FrequencyToggle
          value={reportFrequency}
          onToggle={toggleReportFrequency}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold tracking-wide">
              {t("workspace.create.industryLabel")}
            </Label>
            <Select
              value={industry}
              onChange={(e) =>
                setIndustry(e.target.value as WorkspaceIndustry | "")
              }
            >
              <option value="">
                {t("workspace.create.industryPlaceholder")}
              </option>
              {WORKSPACE_INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {t(`workspace.industry.${i}`)}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold tracking-wide">
              {t("workspace.create.companySizeLabel")}
            </Label>
            <Select
              value={companySize}
              onChange={(e) =>
                setCompanySize(e.target.value as CompanySize | "")
              }
            >
              <option value="">
                {t("workspace.create.companySizePlaceholder")}
              </option>
              {COMPANY_SIZES.map((s) => (
                <option key={s} value={s}>
                  {t(`agency.companySize.${s}`)}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <Input
          label={t("workspace.create.websiteLabel")}
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={t("workspace.create.phoneLabel")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label={t("workspace.create.locationLabel")}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onCancel}
          >
            {t("workspace.settings.cancelButton")}
          </Button>
          <Button
            type="submit"
            variant="orange"
            loading={saving}
            className="font-semibold"
          >
            {t("workspace.settings.save")}
          </Button>
        </div>
      </form>

      <div className="border-border bg-card rounded-xl border p-5 lg:sticky lg:top-6">
        <h3 className="text-foreground text-sm font-semibold">
          {t("workspace.settings.preview.title")}
        </h3>
        <p className="text-muted-foreground mb-4 text-xs">
          {t("workspace.settings.preview.hint")}
        </p>
        <WorkspacePreviewCard
          name={name}
          timezone={timezone}
          logoUrl={logoUrl}
          bannerUrl={bannerUrl}
          brandColor={brandColor}
          industry={industry || null}
          companySize={companySize || null}
          website={website}
          phone={phone}
          location={location}
          defaultPlatforms={defaultPlatforms}
        />
      </div>
    </div>
  );
}
