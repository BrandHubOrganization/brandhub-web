import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { HashtagEntry } from "@/pages/hashtag-groups/types/hashtag";
import { hashtagErrorKey } from "@/pages/hashtag-groups/services/hashtagService";

interface Props {
  entry: HashtagEntry;
  campaignName?: string;
  pending: boolean;
  error: unknown;
  refreshed: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function RemoveHashtagDialog({
  entry,
  campaignName,
  pending,
  error,
  refreshed,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const prefix = "hashtagGroups.collection.";
  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent className="rounded-xl">
        <DialogHeader>
          <DialogTitle>{t(prefix + "removeTitle")}</DialogTitle>
          <DialogDescription>
            {t(prefix + "removeDescription", { tag: entry.tag })}
          </DialogDescription>
        </DialogHeader>
        {refreshed && (
          <p role="status" className="text-sm font-medium">
            {t(prefix + "changedReview")}
          </p>
        )}
        <p className="text-sm">
          <span className="font-medium">{t(prefix + "purpose")}:</span>{" "}
          {t(prefix + "purposes." + entry.purpose)}
        </p>
        {entry.isRequired && (
          <div className="border-destructive/30 bg-destructive/5 rounded-lg border p-3 text-sm">
            <p className="font-medium">{t(prefix + "requiredWarningTitle")}</p>
            <p className="mt-1">
              {t(prefix + "requiredWarning", {
                campaign: campaignName ?? t(prefix + "campaignScope", { id: entry.campaignId ?? "" }),
              })}
            </p>
          </div>
        )}
        <p className="text-muted-foreground text-sm">
          {t(prefix + "preserveApplied")}
        </p>
        {error != null && (
          <p role="alert" className="text-destructive text-sm">
            {t(prefix + hashtagErrorKey(error, "removeError"))}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={pending}>
            {t(prefix + "cancel")}
          </Button>
          <Button variant="destructive" onClick={() => void onConfirm()} loading={pending}>
            {t(prefix + "remove")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
