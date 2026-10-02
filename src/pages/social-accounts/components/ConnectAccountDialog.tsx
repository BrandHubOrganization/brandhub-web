import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import type { Platform } from "@/types/post";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ALL_PLATFORMS,
  PLATFORM_META,
} from "@/pages/social-accounts/lib/platformMeta";

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
          <DialogDescription>
            {t("socialAccounts.connectDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-2">
          {ALL_PLATFORMS.map((platform) => {
            const meta = PLATFORM_META[platform];
            return (
              <button
                key={platform}
                type="button"
                onClick={() => onSelectPlatform(platform)}
                className={`group flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${meta.color}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-background/80 shadow-2xs">
                    {meta.icon}
                  </div>
                  <span className="font-semibold">{meta.label}</span>
                </div>
                <ArrowUpRight className="size-3.5 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
