import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Upload,
  Link as LinkIcon,
  X,
  Palette,
  Loader2,
  Check,
  ImageIcon,
} from "lucide-react";
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
import { LOGO_ICON_OPTIONS } from "@/pages/agency/logoIcons";
import { BANNER_PRESETS } from "@/pages/agency/bannerPresets";
import { clientProfileService } from "@/services/clientProfileService";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import type { CompanySize } from "@/types/agency";
import type {
  ClientProfile,
  UpdateClientProfileRequest,
} from "@/types/clientProfile";
import { extractErrorMessage } from "@/utils/error";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const CURRENT_YEAR = new Date().getFullYear();

const COLOR_SWATCHES = [
  "#f05a28", // Brand Orange
  "#2563eb", // Royal Blue
  "#059669", // Emerald
  "#7c3aed", // Violet
  "#e11d48", // Rose
  "#d97706", // Amber
  "#0891b2", // Cyan
  "#475569", // Slate
];

type LogoMode = "icon" | "upload" | "url";
type BannerMode = "preset" | "upload" | "url";

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
      if (initial?.id) {
        const resp = await clientProfileService.uploadLogo(initial.id, file);
        const uploadedUrl = resp.data.data.logoUrl ?? "";
        setValues((prev) => ({ ...prev, logoUrl: uploadedUrl }));
      } else {
        const resp = await clientProfileService.uploadLogoDraft(file);
        const uploadedUrl = resp.data.data ?? "";
        setValues((prev) => ({ ...prev, logoUrl: uploadedUrl }));
      }
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
      (!Number.isInteger(year) || year! < 1800 || year! > CURRENT_YEAR)
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

      {/* SECTION 2: Logo & Brand Color */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-foreground">
              2. {t("clientProfile.sectionLogo", "Logo đại diện & Màu sắc")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("clientProfile.sectionLogoDesc", "Tùy chỉnh nhận diện thương hiệu cho hồ sơ của bạn")}
            </p>
          </div>

          {/* Mode Tabs for Logo */}
          <div className="inline-flex rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => handleLogoModeChange("icon")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                logoMode === "icon"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Sparkles className="size-3.5" />
              {t("clientProfile.tabIcon", "Icon có sẵn")}
            </button>
            <button
              type="button"
              onClick={() => handleLogoModeChange("upload")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                logoMode === "upload"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Upload className="size-3.5" />
              {t("clientProfile.tabUpload", "Tải ảnh lên")}
            </button>
            <button
              type="button"
              onClick={() => handleLogoModeChange("url")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                logoMode === "url"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LinkIcon className="size-3.5" />
              {t("clientProfile.tabUrl", "Chọn link (URL)")}
            </button>
          </div>
        </div>

        {/* Brand Color Picker with Swatches */}
        <div className="flex flex-col gap-2 pt-1 border-t border-border">
          <Label className="text-xs font-semibold tracking-wide flex items-center gap-1.5">
            <Palette className="size-3.5 text-brand-orange" />
            {t("clientProfile.brandColorLabel", "Màu sắc thương hiệu")}
          </Label>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex items-center">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => handleSelectBrandColor(e.target.value)}
                className="size-8 cursor-pointer rounded-lg border border-border p-0.5 bg-card"
                title={t("clientProfile.customColorTitle", "Chọn mã màu tùy biến")}
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {COLOR_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleSelectBrandColor(color)}
                  style={{ backgroundColor: color }}
                  className={cn(
                    "size-7 rounded-lg border transition-transform cursor-pointer flex items-center justify-center",
                    brandColor.toLowerCase() === color.toLowerCase()
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110 border-transparent"
                      : "border-transparent hover:scale-105",
                  )}
                  aria-label={t("clientProfile.colorSwatchAria", "Màu {{color}}", { color })}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Tab 1: Built-in Icons Grid */}
        {logoMode === "icon" && (
          <div className="space-y-2 pt-1 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {t("clientProfile.iconPrompt", "Chọn một biểu tượng phù hợp với ngành hàng hoặc tính cách thương hiệu:")}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2 max-h-52 overflow-y-auto p-1 border rounded-lg border-border/60 bg-muted/20">
              {LOGO_ICON_OPTIONS.map(({ name: iconName, label, Icon }) => {
                const isSelected = logoIcon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => handleSelectIcon(iconName)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border p-2.5 transition-all text-center cursor-pointer",
                      isSelected
                        ? "border-brand-orange bg-brand-orange/10 ring-2 ring-brand-orange/30 shadow-xs"
                        : "border-border/60 bg-card hover:border-brand-orange/50 hover:bg-muted/40",
                    )}
                  >
                    <Icon
                      className="size-6 transition-transform group-hover:scale-110"
                      style={{
                        color: isSelected ? brandColor : "currentColor",
                      }}
                    />
                    <span
                      className={cn(
                        "text-[10px] truncate max-w-full",
                        isSelected
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {label || iconName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Upload Image */}
        {logoMode === "upload" && (
          <div className="space-y-3 pt-1 border-t border-border">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleLogoFileUpload(file);
                e.target.value = "";
              }}
            />

            {!values.logoUrl || values.logoUrl.startsWith("icon:") ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/80 p-6 text-center hover:border-brand-orange/60 hover:bg-muted/30 cursor-pointer transition-colors"
              >
                {uploadingLogo ? (
                  <Loader2 className="size-8 text-brand-orange animate-spin" />
                ) : (
                  <Upload className="size-8 text-muted-foreground/60" />
                )}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-foreground">
                    {uploadingLogo
                      ? t("clientProfile.uploading", "Đang tải ảnh lên...")
                      : t(
                          "clientProfile.uploadPrompt",
                          "Nhấn để chọn ảnh logo từ thiết bị",
                        )}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {t(
                      "clientProfile.uploadHint",
                      "PNG, JPG, SVG hoặc WEBP (tối đa 5MB)",
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-3">
                <img
                  src={values.logoUrl}
                  alt="Logo Preview"
                  className="size-16 rounded-lg object-cover border border-border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {t("clientProfile.uploadedLogo", "Logo đã tải lên")}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {values.logoUrl}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {t("clientProfile.changeImage", "Đổi ảnh khác")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                      onClick={() =>
                        setValues((prev) => ({ ...prev, logoUrl: "" }))
                      }
                    >
                      <X className="mr-1 size-3.5" />
                      {t("clientProfile.removeImage", "Xóa ảnh")}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: URL Direct Input */}
        {logoMode === "url" && (
          <div className="space-y-3 pt-1 border-t border-border">
            <Input
              label={t("clientProfile.logoUrlLabel", "Đường dẫn ảnh logo (URL)")}
              placeholder="https://brand.vn/logo.png"
              value={values.logoUrl.startsWith("icon:") ? "" : values.logoUrl}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, logoUrl: e.target.value }))
              }
              error={errors.logoUrl}
              iconPrefix={<LinkIcon className="size-4" />}
            />

            {values.logoUrl &&
              !values.logoUrl.startsWith("icon:") &&
              isValidUrl(normalizeUrl(values.logoUrl)) && (
                <div className="flex items-center gap-3 rounded-lg border border-border p-2.5 bg-muted/20">
                  <img
                    src={normalizeUrl(values.logoUrl)}
                    alt="Logo Preview"
                    className="size-12 rounded-md object-cover border border-border"
                  />
                  <div className="text-xs text-muted-foreground flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {t("clientProfile.urlPreview", "Xem trước ảnh URL")}
                    </p>
                    <p className="truncate text-[11px]">{values.logoUrl}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 text-destructive"
                    onClick={() =>
                      setValues((prev) => ({ ...prev, logoUrl: "" }))
                    }
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              )}
          </div>
        )}
      </div>

      {/* SECTION 3: Banner / Cover Image */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-foreground">
              3. {t("clientProfile.sectionBanner", "Ảnh bìa thương hiệu")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t(
                "clientProfile.sectionBannerDesc",
                "Ảnh bìa khổ rộng hiển thị đầu trang hồ sơ thương hiệu",
              )}
            </p>
          </div>

          {/* Mode Tabs for Banner */}
          <div className="inline-flex rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setBannerMode("preset")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                bannerMode === "preset"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Sparkles className="size-3.5" />
              {t("clientProfile.tabPreset", "Ảnh có sẵn")}
            </button>
            <button
              type="button"
              onClick={() => setBannerMode("upload")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                bannerMode === "upload"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Upload className="size-3.5" />
              {t("clientProfile.tabUpload", "Tải ảnh lên")}
            </button>
            <button
              type="button"
              onClick={() => setBannerMode("url")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                bannerMode === "url"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LinkIcon className="size-3.5" />
              {t("clientProfile.tabUrl", "Chọn link (URL)")}
            </button>
          </div>
        </div>

        {/* Tab 1: Banner Preset Grid */}
        {bannerMode === "preset" && (
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {BANNER_PRESETS.map((preset) => {
                const isSelected =
                  values.bannerUrl === preset.url ||
                  selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border text-left transition-all cursor-pointer h-20",
                      isSelected
                        ? "ring-2 ring-brand-orange border-brand-orange shadow-sm"
                        : "border-border hover:opacity-90",
                    )}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="size-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 flex flex-col justify-end">
                      <span className="text-[11px] font-medium text-white truncate drop-shadow-xs">
                        {preset.name}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 rounded-full bg-brand-orange p-1 text-white shadow-xs">
                        <Check className="size-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Banner Upload Mode */}
        {bannerMode === "upload" && (
          <div className="space-y-3 pt-1">
            <input
              ref={bannerFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleBannerFileUpload(file);
                }
                e.target.value = "";
              }}
            />

            {bannerPreviewUrl && bannerMode === "upload" ? (
              <div className="relative overflow-hidden rounded-xl border border-border">
                <img
                  src={bannerPreviewUrl}
                  alt="Banner Preview"
                  className="h-32 w-full object-cover"
                />
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingBanner}
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="bg-card/90 backdrop-blur-xs text-xs cursor-pointer shadow-sm"
                  >
                    {uploadingBanner ? (
                      <Loader2 className="size-3 animate-spin mr-1" />
                    ) : null}
                    {t("clientProfile.changeBanner", "Đổi ảnh bìa khác")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={uploadingBanner}
                    onClick={handleClearBanner}
                    className="bg-card/90 backdrop-blur-xs text-xs text-destructive hover:bg-destructive/10 cursor-pointer shadow-sm"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !uploadingBanner && bannerFileInputRef.current?.click()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-brand-orange/60 hover:bg-muted/30",
                  uploadingBanner && "opacity-60 pointer-events-none",
                )}
              >
                <div className="rounded-full bg-brand-orange/10 p-3 text-brand-orange mb-2">
                  {uploadingBanner ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <ImageIcon className="size-5" />
                  )}
                </div>
                <p className="text-xs font-medium text-foreground">
                  {uploadingBanner
                    ? t("clientProfile.uploadingBanner", "Đang tải ảnh bìa lên...")
                    : t(
                        "clientProfile.bannerClick",
                        "Nhấp để chọn file ảnh bìa hoặc kéo thả vào đây",
                      )}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {t(
                    "clientProfile.uploadBannerHint",
                    "PNG, JPG, WEBP tối đa 5MB (Tỉ lệ khuyến nghị 16:9 hoặc 3:1)",
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Banner URL Mode */}
        {bannerMode === "url" && (
          <div className="space-y-3 pt-1">
            <Input
              label={t("clientProfile.bannerUrlLabel", "URL ảnh bìa")}
              placeholder="https://images.unsplash.com/..."
              value={bannerUrlInput}
              onChange={(e) => handleBannerUrlChange(e.target.value)}
              iconPrefix={<LinkIcon className="size-4" />}
            />
            {bannerUrlInput.trim() && (
              <div className="overflow-hidden rounded-xl border border-border h-28 bg-muted relative">
                <img
                  src={bannerUrlInput.trim()}
                  alt="Banner preview"
                  className="size-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-card/90 backdrop-blur-xs text-xs text-destructive hover:bg-destructive/10 cursor-pointer h-7"
                  onClick={handleClearBanner}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

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
            min={1800}
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
    </form>
  );
}

export default ClientProfileForm;
