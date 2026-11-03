import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Check, FileSpreadsheet, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SurveyShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyTitle: string;
  publicUrl: string;
  spreadsheetUrl?: string;
}

export function SurveyShareDialog({
  open,
  onOpenChange,
  surveyTitle,
  publicUrl,
  spreadsheetUrl,
}: SurveyShareDialogProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success(t("tasks.survey.publishCard.linkCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("tasks.survey.publishCard.copyFailed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("tasks.survey.editor.shareTitle")}</DialogTitle>
          <DialogDescription className="truncate">
            {surveyTitle || t("tasks.survey.titlePlaceholder")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center p-5 bg-muted/30 rounded-xl border border-border">
            <div className="p-3 bg-white rounded-xl shadow-xs">
              <QRCodeSVG
                value={publicUrl || "https://brandhub.vn"}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="mt-3 text-xs font-mono text-muted-foreground break-all text-center max-w-xs">
              {publicUrl}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 truncate rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs font-mono text-muted-foreground select-all">
              {publicUrl}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleCopy()}
              className="gap-1.5 shrink-0"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span>
                {copied
                  ? t("tasks.survey.publishCard.linkCopied")
                  : t("tasks.survey.publishCard.copyLink")}
              </span>
            </Button>
          </div>

          {spreadsheetUrl && (
            <div className="pt-2 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-border/80 hover:border-brand-orange/60 hover:text-brand-orange"
                asChild
              >
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("tasks.survey.publishCard.openSheet")}</span>
                  <ExternalLink className="size-3 text-muted-foreground ml-auto" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
