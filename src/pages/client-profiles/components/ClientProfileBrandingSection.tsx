import React from "react";
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
  Crop,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOGO_ICON_OPTIONS } from "@/pages/agency/logoIcons";
import { BANNER_PRESETS } from "@/pages/agency/bannerPresets";
import { cn } from "@/lib/utils";

export const COLOR_SWATCHES = [
  "#f05a28", // Brand Orange
  "#2563eb", // Royal Blue
  "#059669", // Emerald
  "#7c3aed", // Violet
  "#e11d48", // Rose
  "#d97706", // Amber
  "#0891b2", // Cyan
  "#475569", // Slate
];

export type LogoMode = "icon" | "upload" | "url";
export type BannerMode = "preset" | "upload" | "url";

interface ClientProfileBrandingSectionProps {
  logoMode: LogoMode;
  handleLogoModeChange: (mode: LogoMode) => void;
  brandColor: string;
  handleSelectBrandColor: (color: string) => void;
  logoIcon: string;
  handleSelectIcon: (iconName: string) => void;
  logoUrl: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  uploadingLogo: boolean;
  onLogoFileSelect: (file: File) => void;
  onOpenLogoCropper: () => void;
  onRemoveLogo: () => void;
  onLogoUrlChange: (val: string) => void;
  logoUrlError?: string;
  isValidUrl: (url: string) => boolean;
  normalizeUrl: (url: string) => string;

  bannerMode: BannerMode;
  setBannerMode: (mode: BannerMode) => void;
  selectedPresetId: string;
  handleSelectPreset: (presetId: string) => void;
  bannerUrl: string;
  bannerPreviewUrl: string | null;
  bannerFileInputRef: React.RefObject<HTMLInputElement | null>;
  uploadingBanner: boolean;
  onBannerFileSelect: (file: File) => void;
  onOpenBannerCropper: () => void;
  onClearBanner: () => void;
  bannerUrlInput: string;
  handleBannerUrlChange: (val: string) => void;
  onOpenRecentModal: (category: "logo" | "banner") => void;
}

export const ClientProfileBrandingSection: React.FC<
  ClientProfileBrandingSectionProps
> = ({
  logoMode,
  handleLogoModeChange,
  brandColor,
  handleSelectBrandColor,
  logoIcon,
  handleSelectIcon,
  logoUrl,
  fileInputRef,
  uploadingLogo,
  onLogoFileSelect,
  onOpenLogoCropper,
  onRemoveLogo,
  onLogoUrlChange,
  logoUrlError,
  isValidUrl,
  normalizeUrl,

  bannerMode,
  setBannerMode,
  selectedPresetId,
  handleSelectPreset,
  bannerUrl,
  bannerPreviewUrl,
  bannerFileInputRef,
  uploadingBanner,
  onBannerFileSelect,
  onOpenBannerCropper,
  onClearBanner,
  bannerUrlInput,
  handleBannerUrlChange,
  onOpenRecentModal,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* SECTION 2: Logo & Brand Color */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-foreground">
              2. {t("clientProfile.sectionLogo", "Logo đại diện & Màu sắc")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t(
                "clientProfile.sectionLogoDesc",
                "Tùy chỉnh nhận diện thương hiệu cho hồ sơ của bạn",
              )}
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
                  aria-label={t(
                    "clientProfile.colorSwatchAria",
                    "Màu {{color}}",
                    { color },
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Tab 1: Built-in Icons Grid */}
        {logoMode === "icon" && (
          <div className="space-y-2 pt-1 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {t(
                "clientProfile.iconPrompt",
                "Chọn một biểu tượng phù hợp với ngành hàng hoặc tính cách thương hiệu:",
              )}
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
                if (file) {
                  onLogoFileSelect(file);
                }
                e.target.value = "";
              }}
            />

            {!logoUrl || logoUrl.startsWith("icon:") ? (
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
                  src={logoUrl}
                  alt="Logo Preview"
                  className="size-16 rounded-lg object-cover border border-border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {t("clientProfile.uploadedLogo", "Logo đã tải lên")}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {logoUrl}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs cursor-pointer gap-1"
                      onClick={onOpenLogoCropper}
                    >
                      <Crop className="size-3 text-brand-orange" />
                      Cắt / Đổ màu
                    </Button>
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
                      onClick={onRemoveLogo}
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
              value={logoUrl.startsWith("icon:") ? "" : logoUrl}
              onChange={(e) => onLogoUrlChange(e.target.value)}
              error={logoUrlError}
              iconPrefix={<LinkIcon className="size-4" />}
            />

            {logoUrl &&
              !logoUrl.startsWith("icon:") &&
              isValidUrl(normalizeUrl(logoUrl)) && (
                <div className="flex items-center gap-3 rounded-lg border border-border p-2.5 bg-muted/20">
                  <img
                    src={normalizeUrl(logoUrl)}
                    alt="Logo Preview"
                    className="size-12 rounded-md object-cover border border-border"
                  />
                  <div className="text-xs text-muted-foreground flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {t("clientProfile.urlPreview", "Xem trước ảnh URL")}
                    </p>
                    <p className="truncate text-[11px]">{logoUrl}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 text-destructive"
                    onClick={onRemoveLogo}
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
            <button
              type="button"
              onClick={() => onOpenRecentModal("banner")}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <History className="size-3.5 text-brand-orange" />
              Ảnh cũ đã dùng
            </button>
          </div>
        </div>

        {/* Tab 1: Banner Preset Grid */}
        {bannerMode === "preset" && (
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {BANNER_PRESETS.map((preset) => {
                const isSelected =
                  bannerUrl === preset.url || selectedPresetId === preset.id;
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
                  onBannerFileSelect(file);
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
                    onClick={onOpenBannerCropper}
                    className="bg-card/90 backdrop-blur-xs text-xs cursor-pointer shadow-sm gap-1"
                  >
                    <Crop className="size-3 text-brand-orange" />
                    Cắt / Đổ màu
                  </Button>
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
                    onClick={onClearBanner}
                    className="bg-card/90 backdrop-blur-xs text-xs text-destructive hover:bg-destructive/10 cursor-pointer shadow-sm"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => bannerFileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/80 p-8 text-center hover:border-brand-orange/60 hover:bg-muted/30 cursor-pointer transition-colors"
              >
                {uploadingBanner ? (
                  <Loader2 className="size-8 text-brand-orange animate-spin" />
                ) : (
                  <ImageIcon className="size-8 text-muted-foreground/60" />
                )}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-foreground">
                    {uploadingBanner
                      ? t("clientProfile.uploading", "Đang tải ảnh lên...")
                      : t(
                          "clientProfile.uploadBannerPrompt",
                          "Nhấn để tải lên ảnh bìa tùy chỉnh",
                        )}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {t(
                      "clientProfile.uploadBannerHint",
                      "PNG, JPG hoặc WEBP (tỉ lệ 16:9 hoặc 3:1, tối đa 5MB)",
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: URL Direct Input */}
        {bannerMode === "url" && (
          <div className="space-y-3 pt-1">
            <Input
              label={t("clientProfile.bannerUrlLabel", "Đường dẫn ảnh bìa (URL)")}
              placeholder="https://images.unsplash.com/photo-..."
              value={bannerUrlInput}
              onChange={(e) => handleBannerUrlChange(e.target.value)}
              iconPrefix={<LinkIcon className="size-4" />}
            />
            {bannerPreviewUrl && (
              <div className="relative overflow-hidden rounded-xl border border-border h-28 bg-muted">
                <img
                  src={bannerPreviewUrl}
                  alt="Banner preview"
                  className="size-full object-cover"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
