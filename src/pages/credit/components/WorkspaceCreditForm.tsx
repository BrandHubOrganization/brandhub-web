import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  creditErrorKey,
  creditInteger,
} from "@/pages/credit/utils/creditInput";
import type { WorkspaceCredit } from "@/pages/credit/types/credit";

interface Props {
  workspace: WorkspaceCredit;
  onSave: (workspace: WorkspaceCredit, cap: number | null) => Promise<void>;
  onReload: () => Promise<void>;
  onClose: () => void;
}

export function WorkspaceCreditForm({
  workspace,
  onSave,
  onReload,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const id = useId();
  const [original] = useState(workspace);
  const [isUnlimited, setIsUnlimited] = useState(workspace.cap === null);
  const [value, setValue] = useState(
    workspace.cap === null ? "" : String(workspace.cap),
  );
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [isStale, setIsStale] = useState(false);
  const validate = () => {
    const isValid = isUnlimited || creditInteger(value) !== null;
    if (!isStale) setError(isValid ? "" : "credit.errors.integer");
    return isValid;
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isPending || isStale || !validate()) return;
    setIsPending(true);
    try {
      await onSave(original, isUnlimited ? null : creditInteger(value));
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
  return (
    <form
      onSubmit={submit}
      className="border-border bg-muted/30 space-y-3 rounded-xl border p-4"
    >
      <fieldset disabled={isPending} className="space-y-3">
        <label htmlFor={id} className="text-sm font-medium">
          {t("credit.workspace.mode")}
        </label>
        <Select
          id={id}
          value={isUnlimited ? "unlimited" : "cap"}
          onChange={(event) => {
            setIsUnlimited(event.target.value === "unlimited");
            if (!isStale) setError("");
          }}
        >
          <option value="unlimited">{t("credit.workspace.unlimited")}</option>
          <option value="cap">{t("credit.workspace.limited")}</option>
        </Select>
        {!isUnlimited ? (
          <Input
            label={t("credit.workspace.cap")}
            inputMode="numeric"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onBlur={validate}
            error={error === "credit.errors.integer" ? t(error) : undefined}
          />
        ) : null}
      </fieldset>
      <p className="text-muted-foreground text-xs">
        {t("credit.workspace.hint")}
      </p>
      {error && error !== "credit.errors.integer" ? (
        <p role="alert" className="text-destructive text-sm">
          {t(error)}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          variant="orange"
          loading={isPending}
          disabled={isPending || isStale}
        >
          {t("credit.save")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => void reload()}
        >
          {t("credit.reload")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          onClick={onClose}
        >
          {t("common.confirmDialog.cancel")}
        </Button>
      </div>
    </form>
  );
}
