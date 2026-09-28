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

// Mirrors workspace/components/RemoveMemberDialog.tsx — agency remove-member
// had no confirm step before this (destructive click fired immediately).
export function RemoveAgencyMemberDialog({
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
          <DialogTitle>{t("agency.members.removeConfirmTitle")}</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          {t("agency.members.removeConfirmDescription")}
        </p>
        <DialogFooter>
          <Button variant="destructive" onClick={onSubmit} loading={submitting}>
            {t("agency.members.remove")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
