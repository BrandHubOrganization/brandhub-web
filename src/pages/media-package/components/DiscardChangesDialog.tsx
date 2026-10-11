import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DiscardChangesDialog({
  open,
  onKeep,
  onDiscard,
}: {
  open: boolean;
  onKeep: () => void;
  onDiscard: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onKeep();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("mediaPackage.ui.unsavedTitle")}</DialogTitle>
          <DialogDescription>
            {t("mediaPackage.ui.unsavedDescription")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onKeep}>
            {t("mediaPackage.ui.keepEditing")}
          </Button>
          <Button variant="destructive" onClick={onDiscard}>
            {t("mediaPackage.ui.discard")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
