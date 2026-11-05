import { useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Check, ImagePlus, Link2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SurveyBannerCardProps {
  bannerUrl: string;
  onBannerChange: (url: string) => void;
}

function compressBannerImage(file: File, onDone: (dataUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const maxW = 1200;
      const maxH = 320;
      const scale = Math.max(maxW / img.width, maxH / img.height);
      const targetW = Math.min(maxW, Math.round(img.width * Math.min(1, scale)));
      const targetH = Math.min(maxH, Math.round(img.height * Math.min(1, scale)));
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const ratio = Math.max(targetW / img.width, targetH / img.height);
      const drawW = img.width * ratio;
      const drawH = img.height * ratio;
      ctx.drawImage(img, (targetW - drawW) / 2, (targetH - drawH) / 2, drawW, drawH);
      onDone(canvas.toDataURL("image/jpeg", 0.85));
    };
    if (typeof reader.result === "string") img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

export function SurveyBannerCard({ bannerUrl, onBannerChange }: SurveyBannerCardProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlBox, setShowUrlBox] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) compressBannerImage(file, onBannerChange);
    e.target.value = "";
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onBannerChange(trimmed);
    setUrlInput("");
    setShowUrlBox(false);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {bannerUrl ? (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <img
            src={bannerUrl}
            alt="Survey Banner"
            className="h-36 sm:h-48 w-full object-cover"
          />
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/85 p-1 shadow-xs backdrop-blur-sm">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-7 gap-1.5 px-2.5 text-xs font-medium text-foreground"
              title={t("tasks.survey.changeBanner")}
            >
              <ImagePlus className="size-3.5 text-brand-orange" />
              <span>{t("tasks.survey.changeBanner")}</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onBannerChange("")}
              className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title={t("tasks.survey.removeBanner")}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-dashed border-border/80 bg-card/50 px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 gap-1.5 text-xs font-medium hover:border-brand-orange/60 hover:text-brand-orange"
            >
              <ImagePlus className="size-3.5 text-brand-orange" />
              <span>{t("tasks.survey.addBanner")}</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowUrlBox((v) => !v)}
              className="size-8 text-muted-foreground hover:text-brand-orange"
              title={t("tasks.survey.bannerUrlPlaceholder")}
            >
              <Link2 className="size-3.5" />
            </Button>
          </div>
          <div className={`flex flex-1 items-center gap-1.5 sm:max-w-xs ${showUrlBox ? "flex" : "hidden sm:flex"}`}>
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyUrl()}
              placeholder={t("tasks.survey.bannerUrlPlaceholder")}
              className="h-8 bg-background text-xs"
            />
            {urlInput.trim() && (
              <Button type="button" variant="orange" size="icon" onClick={handleApplyUrl} className="size-8 shrink-0">
                <Check className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
