import { useState } from "react";
import { DiscardChangesDialog } from "./DiscardChangesDialog";
import { useDraftUnloadWarning } from "../hooks/useDraftUnloadWarning";
import { OfferingEditor } from "@/pages/media-package/components/OfferingEditor";
import { copyOfferingDetails } from "@/pages/media-package/types/serviceUnits";
import type { OfferingFields } from "@/pages/media-package/types/mediaPackage";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { InlineWorkArea } from "@/components/shared/InlineWorkArea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  CreateCustomMediaPackageRequest,
  MediaPackage,
} from "@/pages/media-package/types/mediaPackage";

interface CreateCustomPackageFormProps {
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

export function CreateCustomPackageForm({
  open,
  sourceTemplate,
  loading,
  onOpenChange,
  onSubmit,
}: CreateCustomPackageFormProps) {
  const { t } = useTranslation();
  const [offering, setOffering] = useState<OfferingFields>({
    offeringDetails: copyOfferingDetails(sourceTemplate?.offeringDetails),
  });
  const [name, setName] = useState(sourceTemplate?.name ?? "");
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
      durationWeeks,
      budgetAmount,
      scopeDescription,
      offering,
    }) !==
    JSON.stringify({
      name: sourceTemplate?.name ?? "",
      durationWeeks: sourceTemplate?.durationWeeks?.toString() ?? "",
      budgetAmount: sourceTemplate?.budgetAmount?.toString() ?? "",
      scopeDescription: sourceTemplate?.scopeDescription ?? "",
      offering: {
        offeringDetails: copyOfferingDetails(sourceTemplate?.offeringDetails),
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
    setDurationWeeks("");
    setBudgetAmount("");
    setScopeDescription("");
    setErrors({});
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = t("mediaPackage.form.errors.name");
    if (
      durationWeeks.trim() &&
      (!Number.isInteger(Number(durationWeeks)) || Number(durationWeeks) <= 0)
    ) {
      nextErrors.durationWeeks = t("mediaPackage.form.errors.duration");
    }
    if (
      budgetAmount.trim() &&
      (!Number.isFinite(Number(budgetAmount)) || Number(budgetAmount) <= 0)
    ) {
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
      !offering.offeringDetails?.deliverables.length
    )
      return;
    const success = await onSubmit({
      sourceTemplateId: sourceTemplate?.id,
      ...offering,
      name: name.trim(),
      durationWeeks: durationWeeks.trim() ? Number(durationWeeks) : undefined,
      budgetAmount: budgetAmount.trim() ? Number(budgetAmount) : undefined,
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

  if (!open) return null;
  return (
    <>
      <InlineWorkArea
        title={t("mediaPackage.form.title")}
        description={t("mediaPackage.form.description")}
        backLabel={t("mediaPackage.ui.backToPackages")}
        onBack={() => handleOpenChange(false)}
        disabled={loading}
        returnFocusTo={
          sourceTemplate
            ? `[data-package-create-from="${CSS.escape(sourceTemplate.id)}"]`
            : "[data-package-create]"
        }
      >
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
              aria-describedby={errors.name ? "package-form-errors" : undefined}
              id="package-field-name"
              label={t("mediaPackage.form.nameLabel")}
              placeholder={t("mediaPackage.form.namePlaceholder")}
              value={name}
              maxLength={255}
              error={errors.name}
              onChange={(event) => setName(event.target.value)}
            />

            <p className="text-muted-foreground text-sm">
              {t("mediaPackage.values.optionalFinancials")}
            </p>
            <div className="grid items-start gap-4 sm:grid-cols-2">
              {
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
              }
              {
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
              }
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
            <footer className="border-border flex flex-wrap justify-end gap-2 border-t pt-4">
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
            </footer>
          </fieldset>
        </form>
      </InlineWorkArea>
      <DiscardChangesDialog
        open={confirmDiscard}
        onKeep={() => setConfirmDiscard(false)}
        onDiscard={discard}
      />
    </>
  );
}
