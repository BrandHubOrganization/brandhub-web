import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type IssueCategory = "VISUAL" | "COPY" | "BRAND" | "COMPLIANCE" | "OTHER";
type Severity = "LOW" | "MEDIUM" | "HIGH";

const CATEGORIES: IssueCategory[] = [
  "VISUAL",
  "COPY",
  "BRAND",
  "COMPLIANCE",
  "OTHER",
];
const SEVERITIES: Severity[] = ["LOW", "MEDIUM", "HIGH"];

interface RejectRequestModalProps {
  isOpen: boolean;
  itemTitle: string;
  onClose: () => void;
  onSubmit: (comment: string) => void;
}

export function RejectRequestModal({
  isOpen,
  itemTitle,
  onClose,
  onSubmit,
}: RejectRequestModalProps) {
  const { t } = useTranslation();
  const [category, setCategory] = useState<IssueCategory | "">("");
  const [severity, setSeverity] = useState<Severity>("MEDIUM");
  const [detail, setDetail] = useState("");

  const resetForm = () => {
    setCategory("");
    setSeverity("MEDIUM");
    setDetail("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!category) {
      toast.error(t("dashboard.portal.rejectModal.categoryRequired"));
      return;
    }
    if (!detail.trim()) {
      toast.error(t("dashboard.portal.rejectModal.detailRequired"));
      return;
    }

    const categoryLabel = t(`dashboard.portal.rejectModal.category.${category}`);
    const severityLabel = t(`dashboard.portal.rejectModal.severity.${severity}`);
    const comment = `[${categoryLabel} · ${severityLabel}] ${detail.trim()}`;

    onSubmit(comment);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dashboard.portal.rejectModal.title")}</DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground -mt-2 text-xs">{itemTitle}</p>

        <div className="space-y-4">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              {t("dashboard.portal.rejectModal.categoryLabel")}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IssueCategory)}
              className="border-border bg-card text-foreground w-full cursor-pointer rounded-lg border px-3 py-2 text-xs"
            >
              <option value="" disabled>
                {t("dashboard.portal.rejectModal.categoryPlaceholder")}
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`dashboard.portal.rejectModal.category.${c}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
              {t("dashboard.portal.rejectModal.severityLabel")}
            </label>
            <div className="flex gap-2">
              {SEVERITIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`flex-1 cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    severity === s
                      ? "border-brand-orange bg-brand-orange-soft text-brand-orange dark:bg-brand-orange/20"
                      : "border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {t(`dashboard.portal.rejectModal.severity.${s}`)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-medium">
              {t("dashboard.portal.rejectModal.detailLabel")}
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={t("dashboard.portal.rejectModal.detailPlaceholder")}
              rows={4}
              className="border-border bg-card text-foreground w-full resize-none rounded-lg border px-3 py-2 text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            {t("dashboard.portal.rejectModal.cancel")}
          </Button>
          <Button variant="destructive" className="gap-1.5" onClick={handleSubmit}>
            <RotateCcw className="size-3.5" />
            {t("dashboard.portal.rejectModal.submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
