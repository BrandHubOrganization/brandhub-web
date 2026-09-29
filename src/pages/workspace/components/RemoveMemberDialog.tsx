import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WorkspaceMember } from "@/types/workspace";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  onSubmit: () => void;
  target: WorkspaceMember | null;
  isLastManager: boolean;
}

export function RemoveMemberDialog({
  open,
  onOpenChange,
  submitting,
  onSubmit,
  target,
  isLastManager,
}: Props) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onOpenChange(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("workspace.members.removeConfirmTitle")}</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          {t("workspace.members.removeConfirmDescription", {
            name: target?.fullName || target?.email || "",
          })}
        </p>
        {isLastManager && (
          <p className="text-sm font-medium text-rose-600">
            {t("workspace.members.removeLastManagerWarning")}
          </p>
        )}
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={onSubmit}
            loading={submitting}
            disabled={isLastManager}
          >
            {t("workspace.members.removeButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
