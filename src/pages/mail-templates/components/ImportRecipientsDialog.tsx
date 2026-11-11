import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mailTemplateService } from "@/pages/mail-templates/services/mailTemplateService";
import type { ImportRecipientGroupResult } from "@/pages/mail-templates/types";

/** CSV import for recipient groups: email,name,consent (spec AC13). */
export function ImportRecipientsDialog({
  workspaceId,
  open,
  onOpenChange,
  onImported,
}: {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [groupName, setGroupName] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportRecipientGroupResult | null>(null);

  const reset = () => {
    setGroupName("");
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error(t("mailTemplate.import.noFile"));
      return;
    }
    setBusy(true);
    try {
      const res = await mailTemplateService.importRecipientGroup(
        workspaceId,
        file,
        { name: groupName || undefined },
      );
      setResult(res);
      onImported();
    } catch {
      toast.error(t("mailTemplate.import.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("mailTemplate.import.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-muted-foreground text-xs">
            {t("mailTemplate.import.hint")}
          </p>
          <div className="space-y-1">
            <label className="text-xs font-medium">
              {t("mailTemplate.import.groupName")}
            </label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={t("mailTemplate.import.groupNamePlaceholder")}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">
              {t("mailTemplate.import.file")}
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="text-sm"
            />
          </div>
          {result && (
            <div className="grid grid-cols-2 gap-2 rounded-md border p-3 text-xs">
              <div>
                {t("mailTemplate.import.imported")}: {result.imported}
              </div>
              <div>
                {t("mailTemplate.import.skippedNoConsent")}:{" "}
                {result.skippedNoConsent}
              </div>
              <div>
                {t("mailTemplate.import.skippedSuppressed")}:{" "}
                {result.skippedSuppressed}
              </div>
              <div>
                {t("mailTemplate.import.skippedInvalid")}:{" "}
                {result.skippedInvalid}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("mailTemplate.import.close")}
          </Button>
          <Button
            type="button"
            disabled={busy}
            onClick={() => void handleImport()}
          >
            {t("mailTemplate.import.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
