import { useState } from "react";
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

export interface CreateAmbassadorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, faceImageUrl: string) => void;
}

export function CreateAmbassadorDialog({
  isOpen,
  onClose,
  onSubmit,
}: CreateAmbassadorDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [faceImageUrl, setFaceImageUrl] = useState("");

  function handleSubmit() {
    if (!name.trim() || !faceImageUrl.trim()) return;
    onSubmit(name.trim(), faceImageUrl.trim());
    setName("");
    setFaceImageUrl("");
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("aiStudio.ambassadors.createTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
          <div className="space-y-1.5">
            <Label htmlFor="ambassador-face-url">
              {t("aiStudio.ambassadors.faceImageLabel")}
            </Label>
            <Input
              id="ambassador-face-url"
              value={faceImageUrl}
              onChange={(e) => setFaceImageUrl(e.target.value)}
              placeholder={t("aiStudio.ambassadors.faceImagePlaceholder")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            {t("aiStudio.ambassadors.cancel")}
          </Button>
          <Button
            variant="orange"
            size="sm"
            disabled={!name.trim() || !faceImageUrl.trim()}
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
