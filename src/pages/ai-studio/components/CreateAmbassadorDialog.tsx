import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, UserRound, Sparkles } from "lucide-react";
import type {
  InstantIdSettings,
  ModelQualityTier,
  PosePreservation,
} from "../types/ambassador";

export interface CreateAmbassadorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    faceImageUrl: string,
    instantIdSettings: InstantIdSettings,
  ) => void;
}

const POSE_OPTIONS: PosePreservation[] = ["LOW", "MEDIUM", "HIGH"];
const QUALITY_OPTIONS: ModelQualityTier[] = ["STANDARD", "HIGH", "ULTRA"];

export function CreateAmbassadorDialog({
  isOpen,
  onClose,
  onSubmit,
}: CreateAmbassadorDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [facePreviewUrl, setFacePreviewUrl] = useState("");
  const [identityStrength, setIdentityStrength] = useState(75);
  const [posePreservation, setPosePreservation] =
    useState<PosePreservation>("MEDIUM");
  const [qualityTier, setQualityTier] = useState<ModelQualityTier>("HIGH");
  const [negativePrompt, setNegativePrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelected(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setFacePreviewUrl(URL.createObjectURL(file));
  }

  function resetForm() {
    setName("");
    setFacePreviewUrl("");
    setIdentityStrength(75);
    setPosePreservation("MEDIUM");
    setQualityTier("HIGH");
    setNegativePrompt("");
  }

  function handleSubmit() {
    if (!name.trim() || !facePreviewUrl) return;
    onSubmit(name.trim(), facePreviewUrl, {
      identityStrength,
      posePreservation,
      qualityTier,
      negativePrompt: negativePrompt.trim() || undefined,
    });
    resetForm();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t("aiStudio.ambassadors.createTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="ambassador-name">
              {t("aiStudio.ambassadors.nameLabel")}
            </Label>
            <Input
              id="ambassador-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("aiStudio.ambassadors.namePlaceholder")}
            />
          </div>

          {/* D17-16: Face Upload for Ambassador */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <UserRound className="size-3.5" />
              {t("aiStudio.ambassadors.faceUploadLabel")}
            </Label>
            <p className="text-muted-foreground text-2xs">
              {t("aiStudio.ambassadors.faceUploadHint")}
            </p>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileSelected(e.dataTransfer.files);
              }}
              className="border-border hover:border-brand-orange flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed p-4 text-center transition-colors"
            >
              {facePreviewUrl ? (
                <img
                  src={facePreviewUrl}
                  alt="Face preview"
                  className="size-20 rounded-full object-cover"
                />
              ) : (
                <>
                  <UploadCloud className="text-muted-foreground size-5" />
                  <span className="text-muted-foreground text-2xs font-medium">
                    {t("aiStudio.ambassadors.faceUploadDropzone")}
                  </span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelected(e.target.files)}
            />
          </div>

          {/* D17-17: InstantID Model Setup */}
          <div className="space-y-3 border-t pt-4">
            <Label className="flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              {t("aiStudio.ambassadors.instantIdLabel")}
            </Label>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium">
                  {t("aiStudio.ambassadors.identityStrengthLabel")}
                </span>
                <span className="text-brand-orange text-xs font-bold">
                  {identityStrength}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={identityStrength}
                onChange={(e) => setIdentityStrength(Number(e.target.value))}
                className="accent-brand-orange w-full"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-muted-foreground text-xs font-medium">
                {t("aiStudio.ambassadors.posePreservationLabel")}
              </span>
              <div className="flex gap-1.5">
                {POSE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPosePreservation(option)}
                    className={`text-2xs cursor-pointer rounded-lg border px-2.5 py-1 font-medium transition-colors ${
                      posePreservation === option
                        ? "border-brand-orange bg-brand-orange-soft text-brand-orange"
                        : "border-border text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {t(`aiStudio.ambassadors.posePreservation.${option}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-muted-foreground text-xs font-medium">
                {t("aiStudio.ambassadors.qualityTierLabel")}
              </span>
              <div className="flex gap-1.5">
                {QUALITY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setQualityTier(option)}
                    className={`text-2xs cursor-pointer rounded-lg border px-2.5 py-1 font-medium transition-colors ${
                      qualityTier === option
                        ? "border-brand-orange bg-brand-orange-soft text-brand-orange"
                        : "border-border text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {t(`aiStudio.ambassadors.qualityTier.${option}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ambassador-negative-prompt" className="text-xs">
                {t("aiStudio.ambassadors.negativePromptLabel")}
              </Label>
              <Textarea
                id="ambassador-negative-prompt"
                rows={2}
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder={t(
                  "aiStudio.ambassadors.negativePromptPlaceholder",
                )}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            {t("aiStudio.ambassadors.cancel")}
          </Button>
          <Button
            variant="orange"
            size="sm"
            disabled={!name.trim() || !facePreviewUrl}
            onClick={handleSubmit}
          >
            {t("aiStudio.ambassadors.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateAmbassadorDialog;
