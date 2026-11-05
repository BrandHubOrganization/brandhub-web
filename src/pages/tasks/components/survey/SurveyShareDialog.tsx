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
import { stripHtmlTags } from "@/pages/tasks/components/survey/SurveyFormatText";

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
  const cleanTitle =
    stripHtmlTags(surveyTitle) || t("tasks.survey.titlePlaceholder");

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
      <DialogContent className="overflow-hidden sm:max-w-md">
        <DialogHeader className="min-w-0 pr-6">
          <DialogTitle>{t("tasks.survey.editor.shareTitle")}</DialogTitle>
          <DialogDescription className="line-clamp-2 text-xs break-words">
            {cleanTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="min-w-0 space-y-4">
          <div className="border-border bg-muted/30 flex flex-col items-center justify-center rounded-xl border p-5">
            <div
              className="border-border/60 rounded-xl border p-3.5 shadow-2xs"
              style={{ backgroundColor: "oklch(1 0 0)" }}
            >
              <QRCodeSVG
                value={publicUrl || window.location.origin}
                size={180}
                level="M"
                includeMargin={false}
                bgColor="oklch(1 0 0)"
                fgColor="oklch(0.14 0 0)"
              />
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <div
              className="border-border bg-muted/40 text-muted-foreground min-w-0 flex-1 truncate rounded-lg border px-3 py-2 font-mono text-xs select-all"
              title={publicUrl}
            >
              {publicUrl}
            </div>
            <Button
              type="button"
              variant="orange"
              size="sm"
              onClick={() => void handleCopy()}
              className="h-9 shrink-0 gap-1.5 px-3.5"
            >
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
              <span>
                {copied
                  ? t("tasks.survey.publishCard.linkCopied")
                  : t("tasks.survey.publishCard.copyLink")}
              </span>
            </Button>
            {publicUrl && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9 shrink-0"
                title={t("tasks.survey.editor.preview", "Mở trong tab mới")}
                asChild
              >
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            )}
          </div>

          {spreadsheetUrl && (
            <div className="border-border/60 border-t pt-2">
              <Button
                variant="outline"
                size="sm"
                className="border-border/80 hover:border-brand-orange/60 hover:text-brand-orange h-9 w-full gap-2"
                asChild
              >
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("tasks.survey.publishCard.openSheet")}</span>
                  <ExternalLink className="text-muted-foreground ml-auto size-3" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
