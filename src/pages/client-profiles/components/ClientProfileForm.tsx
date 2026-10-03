import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ProvinceSelect } from "@/components/ui/province-select";
import { BUDGET_RANGES } from "@/pages/client-profiles/constants";
import { COMPANY_SIZES } from "@/pages/agency/constants";
import { WORKSPACE_INDUSTRIES } from "@/pages/workspace/constants";
import { BANNER_PRESETS } from "@/pages/agency/bannerPresets";
import { clientProfileService } from "@/services/clientProfileService";
import { ImageCropperModal, RecentAssetsModal } from "@/components/shared/image-editor";
import { saveRecentAsset } from "@/utils/recentAssetsStorage";
import { useAuthStore } from "@/store/authStore";
import type { CompanySize } from "@/types/agency";
import type {
  ClientProfile,
  UpdateClientProfileRequest,
} from "@/types/clientProfile";
import { extractErrorMessage } from "@/utils/error";
import { LOGO_ICON_OPTIONS } from "@/pages/agency/logoIcons";
import {
  ClientProfileBrandingSection,
  type LogoMode,
  type BannerMode,
} from "./ClientProfileBrandingSection";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const CURRENT_YEAR = new Date().getFullYear();

export type ClientProfileFormValues = {
  displayName: string;
  company: string;
  logoUrl: string;
  bannerUrl: string;
  website: string;
  industry: string;
  location: string;
  tagline: string;
  foundedYear: string;
  companySize: string;
  budgetRange: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  address: string;
  taxCode: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  description: string;
  note: string;
  brandColor?: string;
};

interface Props {
  initial?: ClientProfile | null;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (data: UpdateClientProfileRequest) => void;
  onCancel?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onValuesChange?: (values: ClientProfileFormValues) => void;
}

