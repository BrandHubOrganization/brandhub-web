import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Pencil,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { aiGenerationService } from "@/services/aiGenerationService";
import { extractErrorMessage } from "@/utils/error";
import { aiCreditErrorMessage } from "@/services/aiCreditRequest";

type GeneratorPhase = "describe" | "generating-character" | "review";

interface AmbassadorGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (result: { characterImageUrl: string }) => void;
}

const MIN_DESCRIPTION_LENGTH = 10;

export function AmbassadorGeneratorModal({
  open,
  onOpenChange,
  onComplete,
}: AmbassadorGeneratorModalProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<GeneratorPhase>("describe");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [characterImageUrl, setCharacterImageUrl] = useState("");
  const [error, setError] = useState("");

  const isBusy = phase === "generating-character";

  const resetFlow = () => {
    setPhase("describe");
    setName("");
    setDescription("");
    setCharacterImageUrl("");
    setError("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isBusy) return;
    if (!nextOpen) resetFlow();
    onOpenChange(nextOpen);
  };

  const handleGenerateCharacter = async () => {
    const normalizedDescription = description.trim();
    if (normalizedDescription.length < MIN_DESCRIPTION_LENGTH) {
      setError(t("editor.studio.image.characterFlow.descriptionRequired"));
      return;
    }

    setPhase("generating-character");
    setError("");
    try {
      const result = await aiGenerationService.generateAmbassador({
        prompt: normalizedDescription,
      });
      if (!result.image_url) throw new Error("Missing ambassador image URL");
      setCharacterImageUrl(result.image_url);
      setPhase("review");
    } catch (error) {
      setError(
        aiCreditErrorMessage(error) ??
          extractErrorMessage(
            error,
            t("editor.studio.image.characterFlow.characterFailed"),
          ),
      );
      setPhase("describe");
    }
  };

  const handleSelectAmbassador = () => {
    if (!characterImageUrl) return;
    onComplete({ characterImageUrl });
    toast.success(t("editor.studio.image.ambassadorSelected"));
    handleOpenChange(false);
  };

  const renderProgress = () => {
    const activeStep =
      phase === "describe" || phase === "generating-character" ? 1 : 2;

    return (
      <div
        className="grid grid-cols-2 gap-2"
        aria-label={t("editor.studio.image.characterFlow.progressLabel")}
      >
        {[1, 2].map((step) => (
          <div key={step} className="space-y-1.5">
            <div
              className={`h-1.5 rounded-full ${
                step <= activeStep ? "bg-brand-orange" : "bg-muted"
              }`}
            />
            <p className="text-muted-foreground text-2xs">
              {t(`editor.studio.image.characterFlow.step${step}`)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-brand-orange-soft text-brand-orange rounded-lg p-1.5">
              <Sparkles className="size-4" />
            </span>
            {t("editor.studio.image.characterFlow.title")}
          </DialogTitle>
          <DialogDescription>
            {t("editor.studio.image.characterFlow.subtitle")}
          </DialogDescription>
        </DialogHeader>

        {renderProgress()}

        {phase === "describe" && (
          <div className="space-y-4 py-2">
            <Input
              id="character-name"
              label={t("editor.studio.image.characterFlow.nameLabel")}
              value={name}
              maxLength={40}
              onChange={(event) => setName(event.target.value)}
              placeholder={t(
                "editor.studio.image.characterFlow.namePlaceholder",
              )}
            />
            <div className="space-y-1.5">
              <label
                htmlFor="character-description"
                className="text-xs font-semibold tracking-wide"
              >
                {t("editor.studio.image.characterFlow.descriptionLabel")}
              </label>
              <Textarea
                id="character-description"
                data-testid="character-description"
                rows={6}
                value={description}
                maxLength={3000}
                onChange={(event) => {
                  setDescription(event.target.value);
                  if (error) setError("");
                }}
                placeholder={t(
                  "editor.studio.image.characterFlow.descriptionPlaceholder",
                )}
              />
              <p className="text-muted-foreground text-2xs">
                {t("editor.studio.image.characterFlow.descriptionHint")}
              </p>
            </div>
          </div>
        )}

        {phase === "generating-character" && (
          <div className="flex min-h-72 flex-col items-center justify-center gap-4 py-8 text-center">
            <span className="bg-brand-orange-soft text-brand-orange rounded-full p-4">
              <Loader2 className="size-8 animate-spin" />
            </span>
            <div>
              <p className="font-semibold">
                {t("editor.studio.image.characterFlow.generatingCharacter")}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {t("editor.studio.image.characterFlow.generatingCharacterHint")}
              </p>
            </div>
          </div>
        )}

        {phase === "review" && (
          <div className="grid gap-4 py-2 sm:grid-cols-[minmax(0,1fr)_220px]">
            <div className="border-border bg-muted/30 overflow-hidden rounded-xl border">
              <img
                src={characterImageUrl}
                alt={t("editor.studio.image.characterFlow.characterPreviewAlt")}
                className="max-h-[52vh] w-full object-contain"
              />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold">
                  {name.trim() ||
                    t("editor.studio.image.characterFlow.defaultName")}
                </p>
                <p className="text-muted-foreground mt-1 line-clamp-6 text-xs leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="text-destructive text-xs font-medium">
            {error}
          </p>
        )}

        <DialogFooter>
          {phase === "describe" && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                {t("editor.studio.image.characterFlow.cancel")}
              </Button>
              <Button
                type="button"
                variant="orange"
                data-testid="generate-character"
                onClick={handleGenerateCharacter}
              >
                <Sparkles className="size-4" />
                {t("editor.studio.image.characterFlow.generateCharacter")}
              </Button>
            </>
          )}

          {phase === "review" && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPhase("describe")}
              >
                <Pencil className="size-4" />
                {t("editor.studio.image.characterFlow.editDescription")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateCharacter}
              >
                <RefreshCw className="size-4" />
                {t("editor.studio.image.characterFlow.regenerate")}
              </Button>
              <Button
                type="button"
                variant="orange"
                data-testid="approve-character"
                onClick={handleSelectAmbassador}
              >
                <CheckCircle2 className="size-4" />
                {t("editor.studio.image.characterFlow.useAmbassador")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
