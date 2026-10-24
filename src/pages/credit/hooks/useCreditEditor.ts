import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  creditErrorKey,
  creditInteger,
} from "@/pages/credit/utils/creditInput";

export interface CreditEditorOptions {
  initial: number | null;
  enabled?: boolean;
  onSave: (amount: number, enabled: boolean) => Promise<unknown>;
  onReload: () => Promise<{ initial: number | null; enabled?: boolean }>;
}
export function useCreditEditor(options: CreditEditorOptions) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<string | null>(null);
  const [enabledDraft, setEnabled] = useState<boolean | null>(null);
  const value =
    draft ?? (options.initial === null ? "" : String(options.initial));
  const enabled = enabledDraft ?? options.enabled ?? true;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [stale, setStale] = useState(false);
  const setValue = (next: string) => {
    setDraft(next);
    setSaved(false);
  };
  const validate = () => {
    const valid = creditInteger(value) !== null;
    if (!stale) setError(valid ? "" : "credit.errors.integer");
    return valid;
  };
  const submit = async () => {
    const amount = creditInteger(value);
    if (amount === null) {
      setError("credit.errors.integer");
      return;
    }
    setPending(true);
    setError("");
    setSaved(false);
    try {
      await options.onSave(amount, enabled);
      setSaved(true);
      toast.success(t("credit.saved"));
    } catch (failure) {
      const key = creditErrorKey(failure);
      setError(key);
      setStale(key === "credit.errors.stale");
    } finally {
      setPending(false);
    }
  };
  const reload = async () => {
    setPending(true);
    setError("");
    setSaved(false);
    try {
      const fresh = await options.onReload();
      setDraft(fresh.initial === null ? "" : String(fresh.initial));
      setEnabled(fresh.enabled ?? true);
      setStale(false);
    } catch (failure) {
      setError(creditErrorKey(failure));
    } finally {
      setPending(false);
    }
  };
  return {
    value,
    setValue,
    enabled,
    setEnabled,
    pending,
    error,
    saved,
    stale,
    submit,
    reload,
    validate,
  };
}
