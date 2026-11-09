import React from "react";
import { FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import {
  Crop,
  History,
  Upload,
  Building2,
  Tag,
  Briefcase,
  Users,
  Globe,
  Phone,
  Calendar,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { VietnamAddressPicker } from "@/components/ui/vietnam-address-picker";
import { RichTextInput } from "@/components/ui/rich-text-input";
import { AGENCY_CATEGORIES, COMPANY_SIZES } from "@/pages/agency/constants";
import { LOGO_ICON_OPTIONS, getLogoIcon } from "@/pages/agency/logoIcons";
import { cn } from "@/lib/utils";
import type { AgencyCategory, CompanySize } from "@/types/agency";
import { normalizeUrl, formatPhoneNumber } from "@/utils/validation";
import { CharacterCounter } from "@/components/ui/character-counter";


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
  clearFieldError: (field: keyof AgencyDetailFieldErrors) => void;
  errors: AgencyDetailFieldErrors;
  logoUrl: string;
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
  clearFieldError,
  errors,
  logoUrl,
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
          if (errors.name) clearFieldError("name");
        }}
        onBlur={() => validateField("name", name)}
        error={errors.name}
        required
        iconPrefix={<Building2 className="text-muted-foreground size-4" />}
      />

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold tracking-wide">
          {t("agency.detail.logoLabel")}
        </Label>
        <div className="flex items-center gap-3">
          <div className="bg-brand-orange/10 flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="size-full object-cover" />
            ) : (
              (() => {
                const Icon = getLogoIcon(logoIcon);
                return <Icon className="text-brand-orange size-6" />;
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
                className="text-brand-orange border-brand-orange/30 hover:bg-brand-orange/10 cursor-pointer gap-1.5 text-xs"
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
              className="text-muted-foreground hover:text-foreground cursor-pointer gap-1.5 text-xs"
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
        label={
          <span className="flex items-center gap-1.5">
            <FileText className="text-brand-orange size-3.5" />
            {t("agency.create.descriptionLabel")}
          </span>
        }
        placeholder={t("agency.create.descriptionPlaceholder")}
        value={description}
        onChange={setDescription}
      />
      <Input
        label={
          <span className="flex w-full items-center justify-between">
            <span>{t("agency.create.taglineLabel")}</span>
            <CharacterCounter current={tagline.length} max={140} />
          </span>
        }
        placeholder={t("agency.create.taglinePlaceholder")}
        maxLength={140}
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
        iconPrefix={<Tag className="text-muted-foreground size-4" />}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide">
            <Briefcase className="text-brand-orange size-3.5" />
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
          <Label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide">
            <Users className="text-brand-orange size-3.5" />
            {t("agency.create.companySizeLabel")}
          </Label>
          <Select
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value as CompanySize | "")}
          >
            <option value="">
              {t("agency.create.companySizePlaceholder")}
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
        label={t("agency.create.websiteLabel")}
        placeholder={t("agency.create.websitePlaceholder")}
        value={website}
        onChange={(e) => {
          setWebsite(e.target.value);
          if (errors.website) clearFieldError("website");
        }}
        onBlur={() => {
          const norm = normalizeUrl(website);
          if (norm !== website) setWebsite(norm);
          validateField("website", norm);
        }}
        error={errors.website}
        iconPrefix={<Globe className="text-muted-foreground size-4" />}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={t("agency.create.phoneLabel")}
          placeholder={t("agency.create.phonePlaceholder")}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (errors.phone) clearFieldError("phone");
          }}
          onBlur={() => {
            const fmt = formatPhoneNumber(phone);
            if (fmt !== phone) setPhone(fmt);
            validateField("phone", fmt);
          }}
          error={errors.phone}
          iconPrefix={<Phone className="text-muted-foreground size-4" />}
        />
        <Input
          label={t("agency.create.foundedYearLabel")}
          type="text"
          inputMode="numeric"
          value={foundedYear}
          onChange={(e) => {
            const val = e.target.value;
            setFoundedYear(val);
            validateField("foundedYear", val);
          }}
          onBlur={() => validateField("foundedYear", foundedYear)}
          error={errors.foundedYear}
          iconPrefix={<Calendar className="text-muted-foreground size-4" />}
        />
      </div>
      <div className="sm:col-span-2">
        <VietnamAddressPicker
          locationValue={location}
          addressValue={location}
          onLocationChange={setLocation}
          onAddressChange={setLocation}
          disabled={saving}
          labels={{
            province: t("agency.create.locationProvinceLabel", "Tỉnh / Thành phố"),
            district: t("agency.create.locationDistrictLabel", "Quận / Huyện"),
            ward: t("agency.create.locationWardLabel", "Phường / Xã"),
            street: t("agency.create.locationStreetLabel", "Số nhà, tên đường (tùy chọn)"),
            fullAddress: t("agency.create.locationLabel", "Khu vực / Vị trí"),
          }}
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
            if (errors.facebookUrl) clearFieldError("facebookUrl");
          }}
          onBlur={() => {
            const norm = normalizeUrl(facebookUrl);
            if (norm !== facebookUrl) setFacebookUrl(norm);
            validateField("facebookUrl", norm);
          }}
          error={errors.facebookUrl}
          iconPrefix={
            <FaFacebook className="size-4 text-blue-600 dark:text-blue-400" />
          }
        />
        <Input
          label={t("agency.create.linkedinUrlLabel")}
          placeholder="https://linkedin.com/..."
          value={linkedinUrl}
          onChange={(e) => {
            setLinkedinUrl(e.target.value);
            if (errors.linkedinUrl) clearFieldError("linkedinUrl");
          }}
          onBlur={() => {
            const norm = normalizeUrl(linkedinUrl);
            if (norm !== linkedinUrl) setLinkedinUrl(norm);
            validateField("linkedinUrl", norm);
          }}
          error={errors.linkedinUrl}
          iconPrefix={
            <FaLinkedin className="size-4 text-sky-600 dark:text-sky-400" />
          }
        />
        <Input
          label={t("agency.create.instagramUrlLabel")}
          placeholder="https://instagram.com/..."
          value={instagramUrl}
          onChange={(e) => {
            setInstagramUrl(e.target.value);
            if (errors.instagramUrl) clearFieldError("instagramUrl");
          }}
          onBlur={() => {
            const norm = normalizeUrl(instagramUrl);
            if (norm !== instagramUrl) setInstagramUrl(norm);
            validateField("instagramUrl", norm);
          }}
          error={errors.instagramUrl}
          iconPrefix={
            <FaInstagram className="size-4 text-pink-600 dark:text-pink-400" />
          }
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
          variant="orange"
          loading={saving}
          disabled={hasErrors || !name.trim()}
          onClick={handleSave}
          className="cursor-pointer"
        >
          {t("agency.detail.saveButton")}
        </Button>
      </div>
    </div>
  );
};
