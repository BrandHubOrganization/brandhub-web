import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { MaterialDuplicateConflict } from "@/types/material";
export function DuplicateResolutionModal({
  conflict,
  onChoose,
}: {
  conflict: MaterialDuplicateConflict | null;
  onChoose: (resolution: "SKIP" | "KEEP_BOTH" | "OVERWRITE") => void;
}) {
  const { t } = useTranslation();
  const label = (key: string) => t(`materials.repository.${key}`);
  return (
    <Dialog
      open={!!conflict}
      onOpenChange={(open) => {
        if (!open) onChoose("SKIP");
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label("duplicateTitle")}</DialogTitle>
          <DialogDescription>
            {t("materials.repository.duplicateDescription", {
              name: conflict?.existingName,
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => onChoose("SKIP")}>
            {label("skip")}
          </Button>
          <Button variant="outline" onClick={() => onChoose("KEEP_BOTH")}>
            {label("keepBoth")}
          </Button>
          <Button onClick={() => onChoose("OVERWRITE")}>
            {label("overwrite")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
