import React from "react";
import { useTranslation } from "react-i18next";
import { Crop, History, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ProvinceSelect } from "@/components/ui/province-select";
import { RichTextInput } from "@/components/ui/rich-text-input";
import { AGENCY_CATEGORIES, COMPANY_SIZES } from "@/pages/agency/constants";
import { LOGO_ICON_OPTIONS, getLogoIcon } from "@/pages/agency/logoIcons";
import { cn } from "@/lib/utils";
import type { AgencyCategory, CompanySize } from "@/types/agency";

const CURRENT_YEAR = new Date().getFullYear();

export type AgencyDetailFieldErrors = Partial<
  Record<
    | "name"
    | "website"
    | "phone"
    | "facebookUrl"
    | "linkedinUrl"
    | "instagramUrl"
    | "foundedYear",
    string
  >
>;

interface AgencyDetailEditFormProps {
  name: string;
  setName: (v: string) => void;
  validateField: (field: keyof AgencyDetailFieldErrors, value: string) => void;
  errors: AgencyDetailFieldErrors;
  logoUrl: string;
  brandColor: string;
  setBrandColor: (v: string) => void;
  logoIcon: string;
  setLogoIcon: (v: string) => void;
  logoInputRef: React.RefObject<HTMLInputElement | null>;
  handleLogoFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingLogo: boolean;
  onOpenLogoCropper: () => void;
  onOpenLogoRecent: () => void;
  description: string;
  setDescription: (v: string) => void;
  tagline: string;
  setTagline: (v: string) => void;
  category: AgencyCategory | "";
  setCategory: (v: AgencyCategory | "") => void;
  companySize: CompanySize | "";
  setCompanySize: (v: CompanySize | "") => void;
  website: string;
  setWebsite: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  foundedYear: string;
  setFoundedYear: (v: string) => void;
  facebookUrl: string;
  setFacebookUrl: (v: string) => void;
  linkedinUrl: string;
  setLinkedinUrl: (v: string) => void;
  instagramUrl: string;
  setInstagramUrl: (v: string) => void;
  handleCancelEdit: () => void;
  handleSave: () => void;
  saving: boolean;
  hasErrors: boolean;
}