function normalizeUrl(value: string) {
  const s = value.trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

function isValidUrl(value: string) {
  try {
    return new URL(value).hostname.includes(".");
  } catch {
    return false;
  }
}

const URL_FIELDS = [
  "website",
  "linkedin",
  "facebook",
  "instagram",
] as const;

function parseInitialLogo(logoUrl?: string | null): {
  mode: LogoMode;
  icon: string;
  color: string;
  url: string;
} {
  if (logoUrl?.startsWith("icon:")) {
    const parts = logoUrl.split(":");
    return {
      mode: "icon",
      icon: parts[1] || LOGO_ICON_OPTIONS[0].name,
      color: parts[2] || "#f05a28",
      url: "",
    };
  }
  if (logoUrl) {
    return {
      mode: "url",
      icon: LOGO_ICON_OPTIONS[0].name,
      color: "#f05a28",
      url: logoUrl,
    };
  }
  return {
    mode: "icon",
    icon: LOGO_ICON_OPTIONS[0].name,
    color: "#f05a28",
    url: "",
  };
}

function parseInitialBanner(bannerUrl?: string | null): {
  mode: BannerMode;
  presetId: string;
  url: string;
} {
  if (!bannerUrl) {
    return {
      mode: "preset",
      presetId: BANNER_PRESETS[0]?.id || "preset-1",
      url: BANNER_PRESETS[0]?.url || "",
    };
  }
  const matchingPreset = BANNER_PRESETS.find((p) => p.url === bannerUrl);
  if (matchingPreset) {
    return {
      mode: "preset",
      presetId: matchingPreset.id,
      url: matchingPreset.url,
    };
  }
  return {
    mode: "url",
    presetId: BANNER_PRESETS[0]?.id || "preset-1",
    url: bannerUrl,
  };
}

function buildDefaults(
  initial: ClientProfile | null | undefined,
  prefill: { name?: string; email?: string; phone?: string },
): ClientProfileFormValues {
  const social = initial?.socialLinks ?? {};
  const seed = (v?: string) => (initial ? "" : (v ?? ""));
  const parsedLogo = parseInitialLogo(initial?.logoUrl);
  const parsedBanner = parseInitialBanner(initial?.bannerUrl);

  return {
    displayName: initial?.displayName ?? "",
    company: initial?.company ?? "",
    logoUrl:
      initial?.logoUrl ??
      (parsedLogo.mode === "icon"
        ? `icon:${parsedLogo.icon}:${parsedLogo.color}`
        : ""),
    bannerUrl: initial?.bannerUrl ?? parsedBanner.url,
    website: initial?.website ?? "",
    industry: initial?.industry ?? "",
    location: initial?.location ?? "",
    tagline: initial?.tagline ?? "",
    foundedYear: initial?.foundedYear ? String(initial.foundedYear) : "",
    companySize: initial?.companySize ?? "",
    budgetRange: initial?.budgetRange ?? "",
    contactName: initial?.contactName ?? seed(prefill.name),
    contactEmail: initial?.contactEmail ?? seed(prefill.email),
    phone: initial?.phone ?? seed(prefill.phone),
    address: initial?.address ?? "",
    taxCode: initial?.taxCode ?? "",
    linkedin: social.linkedin ?? "",
    facebook: social.facebook ?? "",
    instagram: initial?.instagramUrl ?? "",
    description: initial?.description ?? "",
    note: initial?.note ?? "",
    brandColor: parsedLogo.color,
  };
}

export function ClientProfileForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
  onDirtyChange,
  onValuesChange,
}: Props) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const initialParsed = useMemo(
    () => parseInitialLogo(initial?.logoUrl),
    [initial],
  );

  const defaults = useMemo(
    () =>
      buildDefaults(initial, {
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
      }),
    [initial, user],
  );

  const [values, setValues] = useState<ClientProfileFormValues>(defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Logo state
  const [logoMode, setLogoMode] = useState<LogoMode>(initialParsed.mode);
  const [logoIcon, setLogoIcon] = useState(initialParsed.icon);
  const [brandColor, setBrandColor] = useState(initialParsed.color);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Banner state
  const initialBannerParsed = useMemo(
    () => parseInitialBanner(initial?.bannerUrl),
    [initial],
  );
  const [bannerMode, setBannerMode] = useState<BannerMode>(initialBannerParsed.mode);
  const [selectedPresetId, setSelectedPresetId] = useState(initialBannerParsed.presetId);
  const [bannerUrlInput, setBannerUrlInput] = useState(
    initialBannerParsed.mode === "url" ? initialBannerParsed.url : "",
  );
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(
    initial?.bannerUrl || initialBannerParsed.url,
  );
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Cropper & Recent Assets Modals
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [cropperUrl, setCropperUrl] = useState<string | null>(null);
  const [cropperType, setCropperType] = useState<"logo" | "banner">("logo");
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [recentModalCategory, setRecentModalCategory] = useState<"logo" | "banner" | null>(null);

  const dirty = useMemo(
    () =>
      (Object.keys(values) as (keyof ClientProfileFormValues)[]).some(
        (k) => values[k] !== defaults[k],
      ),
    [values, defaults],
  );

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    onValuesChange?.(values);
  }, [values, onValuesChange]);

  const set =
    (key: keyof ClientProfileFormValues) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setValues((prev) => ({ ...prev, [key]: e.target.value }));

  // Handle Logo Mode changes
  const handleLogoModeChange = (mode: LogoMode) => {
    setLogoMode(mode);
    if (mode === "icon") {
      const iconUrl = `icon:${logoIcon}:${brandColor}`;
      setValues((prev) => ({
        ...prev,
        logoUrl: iconUrl,
        brandColor,
      }));
    } else if (mode === "upload") {
      // If currently an icon, clear it so user can upload
      if (values.logoUrl.startsWith("icon:")) {
        setValues((prev) => ({ ...prev, logoUrl: "" }));
      }
    } else if (mode === "url") {
      if (values.logoUrl.startsWith("icon:")) {
        setValues((prev) => ({ ...prev, logoUrl: "" }));
      }
    }
  };

  const handleSelectIcon = (iconName: string) => {
    setLogoIcon(iconName);
    const iconUrl = `icon:${iconName}:${brandColor}`;
    setValues((prev) => ({
      ...prev,
      logoUrl: iconUrl,
      brandColor,
    }));
  };

  const handleSelectBrandColor = (color: string) => {
    setBrandColor(color);
    if (logoMode === "icon") {
      const iconUrl = `icon:${logoIcon}:${color}`;
      setValues((prev) => ({
        ...prev,
        logoUrl: iconUrl,
        brandColor: color,
      }));
    } else {
      setValues((prev) => ({ ...prev, brandColor: color }));
    }
  };

  const handleLogoFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("agency.detail.errors.invalidUrl", "File không hợp lệ"));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        t("agency.create.uploadHint", "Kích thước ảnh tối đa 5MB"),
      );
      return;
    }

    setUploadingLogo(true);
    try {
      let uploadedUrl = "";
      if (initial?.id) {
        const resp = await clientProfileService.uploadLogo(initial.id, file);
        uploadedUrl = resp.data.data.logoUrl ?? "";
      } else {
        const resp = await clientProfileService.uploadLogoDraft(file);
        uploadedUrl = resp.data.data ?? "";
      }
      setValues((prev) => ({ ...prev, logoUrl: uploadedUrl }));
      saveRecentAsset("logo", uploadedUrl);
      toast.success(t("clientProfile.logoUploadSuccess"));
    } catch (err) {
      toast.error(
        extractErrorMessage(err, t("clientProfile.logoUploadFailed")),
      );
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    setBannerMode("preset");
    const preset = BANNER_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setBannerPreviewUrl(preset.url);
      setValues((prev) => ({ ...prev, bannerUrl: preset.url }));
    }
  };

  const handleBannerFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("agency.detail.errors.invalidUrl", "File không hợp lệ"));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        t(
          "clientProfile.uploadBannerHint",
          "PNG, JPG, WEBP tối đa 5MB (Tỉ lệ khuyến nghị 16:9 hoặc 3:1)",
        ),
      );
      return;
    }

    setUploadingBanner(true);
    try {
      const { data } = await clientProfileService.uploadBannerDraft(file);
      const url = data.data;
      setBannerMode("upload");
      setBannerPreviewUrl(url);
      setValues((prev) => ({ ...prev, bannerUrl: url }));
      saveRecentAsset("banner", url);
      toast.success(
        t("workspace.settings.bannerUploadSuccess", "Đã tải ảnh bìa lên"),
      );
    } catch (err: unknown) {
      toast.error(
        extractErrorMessage(err, t("common.uploadFailed", "Không thể tải ảnh lên")),
      );
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleCropperConfirm = async (file: File) => {
    if (cropperType === "logo") {
      await handleLogoFileUpload(file);
    } else {
      await handleBannerFileUpload(file);
    }
  };

  const handleBannerUrlChange = (val: string) => {
    setBannerUrlInput(val);
    setBannerMode("url");
    setBannerPreviewUrl(val.trim() || null);
    setValues((prev) => ({ ...prev, bannerUrl: val.trim() }));
  };

  const handleClearBanner = () => {
    setBannerUrlInput("");
    const fallback = BANNER_PRESETS[0];
    setSelectedPresetId(fallback?.id || "preset-1");
    setBannerMode("preset");
    setBannerPreviewUrl(fallback?.url || null);
    setValues((prev) => ({ ...prev, bannerUrl: fallback?.url || "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isIconLogo = values.logoUrl.startsWith("icon:");
    const finalLogoUrl = isIconLogo
      ? values.logoUrl
      : normalizeUrl(values.logoUrl);

    const urls = {
      website: normalizeUrl(values.website),
      linkedin: normalizeUrl(values.linkedin),
      facebook: normalizeUrl(values.facebook),
      instagram: normalizeUrl(values.instagram),
    };

    const next: Record<string, string> = {};
    if (!values.displayName.trim()) {
      next.displayName = t("clientProfile.displayNameRequired");
    }

    if (!isIconLogo && finalLogoUrl && !isValidUrl(finalLogoUrl)) {
      next.logoUrl = t("clientProfile.invalidUrl");
    }

    for (const k of URL_FIELDS) {
      if (urls[k] && !isValidUrl(urls[k])) {
        next[k] = t("clientProfile.invalidUrl");
      }
    }

    const rawYear = values.foundedYear.trim();
    const year = rawYear ? Number(rawYear) : null;
    if (
      rawYear &&
      (!Number.isInteger(year) || year! <= 0 || year! > CURRENT_YEAR)
    ) {
      next.foundedYear = t("clientProfile.invalidYear");
    }

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setErrors({});

    const socialLinks: Record<string, string> = {};
    if (urls.linkedin) socialLinks.linkedin = urls.linkedin;
    if (urls.facebook) socialLinks.facebook = urls.facebook;

    onSubmit({
      displayName: values.displayName.trim(),
      company: values.company.trim() || undefined,
      phone: values.phone.trim() || undefined,
      note: values.note.trim() || undefined,
      logoUrl: finalLogoUrl || undefined,
      bannerUrl: values.bannerUrl || undefined,
      website: urls.website || undefined,
      industry: values.industry || undefined,
      location: values.location.trim() || undefined,
      description: values.description.trim() || undefined,
      socialLinks: Object.keys(socialLinks).length ? socialLinks : undefined,
      contactName: values.contactName.trim() || undefined,
      contactEmail: values.contactEmail.trim() || undefined,
      companySize: (values.companySize || undefined) as CompanySize | undefined,
      instagramUrl: urls.instagram || undefined,
      taxCode: values.taxCode.trim() || undefined,
      address: values.address.trim() || undefined,
      tagline: values.tagline.trim() || undefined,
      foundedYear: year ?? undefined,
      budgetRange: values.budgetRange || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SECTION 1: Basic Information */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
        <h3 className="text-sm font-semibold tracking-wide text-foreground">
          1. {t("clientProfile.sectionGeneral", "Thông tin chung")}
        </h3>

        <Input
          label={t("clientProfile.displayNameLabel", "Tên hiển thị")}
          placeholder={t(
            "clientProfile.displayNamePlaceholder",
            "VD: Cà phê Nhà Làm",
          )}
          value={values.displayName}
          onChange={set("displayName")}
          required
          error={errors.displayName}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={t("clientProfile.companyLabel", "Công ty")}
            placeholder={t("clientProfile.companyPlaceholder", "VD: Công ty TNHH Cà phê Nhà Làm")}
            value={values.company}
            onChange={set("company")}
          />
          <Input
            label={t("clientProfile.taglineLabel", "Khẩu hiệu (Tagline)")}
            placeholder={t(
              "clientProfile.taglinePlaceholder",
              "VD: Cà phê rang xay nguyên chất",
            )}
            maxLength={140}
            value={values.tagline}
            onChange={set("tagline")}
          />
        </div>
      </div>

      {/* SECTION 2 & 3: Logo, Brand Color & Banner */}
      <ClientProfileBrandingSection
        logoMode={logoMode}
        handleLogoModeChange={handleLogoModeChange}
        brandColor={brandColor}
        handleSelectBrandColor={handleSelectBrandColor}
        logoIcon={logoIcon}
        handleSelectIcon={handleSelectIcon}
        logoUrl={values.logoUrl}
        fileInputRef={fileInputRef}
        uploadingLogo={uploadingLogo}
        onLogoFileSelect={(file) => {
          setCropperFile(file);
          setCropperUrl(null);
          setCropperType("logo");
          setIsCropperOpen(true);
        }}
        onOpenLogoCropper={() => {
          setCropperUrl(values.logoUrl);
          setCropperFile(null);
          setCropperType("logo");
          setIsCropperOpen(true);
        }}
        onRemoveLogo={() => setValues((prev) => ({ ...prev, logoUrl: "" }))}
        onLogoUrlChange={(val) =>
          setValues((prev) => ({ ...prev, logoUrl: val }))
        }
        logoUrlError={errors.logoUrl}
        isValidUrl={isValidUrl}
        normalizeUrl={normalizeUrl}
        bannerMode={bannerMode}
        setBannerMode={setBannerMode}
        selectedPresetId={selectedPresetId}
        handleSelectPreset={handleSelectPreset}
        bannerUrl={values.bannerUrl}
        bannerPreviewUrl={bannerPreviewUrl}
        bannerFileInputRef={bannerFileInputRef}
        uploadingBanner={uploadingBanner}
        onBannerFileSelect={(file) => {
          setCropperFile(file);
          setCropperUrl(null);
          setCropperType("banner");
          setIsCropperOpen(true);
        }}
        onOpenBannerCropper={() => {
          setCropperUrl(bannerPreviewUrl);
          setCropperFile(null);
          setCropperType("banner");
          setIsCropperOpen(true);
        }}
        onClearBanner={handleClearBanner}
        bannerUrlInput={bannerUrlInput}
        handleBannerUrlChange={handleBannerUrlChange}
        onOpenRecentModal={(cat) => setRecentModalCategory(cat)}
      />

      {/* SECTION 4: Business & Classification */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
        <h3 className="text-sm font-semibold tracking-wide text-foreground">
          4. {t("clientProfile.sectionBusiness", "Thông tin doanh nghiệp")}
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold tracking-wide">
              {t("clientProfile.industryLabel", "Ngành nghề")}
            </Label>
            <Select value={values.industry} onChange={set("industry")}>
              <option value="">
                {t("clientProfile.industryPlaceholder", "Chọn ngành nghề")}
              </option>
              {values.industry &&
                !(WORKSPACE_INDUSTRIES as readonly string[]).includes(
                  values.industry,
                ) && <option value={values.industry}>{values.industry}</option>}
              {WORKSPACE_INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {t(`workspace.industry.${i}`)}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold tracking-wide">
              {t("clientProfile.companySizeLabel", "Quy mô công ty")}
            </Label>
            <Select
              value={values.companySize}
              onChange={set("companySize")}
            >
              <option value="">
                {t("clientProfile.companySizePlaceholder", "Chọn quy mô")}
              </option>
              {values.companySize &&
                !(COMPANY_SIZES as readonly string[]).includes(
                  values.companySize,
                ) && (
                  <option value={values.companySize}>
                    {values.companySize}
                  </option>
                )}
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
            label={t("clientProfile.foundedYearLabel", "Năm thành lập")}
            type="number"
            inputMode="numeric"
            min={1}
            max={CURRENT_YEAR}
            value={values.foundedYear}
            onChange={set("foundedYear")}
            placeholder="2020"
            error={errors.foundedYear}
          />

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold tracking-wide">
              {t("clientProfile.budgetRangeLabel", "Ngân sách marketing")}
            </Label>
            <Select
              value={values.budgetRange}
              onChange={set("budgetRange")}
            >
              <option value="">
                {t(
                  "clientProfile.budgetRangePlaceholder",
                  "Chọn khoảng ngân sách",
                )}
              </option>
              {values.budgetRange &&
                !(BUDGET_RANGES as readonly string[]).includes(
                  values.budgetRange,
                ) && (
                  <option value={values.budgetRange}>
                    {values.budgetRange}
                  </option>
                )}
              {BUDGET_RANGES.map((b) => (
                <option key={b} value={b}>
                  {t(`clientProfile.budgetRange.${b}`)}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* SECTION 5: Contact Information */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
        <h3 className="text-sm font-semibold tracking-wide text-foreground">
          5. {t("clientProfile.sectionContact", "Thông tin liên hệ")}
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={t("clientProfile.websiteLabel", "Website")}
            placeholder="https://brand.vn"
            value={values.website}
            onChange={set("website")}
            error={errors.website}
          />
          <Input
            label={t("clientProfile.phoneLabel", "Số điện thoại")}
            type="tel"
            inputMode="tel"
            placeholder="0901234567"
            value={values.phone}
            onChange={set("phone")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={t("clientProfile.contactNameLabel", "Người liên hệ")}
            placeholder="VD: Nguyễn Văn A"
            value={values.contactName}
            onChange={set("contactName")}
          />
          <Input
            label={t("clientProfile.contactEmailLabel", "Email liên hệ")}
            type="email"
            placeholder="contact@brand.vn"
            value={values.contactEmail}
            onChange={set("contactEmail")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ProvinceSelect
            label={t("clientProfile.locationLabel", "Tỉnh / Thành phố")}
            value={values.location}
            onChange={(val) =>
              setValues((prev) => ({ ...prev, location: val }))
            }
          />
          <Input
            label={t("clientProfile.taxCodeLabel", "Mã số thuế")}
            inputMode="numeric"
            placeholder="0312345678"
            value={values.taxCode}
            onChange={set("taxCode")}
          />
        </div>

        <Input
          label={t("clientProfile.addressLabel", "Địa chỉ chi tiết")}
          placeholder={t(
            "clientProfile.addressPlaceholder",
            "VD: 12 Nguyễn Huệ, Quận 1, TP.HCM",
          )}
          value={values.address}
          onChange={set("address")}
        />
      </div>

      {/* SECTION 6: Social Media & Bio */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
        <h3 className="text-sm font-semibold tracking-wide text-foreground">
          6. {t("clientProfile.sectionSocial", "Mạng xã hội & Giới thiệu")}
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label={t("clientProfile.facebookLabel", "Facebook")}
            placeholder="https://facebook.com/..."
            value={values.facebook}
            onChange={set("facebook")}
            error={errors.facebook}
          />
          <Input
            label={t("clientProfile.linkedinLabel", "LinkedIn")}
            placeholder="https://linkedin.com/in/..."
            value={values.linkedin}
            onChange={set("linkedin")}
            error={errors.linkedin}
          />
          <Input
            label={t("clientProfile.instagramLabel", "Instagram")}
            placeholder="https://instagram.com/..."
            value={values.instagram}
            onChange={set("instagram")}
            error={errors.instagram}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold tracking-wide">
            {t("clientProfile.descriptionLabel", "Mô tả / Giới thiệu thương hiệu")}
          </Label>
          <Textarea
            value={values.description}
            onChange={set("description")}
            placeholder={t(
              "clientProfile.descriptionHint",
              "Giới thiệu ngắn về thương hiệu: sản phẩm chính, khách hàng mục tiêu, định vị thị trường...",
            )}
            rows={4}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold tracking-wide">
            {t("clientProfile.noteLabel", "Ghi chú nội bộ")}
          </Label>
          <Textarea
            value={values.note}
            onChange={set("note")}
            placeholder={t("clientProfile.notePlaceholder", "Ghi chú dành riêng cho bạn khi quản lý hồ sơ này...")}
            rows={2}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="cursor-pointer"
          >
            {t("clientProfile.cancelEdit", "Hủy")}
          </Button>
        )}
        <Button
          type="submit"
          loading={submitting}
          disabled={!values.displayName.trim()}
          className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer text-white px-6 font-medium shadow-sm"
        >
          {submitLabel}
        </Button>
      </div>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        imageFile={cropperFile}
        imageUrl={cropperUrl}
        cropType={cropperType}
        onConfirm={handleCropperConfirm}
      />

      {/* Recent Assets Modal */}
      {recentModalCategory && (
        <RecentAssetsModal
          isOpen={Boolean(recentModalCategory)}
          onClose={() => setRecentModalCategory(null)}
          category={recentModalCategory}
          currentUrl={
            recentModalCategory === "logo" ? values.logoUrl : bannerPreviewUrl
          }
          onSelect={(url) => {
            if (recentModalCategory === "logo") {
              setLogoMode("upload");
              setValues((prev) => ({ ...prev, logoUrl: url }));
            } else {
              setBannerMode("upload");
              setBannerPreviewUrl(url);
              setValues((prev) => ({ ...prev, bannerUrl: url }));
            }
          }}
        />
      )}
    </form>
  );
}

export default ClientProfileForm;
