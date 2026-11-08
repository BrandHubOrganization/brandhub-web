import { QuickNumbers } from "@/components/shared/FieldChoices";
import { useId, useState } from "react";
import { DiscardChangesDialog } from "./DiscardChangesDialog";
import { useDraftUnloadWarning } from "../hooks/useDraftUnloadWarning";
import { usePackageEditorHeight } from "@/pages/media-package/hooks/usePackageEditorHeight";
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
  editing?: boolean;
  sourceTemplate?: MediaPackage | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (request: CreateCustomMediaPackageRequest) => Promise<boolean>;
}

interface FormErrors {
  name?: string;
  offering?: string;
  durationWeeks?: string;
  budgetAmount?: string;
  scopeDescription?: string;
}

export function CreateCustomPackageForm({
  open,
  editing = false,
  sourceTemplate,
  loading,
  onOpenChange,
  onSubmit,
}: CreateCustomPackageFormProps) {
  const { t, i18n } = useTranslation();
  const formId = useId();
  const { ref: editorRef, height: editorHeight } = usePackageEditorHeight(open);
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
    if (!offering.offeringDetails?.deliverables.length)
      nextErrors.offering = t("mediaPackage.offering.required");
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
      <div
        ref={editorRef}
        style={{ height: editorHeight }}
        className="min-h-0 min-w-0"
      >
        <InlineWorkArea
          className="flex h-full min-h-0 flex-col gap-1 space-y-0 overflow-hidden p-2 sm:p-2"
          compactHeader
          headerActions={
            <>
              <span className="sr-only" role="status">
                {t(
                  dirty
                    ? "mediaPackage.editor.unsaved"
                    : "mediaPackage.editor.saveHint",
                )}
              </span>
              <Button
                type="submit"
                form={formId}
                variant="orange"
                className="h-11 min-h-11 px-3 text-sm sm:h-9 sm:min-h-9"
                loading={loading}
              >
                {t("mediaPackage.editor.save")}
              </Button>
            </>
          }
          title={t(
            editing
              ? "mediaPackage.editor.editTitle"
              : "mediaPackage.form.title",
          )}
          backLabel={t("mediaPackage.ui.backToPackages")}
          onBack={() => handleOpenChange(false)}
          disabled={loading}
          returnFocusTo={
            sourceTemplate
              ? `[data-package-create-from="${CSS.escape(sourceTemplate.id)}"]`
              : "[data-package-create]"
          }
        >
          <form
            id={formId}
            onSubmit={handleSubmit}
            className="flex min-h-0 min-w-0 flex-1 flex-col"
          >
            <fieldset
              data-package-editor-scroll
              disabled={loading}
              className="min-h-0 min-w-0 flex-1 [scrollbar-gutter:stable] space-y-5 overflow-y-auto overscroll-contain px-1 pb-2"
            >
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
              <section
                className="border-border bg-card min-w-0 space-y-4 rounded-xl border p-4 sm:p-5"
                aria-labelledby="package-info-title"
              >
                <h3 id="package-info-title" className="text-sm font-semibold">
                  {t("mediaPackage.editor.packageInfo")}
                </h3>
                <div className="grid items-start gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
                  <Input
                    required
                    id="package-field-name"
                    label={t("mediaPackage.form.nameLabel")}
                    value={name}
                    maxLength={255}
                    error={errors.name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <div className="[&_button[aria-pressed=true]]:border-brand-orange [&_button[aria-pressed=true]]:bg-brand-orange-soft [&_button[aria-pressed=true]]:text-foreground [&_button]:bg-muted space-y-2 [&_button]:min-h-9">
                    <Input
                      id="package-field-budgetAmount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      label={t("mediaPackage.editor.budgetOptional")}
                      value={budgetAmount}
                      iconSuffix={<span className="text-xs">VND</span>}
                      error={errors.budgetAmount}
                      onChange={(e) => setBudgetAmount(e.target.value)}
                    />
                    <QuickNumbers
                      values={[10000000, 25000000, 50000000]}
                      value={budgetAmount}
                      onChange={setBudgetAmount}
                      format={(amount) =>
                        t("mediaPackage.editor.millions", {
                          amount: new Intl.NumberFormat(
                            i18n.resolvedLanguage ?? i18n.language,
                          ).format(amount / 1000000),
                        })
                      }
                    />
                  </div>
                  <div className="[&_button[aria-pressed=true]]:border-brand-orange [&_button[aria-pressed=true]]:bg-brand-orange-soft [&_button[aria-pressed=true]]:text-foreground [&_button]:bg-muted space-y-2 [&_button]:min-h-9">
                    <Input
                      id="package-field-durationWeeks"
                      type="number"
                      min={1}
                      step={1}
                      label={t("mediaPackage.editor.durationOptional")}
                      value={durationWeeks}
                      error={errors.durationWeeks}
                      onChange={(e) => setDurationWeeks(e.target.value)}
                    />
                    <QuickNumbers
                      values={[2, 4, 6, 8]}
                      value={durationWeeks}
                      onChange={setDurationWeeks}
                      format={(count) =>
                        t("mediaPackage.values.duration", { count })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-field-scopeDescription">
                    {t("mediaPackage.proposal.packageDescription")}
                  </Label>
                  <Textarea
                    id="package-field-scopeDescription"
                    rows={2}
                    maxLength={5000}
                    value={scopeDescription}
                    aria-invalid={Boolean(errors.scopeDescription)}
                    aria-describedby={
                      errors.scopeDescription
                        ? "package-form-errors"
                        : undefined
                    }
                    onChange={(e) => setScopeDescription(e.target.value)}
                  />
                </div>
              </section>
              <OfferingEditor value={offering} onChange={setOffering} />
            </fieldset>
          </form>
        </InlineWorkArea>
      </div>
      <DiscardChangesDialog
        open={confirmDiscard}
        onKeep={() => setConfirmDiscard(false)}
        onDiscard={discard}
      />
    </>
  );
}
