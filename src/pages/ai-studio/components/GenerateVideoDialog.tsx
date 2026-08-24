import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Ambassador } from "../types/ambassador";

export interface GenerateVideoDialogProps {
  ambassador: Ambassador | null;
  onClose: () => void;
  onSubmit: (ambassador: Ambassador, prompt: string) => void;
}

export function GenerateVideoDialog({
  ambassador,
  onClose,
  onSubmit,
}: GenerateVideoDialogProps) {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState("");

  function handleSubmit() {
    if (!ambassador || !prompt.trim()) return;
    onSubmit(ambassador, prompt.trim());
    setPrompt("");
  }

  return (
    <Dialog open={!!ambassador} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("aiStudio.ambassadors.generateVideoTitle", {
              name: ambassador?.name,
            })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="video-prompt">
            {t("aiStudio.ambassadors.promptLabel")}
          </Label>
          <Textarea
            id="video-prompt"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("aiStudio.ambassadors.promptPlaceholder")}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            {t("aiStudio.ambassadors.cancel")}
          </Button>
          <Button
            variant="orange"
            size="sm"
            disabled={!prompt.trim()}
            onClick={handleSubmit}
          >
            {t("aiStudio.ambassadors.generate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GenerateVideoDialog;
