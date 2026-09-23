import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  onSubmit: () => void;
}

export function LeaveWorkspaceDialog({
  open,
  onOpenChange,
  submitting,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onOpenChange(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("workspace.members.leaveConfirmTitle")}</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          {t("workspace.members.leaveConfirmDescription")}
        </p>
        <DialogFooter>
          <Button variant="destructive" onClick={onSubmit} loading={submitting}>
            {t("workspace.members.leaveButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
