import React, { useState, useEffect } from "react";
import type { WatermarkMetadata, WatermarkPreset } from "@/types/material";
import { materialService } from "@/services/materialService";
import { Bookmark, Plus, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface WatermarkPresetSelectorProps {
  workspaceId: string;
  currentConfig: WatermarkMetadata;
  onApplyPreset: (config: WatermarkMetadata) => void;
}

export const WatermarkPresetSelector: React.FC<WatermarkPresetSelectorProps> = ({
  workspaceId,
  currentConfig,
  onApplyPreset,
}) => {
  const { t } = useTranslation();
  const [presets, setPresets] = useState<WatermarkPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Load presets on mount
  useEffect(() => {
    if (!workspaceId) return;
    setIsLoading(true);
    materialService
      .listPresets(workspaceId)
      .then((data) => {
        setPresets(data);
        // If there is a default preset, auto-apply it
        const defaultPreset = data.find((p) => p.isDefault);
        if (defaultPreset) {
          setSelectedPresetId(defaultPreset.id);
          onApplyPreset(defaultPreset.config);
        }
      })
      .catch((err) => {
        console.warn("Could not load watermark presets:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [workspaceId]);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = presets.find((p) => p.id === presetId);
    if (found) {
      onApplyPreset(found.config);
      toast.success(t("materials.watermark.presetApplied", "Đã áp dụng mẫu thiết lập"));
    }
  };

  const handleSavePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) {
      toast.error(t("materials.watermark.presetNameRequired", "Vui lòng nhập tên mẫu"));
      return;
    }

    setIsSaving(true);
    try {
      const created = await materialService.createPreset(workspaceId, {
        name: newPresetName.trim(),
        isDefault,
        config: currentConfig,
      });

      setPresets((prev) => [created, ...prev]);
      setSelectedPresetId(created.id);
      setShowSaveDialog(false);
      setNewPresetName("");
      setIsDefault(false);
      toast.success(t("materials.watermark.presetSaved", "Đã lưu mẫu cấu hình thành công"));
    } catch (err) {
      console.error("Failed to save watermark preset:", err);
      toast.error(t("materials.watermark.presetSaveFailed", "Không thể lưu mẫu cấu hình"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Bookmark className="size-3.5 text-brand-orange" />
          <span>{t("materials.watermark.brandPresets", "Mẫu thương hiệu (Preset)")}</span>
        </label>
        <button
          type="button"
          onClick={() => setShowSaveDialog(!showSaveDialog)}
          className="text-[11px] font-medium text-brand-orange hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Plus className="size-3" />
          <span>{t("materials.watermark.saveAsPreset", "Lưu mẫu mới")}</span>
        </button>
      </div>

      {showSaveDialog && (
        <form
          onSubmit={handleSavePreset}
          className="p-3 rounded-2xl border border-brand-orange/30 bg-brand-orange/5 space-y-2.5 animate-in fade-in duration-150"
        >
          <div>
            <input
              type="text"
              placeholder={t("materials.watermark.presetNamePlaceholder", "Tên mẫu (vd: Nike Góc Phải 80%)")}
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="w-full text-xs px-3 py-1.5 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-brand-orange"
              autoFocus
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-border text-brand-orange focus:ring-brand-orange"
              />
              <span>{t("materials.watermark.setAsDefault", "Đặt làm mặc định cho Client")}</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowSaveDialog(false)}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-border text-muted-foreground hover:bg-muted cursor-pointer"
              >
                {t("materials.watermark.cancelBtn", "Hủy")}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="text-[11px] px-3 py-1 rounded-lg bg-brand-orange text-white hover:bg-brand-orange/90 font-medium flex items-center gap-1 cursor-pointer"
              >
                {isSaving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                <span>{t("materials.watermark.saveBtn", "Lưu")}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="relative">
        <select
          value={selectedPresetId}
          onChange={(e) => handleSelectPreset(e.target.value)}
          disabled={isLoading || presets.length === 0}
          className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange/20 cursor-pointer disabled:opacity-50"
        >
          <option value="">
            {isLoading
              ? t("materials.watermark.loadingPresets", "Đang tải mẫu cấu hình...")
              : presets.length === 0
                ? t("materials.watermark.noPresets", "Chưa có mẫu nào — Bạn có thể tạo mẫu mới")
                : t("materials.watermark.selectPreset", "— Chọn mẫu cấu hình đã lưu —")}
          </option>
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name} {preset.isDefault ? "★ (Mặc định)" : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
