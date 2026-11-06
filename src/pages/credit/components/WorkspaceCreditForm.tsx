import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCredits } from "@/pages/credit/utils/creditFormat";
import {
  creditErrorKey,
  creditInteger,
} from "@/pages/credit/utils/creditInput";
import type { WorkspaceCredit } from "@/pages/credit/types/credit";

interface Props {
  workspace: WorkspaceCredit;
  availableCredits?: number | null;
  otherWorkspacesCapSum?: number;
  onSave: (workspace: WorkspaceCredit, cap: number | null) => Promise<void>;
  onReload: () => Promise<void>;
  onClose: () => void;
}

function formatThousandDots(value: string): string {
  const withoutDots = value.replace(/\./g, "");
  if (/^[1-9]\d*$/.test(withoutDots)) {
    return withoutDots.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  return value;
}

export function WorkspaceCreditForm({
  workspace,
  availableCredits = null,
  otherWorkspacesCapSum = 0,
  onSave,
  onReload,
  onClose,
}: Props) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const [original] = useState(workspace);
  const [isUnlimited, setIsUnlimited] = useState(workspace.cap === null);
  const [value, setValue] = useState(
    workspace.cap === null ? "" : formatThousandDots(String(workspace.cap)),
  );
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [isStale, setIsStale] = useState(false);

  const normalized = value.trim().replace(/\./g, "");
  const parsedCap = isUnlimited ? null : creditInteger(normalized);
  const projectedTotalCap = otherWorkspacesCapSum + (parsedCap ?? 0);
  const exceedsAvailable =
    !isUnlimited &&
    parsedCap !== null &&
    availableCredits !== null &&
    projectedTotalCap > availableCredits;
  const committedInPeriod = workspace.used + workspace.held;
  const belowCommitted =
    !isUnlimited && parsedCap !== null && parsedCap < committedInPeriod;

  const validate = (nextValue = value, unlimitedMode = isUnlimited) => {
    if (unlimitedMode) {
      if (!isStale) setError("");
      return true;
    }
    const candidate = nextValue.trim().replace(/\./g, "");
    if (!candidate) {
      if (!isStale) setError("credit.errors.required");
      return false;
    }
    const isValid = creditInteger(candidate) !== null;
    if (!isStale) setError(isValid ? "" : "credit.errors.integer");
    return isValid;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isPending || isStale || !validate()) return;
    setIsPending(true);
    try {
      await onSave(original, isUnlimited ? null : creditInteger(normalized));
      toast.success(t("credit.saved"));
      onClose();
    } catch (failure) {
      const key = creditErrorKey(failure);
      setError(key);
      setIsStale(key === "credit.errors.stale");
    } finally {
      setIsPending(false);
    }
  };

  const reload = async () => {
    setIsPending(true);
    try {
      await onReload();
      onClose();
    } catch (failure) {
      setError(creditErrorKey(failure));
    } finally {
      setIsPending(false);
    }
  };

  const inputErrorMessage =
    error === "credit.errors.required"
      ? t("credit.errors.required", "Vui lòng nhập hạn mức credit.")
      : error === "credit.errors.integer"
        ? t(error)
        : undefined;

  return (
    <form
      onSubmit={submit}
      noValidate
      className="border-border bg-muted/20 space-y-3 rounded-lg border p-4"
    >
      <fieldset disabled={isPending} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor={id} className="text-sm font-medium">
            {t("credit.workspace.mode")}
          </label>
          <Select
            id={id}
            value={isUnlimited ? "unlimited" : "cap"}
            onChange={(event) => {
              const nextUnlimited = event.target.value === "unlimited";
              setIsUnlimited(nextUnlimited);
              if (!isStale) setError("");
            }}
          >
            <option value="unlimited">{t("credit.workspace.unlimited")}</option>
            <option value="cap">{t("credit.workspace.limited")}</option>
          </Select>
        </div>

        {!isUnlimited ? (
          <Input
            label={t("credit.workspace.cap")}
            inputMode="numeric"
            value={value}
            onChange={(event) => {
              const next = formatThousandDots(event.target.value);
              setValue(next);
              if (error === "credit.errors.required" || error === "credit.errors.integer") {
                validate(next, false);
              }
            }}
            onBlur={() => validate()}
            error={inputErrorMessage}
          />
        ) : null}
      </fieldset>

      {exceedsAvailable && parsedCap !== null && availableCredits !== null && (
        <div
          role="status"
          data-testid="workspace-form-cap-warning"
          className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-0.5">
            <p className="font-medium">
              {parsedCap > availableCredits
                ? t("credit.workspace.singleCapExceedsWarning", {
                    cap: formatCredits(parsedCap, i18n.language),
                    available: formatCredits(availableCredits, i18n.language),
                    defaultValue: `Hạn mức của Workspace này (${formatCredits(parsedCap, i18n.language)} credit) lớn hơn số dư Credit hiện tại của Agency (${formatCredits(availableCredits, i18n.language)} credit).`,
                  })
                : t("credit.workspace.projectedTotalExceedsWarning", {
                    totalCap: formatCredits(projectedTotalCap, i18n.language),
                    available: formatCredits(availableCredits, i18n.language),
                    defaultValue: `Tổng giới hạn tối đa của các Workspace sau khi lưu (${formatCredits(projectedTotalCap, i18n.language)} credit) vượt quá số dư Credit hiện tại của Agency (${formatCredits(availableCredits, i18n.language)} credit).`,
                  })}
            </p>
            <p className="text-amber-700/90 dark:text-amber-300/90">
              {t(
                "credit.workspace.exceedsHint",
                "Bạn vẫn có thể lưu hạn mức này, nhưng tổng chi tiêu thực tế của các Workspace sẽ bị chặn khi quỹ Agency hết số dư.",
              )}
            </p>
          </div>
        </div>
      )}

      {belowCommitted && parsedCap !== null && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p>
            {t("credit.workspace.belowUsedWarning", {
              cap: formatCredits(parsedCap, i18n.language),
              committed: formatCredits(committedInPeriod, i18n.language),
              defaultValue: `Workspace này đã dùng/giữ ${formatCredits(committedInPeriod, i18n.language)} credit trong kỳ. Đặt hạn mức ${formatCredits(parsedCap, i18n.language)} credit sẽ tạm chặn các thao tác AI có phí cho đến kỳ tiếp theo.`,
            })}
          </p>
        </div>
      )}

      <p className="text-muted-foreground text-xs">
        {t("credit.workspace.hint")}
      </p>

      {error &&
      error !== "credit.errors.integer" &&
      error !== "credit.errors.required" ? (
        <p role="alert" className="text-destructive text-sm">
          {t(error)}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          variant="orange"
          size="sm"
          loading={isPending}
          disabled={isPending || isStale}
        >
          {t("credit.save")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => void reload()}
        >
          {t("credit.reload")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={onClose}
        >
          {t("common.confirmDialog.cancel")}
        </Button>
      </div>
    </form>
  );
}
