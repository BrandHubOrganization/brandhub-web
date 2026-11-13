import { QuickNumbers } from "@/components/shared/FieldChoices";
import { useId, useState } from "react";
import { CheckCircle2, Eye, Pencil, Rocket } from "lucide-react";
import { DiscardChangesDialog } from "./DiscardChangesDialog";
import { useDraftUnloadWarning } from "../hooks/useDraftUnloadWarning";
import { usePackageEditorHeight } from "@/pages/media-package/hooks/usePackageEditorHeight";
import { OfferingEditor } from "@/pages/media-package/components/OfferingEditor";
import { PackageProposalView } from "@/pages/media-package/components/PackageProposalView";
import { copyOfferingDetails } from "@/pages/media-package/types/serviceUnits";
import {
  formatVndInput,
  parseVndInput,
} from "@/pages/media-package/lib/formatMediaPackage";
import type { OfferingFields } from "@/pages/media-package/types/mediaPackage";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { InlineWorkArea } from "@/components/shared/InlineWorkArea";
import { Input } from "@/components/ui/input";
import { RichTextInput } from "@/components/ui/rich-text-input";
import type {
  CreateCustomMediaPackageRequest,
  MediaPackage,
} from "@/pages/media-package/types/mediaPackage";

interface CreateCustomPackageFormProps {
  open: boolean;
  editing?: boolean;
  mode?: "create" | "edit" | "workspace-deploy";
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
  mode,
  sourceTemplate,
  loading,
  onOpenChange,
  onSubmit,
}: CreateCustomPackageFormProps) {
  const { t, i18n } = useTranslation();
  const formId = useId();
  const effectiveMode = mode ?? (editing ? "edit" : "create");
  const isWorkspaceDeploy = effectiveMode === "workspace-deploy";
  const [agreed, setAgreed] = useState(false);
  const [agreementError, setAgreementError] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
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

  const validateName = (val: string) =>
    !val.trim() ? t("mediaPackage.form.errors.name") : undefined;

  const validateDuration = (val: string) =>
    val.trim() && (!Number.isInteger(Number(val)) || Number(val) <= 0)
      ? t("mediaPackage.form.errors.duration")
      : undefined;

  const validateBudget = (val: string) =>
    val.trim() && (!Number.isFinite(Number(val)) || Number(val) <= 0)
      ? t("mediaPackage.form.errors.budget")
      : undefined;

  const validateScope = (val: string) =>
    val.length > 5000 ? t("mediaPackage.form.errors.scopeLength") : undefined;

  const validate = () => {
    const nextErrors: FormErrors = {};
    const nameErr = validateName(name);
    if (nameErr) nextErrors.name = nameErr;
    const durationErr = validateDuration(durationWeeks);
    if (durationErr) nextErrors.durationWeeks = durationErr;
    const budgetErr = validateBudget(budgetAmount);
    if (budgetErr) nextErrors.budgetAmount = budgetErr;
    const scopeErr = validateScope(scopeDescription);
    if (scopeErr) nextErrors.scopeDescription = scopeErr;
    if (!offering.offeringDetails?.deliverables.length)
      nextErrors.offering = t("mediaPackage.offering.required");
    setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0];
    if (first) document.getElementById(`package-field-${first}`)?.focus();
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isWorkspaceDeploy && !agreed) {
      setAgreementError(true);
      return;
    }
    if (
      loading ||
      !validate() ||
      !offering.offeringDetails?.deliverables.length
    ) {
      if (isWorkspaceDeploy) setAdjusting(true);
      return;
    }
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
                className="h-11 min-h-11 gap-1.5 px-3.5 text-sm sm:h-9 sm:min-h-9"
                loading={loading}
              >
                {isWorkspaceDeploy && <Rocket className="size-4 shrink-0" />}
                {isWorkspaceDeploy
                  ? t("mediaPackage.deploy.startButton", "Bắt đầu triển khai")
                  : t("mediaPackage.editor.save")}
              </Button>
            </>
          }
          title={
            isWorkspaceDeploy
              ? t(
                  "mediaPackage.deploy.title",
                  "Xác nhận & Triển khai gói truyền thông",
                )
              : t(
                  editing
                    ? "mediaPackage.editor.editTitle"
                    : "mediaPackage.form.title",
                )
          }
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
              {isWorkspaceDeploy && (
                <section
                  aria-label="Xác nhận điều khoản triển khai"
                  className="border-brand-orange/30 bg-brand-orange-soft/60 space-y-3 rounded-2xl border p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="text-foreground flex items-center gap-2 text-base font-bold">
                        <CheckCircle2 className="text-brand-orange size-5 shrink-0" />
                        <span>
                          Bạn đã đồng ý với các điều khoản trong gói này chưa?
                        </span>
                      </h3>
                      <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                        Vui lòng kiểm tra kỹ ngân sách, thời lượng, mô tả và
                        hạng mục bàn giao bên dưới. Nếu cần thay đổi, bạn có
                        thể cân chỉnh trước khi nhấn{" "}
                        <strong className="text-foreground">
                          Bắt đầu triển khai
                        </strong>
                        .
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={adjusting ? "secondary" : "outline"}
                      size="sm"
                      className="shrink-0 gap-1.5 rounded-xl bg-background font-semibold"
                      onClick={() => setAdjusting((prev) => !prev)}
                    >
                      {adjusting ? (
                        <>
                          <Eye className="size-4" />
                          Xem bản tóm tắt
                        </>
                      ) : (
                        <>
                          <Pencil className="size-4" />
                          Cân chỉnh gói
                        </>
                      )}
                    </Button>
                  </div>

                  <label className="border-border/70 bg-background/90 flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-medium">
                    <input
                      type="checkbox"
                      className="accent-brand-orange size-4 shrink-0 cursor-pointer"
                      checked={agreed}
                      onChange={(e) => {
                        setAgreed(e.target.checked);
                        if (e.target.checked) setAgreementError(false);
                      }}
                    />
                    <span className="text-foreground">
                      Tôi đã xem xét và đồng ý với toàn bộ điều khoản, hạng mục
                      của gói này để bắt đầu triển khai.
                    </span>
                  </label>
                  {agreementError && (
                    <p role="alert" className="text-destructive text-xs font-medium">
                      Vui lòng tick xác nhận đồng ý với các điều khoản trước khi
                      bắt đầu triển khai.
                    </p>
                  )}
                </section>
              )}

              {isWorkspaceDeploy && !adjusting ? (
                <PackageProposalView
                  mediaPackage={{
                    name: name.trim() || sourceTemplate?.name || "",
                    budgetAmount: budgetAmount.trim()
                      ? Number(budgetAmount)
                      : null,
                    durationWeeks: durationWeeks.trim()
                      ? Number(durationWeeks)
                      : null,
                    scopeDescription: scopeDescription.trim() || null,
                    offeringDetails: offering.offeringDetails ?? null,
                  }}
                />
              ) : (
                <>
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
                    onChange={(e) => {
                      const val = e.target.value;
                      setName(val);
                      setErrors((prev) => ({
                        ...prev,
                        name: validateName(val),
                      }));
                    }}
                  />
                  <div className="[&_button[aria-pressed=true]]:border-brand-orange [&_button[aria-pressed=true]]:bg-brand-orange-soft [&_button[aria-pressed=true]]:text-foreground [&_button]:bg-muted space-y-2 [&_button]:min-h-9">
                    <Input
                      id="package-field-budgetAmount"
                      type="text"
                      inputMode="numeric"
                      label={t("mediaPackage.editor.budgetOptional")}
                      value={formatVndInput(budgetAmount)}
                      iconSuffix={<span className="text-xs">VND</span>}
                      error={errors.budgetAmount}
                      onChange={(e) => {
                        const val = parseVndInput(e.target.value);
                        setBudgetAmount(val);
                        setErrors((prev) => ({
                          ...prev,
                          budgetAmount: validateBudget(val),
                        }));
                      }}
                    />
                    <QuickNumbers
                      values={[10000000, 25000000, 50000000]}
                      value={budgetAmount}
                      onChange={(val) => {
                        setBudgetAmount(val);
                        setErrors((prev) => ({
                          ...prev,
                          budgetAmount: validateBudget(val),
                        }));
                      }}
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
                      onChange={(e) => {
                        const val = e.target.value;
                        setDurationWeeks(val);
                        setErrors((prev) => ({
                          ...prev,
                          durationWeeks: validateDuration(val),
                        }));
                      }}
                    />
                    <QuickNumbers
                      values={[2, 4, 6, 8]}
                      value={durationWeeks}
                      onChange={(val) => {
                        setDurationWeeks(val);
                        setErrors((prev) => ({
                          ...prev,
                          durationWeeks: validateDuration(val),
                        }));
                      }}
                      format={(count) =>
                        t("mediaPackage.values.duration", { count })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <RichTextInput
                    id="package-field-scopeDescription"
                    label={t("mediaPackage.proposal.packageDescription")}
                    value={scopeDescription}
                    aria-invalid={Boolean(errors.scopeDescription)}
                    aria-describedby={
                      errors.scopeDescription
                        ? "package-form-errors"
                        : undefined
                    }
                    onChange={(val) => {
                      setScopeDescription(val);
                      setErrors((prev) => ({
                        ...prev,
                        scopeDescription: validateScope(val),
                      }));
                    }}
                  />
                  {errors.scopeDescription && (
                    <p role="alert" className="text-destructive text-xs">
                      {errors.scopeDescription}
                    </p>
                  )}
                </div>
              </section>
              <OfferingEditor
                value={offering}
                onChange={(next) => {
                  setOffering(next);
                  setErrors((prev) => ({
                    ...prev,
                    offering: next.offeringDetails?.deliverables.length
                      ? undefined
                      : t("mediaPackage.offering.required"),
                  }));
                }}
              />
                </>
              )}
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
