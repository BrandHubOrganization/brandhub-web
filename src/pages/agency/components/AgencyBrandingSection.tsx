import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOGO_ICON_OPTIONS } from "@/pages/agency/logoIcons";
import { BANNER_PRESETS } from "@/pages/agency/bannerPresets";
import { cn } from "@/lib/utils";
import {
  Upload,
  Link as LinkIcon,
  Sparkles,
  Image as ImageIcon,
  X,
  Check,
  Palette,
  Crop,
  History,
} from "lucide-react";

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

export type LogoMode = "upload" | "url" | "icon";
export type BannerMode = "upload" | "url" | "preset";

interface AgencyBrandingSectionProps {
  logoMode: LogoMode;
  setLogoMode: (mode: LogoMode) => void;
  brandColor: string;
  setBrandColor: (color: string) => void;
  logoIcon: string;
  setLogoIcon: (icon: string) => void;
  logoPreviewUrl: string;
  logoFile: File | null;
  logoFileInputRef: React.RefObject<HTMLInputElement | null>;
  handleLogoFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearLogoFile: () => void;
  logoUrlInput: string;
  setLogoUrlInput: (url: string) => void;
  onOpenLogoCropper: () => void;
  onOpenLogoRecent: () => void;

  bannerMode: BannerMode;
  setBannerMode: (mode: BannerMode) => void;
  selectedPresetId: string;
  setSelectedPresetId: (id: string) => void;
  bannerPreviewUrl: string;
  bannerFile: File | null;
  bannerFileInputRef: React.RefObject<HTMLInputElement | null>;
  handleBannerFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearBannerFile: () => void;
  bannerUrlInput: string;
  setBannerUrlInput: (url: string) => void;
  onOpenBannerCropper: () => void;
  onOpenBannerRecent: () => void;
}

export const AgencyBrandingSection: React.FC<AgencyBrandingSectionProps> = ({
  logoMode,
  setLogoMode,
  brandColor,
  setBrandColor,
  logoIcon,
  setLogoIcon,
  logoPreviewUrl,
  logoFile,
  logoFileInputRef,
  handleLogoFileChange,
  handleClearLogoFile,
  logoUrlInput,
  setLogoUrlInput,
  onOpenLogoCropper,
  onOpenLogoRecent,

  bannerMode,
  setBannerMode,
  selectedPresetId,
  setSelectedPresetId,
  bannerPreviewUrl,
  bannerFileInputRef,
  handleBannerFileChange,
  handleClearBannerFile,
  bannerUrlInput,
  setBannerUrlInput,
  onOpenBannerCropper,
  onOpenBannerRecent,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* SECTION 2: Logo & Brand Color */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-foreground">
              2. {t("agency.create.logoLabel")} & {t("agency.create.brandColorLabel")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("agency.create.logoDesc", "Tùy chỉnh nhận diện thương hiệu cho công ty của bạn")}
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
                title={t("agency.create.customColorTitle", "Chọn mã màu tùy biến")}
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
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110 border-transparent"
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
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onOpenLogoCropper}
                    className="text-xs cursor-pointer gap-1.5 text-brand-orange border-brand-orange/30 hover:bg-brand-orange/10"
                  >
                    <Crop className="size-3.5" />
                    Cắt / Đổ màu
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onOpenLogoRecent}
                    className="text-xs cursor-pointer gap-1.5"
                  >
                    <History className="size-3.5" />
                    Logo cũ
                  </Button>
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
              <div>
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

                <div className="flex justify-center mt-2.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onOpenLogoRecent}
                    className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
                  >
                    <History className="size-3.5" />
                    Chọn từ logo đã dùng trước đây
                  </Button>
                </div>
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

      {/* SECTION 3: Banner Selection */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-foreground">
              3. {t("agency.create.bannerLabel")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("agency.create.bannerDesc", "Ảnh bìa khổ rộng hiển thị đầu trang hồ sơ công ty")}
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
                <div className="absolute top-2 right-2 flex flex-wrap items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onOpenBannerCropper}
                    className="bg-card/90 backdrop-blur-xs text-xs cursor-pointer shadow-sm gap-1.5 text-brand-orange border-brand-orange/30 hover:bg-brand-orange/10"
                  >
                    <Crop className="size-3.5" />
                    Cắt / Đổ màu
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onOpenBannerRecent}
                    className="bg-card/90 backdrop-blur-xs text-xs cursor-pointer shadow-sm gap-1.5"
                  >
                    <History className="size-3.5" />
                    Ảnh bìa cũ
                  </Button>
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
              <div>
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
                    {t(
                      "agency.create.uploadBannerHint",
                      "PNG, JPG, WEBP tối đa 5MB (Tỉ lệ khuyến nghị 16:9 hoặc 3:1)",
                    )}
                  </p>
                </div>

                <div className="flex justify-center mt-2.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onOpenBannerRecent}
                    className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
                  >
                    <History className="size-3.5" />
                    Chọn từ ảnh bìa đã dùng trước đây
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Banner URL Mode */}
        {bannerMode === "url" && (
          <div className="space-y-3 pt-1">
            <Input
              label={t("agency.create.bannerUrlLabel", "URL ảnh bìa")}
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
    </>
  );
};
