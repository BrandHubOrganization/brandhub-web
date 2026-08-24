import { useTranslation } from "react-i18next";
import type { Platform } from "@/types/post";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ALL_PLATFORMS, PLATFORM_META } from "@/pages/social-accounts/lib/platformMeta";

interface ConnectAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlatform: (platform: Platform) => void;
}

export function ConnectAccountDialog({
  isOpen,
  onClose,
  onSelectPlatform,
}: ConnectAccountDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("socialAccounts.connectDialog.title")}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {ALL_PLATFORMS.map((platform) => {
            const meta = PLATFORM_META[platform];
            return (
              <button
                key={platform}
                type="button"
                onClick={() => onSelectPlatform(platform)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors hover:opacity-80 ${meta.color}`}
              >
                {meta.icon}
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
