import { useEffect, useRef, useState } from "react";
import { OfferingEditor } from "@/pages/media-package/components/OfferingEditor";
import { PackageTermsDiff } from "@/pages/media-package/components/PackageTermsDiff";
import type { OfferingFields } from "@/pages/media-package/types/mediaPackage";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DiscardChangesDialog } from "./DiscardChangesDialog";
import { useDraftUnloadWarning } from "../hooks/useDraftUnloadWarning";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InlineWorkArea } from "@/components/shared/InlineWorkArea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  MediaPackage,
  NegotiateTermsRequest,
} from "@/pages/media-package/types/mediaPackage";

export interface NegotiateTermsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaPackage: MediaPackage;
  currentTermsVersion: number;
  loading: boolean;
  clientNegotiation?: boolean;
  onSubmit: (terms: NegotiateTermsRequest) => Promise<boolean>;
}

interface FormErrors {
  budgetAmount?: string;
  durationWeeks?: string;
  scopeDescription?: string;
  general?: string;
}

export function NegotiateTermsForm({
  open,
  onOpenChange,
  mediaPackage,
  currentTermsVersion,
  loading,
  clientNegotiation = false,
  onSubmit,
}: NegotiateTermsFormProps) {
  const { t, i18n } = useTranslation();
  const [offering, setOffering] = useState<OfferingFields>({});

  const [budgetAmount, setBudgetAmount] = useState<string>("");
  const [durationWeeks, setDurationWeeks] = useState<string>("");
  const [scopeDescription, setScopeDescription] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const wasOpen = useRef(false);
  const [baseVersion, setBaseVersion] = useState(currentTermsVersion);
  const [basePackage, setBasePackage] = useState(mediaPackage);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open && !wasOpen.current) {
      setBaseVersion(currentTermsVersion);
      setBasePackage(mediaPackage);
      setNote("");
      setOffering({
        offeringModel: mediaPackage.offeringModel,
        offeringDetails: mediaPackage.offeringDetails,
      });
      setBudgetAmount(
        mediaPackage.budgetAmount != null
          ? String(mediaPackage.budgetAmount)
          : "",
      );
      setDurationWeeks(
        mediaPackage.durationWeeks != null
          ? String(mediaPackage.durationWeeks)
          : "",
      );
      setScopeDescription(mediaPackage.scopeDescription ?? "");
      setErrors({});
    }
    wasOpen.current = open;
  }, [open, mediaPackage, currentTermsVersion]);

  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const dirty =
    !!note.trim() ||
    budgetAmount !== String(basePackage.budgetAmount ?? "") ||
    durationWeeks !== String(basePackage.durationWeeks ?? "") ||
    scopeDescription !== (basePackage.scopeDescription ?? "") ||
    JSON.stringify(offering) !==
      JSON.stringify({
        offeringModel: basePackage.offeringModel,
        offeringDetails: basePackage.offeringDetails,
      });
  useDraftUnloadWarning(open && dirty);
  const handleOpenChange = (next: boolean) => {
    if (loading) return;
    if (!next && dirty) {
      setConfirmDiscard(true);
      return;
    }
    onOpenChange(next);
  };
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
      if (
        Number.isNaN(durationNum) ||
        durationNum <= 0 ||
        !Number.isInteger(durationNum)
      ) {
        nextErrors.durationWeeks = t("mediaPackage.form.errors.duration");
      }
    }

    if (scopeDescription.length > 5000) {
      nextErrors.scopeDescription = t("mediaPackage.form.errors.scopeLength");
    }

    if (
      budgetAmount.trim() === "" &&
      durationWeeks.trim() === "" &&
      scopeDescription.trim() === "" &&
      !offering.offeringDetails?.deliverables.length
    ) {
      nextErrors.general =
        i18n.language === "vi"
          ? "Vui lòng nhập ít nhất một điều khoản cần điều chỉnh."
          : "Please provide at least one term to adjust.";
    }

    setErrors(nextErrors);
    const first = nextErrors.budgetAmount
      ? "budget"
      : nextErrors.durationWeeks
        ? "duration"
        : nextErrors.scopeDescription
          ? "scope"
          : null;
    if (first) document.getElementById(`negotiate-${first}`)?.focus();
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !validate() ||
      loading ||
      (offering.offeringDetails != null &&
        !offering.offeringDetails.deliverables.length)
    )
      return;

    const request: NegotiateTermsRequest = {
      expectedTermsVersion: baseVersion,
      note: note.trim() || undefined,
      offeringDetails: offering.offeringDetails,
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
    budgetAmount.trim() !== "" &&
    !Number.isNaN(Number(budgetAmount)) &&
    Number(budgetAmount) > 0
      ? new Intl.NumberFormat(i18n.language === "en" ? "en-US" : "vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(Number(budgetAmount))
      : null;

  if (!open) return null;
  return (
    <>
      <InlineWorkArea
        title={t("mediaPackage.negotiateModal.title")}
        description={t("mediaPackage.negotiateModal.description")}
        backLabel={t("mediaPackage.ui.backToPackages")}
        onBack={() => handleOpenChange(false)}
        disabled={loading}
        returnFocusTo={"[data-package-negotiate]"}
      >
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <fieldset disabled={loading} className="min-w-0 space-y-5">
            <div className="border-border bg-muted/40 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm">
              <div>
                <span className="text-muted-foreground">
                  {t("mediaPackage.ui.currentPackage")}:{" "}
                </span>
                <span className="text-foreground font-semibold">
                  {basePackage.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-xs">
                  v{baseVersion}
                </Badge>
                <ArrowRight className="text-muted-foreground size-3.5 shrink-0" />
                <Badge
                  variant="secondary"
                  className="text-brand-orange border-brand-orange/30 text-xs font-medium"
                >
                  v{baseVersion + 1} (
                  {i18n.language === "vi" ? "Đề xuất mới" : "New proposal"})
                </Badge>
              </div>
            </div>

            {errors.general && (
              <p role="alert" className="text-destructive text-xs font-medium">
                {errors.general}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="negotiate-budget"
                  className="text-xs font-medium"
                >
                  {t(
                    "mediaPackage.negotiateModal.budgetLabel",
                    "Ngân sách (VND)",
                  )}
                </Label>
                <Input
                  aria-invalid={!!errors.budgetAmount}
                  aria-describedby={
                    errors.budgetAmount ? "negotiate-error-budget" : undefined
                  }
                  id="negotiate-budget"
                  type="number"
                  min="0"
                  step="100000"
                  placeholder={t(
                    "mediaPackage.form.budgetLabel",
                    "Ví dụ: 15000000",
                  )}
                  value={budgetAmount}
                  onChange={(e) => {
                    setBudgetAmount(e.target.value);
                    if (errors.budgetAmount)
                      setErrors((prev) => ({
                        ...prev,
                        budgetAmount: undefined,
                      }));
                  }}
                  disabled={loading}
                />
                {formattedBudgetPreview && (
                  <p className="text-muted-foreground text-xs font-medium">
                    ≈ {formattedBudgetPreview}
                  </p>
                )}
                {errors.budgetAmount && (
                  <p
                    id="negotiate-error-budget"
                    role="alert"
                    className="text-destructive text-xs"
                  >
                    {errors.budgetAmount}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="negotiate-duration"
                  className="text-xs font-medium"
                >
                  {t(
                    "mediaPackage.negotiateModal.durationLabel",
                    "Thời lượng (tuần)",
                  )}
                </Label>
                <Input
                  aria-invalid={!!errors.durationWeeks}
                  aria-describedby={
                    errors.durationWeeks
                      ? "negotiate-error-duration"
                      : undefined
                  }
                  id="negotiate-duration"
                  type="number"
                  min="1"
                  step="1"
                  placeholder={t("mediaPackage.ui.durationExample")}
                  value={durationWeeks}
                  onChange={(e) => {
                    setDurationWeeks(e.target.value);
                    if (errors.durationWeeks)
                      setErrors((prev) => ({
                        ...prev,
                        durationWeeks: undefined,
                      }));
                  }}
                  disabled={loading}
                />
                {errors.durationWeeks && (
                  <p
                    id="negotiate-error-duration"
                    role="alert"
                    className="text-destructive text-xs"
                  >
                    {errors.durationWeeks}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="negotiate-scope"
                  className="text-xs font-medium"
                >
                  {t(
                    "mediaPackage.negotiateModal.scopeLabel",
                    "Mô tả phạm vi công việc",
                  )}
                </Label>
                <span className="text-muted-foreground text-xs">
                  {scopeDescription.length}/5000
                </span>
              </div>
              <Textarea
                aria-invalid={!!errors.scopeDescription}
                aria-describedby={
                  errors.scopeDescription ? "negotiate-error-scope" : undefined
                }
                id="negotiate-scope"
                rows={4}
                placeholder={t(
                  "mediaPackage.form.scopePlaceholder",
                  "Mô tả chi tiết các deliverable, số lượng bài đăng, kênh truyền thông, mốc thời gian...",
                )}
                value={scopeDescription}
                onChange={(e) => {
                  setScopeDescription(e.target.value);
                  if (errors.scopeDescription)
                    setErrors((prev) => ({
                      ...prev,
                      scopeDescription: undefined,
                    }));
                }}
                disabled={loading}
                maxLength={5000}
              />
              {errors.scopeDescription && (
                <p
                  id="negotiate-error-scope"
                  role="alert"
                  className="text-destructive text-xs"
                >
                  {errors.scopeDescription}
                </p>
              )}
            </div>

            <OfferingEditor
              value={offering}
              onChange={setOffering}
              clientNegotiation={clientNegotiation}
            />
            <div className="space-y-2">
              <Label htmlFor="negotiation-note">
                {t("mediaPackage.history.note")}
              </Label>
              <Textarea
                id="negotiation-note"
                value={note}
                maxLength={2000}
                disabled={loading}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
            <PackageTermsDiff
              before={{
                budgetAmount: basePackage.budgetAmount,
                durationWeeks: basePackage.durationWeeks,
                scopeDescription: basePackage.scopeDescription,
                offeringModel: basePackage.offeringModel,
                offeringDetails: basePackage.offeringDetails,
              }}
              after={{
                budgetAmount: budgetAmount.trim()
                  ? Number(budgetAmount)
                  : basePackage.budgetAmount,
                durationWeeks: durationWeeks.trim()
                  ? Number(durationWeeks)
                  : basePackage.durationWeeks,
                scopeDescription:
                  scopeDescription.trim() || basePackage.scopeDescription,
                offeringModel: offering.offeringModel,
                offeringDetails: offering.offeringDetails,
              }}
            />
            <footer className="border-border flex flex-wrap justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                {t("mediaPackage.actions.cancel", "Hủy")}
              </Button>
              <Button type="submit" variant="orange" loading={loading}>
                {t("mediaPackage.negotiateModal.submit")}
              </Button>
            </footer>
          </fieldset>
        </form>
      </InlineWorkArea>
      <DiscardChangesDialog
        open={confirmDiscard}
        onKeep={() => setConfirmDiscard(false)}
        onDiscard={() => {
          setConfirmDiscard(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
