import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Copy,
  Check,
  QrCode,
  FileSpreadsheet,
  ExternalLink,
  Share2,
} from "lucide-react";
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
import type { SurveyModel } from "@/pages/tasks/types/survey";
import { cn } from "@/lib/utils";

interface SurveyPublishCardProps {
  survey: SurveyModel | null;
}

export function SurveyPublishCard({ survey }: SurveyPublishCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const isPublished = Boolean(survey?.publicLink || survey?.publicToken);
  const publicUrl = survey?.publicLink
    ? survey.publicLink
    : survey?.publicToken
      ? `${window.location.origin}/public/surveys/${survey.publicToken}`
      : "";

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
    <div className="border-border/80 bg-card space-y-4 rounded-xl border p-4 shadow-2xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-brand-orange/15 text-brand-orange flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Share2 className="size-4" />
          </div>
          <div>
            <h3 className="text-foreground text-sm font-semibold">
              {t("tasks.survey.publishCard.title")}
            </h3>
            <p className="text-2xs text-muted-foreground">
              {t("tasks.survey.publishCard.description")}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "text-2xs rounded-md px-2 py-0.5 font-semibold",
            isPublished
              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-muted text-muted-foreground",
          )}
        >
          {isPublished
            ? t("tasks.survey.publishCard.statusPublished")
            : t("tasks.survey.publishCard.statusDraft")}
        </span>
      </div>

      {isPublished && publicUrl ? (
        <div className="space-y-3">
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <div className="border-border bg-muted/50 text-muted-foreground flex-1 truncate rounded-lg border px-3 py-2 font-mono text-xs select-all">
              {publicUrl}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() => void handleCopy()}
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                <span>
                  {copied
                    ? t("tasks.survey.publishCard.linkCopied")
                    : t("tasks.survey.publishCard.copyLink")}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() => setQrOpen(true)}
              >
                <QrCode className="size-3.5" />
                <span>{t("tasks.survey.publishCard.showQr")}</span>
              </Button>
            </div>
          </div>

          <div className="border-border/60 flex flex-wrap items-center gap-2 border-t pt-1">
            {survey?.spreadsheetUrl ? (
              <Button
                variant="outline"
                size="sm"
                className="border-border/80 hover:border-brand-orange/60 hover:text-brand-orange gap-2"
                asChild
              >
                <a
                  href={survey.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("tasks.survey.publishCard.openSheet")}</span>
                  <ExternalLink className="text-muted-foreground size-3" />
                </a>
              </Button>
            ) : (
              <span className="text-2xs text-muted-foreground flex items-center gap-1.5 italic">
                <FileSpreadsheet className="size-3.5 opacity-60" />
                {t("tasks.survey.publishCard.noSheet")}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-muted/40 text-muted-foreground rounded-lg p-3 text-xs">
          {t("tasks.survey.noQuestionsInForm")}
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center sm:text-left">
              {t("tasks.survey.publishCard.qrCode")}
            </DialogTitle>
            <DialogDescription className="text-center sm:text-left">
              {survey?.formName ||
                survey?.title ||
                t("tasks.survey.titlePlaceholder")}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-card border-border flex flex-col items-center justify-center rounded-xl border p-6">
            <div className="rounded-xl bg-white p-3 shadow-xs">
              <QRCodeSVG
                value={publicUrl}
                size={220}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-muted-foreground mt-4 max-w-xs text-center font-mono text-xs break-all">
              {publicUrl}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleCopy()}
              className="gap-1.5"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied
                ? t("tasks.survey.publishCard.linkCopied")
                : t("tasks.survey.publishCard.copyLink")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
