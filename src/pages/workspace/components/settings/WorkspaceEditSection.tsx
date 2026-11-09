import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa6";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RichTextInput } from "@/components/ui/rich-text-input";
import { CharacterCounter } from "@/components/ui/character-counter";
import { cn } from "@/lib/utils";
import { LOGO_ICON_OPTIONS } from "@/pages/agency/logoIcons";
import { PlatformToggle } from "../PlatformToggle";
import { FrequencyToggle } from "../FrequencyToggle";
import { TimezoneSelect } from "../TimezoneSelect";
import {
  COMPANY_SIZES,
  WORKSPACE_INDUSTRIES,
} from "@/pages/workspace/constants";
import type {
  CompanySize,
  ReportFrequency,
  WorkspaceIndustry,
} from "@/types/workspace";

const CURRENT_YEAR = new Date().getFullYear();

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
  description?: string;
  setDescription?: (val: string) => void;
  tagline?: string;
  setTagline?: (val: string) => void;
  foundedYear?: string;
  setFoundedYear?: (val: string) => void;
  brandColor?: string | null;
  setBrandColor?: (val: string | null) => void;
  logoIcon?: string;
  setLogoIcon?: (val: string) => void;
  facebookUrl?: string;
  setFacebookUrl?: (val: string) => void;
  linkedinUrl?: string;
  setLinkedinUrl?: (val: string) => void;
  instagramUrl?: string;
  setInstagramUrl?: (val: string) => void;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  // Optional legacy props
  logoUrl?: string | null;
  bannerUrl?: string | null;
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
  description = "",
  setDescription,
  tagline = "",
  setTagline,
  foundedYear = "",
  setFoundedYear,
  brandColor,
  setBrandColor,
  logoIcon = "",
  setLogoIcon,
  facebookUrl = "",
  setFacebookUrl,
  linkedinUrl = "",
  setLinkedinUrl,
  instagramUrl = "",
  setInstagramUrl,
  saving,
  onSubmit,
  onCancel,
}: WorkspaceEditSectionProps) {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 border-t pt-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={t("workspace.settings.nameLabel")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {setTagline && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold tracking-wide">
                {t("workspace.create.taglineLabel")}
              </Label>
              <CharacterCounter current={tagline.length} max={140} />
            </div>
            <Input
              placeholder={t("workspace.create.taglinePlaceholder")}
              maxLength={140}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>
        )}
      </div>

      {setDescription && (
        <RichTextInput
          label={t("workspace.create.descriptionLabel")}
          value={description}
          onChange={setDescription}
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TimezoneSelect value={timezone} onChange={setTimezone} />
        {setFoundedYear && (
          <Input
            label={t("workspace.create.foundedYearLabel")}
            type="number"
            inputMode="numeric"
            min={1800}
            max={CURRENT_YEAR}
            placeholder="2020"
            value={foundedYear}
            onChange={(e) => setFoundedYear(e.target.value)}
          />
        )}
      </div>

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
            onChange={(e) => setCompanySize(e.target.value as CompanySize | "")}
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

      {(setBrandColor || setLogoIcon) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {setBrandColor && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold tracking-wide">
                {t("workspace.create.brandColorLabel")}
              </Label>
              <input
                type="color"
                value={brandColor || "#f05a28"}
                onChange={(e) => setBrandColor(e.target.value)}
                className="border-input h-9 w-full cursor-pointer rounded-md border"
              />
            </div>
          )}
          {setLogoIcon && (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold tracking-wide">
                {t("workspace.create.logoIconLabel")}
              </Label>
              <div className="flex flex-wrap gap-2">
                {LOGO_ICON_OPTIONS.map(({ name: iconName, Icon }) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() =>
                      setLogoIcon(logoIcon === iconName ? "" : iconName)
                    }
                    className={cn(
                      "flex size-10 cursor-pointer items-center justify-center rounded-lg border transition-colors",
                      logoIcon === iconName
                        ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="size-5" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {(setFacebookUrl || setLinkedinUrl || setInstagramUrl) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {setFacebookUrl && (
            <Input
              label={t("workspace.create.facebookUrlLabel")}
              iconPrefix={<FaFacebook aria-hidden="true" />}
              inputMode="url"
              placeholder="https://facebook.com/..."
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
            />
          )}
          {setLinkedinUrl && (
            <Input
              label={t("workspace.create.linkedinUrlLabel")}
              iconPrefix={<FaLinkedin aria-hidden="true" />}
              inputMode="url"
              placeholder="https://linkedin.com/..."
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
          )}
          {setInstagramUrl && (
            <Input
              label={t("workspace.create.instagramUrlLabel")}
              iconPrefix={<FaInstagram aria-hidden="true" />}
              inputMode="url"
              placeholder="https://instagram.com/..."
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
            />
          )}
        </div>
      )}

      <div className="flex gap-2 pt-2">
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
  );
}
