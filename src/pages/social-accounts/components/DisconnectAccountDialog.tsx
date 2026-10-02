import { useTranslation, Trans } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import type { SocialAccount } from "@/pages/social-accounts/types/socialAccount";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PLATFORM_META } from "@/pages/social-accounts/lib/platformMeta";

interface DisconnectAccountDialogProps {
  account: SocialAccount | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DisconnectAccountDialog({
  account,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: DisconnectAccountDialogProps) {
  const { t } = useTranslation();

  if (!account) return null;

  const meta = PLATFORM_META[account.platform];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive dark:bg-destructive/20">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {t("socialAccounts.disconnectDialog.title")}
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                {meta.label} · {account.accountHandle}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2 text-xs leading-relaxed text-muted-foreground">
          <Trans
            i18nKey="socialAccounts.disconnectDialog.description"
            values={{
              accountName: account.accountName,
              platform: meta.label,
            }}
            components={{
              strong: <span className="font-semibold text-foreground" />,
            }}
          />
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs"
          >
            {t("socialAccounts.disconnectDialog.cancelText")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="gap-1.5 text-xs font-semibold"
          >
            {isLoading
              ? t("common.processing", "Đang xử lý...")
              : t("socialAccounts.disconnectDialog.confirmText")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
