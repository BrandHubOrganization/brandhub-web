import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ProvinceSelect } from "@/components/ui/province-select";
import { RichTextInput } from "@/components/ui/rich-text-input";
import { toast } from "sonner";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage } from "@/utils/error";
import { AGENCY_CATEGORIES, COMPANY_SIZES } from "@/pages/agency/constants";
import { LOGO_ICON_OPTIONS, getLogoIcon } from "@/pages/agency/logoIcons";
import { BANNER_PRESETS } from "@/pages/agency/bannerPresets";
import type { AgencyCategory, CompanySize } from "@/types/agency";
import { ImageCropperModal, RecentAssetsModal } from "@/components/shared/image-editor";
import { saveRecentAsset } from "@/utils/recentAssetsStorage";
import {
  AgencyBrandingSection,
  type LogoMode,
  type BannerMode,
} from "./components/AgencyBrandingSection";
import { AgencyCreateLivePreview } from "./components/AgencyCreateLivePreview";

import {
  normalizeUrl,
  isValidUrl,
  formatPhoneNumber,
  isValidPhone,
  isValidFoundedYear,
  CURRENT_YEAR,
} from "@/utils/validation";
import { CharacterCounter } from "@/components/ui/character-counter";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function CreateAgencyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Basic Information
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AgencyCategory | "">("");
  const [companySize, setCompanySize] = useState<CompanySize | "">("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [brandColor, setBrandColor] = useState("#f05a28");
  const [tagline, setTagline] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleUrlBlur = (
    field: "website" | "facebookUrl" | "linkedinUrl" | "instagramUrl",
    value: string,
    setter: (val: string) => void,
  ) => {
    if (!value.trim()) {
      clearError(field);
      return;
    }
    const normalized = normalizeUrl(value);
    setter(normalized);
    if (!isValidUrl(normalized)) {
      setErrors((prev) => ({
        ...prev,
        [field]: t("agency.detail.errors.invalidUrl", "Định dạng URL không hợp lệ"),
      }));
    } else {
      clearError(field);
    }
  };

  const handlePhoneBlur = () => {
    if (!phone.trim()) {
      clearError("phone");
      return;
    }
    const formatted = formatPhoneNumber(phone);
    setPhone(formatted);
    if (!isValidPhone(formatted)) {
      setErrors((prev) => ({
        ...prev,
        phone: t(
          "agency.detail.errors.invalidPhone",
          "Số điện thoại không hợp lệ (10-11 số)",
        ),
      }));
    } else {
      clearError("phone");
    }
  };

  const handleFoundedYearBlur = () => {
    if (!foundedYear.trim()) {
      clearError("foundedYear");
      return;
    }
    if (!isValidFoundedYear(foundedYear)) {
      setErrors((prev) => ({
        ...prev,
        foundedYear: t(
          "agency.detail.errors.invalidFoundedYear",
          "Năm thành lập không hợp lệ",
        ),
      }));
    } else {
      clearError("foundedYear");
    }
  };

  // Logo selection mode & state
  const [logoMode, setLogoMode] = useState<LogoMode>("icon");
  const [logoIcon, setLogoIcon] = useState(LOGO_ICON_OPTIONS[0].name);
  const [logoUrlInput, setLogoUrlInput] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Banner selection mode & state
  const [bannerMode, setBannerMode] = useState<BannerMode>("preset");
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    BANNER_PRESETS[0].id,
  );
  const [bannerUrlInput, setBannerUrlInput] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Cropper & Recent Modals state
  const [logoCropperOpen, setLogoCropperOpen] = useState(false);
  const [logoCropperSrc, setLogoCropperSrc] = useState<string | null>(null);
  const [logoRecentModalOpen, setLogoRecentModalOpen] = useState(false);

  const [bannerCropperOpen, setBannerCropperOpen] = useState(false);
  const [bannerCropperSrc, setBannerCropperSrc] = useState<string | null>(null);
  const [bannerRecentModalOpen, setBannerRecentModalOpen] = useState(false);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
      if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    };
  }, [logoPreviewUrl, bannerPreviewUrl]);

  // Handle Logo file selection
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("agency.detail.errors.invalidUrl"));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("agency.create.uploadHint"));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLogoCropperSrc(objectUrl);
    setLogoCropperOpen(true);
  };

  const handleLogoCropConfirm = (croppedFile: File, croppedPreviewUrl: string) => {
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoFile(croppedFile);
    setLogoPreviewUrl(croppedPreviewUrl);
    setLogoCropperOpen(false);
  };

  const handleSelectRecentLogo = (url: string) => {
    setLogoRecentModalOpen(false);
    setLogoCropperSrc(url);
    setLogoCropperOpen(true);
  };

  const handleClearLogoFile = () => {
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoFile(null);
    setLogoPreviewUrl(null);
    if (logoFileInputRef.current) logoFileInputRef.current.value = "";
  };

  // Handle Banner file selection
  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("agency.detail.errors.invalidUrl"));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("agency.create.uploadHint"));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setBannerCropperSrc(objectUrl);
    setBannerCropperOpen(true);
  };

  const handleBannerCropConfirm = (croppedFile: File, croppedPreviewUrl: string) => {
    if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    setBannerFile(croppedFile);
    setBannerPreviewUrl(croppedPreviewUrl);
    setBannerCropperOpen(false);
  };

  const handleSelectRecentBanner = (url: string) => {
    setBannerRecentModalOpen(false);
    setBannerCropperSrc(url);
    setBannerCropperOpen(true);
  };

  const handleClearBannerFile = () => {
    if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    setBannerFile(null);
    setBannerPreviewUrl(null);
    if (bannerFileInputRef.current) bannerFileInputRef.current.value = "";
  };

  // Compute effective logo & banner for preview and submission
  const effectiveLogoUrl =
    logoMode === "upload"
      ? logoPreviewUrl
      : logoMode === "url"
        ? logoUrlInput.trim() || null
        : null;

  const effectiveBannerUrl =
    bannerMode === "upload"
      ? bannerPreviewUrl
      : bannerMode === "url"
        ? bannerUrlInput.trim() || null
        : bannerMode === "preset"
          ? BANNER_PRESETS.find((p) => p.id === selectedPresetId)?.url || null
          : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = t("agency.create.nameRequired", "Vui lòng nhập tên agency");
    }
    if (website.trim() && !isValidUrl(normalizeUrl(website))) {
      newErrors.website = t("agency.detail.errors.invalidUrl", "Định dạng URL không hợp lệ");
    }
    if (phone.trim() && !isValidPhone(phone)) {
      newErrors.phone = t(
        "agency.detail.errors.invalidPhone",
        "Số điện thoại không hợp lệ (10-11 số)",
      );
    }
    if (foundedYear.trim() && !isValidFoundedYear(foundedYear)) {
      newErrors.foundedYear = t(
        "agency.detail.errors.invalidFoundedYear",
        "Năm thành lập không hợp lệ",
      );
    }
    if (facebookUrl.trim() && !isValidUrl(normalizeUrl(facebookUrl))) {
      newErrors.facebookUrl = t("agency.detail.errors.invalidUrl", "Định dạng URL không hợp lệ");
    }
    if (linkedinUrl.trim() && !isValidUrl(normalizeUrl(linkedinUrl))) {
      newErrors.linkedinUrl = t("agency.detail.errors.invalidUrl", "Định dạng URL không hợp lệ");
    }
    if (instagramUrl.trim() && !isValidUrl(normalizeUrl(instagramUrl))) {
      newErrors.instagramUrl = t("agency.detail.errors.invalidUrl", "Định dạng URL không hợp lệ");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t("common.formError", "Vui lòng kiểm tra lại các trường thông tin"));
      return;
    }
    setErrors({});

    setLoading(true);

    try {
      // 1. Create the agency with metadata
      const { data } = await agencyService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        category: (category as AgencyCategory) || undefined,
        companySize: (companySize as CompanySize) || undefined,
        website: website.trim() || undefined,
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
        brandColor: brandColor || undefined,
        tagline: tagline.trim() || undefined,
        foundedYear: foundedYear ? parseInt(foundedYear, 10) : undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        logoUrl:
          logoMode === "url" && logoUrlInput.trim()
            ? logoUrlInput.trim()
            : logoMode === "icon"
              ? `seed:${logoIcon}:${brandColor}`
              : undefined,
        bannerUrl:
          bannerMode === "url" && bannerUrlInput.trim()
            ? bannerUrlInput.trim()
            : bannerMode === "preset"
              ? effectiveBannerUrl || undefined
              : undefined,
      });

      const agencyId = data.data.id;

      // 2. Upload Logo File if uploaded from device
      if (logoMode === "upload" && logoFile) {
        try {
          const resp = await agencyService.uploadLogo(agencyId, logoFile);
          if (resp.data.data.logoUrl) saveRecentAsset("logo", resp.data.data.logoUrl);
        } catch (uploadErr) {
          console.error("Failed to upload logo:", uploadErr);
        }
      }

      // 3. Upload Banner File if uploaded from device
      if (bannerMode === "upload" && bannerFile) {
        try {
          const resp = await agencyService.uploadBanner(agencyId, bannerFile);
          if (resp.data.data.bannerUrl) saveRecentAsset("banner", resp.data.data.bannerUrl);
        } catch (uploadErr) {
          console.error("Failed to upload banner:", uploadErr);
        }
      }

      toast.success(t("agency.create.success"));
      navigate(`/agency/${agencyId}`);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, t("agency.errors.createFailed")));
    } finally {
      setLoading(false);
    }
  };

  const CurrentIcon = getLogoIcon(logoIcon);

  return (
    <PageWrapper
      title={t("agency.create.title")}
      description={t("agency.create.description")}
      fullWidth
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: Input Form */}
        <div className="lg:col-span-7 xl:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SECTION 1: Basic Information */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
              <h3 className="text-sm font-semibold tracking-wide text-foreground">
                1. {t("agency.create.title")}
              </h3>

              <Input
                label={t("agency.create.nameLabel")}
                placeholder={t("agency.create.namePlaceholder")}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError("name");
                }}
                required
                error={errors.name}
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold tracking-wide">
                    {t("agency.create.taglineLabel")}
                  </Label>
                  <CharacterCounter current={tagline.length} max={140} />
                </div>
                <Input
                  placeholder={t("agency.create.taglinePlaceholder")}
                  maxLength={140}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>

              <RichTextInput
                label={t("agency.create.descriptionLabel")}
                placeholder={t("agency.create.descriptionPlaceholder")}
                value={description}
                onChange={setDescription}
              />
            </div>

            {/* SECTION 2 & 3: Logo, Color, Banner */}
            <AgencyBrandingSection
              logoMode={logoMode}
              setLogoMode={setLogoMode}
              brandColor={brandColor}
              setBrandColor={setBrandColor}
              logoIcon={logoIcon}
              setLogoIcon={setLogoIcon}
              logoPreviewUrl={logoPreviewUrl || ""}
              logoFile={logoFile}
              logoFileInputRef={logoFileInputRef}
              handleLogoFileChange={handleLogoFileChange}
              handleClearLogoFile={handleClearLogoFile}
              logoUrlInput={logoUrlInput}
              setLogoUrlInput={setLogoUrlInput}
              onOpenLogoCropper={() => {
                if (logoPreviewUrl) {
                  setLogoCropperSrc(logoPreviewUrl);
                  setLogoCropperOpen(true);
                }
              }}
              onOpenLogoRecent={() => setLogoRecentModalOpen(true)}
              bannerMode={bannerMode}
              setBannerMode={setBannerMode}
              selectedPresetId={selectedPresetId}
              setSelectedPresetId={setSelectedPresetId}
              bannerPreviewUrl={bannerPreviewUrl || ""}
              bannerFile={bannerFile}
              bannerFileInputRef={bannerFileInputRef}
              handleBannerFileChange={handleBannerFileChange}
              handleClearBannerFile={handleClearBannerFile}
              bannerUrlInput={bannerUrlInput}
              setBannerUrlInput={setBannerUrlInput}
              onOpenBannerCropper={() => {
                if (bannerPreviewUrl) {
                  setBannerCropperSrc(bannerPreviewUrl);
                  setBannerCropperOpen(true);
                }
              }}
              onOpenBannerRecent={() => setBannerRecentModalOpen(true)}
            />

            {/* SECTION 4: Category, Size, Founded Year */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
              <h3 className="text-sm font-semibold tracking-wide text-foreground">
                4. {t("agency.create.businessInfo", "Thông tin doanh nghiệp")}
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold tracking-wide">
                    {t("agency.create.categoryLabel")}
                  </Label>
                  <Select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as AgencyCategory | "")
                    }
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
                    onChange={(e) =>
                      setCompanySize(e.target.value as CompanySize | "")
                    }
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label={t("agency.create.foundedYearLabel")}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={CURRENT_YEAR}
                  value={foundedYear}
                  onChange={(e) => {
                    setFoundedYear(e.target.value);
                    clearError("foundedYear");
                  }}
                  onBlur={handleFoundedYearBlur}
                  placeholder="2020"
                  error={errors.foundedYear}
                />
                <ProvinceSelect
                  label={t("agency.create.locationLabel")}
                  value={location}
                  onChange={setLocation}
                />
              </div>
            </div>

            {/* SECTION 5: Contact & Socials */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
              <h3 className="text-sm font-semibold tracking-wide text-foreground">
                5. {t("agency.create.contactAndSocial", "Liên hệ & Mạng xã hội")}
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label={t("agency.create.websiteLabel")}
                  placeholder={t("agency.create.websitePlaceholder")}
                  value={website}
                  onChange={(e) => {
                    setWebsite(e.target.value);
                    clearError("website");
                  }}
                  onBlur={() => handleUrlBlur("website", website, setWebsite)}
                  error={errors.website}
                />
                <Input
                  label={t("agency.create.phoneLabel")}
                  type="tel"
                  inputMode="tel"
                  placeholder={t("agency.create.phonePlaceholder", "VD: 0901 234 567")}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearError("phone");
                  }}
                  onBlur={handlePhoneBlur}
                  error={errors.phone}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  label={t("agency.create.facebookUrlLabel")}
                  placeholder="https://facebook.com/..."
                  value={facebookUrl}
                  onChange={(e) => {
                    setFacebookUrl(e.target.value);
                    clearError("facebookUrl");
                  }}
                  onBlur={() =>
                    handleUrlBlur("facebookUrl", facebookUrl, setFacebookUrl)
                  }
                  error={errors.facebookUrl}
                />
                <Input
                  label={t("agency.create.linkedinUrlLabel")}
                  placeholder="https://linkedin.com/..."
                  value={linkedinUrl}
                  onChange={(e) => {
                    setLinkedinUrl(e.target.value);
                    clearError("linkedinUrl");
                  }}
                  onBlur={() =>
                    handleUrlBlur("linkedinUrl", linkedinUrl, setLinkedinUrl)
                  }
                  error={errors.linkedinUrl}
                />
                <Input
                  label={t("agency.create.instagramUrlLabel")}
                  placeholder="https://instagram.com/..."
                  value={instagramUrl}
                  onChange={(e) => {
                    setInstagramUrl(e.target.value);
                    clearError("instagramUrl");
                  }}
                  onBlur={() =>
                    handleUrlBlur("instagramUrl", instagramUrl, setInstagramUrl)
                  }
                  error={errors.instagramUrl}
                />
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/agency")}
                className="cursor-pointer"
              >
                {t("agency.create.cancel")}
              </Button>
              <Button
                type="submit"
                variant="orange"
                loading={loading}
                disabled={!name.trim()}
                className="cursor-pointer px-6 font-medium shadow-sm"
              >
                {t("agency.create.submit")}
              </Button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Profile Preview (Sticky) */}
        <AgencyCreateLivePreview
          effectiveBannerUrl={effectiveBannerUrl || undefined}
          effectiveLogoUrl={effectiveLogoUrl || undefined}
          name={name}
          tagline={tagline}
          category={category}
          companySize={companySize}
          foundedYear={foundedYear}
          brandColor={brandColor}
          CurrentIcon={CurrentIcon}
          description={description}
          website={website}
          phone={phone}
          location={location}
          facebookUrl={facebookUrl}
          linkedinUrl={linkedinUrl}
          instagramUrl={instagramUrl}
        />
      </div>

      {/* Image Cropper & Recent Modals */}
      <ImageCropperModal
        isOpen={logoCropperOpen}
        onClose={() => setLogoCropperOpen(false)}
        cropType="logo"
        imageUrl={logoCropperSrc}
        onConfirm={handleLogoCropConfirm}
      />

      <RecentAssetsModal
        isOpen={logoRecentModalOpen}
        onClose={() => setLogoRecentModalOpen(false)}
        category="logo"
        onSelect={handleSelectRecentLogo}
      />

      <ImageCropperModal
        isOpen={bannerCropperOpen}
        onClose={() => setBannerCropperOpen(false)}
        cropType="banner"
        imageUrl={bannerCropperSrc}
        onConfirm={handleBannerCropConfirm}
      />

      <RecentAssetsModal
        isOpen={bannerRecentModalOpen}
        onClose={() => setBannerRecentModalOpen(false)}
        category="banner"
        onSelect={handleSelectRecentBanner}
      />
    </PageWrapper>
  );
}
