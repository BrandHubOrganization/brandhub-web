import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileEdit, Loader2, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  MediaPackage,
  NegotiateTermsRequest,
} from "@/pages/media-package/types/mediaPackage";

export interface NegotiateTermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaPackage: MediaPackage;
  currentTermsVersion: number;
  loading: boolean;
  onSubmit: (terms: NegotiateTermsRequest) => Promise<boolean>;
}

interface FormErrors {
  budgetAmount?: string;
  durationWeeks?: string;
  scopeDescription?: string;
  general?: string;
}

export function NegotiateTermsModal({
  open,
  onOpenChange,
  mediaPackage,
  currentTermsVersion,
  loading,
  onSubmit,
}: NegotiateTermsModalProps) {
  const { t, i18n } = useTranslation();

  const [budgetAmount, setBudgetAmount] = useState<string>("");
  const [durationWeeks, setDurationWeeks] = useState<string>("");
  const [scopeDescription, setScopeDescription] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      setBudgetAmount(
        mediaPackage.budgetAmount != null ? String(mediaPackage.budgetAmount) : "",
      );
      setDurationWeeks(
        mediaPackage.durationWeeks != null
          ? String(mediaPackage.durationWeeks)
          : "",
      );
      setScopeDescription(mediaPackage.scopeDescription ?? "");
      setErrors({});
    }
  }, [open, mediaPackage]);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (budgetAmount.trim() !== "") {
      const budgetNum = Number(budgetAmount);
      if (Number.isNaN(budgetNum) || budgetNum <= 0) {
        nextErrors.budgetAmount = t("mediaPackage.form.errors.budget");
      }
    }

    if (durationWeeks.trim() !== "") {
      const durationNum = Number(durationWeeks);
      if (Number.isNaN(durationNum) || durationNum <= 0 || !Number.isInteger(durationNum)) {
        nextErrors.durationWeeks = t("mediaPackage.form.errors.duration");
      }
    }

    if (scopeDescription.length > 5000) {
      nextErrors.scopeDescription = t("mediaPackage.form.errors.scopeLength");
    }

    if (
      budgetAmount.trim() === "" &&
      durationWeeks.trim() === "" &&
      scopeDescription.trim() === ""
    ) {
      nextErrors.general =
        i18n.language === "vi"
          ? "Vui lòng nhập ít nhất một điều khoản cần điều chỉnh."
          : "Please provide at least one term to adjust.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || loading) return;

    const request: NegotiateTermsRequest = {
      budgetAmount:
        budgetAmount.trim() !== "" ? Number(budgetAmount) : undefined,
      durationWeeks:
        durationWeeks.trim() !== "" ? Number(durationWeeks) : undefined,
      scopeDescription:
        scopeDescription.trim() !== "" ? scopeDescription.trim() : undefined,
    };

    const success = await onSubmit(request);
    if (success) {
      onOpenChange(false);
    }
  };

  const formattedBudgetPreview =
    budgetAmount.trim() !== "" && !Number.isNaN(Number(budgetAmount)) && Number(budgetAmount) > 0
      ? new Intl.NumberFormat(i18n.language === "en" ? "en-US" : "vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(Number(budgetAmount))
      : null;

  return (
    <Dialog open={open} onOpenChange={(val) => !loading && onOpenChange(val)}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
              <FileEdit className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {t("mediaPackage.negotiateModal.title", "Đề xuất điều chỉnh điều khoản")}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs mt-0.5">
                {t(
                  "mediaPackage.negotiateModal.description",
                  "Điều chỉnh các điều khoản dịch vụ để hai bên tiến hành đàm phán và thống nhất.",
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3 text-xs border">
            <div>
              <span className="text-muted-foreground">Gói hiện tại: </span>
              <span className="font-semibold text-foreground">{mediaPackage.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[11px]">
                v{currentTermsVersion}
              </Badge>
              <span className="text-muted-foreground">→</span>
              <Badge variant="secondary" className="text-[11px] font-medium text-brand-orange border-brand-orange/30">
                v{currentTermsVersion + 1} ({i18n.language === "vi" ? "Đề xuất mới" : "New proposal"})
              </Badge>
            </div>
          </div>

          {errors.general && (
            <p className="text-xs font-medium text-destructive">{errors.general}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="negotiate-budget" className="text-xs font-medium">
                {t("mediaPackage.negotiateModal.budgetLabel", "Ngân sách (VND)")}
              </Label>
              <Input
                id="negotiate-budget"
                type="number"
                min="0"
                step="100000"
                placeholder={t("mediaPackage.form.budgetLabel", "Ví dụ: 15000000")}
                value={budgetAmount}
                onChange={(e) => {
                  setBudgetAmount(e.target.value);
                  if (errors.budgetAmount) setErrors((prev) => ({ ...prev, budgetAmount: undefined }));
                }}
                disabled={loading}
              />
              {formattedBudgetPreview && (
                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  ≈ {formattedBudgetPreview}
                </p>
              )}
              {errors.budgetAmount && (
                <p className="text-xs text-destructive">{errors.budgetAmount}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="negotiate-duration" className="text-xs font-medium">
                {t("mediaPackage.negotiateModal.durationLabel", "Thời lượng (tuần)")}
              </Label>
              <Input
                id="negotiate-duration"
                type="number"
                min="1"
                step="1"
                placeholder="Ví dụ: 4"
                value={durationWeeks}
                onChange={(e) => {
                  setDurationWeeks(e.target.value);
                  if (errors.durationWeeks) setErrors((prev) => ({ ...prev, durationWeeks: undefined }));
                }}
                disabled={loading}
              />
              {errors.durationWeeks && (
                <p className="text-xs text-destructive">{errors.durationWeeks}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="negotiate-scope" className="text-xs font-medium">
                {t("mediaPackage.negotiateModal.scopeLabel", "Mô tả phạm vi công việc")}
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {scopeDescription.length}/5000
              </span>
            </div>
            <Textarea
              id="negotiate-scope"
              rows={4}
              placeholder={t(
                "mediaPackage.form.scopePlaceholder",
                "Mô tả chi tiết các deliverable, số lượng bài đăng, kênh truyền thông, mốc thời gian...",
              )}
              value={scopeDescription}
              onChange={(e) => {
                setScopeDescription(e.target.value);
                if (errors.scopeDescription) setErrors((prev) => ({ ...prev, scopeDescription: undefined }));
              }}
              disabled={loading}
            />
            {errors.scopeDescription && (
              <p className="text-xs text-destructive">{errors.scopeDescription}</p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t("mediaPackage.actions.cancel", "Hủy")}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-brand-orange hover:bg-brand-orange/90 text-white gap-2 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>{i18n.language === "vi" ? "Đang gửi..." : "Submitting..."}</span>
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  <span>{t("mediaPackage.negotiateModal.submit", "Gửi đề xuất")}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
