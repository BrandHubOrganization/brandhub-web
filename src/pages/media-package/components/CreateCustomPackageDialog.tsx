import { useState } from "react";
import { DiscardChangesDialog } from "./DiscardChangesDialog";
import { useDraftUnloadWarning } from "../hooks/useDraftUnloadWarning";
import { OfferingEditor } from "@/pages/media-package/components/OfferingEditor";
import type { OfferingFields } from "@/pages/media-package/types/mediaPackage";
import { useTranslation } from "react-i18next";

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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  CreateCustomMediaPackageRequest,
  MediaPackage,
  MediaPackageType,
} from "@/pages/media-package/types/mediaPackage";

interface CreateCustomPackageDialogProps {
  open: boolean;
  sourceTemplate?: MediaPackage | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (request: CreateCustomMediaPackageRequest) => Promise<boolean>;
}

interface FormErrors {
  name?: string;
  durationWeeks?: string;
  budgetAmount?: string;
  scopeDescription?: string;
}

const PACKAGE_TYPES: MediaPackageType[] = [
  "BY_DURATION",
  "BY_BUDGET",
  "FULL_DELEGATION",
];

export function CreateCustomPackageDialog({
  open,
  sourceTemplate,
  loading,
  onOpenChange,
  onSubmit,
}: CreateCustomPackageDialogProps) {
  const { t } = useTranslation();
  const [offering, setOffering] = useState<OfferingFields>({
    offeringModel: sourceTemplate?.offeringModel,
    offeringDetails: sourceTemplate?.offeringDetails,
  });
  const [name, setName] = useState(sourceTemplate?.name ?? "");
  const [type, setType] = useState<MediaPackageType>(
    sourceTemplate?.type ?? "BY_DURATION",
  );
  const [durationWeeks, setDurationWeeks] = useState(
    sourceTemplate?.durationWeeks?.toString() ?? "",
  );
  const [budgetAmount, setBudgetAmount] = useState(
    sourceTemplate?.budgetAmount?.toString() ?? "",
  );
  const [scopeDescription, setScopeDescription] = useState(
    sourceTemplate?.scopeDescription ?? "",
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const dirty =
    JSON.stringify({
      name,
      type,
      durationWeeks,
      budgetAmount,
      scopeDescription,
      offering,
    }) !==
    JSON.stringify({
      name: sourceTemplate?.name ?? "",
      type: sourceTemplate?.type ?? "BY_DURATION",
      durationWeeks: sourceTemplate?.durationWeeks?.toString() ?? "",
      budgetAmount: sourceTemplate?.budgetAmount?.toString() ?? "",
      scopeDescription: sourceTemplate?.scopeDescription ?? "",
      offering: {
        offeringModel: sourceTemplate?.offeringModel,
        offeringDetails: sourceTemplate?.offeringDetails,
      },
    });
  useDraftUnloadWarning(open && dirty);
  const discard = () => {
    reset();
    setConfirmDiscard(false);
    onOpenChange(false);
  };
  const reset = () => {
    setName("");
    setOffering({});
    setType("BY_DURATION");
    setDurationWeeks("");
    setBudgetAmount("");
    setScopeDescription("");
    setErrors({});
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = t("mediaPackage.form.errors.name");
    if (type === "BY_DURATION" && Number(durationWeeks) <= 0) {
      nextErrors.durationWeeks = t("mediaPackage.form.errors.duration");
    }
    if (type === "BY_BUDGET" && Number(budgetAmount) <= 0) {
      nextErrors.budgetAmount = t("mediaPackage.form.errors.budget");
    }
    if (scopeDescription.length > 5000) {
      nextErrors.scopeDescription = t("mediaPackage.form.errors.scopeLength");
    }
    setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0];
    if (first) document.getElementById(`package-field-${first}`)?.focus();
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      loading ||
      !validate() ||
      (offering.offeringModel && !offering.offeringDetails?.deliverables.length)
    )
      return;
    const success = await onSubmit({
      sourceTemplateId: sourceTemplate?.id,
      ...offering,
      name: name.trim(),
      type,
      durationWeeks: type === "BY_DURATION" ? Number(durationWeeks) : undefined,
      budgetAmount: type === "BY_BUDGET" ? Number(budgetAmount) : undefined,
      scopeDescription: scopeDescription.trim() || undefined,
    });
    if (!success) return;
    reset();
    onOpenChange(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (loading) return;
    if (!nextOpen && dirty) {
      setConfirmDiscard(true);
      return;
    }
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto overscroll-contain sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("mediaPackage.form.title")}</DialogTitle>
            <DialogDescription>
              {t("mediaPackage.form.description")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <fieldset disabled={loading} className="min-w-0 space-y-5">
              {sourceTemplate && (
                <div className="border-border bg-muted/40 rounded-lg border px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    {t("mediaPackage.form.basedOnTemplate")}
                  </span>{" "}
                  <span className="text-foreground font-medium">
                    {sourceTemplate.name}
                  </span>
                </div>
              )}

              {Object.values(errors).some(Boolean) && (
                <div
                  id="package-form-errors"
                  role="alert"
                  className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border p-3 text-sm"
                >
                  {Object.values(errors)
                    .filter(Boolean)
                    .map((message) => (
                      <p key={message}>{message}</p>
                    ))}
                </div>
              )}
              <Input
                aria-describedby={
                  errors.name ? "package-form-errors" : undefined
                }
                id="package-field-name"
                label={t("mediaPackage.form.nameLabel")}
                placeholder={t("mediaPackage.form.namePlaceholder")}
                value={name}
                maxLength={255}
                error={errors.name}
                onChange={(event) => setName(event.target.value)}
              />

              <div className="grid items-start gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="media-package-type"
                    className="text-xs font-semibold"
                  >
                    {t("mediaPackage.form.typeLabel")}
                  </Label>
                  <Select
                    id="media-package-type"
                    value={type}
                    onChange={(event) =>
                      setType(event.target.value as MediaPackageType)
                    }
                  >
                    {PACKAGE_TYPES.map((packageType) => (
                      <option key={packageType} value={packageType}>
                        {t(`mediaPackage.types.${packageType}`)}
                      </option>
                    ))}
                  </Select>
                </div>

                {type === "BY_DURATION" && (
                  <Input
                    aria-describedby={
                      errors.durationWeeks ? "package-form-errors" : undefined
                    }
                    id="package-field-durationWeeks"
                    type="number"
                    min="1"
                    label={t("mediaPackage.form.durationLabel")}
                    value={durationWeeks}
                    error={errors.durationWeeks}
                    onChange={(event) => setDurationWeeks(event.target.value)}
                  />
                )}
                {type === "BY_BUDGET" && (
                  <Input
                    aria-describedby={
                      errors.budgetAmount ? "package-form-errors" : undefined
                    }
                    id="package-field-budgetAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    label={t("mediaPackage.form.budgetLabel")}
                    value={budgetAmount}
                    error={errors.budgetAmount}
                    onChange={(event) => setBudgetAmount(event.target.value)}
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="package-field-scopeDescription"
                  className="text-xs font-semibold"
                >
                  {t("mediaPackage.form.scopeLabel")}
                </Label>
                <Textarea
                  aria-describedby={
                    errors.scopeDescription ? "package-form-errors" : undefined
                  }
                  id="package-field-scopeDescription"
                  rows={5}
                  maxLength={5000}
                  placeholder={t("mediaPackage.form.scopePlaceholder")}
                  value={scopeDescription}
                  aria-invalid={!!errors.scopeDescription}
                  onChange={(event) => setScopeDescription(event.target.value)}
                />
                {errors.scopeDescription && (
                  <p className="text-destructive text-xs font-medium">
                    {errors.scopeDescription}
                  </p>
                )}
              </div>

              <OfferingEditor value={offering} onChange={setOffering} />
              <DialogFooter className="border-border border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => handleOpenChange(false)}
                >
                  {t("mediaPackage.actions.cancel")}
                </Button>
                <Button type="submit" variant="orange" loading={loading}>
                  {t("mediaPackage.actions.createCustom")}
                </Button>
              </DialogFooter>
            </fieldset>
          </form>
        </DialogContent>
      </Dialog>
      <DiscardChangesDialog
        open={confirmDiscard}
        onKeep={() => setConfirmDiscard(false)}
        onDiscard={discard}
      />
    </>
  );
}
