import { QuickNumbers, TextChoices } from "@/components/shared/FieldChoices";
import { useEffect, useRef, useState } from "react";
import { OfferingEditor } from "@/pages/media-package/components/OfferingEditor";
import { PackageTermsDiff } from "@/pages/media-package/components/PackageTermsDiff";
import {
  formatVndInput,
  parseVndInput,
} from "@/pages/media-package/lib/formatMediaPackage";
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
import { RichTextInput } from "@/components/ui/rich-text-input";
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
  const validateBudget = (val: string) => {
    if (val.trim() === "") return undefined;
    const budgetNum = Number(val);
    return Number.isNaN(budgetNum) || budgetNum <= 0
      ? t("mediaPackage.form.errors.budget")
      : undefined;
  };

  const validateDuration = (val: string) => {
    if (val.trim() === "") return undefined;
    const durationNum = Number(val);
    return Number.isNaN(durationNum) ||
      durationNum <= 0 ||
      !Number.isInteger(durationNum)
      ? t("mediaPackage.form.errors.duration")
      : undefined;
  };

  const validateScope = (val: string) =>
    val.length > 5000 ? t("mediaPackage.form.errors.scopeLength") : undefined;

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    const budgetErr = validateBudget(budgetAmount);
    if (budgetErr) nextErrors.budgetAmount = budgetErr;

    const durationErr = validateDuration(durationWeeks);
    if (durationErr) nextErrors.durationWeeks = durationErr;

    const scopeErr = validateScope(scopeDescription);
    if (scopeErr) nextErrors.scopeDescription = scopeErr;

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
                  type="text"
                  inputMode="numeric"
                  placeholder={t(
                    "mediaPackage.form.budgetLabel",
                    "Ví dụ: 15.000.000",
                  )}
                  value={formatVndInput(budgetAmount)}
                  iconSuffix={<span className="text-xs">VND</span>}
                  onChange={(e) => {
                    const val = parseVndInput(e.target.value);
                    setBudgetAmount(val);
                    setErrors((prev) => ({
                      ...prev,
                      budgetAmount: validateBudget(val),
                      general: undefined,
                    }));
                  }}
                  disabled={loading}
                />
                <QuickNumbers
                  values={[5000000, 10000000, 18000000, 30000000, 50000000]}
                  value={budgetAmount}
                  onChange={(val) => {
                    setBudgetAmount(val);
                    setErrors((prev) => ({
                      ...prev,
                      budgetAmount: validateBudget(val),
                      general: undefined,
                    }));
                  }}
                  format={(amount) =>
                    new Intl.NumberFormat(i18n.language).format(amount)
                  }
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
                    const val = e.target.value;
                    setDurationWeeks(val);
                    setErrors((prev) => ({
                      ...prev,
                      durationWeeks: validateDuration(val),
                      general: undefined,
                    }));
                  }}
                  disabled={loading}
                />
                <QuickNumbers
                  values={[2, 4, 6, 8, 12]}
                  value={durationWeeks}
                  onChange={(val) => {
                    setDurationWeeks(val);
                    setErrors((prev) => ({
                      ...prev,
                      durationWeeks: validateDuration(val),
                      general: undefined,
                    }));
                  }}
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
                <span className="text-muted-foreground text-xs">
                  {scopeDescription.length}/5000
                </span>
              </div>
              <TextChoices
                id="negotiate-scope"
                label={t("mediaPackage.negotiateModal.scopeLabel")}
                value={scopeDescription}
                onChange={setScopeDescription}
                maxLength={5000}
                options={["launch", "awareness", "engagement"].map((key) =>
                  t(`mediaPackage.choices.scope.${key}`),
                )}
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
              <RichTextInput
                id="negotiation-note"
                label={t("mediaPackage.history.note")}
                value={note}
                disabled={loading}
                onChange={setNote}
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
