import React, { useRef } from "react";
import type { BrandAssetItem } from "@/types/material";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BrandLogoSelectorProps {
  brandAssets: BrandAssetItem[];
  selectedLogoId: string | null;
  selectedLogoUrl: string | null;
  onSelect: (logoId: string | null, logoUrl: string) => void;
}

export const BrandLogoSelector: React.FC<BrandLogoSelectorProps> = ({
  brandAssets,
  selectedLogoId,
  selectedLogoUrl,
  onSelect,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onSelect(null, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const isCustomSelected = !selectedLogoId && !!selectedLogoUrl;

  return (
    <div className="space-y-3">
      {brandAssets.length === 0 ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
          <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <span>{t("materials.watermark.noLogoWarning")}</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
          {brandAssets.map((asset) => {
            const isSelected = selectedLogoId === asset.id;

            return (
              <button
                key={asset.id}
                type="button"
                onClick={() => onSelect(asset.id, asset.url)}
                className={`flex items-center gap-2.5 p-2 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? "border-brand-orange bg-brand-orange/10 ring-2 ring-brand-orange/30 shadow-xs"
                    : "border-border bg-card hover:bg-muted/60"
                }`}
              >
                <div className="size-10 rounded-lg bg-zinc-950/5 dark:bg-zinc-900 border border-border/50 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {asset.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {asset.source}
                  </p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="size-4 text-brand-orange shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Upload temporary logo action */}
      <div className="pt-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleCustomUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed text-xs font-medium cursor-pointer transition-colors ${
            isCustomSelected
              ? "border-brand-orange bg-brand-orange/10 text-brand-orange ring-1 ring-brand-orange/40"
              : "border-border hover:border-brand-orange/60 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Upload className="size-4" />
          <span>{t("materials.watermark.uploadLogoPrompt")}</span>
        </button>
      </div>
    </div>
  );
};
