import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  RichTextInput,
  stripRichTextHtml,
} from "@/components/ui/rich-text-input";
import { Switch } from "@/components/ui/switch";
import { Crop, History, ImagePlus, X, Globe } from "lucide-react";
import {
  FacebookGlyph,
  LinkedInGlyph,
  InstagramGlyph,
  TikTokGlyph,
} from "./SocialIcon";
import { JobTitleSelect } from "./JobTitleSelect";
import { LanguageChipSelect } from "./LanguageChipSelect";
import { SkillsChipSelect } from "./SkillsChipSelect";
import { VietnamAddressPicker } from "@/components/ui/vietnam-address-picker";
import { TimezoneSelect } from "@/pages/workspace/components/TimezoneSelect";
import {
  type ExtendedProfile,
  type VisibilityField,
  VISIBILITY_FIELDS,
  VISIBILITY_LABEL_KEY,
} from "../types";
import { CharacterCounter } from "@/components/ui/character-counter";
import { normalizeUrl, formatPhoneNumber } from "@/utils/validation";

interface ProfileEditFormProps {
  name: string;
  setName: (v: string) => void;
  email: string;
  phone: string;
  setPhone: (v: string) => void;
  professionalTitle: string;
  setProfessionalTitle: (v: string) => void;
  workingLanguage: string;
  setWorkingLanguage: (v: string) => void;
  timezone: string;
  setTimezone: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  portfolioUrls: string[];
  setPortfolioUrls: (v: string[]) => void;
  ext: ExtendedProfile;
  patchExt: (patch: Partial<ExtendedProfile>) => void;
  bannerUploading: boolean;
  bannerInputRef: React.RefObject<HTMLInputElement | null>;
  handleBannerFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenBannerCropper: () => void;
  onOpenBannerRecent: () => void;
  visibility: Record<VisibilityField, boolean>;
  setVisibility: React.Dispatch<
    React.SetStateAction<Record<VisibilityField, boolean>>
  >;
  handleCancelEdit: () => void;
  handleSave: () => void;
  saving: boolean;
  errors?: Record<string, string>;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  name,
  setName,
  email,
  phone,
  setPhone,
  professionalTitle,
  setProfessionalTitle,
  workingLanguage,
  setWorkingLanguage,
  timezone,
  setTimezone,
  bio,
  setBio,
  portfolioUrls,
  setPortfolioUrls,
  ext,
  patchExt,
  bannerUploading,
  bannerInputRef,
  handleBannerFileChange,
  onOpenBannerCropper,
  onOpenBannerRecent,
  visibility,
  setVisibility,
  handleCancelEdit,
  handleSave,
  saving,
  errors,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="mt-6 grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="w-full min-w-0">
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("settings.profile.fullNameLabel")}
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            error={errors?.name}
            className="w-full min-w-0"
          />
        </div>
        <div className="w-full min-w-0">
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("settings.profile.emailLabel")}
          </label>
          <Input value={email} readOnly className="w-full min-w-0" />
        </div>
        <div className="w-full min-w-0">
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("profile.edit.phoneLabel")}
          </label>
          <Input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() =>
              phone.trim() && setPhone(formatPhoneNumber(phone.trim()))
            }
            placeholder={t("profile.edit.phonePlaceholder", "VD: 0901 234 567")}
            error={errors?.phone}
            className="w-full min-w-0"
          />
        </div>
        <div className="w-full min-w-0">
          <JobTitleSelect
            value={professionalTitle}
            onChange={setProfessionalTitle}
          />
        </div>
        <div className="w-full min-w-0">
          <LanguageChipSelect
            value={workingLanguage}
            onChange={setWorkingLanguage}
          />
        </div>
        <div className="w-full min-w-0">
          <TimezoneSelect value={timezone} onChange={setTimezone} />
        </div>
        <div className="w-full min-w-0 space-y-1.5 sm:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-muted-foreground block text-xs font-medium">
              {t("profile.edit.bioLabel")}
            </label>
            <CharacterCounter current={stripRichTextHtml(bio).length} max={500} />
          </div>
          <RichTextInput
            value={bio}
            onChange={setBio}
            placeholder={t("profile.edit.bioPlaceholder")}
          />
        </div>
        <div className="w-full min-w-0 sm:col-span-2">
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("profile.edit.portfolioLabel")}
          </label>
          <div className="space-y-2">
            {portfolioUrls.map((url, idx) => (
              <div key={idx} className="flex w-full min-w-0 gap-2">
                <Input
                  value={url}
                  onChange={(e) => {
                    const next = [...portfolioUrls];
                    next[idx] = e.target.value;
                    setPortfolioUrls(next);
                  }}
                  placeholder={t("profile.edit.portfolioPlaceholder")}
                  className="min-w-0 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() =>
                    setPortfolioUrls(portfolioUrls.filter((_, i) => i !== idx))
                  }
                >
                  {t("profile.edit.portfolioRemove")}
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPortfolioUrls([...portfolioUrls, ""])}
            >
              {t("profile.edit.portfolioAdd")}
            </Button>
          </div>
        </div>
        <div className="w-full min-w-0 sm:col-span-2">
          <SkillsChipSelect
            value={ext.skills}
            onChange={(skills) => patchExt({ skills })}
          />
        </div>
        <div className="w-full min-w-0 sm:col-span-2">
          <VietnamAddressPicker
            locationValue={ext.location}
            addressValue={ext.location}
            onLocationChange={(loc) => patchExt({ location: loc })}
            onAddressChange={(addr) => patchExt({ location: addr })}
            disabled={saving}
            labels={{
              province: t(
                "profile.edit.locationProvinceLabel",
                "Tỉnh / Thành phố",
              ),
              district: t("profile.edit.locationDistrictLabel", "Quận / Huyện"),
              ward: t("profile.edit.locationWardLabel", "Phường / Xã"),
              street: t(
                "profile.edit.locationStreetLabel",
                "Số nhà, tên đường (tùy chọn)",
              ),
              fullAddress: t("profile.edit.locationLabel", "Khu vực / Địa chỉ"),
            }}
            errors={{
              location: errors?.location,
            }}
          />
        </div>
        <div className="w-full min-w-0">
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("profile.edit.yearsOfExperienceLabel")}
          </label>
          <Input
            type="number"
            min={0}
            max={70}
            value={ext.yearsOfExperience}
            onChange={(e) => patchExt({ yearsOfExperience: e.target.value })}
            placeholder={t("profile.edit.yearsOfExperiencePlaceholder")}
            className="w-full min-w-0"
          />
        </div>
        <div className="w-full min-w-0">
          <label className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium">
            <LinkedInGlyph className="size-3.5" />
            <span>{t("profile.edit.linkedinLabel")}</span>
          </label>
          <Input
            iconPrefix={<LinkedInGlyph className="size-4" />}
            value={ext.linkedinUrl}
            onChange={(e) => patchExt({ linkedinUrl: e.target.value })}
            onBlur={() => {
              if (ext.linkedinUrl.trim()) {
                patchExt({ linkedinUrl: normalizeUrl(ext.linkedinUrl) });
              }
            }}
            placeholder={t("profile.edit.socialPlaceholder")}
            error={errors?.linkedinUrl}
            className="w-full min-w-0"
          />
        </div>
        <div className="w-full min-w-0">
          <label className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium">
            <FacebookGlyph className="size-3.5" />
            <span>{t("profile.edit.facebookLabel")}</span>
          </label>
          <Input
            iconPrefix={<FacebookGlyph className="size-4" />}
            value={ext.facebookUrl}
            onChange={(e) => patchExt({ facebookUrl: e.target.value })}
            onBlur={() => {
              if (ext.facebookUrl.trim()) {
                patchExt({ facebookUrl: normalizeUrl(ext.facebookUrl) });
              }
            }}
            placeholder={t("profile.edit.socialPlaceholder")}
            error={errors?.facebookUrl}
            className="w-full min-w-0"
          />
        </div>
        <div className="w-full min-w-0">
          <label className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium">
            <InstagramGlyph className="size-3.5" />
            <span>{t("profile.edit.instagramLabel")}</span>
          </label>
          <Input
            iconPrefix={<InstagramGlyph className="size-4" />}
            value={ext.instagramUrl}
            onChange={(e) => patchExt({ instagramUrl: e.target.value })}
            onBlur={() => {
              if (ext.instagramUrl.trim()) {
                patchExt({ instagramUrl: normalizeUrl(ext.instagramUrl) });
              }
            }}
            placeholder={t("profile.edit.socialPlaceholder")}
            error={errors?.instagramUrl}
            className="w-full min-w-0"
          />
        </div>
        <div className="w-full min-w-0">
          <label className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium">
            <TikTokGlyph className="size-3.5" />
            <span>{t("profile.edit.tiktokLabel")}</span>
          </label>
          <Input
            iconPrefix={<TikTokGlyph className="size-4" />}
            value={ext.tiktokUrl}
            onChange={(e) => patchExt({ tiktokUrl: e.target.value })}
            onBlur={() => {
              if (ext.tiktokUrl.trim()) {
                patchExt({ tiktokUrl: normalizeUrl(ext.tiktokUrl) });
              }
            }}
            placeholder={t("profile.edit.socialPlaceholder")}
            error={errors?.tiktokUrl}
            className="w-full min-w-0"
          />
        </div>
        <div className="w-full min-w-0">
          <label className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium">
            <Globe className="text-brand-orange size-3.5" />
            <span>{t("profile.edit.websiteLabel")}</span>
          </label>
          <Input
            iconPrefix={<Globe className="text-brand-orange size-4" />}
            value={ext.website}
            onChange={(e) => patchExt({ website: e.target.value })}
            onBlur={() => {
              if (ext.website.trim()) {
                patchExt({ website: normalizeUrl(ext.website) });
              }
            }}
            placeholder={t("profile.edit.socialPlaceholder")}
            error={errors?.website}
            className="w-full min-w-0"
          />
        </div>
        <div className="w-full min-w-0 sm:col-span-2">
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("profile.edit.bannerLabel")}
          </label>
          <div className="flex flex-wrap gap-2">
            <Input
              value={ext.bannerUrl}
              onChange={(e) => patchExt({ bannerUrl: e.target.value })}
              placeholder={t("profile.edit.bannerPlaceholder")}
              className="min-w-[200px] flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              loading={bannerUploading}
              onClick={() => bannerInputRef.current?.click()}
            >
              <ImagePlus className="size-3.5" />
              {t("profile.edit.bannerUpload")}
            </Button>
            {ext.bannerUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-brand-orange border-brand-orange/30 hover:bg-brand-orange/10 shrink-0 gap-1.5 text-xs"
                onClick={onOpenBannerCropper}
              >
                <Crop className="size-3.5" />
                Cắt / Đổ màu
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-muted-foreground hover:text-foreground shrink-0 gap-1.5 text-xs"
              onClick={onOpenBannerRecent}
            >
              <History className="size-3.5" />
              Ảnh bìa cũ
            </Button>
            {ext.bannerUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                title={t("profile.edit.bannerRemove")}
                onClick={() => patchExt({ bannerUrl: "" })}
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
          <p className="text-muted-foreground text-3xs mt-1">
            {t("profile.edit.bannerHint")}
          </p>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerFileChange}
          />
        </div>
      </div>
      <div className="border-border mt-6 w-full min-w-0 border-t pt-6">
        <p className="text-foreground text-sm font-semibold">
          {t("profile.edit.visibilityTitle")}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          {t("profile.edit.visibilityHint")}
        </p>
        <div className="mt-3 grid w-full min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2">
          {VISIBILITY_FIELDS.map((field) => (
            <label
              key={field}
              className="border-border/70 bg-muted/20 hover:bg-muted/40 flex w-full min-w-0 cursor-pointer items-center justify-between overflow-hidden rounded-lg border px-3.5 py-2.5 text-xs font-medium transition-colors"
            >
              <span className="text-foreground min-w-0 truncate pr-2">
                {t(`profile.edit.${VISIBILITY_LABEL_KEY[field]}`)}
              </span>
              <Switch
                className="shrink-0"
                checked={visibility[field]}
                onCheckedChange={(checked) =>
                  setVisibility((prev) => ({
                    ...prev,
                    [field]: checked,
                  }))
                }
              />
            </label>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancelEdit}>
          {t("profile.cancelEdit")}
        </Button>
        <Button variant="orange" onClick={handleSave} loading={saving}>
          {t("settings.profile.save")}
        </Button>
      </div>
    </>
  );
};