export const AgencyDetailEditForm: React.FC<AgencyDetailEditFormProps> = ({
  name,
  setName,
  validateField,
  errors,
  logoUrl,
  brandColor,
  setBrandColor,
  logoIcon,
  setLogoIcon,
  logoInputRef,
  handleLogoFileChange,
  uploadingLogo,
  onOpenLogoCropper,
  onOpenLogoRecent,
  description,
  setDescription,
  tagline,
  setTagline,
  category,
  setCategory,
  companySize,
  setCompanySize,
  website,
  setWebsite,
  phone,
  setPhone,
  location,
  setLocation,
  foundedYear,
  setFoundedYear,
  facebookUrl,
  setFacebookUrl,
  linkedinUrl,
  setLinkedinUrl,
  instagramUrl,
  setInstagramUrl,
  handleCancelEdit,
  handleSave,
  saving,
  hasErrors,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Input
        label={t("agency.create.nameLabel")}
        placeholder={t("agency.create.namePlaceholder")}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          validateField("name", e.target.value);
        }}
        error={errors.name}
        required
      />

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold tracking-wide">
          {t("agency.detail.logoLabel")}
        </Label>
        <div className="flex items-center gap-3">
          <div
            className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg"
            style={{
              background: logoUrl ? undefined : `${brandColor}1a`,
            }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="" className="size-full object-cover" />
            ) : (
              (() => {
                const Icon = getLogoIcon(logoIcon);
                return (
                  <Icon className="size-6" style={{ color: brandColor }} />
                );
              })()
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleLogoFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={uploadingLogo}
              className="cursor-pointer gap-1.5"
              onClick={() => logoInputRef.current?.click()}
            >
              <Upload className="size-3.5" />
              {t("agency.detail.uploadLogoButton")}
            </Button>
            {logoUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1.5 text-xs text-brand-orange border-brand-orange/30 hover:bg-brand-orange/10"
                onClick={onOpenLogoCropper}
              >
                <Crop className="size-3.5" />
                Cắt / Đổ màu
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={onOpenLogoRecent}
            >
              <History className="size-3.5" />
              Logo cũ
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground text-2xs">
          {t("agency.detail.logoPostSaveHint")}
        </p>
      </div>

      <RichTextInput
        label={t("agency.create.descriptionLabel")}
        placeholder={t("agency.create.descriptionPlaceholder")}
        value={description}
        onChange={setDescription}
      />
      <Input
        label={t("agency.create.taglineLabel")}
        placeholder={t("agency.create.taglinePlaceholder")}
        maxLength={140}
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold tracking-wide">
            {t("agency.create.categoryLabel")}
          </Label>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as AgencyCategory | "")}
          >
            <option value="">{t("agency.create.categoryPlaceholder")}</option>
            {AGENCY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`agency.category.${c}`)}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold tracking-wide">
            {t("agency.create.companySizeLabel")}
          </Label>
          <Select
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value as CompanySize | "")}
          >
            <option value="">{t("agency.create.companySizePlaceholder")}</option>
            {COMPANY_SIZES.map((s) => (
              <option key={s} value={s}>
                {t(`agency.companySize.${s}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <Input
        label={t("agency.create.websiteLabel")}
        placeholder={t("agency.create.websitePlaceholder")}
        value={website}
        onChange={(e) => {
          setWebsite(e.target.value);
          validateField("website", e.target.value);
        }}
        error={errors.website}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={t("agency.create.phoneLabel")}
          placeholder={t("agency.create.phonePlaceholder")}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            validateField("phone", e.target.value);
          }}
          error={errors.phone}
        />
        <ProvinceSelect
          label={t("agency.create.locationLabel")}
          value={location}
          onChange={setLocation}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-semibold tracking-wide">
            {t("agency.create.brandColorLabel")}
          </Label>
          <input
            type="color"
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)}
            className="border-input h-9 w-full cursor-pointer rounded-md border"
          />
        </div>
        <Input
          label={t("agency.create.foundedYearLabel")}
          type="number"
          min={1}
          max={CURRENT_YEAR}
          value={foundedYear}
          onChange={(e) => {
            setFoundedYear(e.target.value);
            validateField("foundedYear", e.target.value);
          }}
          error={errors.foundedYear}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold tracking-wide">
          {t("agency.create.logoIconLabel")}
        </Label>
        <div className="flex flex-wrap gap-2">
          {LOGO_ICON_OPTIONS.map(({ name: iconName, Icon }) => (
            <button
              key={iconName}
              type="button"
              onClick={() => setLogoIcon(iconName)}
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label={t("agency.create.facebookUrlLabel")}
          placeholder="https://facebook.com/..."
          value={facebookUrl}
          onChange={(e) => {
            setFacebookUrl(e.target.value);
            validateField("facebookUrl", e.target.value);
          }}
          error={errors.facebookUrl}
        />
        <Input
          label={t("agency.create.linkedinUrlLabel")}
          placeholder="https://linkedin.com/..."
          value={linkedinUrl}
          onChange={(e) => {
            setLinkedinUrl(e.target.value);
            validateField("linkedinUrl", e.target.value);
          }}
          error={errors.linkedinUrl}
        />
        <Input
          label={t("agency.create.instagramUrlLabel")}
          placeholder="https://instagram.com/..."
          value={instagramUrl}
          onChange={(e) => {
            setInstagramUrl(e.target.value);
            validateField("instagramUrl", e.target.value);
          }}
          error={errors.instagramUrl}
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleCancelEdit}
          className="cursor-pointer"
        >
          {t("agency.detail.cancelButton")}
        </Button>
        <Button
          loading={saving}
          disabled={hasErrors || !name.trim()}
          onClick={handleSave}
          className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer text-white"
        >
          {t("agency.detail.saveButton")}
        </Button>
      </div>
    </div>
  );
};
