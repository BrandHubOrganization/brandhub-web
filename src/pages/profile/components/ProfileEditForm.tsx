import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crop, History, ImagePlus, X } from "lucide-react";
import { JobTitleSelect } from "./JobTitleSelect";
import { LanguageChipSelect } from "./LanguageChipSelect";
import { SkillsChipSelect } from "./SkillsChipSelect";
import { LocationAutocomplete } from "./LocationAutocomplete";
import { TimezoneSelect } from "@/pages/workspace/components/TimezoneSelect";
import {
  type ExtendedProfile,
  type VisibilityField,
  VISIBILITY_FIELDS,
  VISIBILITY_LABEL_KEY,
} from "../types";

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
}) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("settings.profile.fullNameLabel")}
          </label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("settings.profile.emailLabel")}
          </label>
          <Input value={email} readOnly />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("profile.edit.phoneLabel")}
          </label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("profile.edit.phonePlaceholder")}
          />
        </div>
        <div>
          <JobTitleSelect
            value={professionalTitle}
            onChange={setProfessionalTitle}
          />
        </div>
        <div>
          <LanguageChipSelect
            value={workingLanguage}
            onChange={setWorkingLanguage}
          />
        </div>
        <TimezoneSelect value={timezone} onChange={setTimezone} />
        <div className="sm:col-span-2">
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("profile.edit.bioLabel")}
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={t("profile.edit.bioPlaceholder")}
            rows={3}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-2 text-sm outline-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("profile.edit.portfolioLabel")}
          </label>
          <div className="space-y-2">
            {portfolioUrls.map((url, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => {
                    const next = [...portfolioUrls];
                    next[idx] = e.target.value;
                    setPortfolioUrls(next);
                  }}
                  placeholder={t("profile.edit.portfolioPlaceholder")}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
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
        <div className="sm:col-span-2">
          <SkillsChipSelect
            value={ext.skills}
            onChange={(skills) => patchExt({ skills })}
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("profile.edit.locationLabel")}
          </label>
          <LocationAutocomplete
            value={ext.location}
            onChange={(location) => patchExt({ location })}
            placeholder={t("profile.edit.locationPlaceholder")}
          />
        </div>
        <div>
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
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("profile.edit.linkedinLabel")}
          </label>
          <Input
            value={ext.linkedinUrl}
            onChange={(e) => patchExt({ linkedinUrl: e.target.value })}
            placeholder={t("profile.edit.socialPlaceholder")}
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("profile.edit.facebookLabel")}
          </label>
          <Input
            value={ext.facebookUrl}
            onChange={(e) => patchExt({ facebookUrl: e.target.value })}
            placeholder={t("profile.edit.socialPlaceholder")}
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("profile.edit.instagramLabel")}
          </label>
          <Input
            value={ext.instagramUrl}
            onChange={(e) => patchExt({ instagramUrl: e.target.value })}
            placeholder={t("profile.edit.socialPlaceholder")}
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("profile.edit.tiktokLabel")}
          </label>
          <Input
            value={ext.tiktokUrl}
            onChange={(e) => patchExt({ tiktokUrl: e.target.value })}
            placeholder={t("profile.edit.socialPlaceholder")}
          />
        </div>
        <div>
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            {t("profile.edit.websiteLabel")}
          </label>
          <Input
            value={ext.website}
            onChange={(e) => patchExt({ website: e.target.value })}
            placeholder={t("profile.edit.socialPlaceholder")}
          />
        </div>
        <div className="sm:col-span-2">
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
                className="shrink-0 gap-1.5 text-xs text-brand-orange border-brand-orange/30 hover:bg-brand-orange/10"
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
              className="shrink-0 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
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
      <div className="border-border mt-6 border-t pt-6">
        <p className="text-foreground text-sm font-semibold">
          {t("profile.edit.visibilityTitle")}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          {t("profile.edit.visibilityHint")}
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {VISIBILITY_FIELDS.map((field) => (
            <label key={field} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={visibility[field]}
                onChange={(e) =>
                  setVisibility((prev) => ({
                    ...prev,
                    [field]: e.target.checked,
                  }))
                }
              />
              {t(`profile.edit.${VISIBILITY_LABEL_KEY[field]}`)}
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
