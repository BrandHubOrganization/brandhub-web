import { useState } from "react";
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

  const reset = () => {
    setName("");
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
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    const success = await onSubmit({
      sourceTemplateId: sourceTemplate?.id,
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
    if (!nextOpen && !loading) reset();
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("mediaPackage.form.title")}</DialogTitle>
          <DialogDescription>
            {t("mediaPackage.form.description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Input
            label={t("mediaPackage.form.nameLabel")}
            placeholder={t("mediaPackage.form.namePlaceholder")}
            value={name}
            maxLength={255}
            error={errors.name}
            onChange={(event) => setName(event.target.value)}
          />

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
              type="number"
              min="0.01"
              step="0.01"
              label={t("mediaPackage.form.budgetLabel")}
              value={budgetAmount}
              error={errors.budgetAmount}
              onChange={(event) => setBudgetAmount(event.target.value)}
            />
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="media-package-scope"
              className="text-xs font-semibold"
            >
              {t("mediaPackage.form.scopeLabel")}
            </Label>
            <Textarea
              id="media-package-scope"
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

          <DialogFooter>
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
