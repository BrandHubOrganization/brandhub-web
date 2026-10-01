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
import { ProfileBannerHeader } from "@/components/shared/ProfileBannerHeader";
import { cn } from "@/lib/utils";
import type { AgencyCategory, CompanySize } from "@/types/agency";
import {
  Upload,
  Link as LinkIcon,
  Sparkles,
  Image as ImageIcon,
  X,
  Globe,
  Phone,
  MapPin,
  Eye,
  Check,
  Palette,
} from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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

type LogoMode = "upload" | "url" | "icon";
type BannerMode = "upload" | "url" | "preset";

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
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("agency.detail.errors.invalidUrl"));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("agency.create.uploadHint"));
      return;
    }

    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    const objectUrl = URL.createObjectURL(file);
    setLogoFile(file);
    setLogoPreviewUrl(objectUrl);
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
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("agency.detail.errors.invalidUrl"));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t("agency.create.uploadHint"));
      return;
    }

    if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    const objectUrl = URL.createObjectURL(file);
    setBannerFile(file);
    setBannerPreviewUrl(objectUrl);
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
    if (!name.trim()) return;

    setLoading(true);
    try {
      const yearNum = foundedYear ? Number(foundedYear) : undefined;

      // 1. Initial Agency Creation
      const { data } = await agencyService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        category: category || undefined,
        companySize: companySize || undefined,
        website: website.trim() || undefined,
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
        brandColor: brandColor || undefined,
        tagline: tagline.trim() || undefined,
        foundedYear:
          yearNum && yearNum >= 1900 && yearNum <= CURRENT_YEAR
            ? yearNum
            : undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        // Logo field mapping
        logoIcon: logoMode === "icon" ? logoIcon : undefined,
        logoUrl: logoMode === "url" ? logoUrlInput.trim() || undefined : undefined,
        // Banner field mapping
        bannerUrl:
          bannerMode === "url"
            ? bannerUrlInput.trim() || undefined
            : bannerMode === "preset"
              ? effectiveBannerUrl || undefined
              : undefined,
      });

      const agencyId = data.data.id;

      // 2. Upload Logo File if uploaded from device
      if (logoMode === "upload" && logoFile) {
        try {
          await agencyService.uploadLogo(agencyId, logoFile);
        } catch (uploadErr) {
          console.error("Failed to upload logo:", uploadErr);
        }
      }

      // 3. Upload Banner File if uploaded from device
      if (bannerMode === "upload" && bannerFile) {
        try {
          await agencyService.uploadBanner(agencyId, bannerFile);
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
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label={t("agency.create.taglineLabel")}
                placeholder={t("agency.create.taglinePlaceholder")}
                maxLength={140}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />

              <RichTextInput
                label={t("agency.create.descriptionLabel")}
                placeholder={t("agency.create.descriptionPlaceholder")}
                value={description}
                onChange={setDescription}
              />
            </div>

            {/* SECTION 2: Logo & Brand Color */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-foreground">
                    2. {t("agency.create.logoLabel")} & {t("agency.create.brandColorLabel")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tùy chỉnh nhận diện thương hiệu cho công ty của bạn
                  </p>
                </div>

                {/* Mode Tabs for Logo */}
                <div className="inline-flex rounded-lg bg-muted p-1">
                  <button
                    type="button"
                    onClick={() => setLogoMode("icon")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                      logoMode === "icon"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Sparkles className="size-3.5" />
                    {t("agency.create.tabIcon")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoMode("upload")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                      logoMode === "upload"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Upload className="size-3.5" />
                    {t("agency.create.tabUpload")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoMode("url")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                      logoMode === "url"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <LinkIcon className="size-3.5" />
                    {t("agency.create.tabUrl")}
                  </button>
                </div>
              </div>

              {/* Brand Color Picker with Swatches */}
              <div className="flex flex-col gap-2 pt-1 border-t border-border">
                <Label className="text-xs font-semibold tracking-wide flex items-center gap-1.5">
                  <Palette className="size-3.5 text-brand-orange" />
                  {t("agency.create.brandColorLabel")}
                </Label>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex items-center">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="size-8 cursor-pointer rounded-lg border border-border p-0.5"
                      title="Chọn mã màu tùy biến"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {COLOR_SWATCHES.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setBrandColor(color)}
                        style={{ backgroundColor: color }}
                        className={cn(
                          "size-7 rounded-lg border transition-transform cursor-pointer flex items-center justify-center",
                          brandColor.toLowerCase() === color.toLowerCase()
                            ? "ring-2 ring-foreground ring-offset-2 scale-110 border-white"
                            : "border-transparent hover:scale-105",
                        )}
                        title={color}
                      >
                        {brandColor.toLowerCase() === color.toLowerCase() && (
                          <Check className="size-3.5 text-white drop-shadow-xs" />
                        )}
                      </button>
                    ))}
                  </div>
                  <span className="font-mono text-xs text-muted-foreground ml-auto">
                    {brandColor.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Tab 1: Logo Upload Mode */}
              {logoMode === "upload" && (
                <div className="space-y-3 pt-2">
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleLogoFileChange}
                  />

                  {logoPreviewUrl ? (
                    <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-3">
                      <div className="size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                        <img
                          src={logoPreviewUrl}
                          alt="Logo Preview"
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">
                          {logoFile?.name || "Logo đã chọn"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {logoFile
                            ? `${(logoFile.size / 1024).toFixed(1)} KB`
                            : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => logoFileInputRef.current?.click()}
                          className="text-xs cursor-pointer"
                        >
                          {t("agency.create.tabUpload")}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleClearLogoFile}
                          className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => logoFileInputRef.current?.click()}
                      className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-brand-orange/60 hover:bg-muted/30"
                    >
                      <div className="rounded-full bg-brand-orange/10 p-3 text-brand-orange mb-2">
                        <Upload className="size-5" />
                      </div>
                      <p className="text-xs font-medium text-foreground">
                        {t("agency.create.uploadClick")}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {t("agency.create.uploadHint")}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Logo URL Mode */}
              {logoMode === "url" && (
                <div className="space-y-3 pt-2">
                  <Input
                    label={t("agency.detail.logoUrlLabel")}
                    placeholder={t("agency.detail.logoUrlPlaceholder")}
                    value={logoUrlInput}
                    onChange={(e) => setLogoUrlInput(e.target.value)}
                  />
                  {logoUrlInput.trim() && (
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-2">
                      <div className="size-12 overflow-hidden rounded-lg border border-border bg-card shrink-0">
                        <img
                          src={logoUrlInput.trim()}
                          alt="Logo Preview"
                          className="size-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground truncate">
                        {logoUrlInput.trim()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Logo Icon Mode (Seeded Icons) */}
              {logoMode === "icon" && (
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-semibold tracking-wide">
                    {t("agency.create.logoIconLabel")}
                  </Label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-48 overflow-y-auto pr-1">
                    {LOGO_ICON_OPTIONS.map(({ name: iconName, Icon, label }) => {
                      const isSelected = logoIcon === iconName;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setLogoIcon(iconName)}
                          title={label || iconName}
                          className={cn(
                            "flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all cursor-pointer",
                            isSelected
                              ? "border-brand-orange bg-brand-orange/10 shadow-xs"
                              : "border-border hover:bg-muted text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <Icon
                            className="size-5"
                            style={{
                              color: isSelected ? brandColor : undefined,
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
            </div>

            {/* SECTION 3: Banner (Panner) Selection */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-wide text-foreground">
                    3. {t("agency.create.bannerLabel")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ảnh bìa khổ rộng hiển thị đầu trang hồ sơ công ty
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
                    {t("agency.create.tabPreset")}
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
                    {t("agency.create.tabUpload")}
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
                    {t("agency.create.tabUrl")}
                  </button>
                </div>
              </div>

              {/* Tab 1: Banner Preset Grid */}
              {bannerMode === "preset" && (
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {BANNER_PRESETS.map((preset) => {
                      const isSelected = selectedPresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setSelectedPresetId(preset.id)}
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
                    onChange={handleBannerFileChange}
                  />

                  {bannerPreviewUrl ? (
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
                          onClick={() => bannerFileInputRef.current?.click()}
                          className="bg-card/90 backdrop-blur-xs text-xs cursor-pointer shadow-sm"
                        >
                          {t("agency.create.tabUpload")}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleClearBannerFile}
                          className="bg-card/90 backdrop-blur-xs text-xs text-destructive hover:bg-destructive/10 cursor-pointer shadow-sm"
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => bannerFileInputRef.current?.click()}
                      className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-brand-orange/60 hover:bg-muted/30"
                    >
                      <div className="rounded-full bg-brand-orange/10 p-3 text-brand-orange mb-2">
                        <ImageIcon className="size-5" />
                      </div>
                      <p className="text-xs font-medium text-foreground">
                        {t("agency.create.uploadClick")}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {t("agency.create.uploadHint")} (Tỉ lệ khuyến nghị 16:9 hoặc 3:1)
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Banner URL Mode */}
              {bannerMode === "url" && (
                <div className="space-y-3 pt-1">
                  <Input
                    label="URL ảnh bìa"
                    placeholder="https://images.unsplash.com/..."
                    value={bannerUrlInput}
                    onChange={(e) => setBannerUrlInput(e.target.value)}
                  />
                  {bannerUrlInput.trim() && (
                    <div className="overflow-hidden rounded-xl border border-border h-28 bg-muted">
                      <img
                        src={bannerUrlInput.trim()}
                        alt="Banner preview"
                        className="size-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 4: Category, Size, Founded Year */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
              <h3 className="text-sm font-semibold tracking-wide text-foreground">
                4. Thông tin doanh nghiệp
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
                  min={1900}
                  max={CURRENT_YEAR}
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(e.target.value)}
                  placeholder="2020"
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
                5. Liên hệ & Mạng xã hội
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label={t("agency.create.websiteLabel")}
                  placeholder={t("agency.create.websitePlaceholder")}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
                <Input
                  label={t("agency.create.phoneLabel")}
                  placeholder={t("agency.create.phonePlaceholder")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  label={t("agency.create.facebookUrlLabel")}
                  placeholder="https://facebook.com/..."
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                />
                <Input
                  label={t("agency.create.linkedinUrlLabel")}
                  placeholder="https://linkedin.com/..."
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
                <Input
                  label={t("agency.create.instagramUrlLabel")}
                  placeholder="https://instagram.com/..."
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
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
                loading={loading}
                disabled={!name.trim()}
                className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer text-white px-6 font-medium shadow-sm"
              >
                {t("agency.create.submit")}
              </Button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Profile Preview (Sticky) */}
        <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Eye className="size-3.5 text-brand-orange" />
              {t("agency.create.previewTitle")}
            </span>
            <span className="rounded-full bg-brand-orange/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-orange">
              {t("agency.create.previewBadge")}
            </span>
          </div>

          {/* Standardized Profile Header Card Preview */}
          <ProfileBannerHeader
            bannerUrl={effectiveBannerUrl}
            bannerEmptyLabel={t("agency.detail.bannerEmptyLabel")}
            canEditBanner={false}
            canEditLogo={false}
            title={name.trim() || t("agency.create.previewNameFallback")}
            subtitle={tagline.trim() || t("agency.create.previewSubtitleFallback")}
            badges={
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {category && (
                  <span className="inline-flex items-center rounded-full bg-brand-orange/10 px-2.5 py-0.5 text-xs font-medium text-brand-orange">
                    {t(`agency.category.${category}`)}
                  </span>
                )}
                {companySize && (
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {t(`agency.companySize.${companySize}`)}
                  </span>
                )}
                {foundedYear && (
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    Thành lập {foundedYear}
                  </span>
                )}
              </div>
            }
            logo={
              effectiveLogoUrl ? (
                <img
                  src={effectiveLogoUrl}
                  alt={name || "Agency Logo"}
                  className="size-full object-cover"
                />
              ) : (
                <div
                  className="flex size-full items-center justify-center transition-colors"
                  style={{
                    backgroundColor: `${brandColor}18`,
                  }}
                >
                  <CurrentIcon
                    className="size-10 sm:size-12 transition-transform"
                    style={{
                      color: brandColor || "#f05a28",
                    }}
                  />
                </div>
              )
            }
          >
            <div className="space-y-4 pt-2">
              {/* Description preview */}
              {description.trim() ? (
                <div className="border-t border-border pt-4">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    {t("agency.create.previewAbout")}
                  </h4>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-xs text-foreground/85 line-clamp-4 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                </div>
              ) : (
                <div className="border-t border-border pt-3 text-center text-xs text-muted-foreground/60 italic">
                  Chưa có mô tả công ty
                </div>
              )}

              {/* Contact info preview */}
              {(website || phone || location) && (
                <div className="border-t border-border pt-3 space-y-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("agency.create.previewContact")}
                  </h4>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {website && (
                      <div className="flex items-center gap-2 truncate">
                        <Globe className="size-3.5 shrink-0 text-brand-orange" />
                        <span className="truncate text-foreground/80">{website}</span>
                      </div>
                    )}
                    {phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="size-3.5 shrink-0 text-brand-orange" />
                        <span className="text-foreground/80">{phone}</span>
                      </div>
                    )}
                    {location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3.5 shrink-0 text-brand-orange" />
                        <span className="text-foreground/80">{location}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Social badges preview */}
              {(facebookUrl || linkedinUrl || instagramUrl) && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {facebookUrl && (
                    <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                      Facebook
                    </span>
                  )}
                  {linkedinUrl && (
                    <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-600 dark:text-sky-400">
                      LinkedIn
                    </span>
                  )}
                  {instagramUrl && (
                    <span className="rounded-md bg-pink-500/10 px-2 py-0.5 text-[10px] font-medium text-pink-600 dark:text-pink-400">
                      Instagram
                    </span>
                  )}
                </div>
              )}
            </div>
          </ProfileBannerHeader>
        </div>
      </div>
    </PageWrapper>
  );
}

export default CreateAgencyPage;
