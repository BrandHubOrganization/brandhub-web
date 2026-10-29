import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { creditPriceImportService as service } from "@/pages/credit/services/creditPriceImportService";
import { creditKeys } from "@/pages/credit/utils/creditQuery";
import { creditErrorKey } from "@/pages/credit/utils/creditInput";
import type { CreditPrice } from "@/pages/credit/types/credit";
import type {
  CreditPriceImportPreview,
  CreditPriceImportResult,
} from "@/pages/credit/types/creditPriceImport";

const MAX_BYTES = 64 * 1024;
function importError(error: unknown) {
  const code = isAxiosError(error)
    ? error.response?.data?.error?.code
    : undefined;
  if (code === "CREDIT_PRICE_CSV_TOO_LARGE")
    return "credit.csv.issue.FILE_SIZE";
  if (code === "CREDIT_PRICE_CSV_CHANGED") return "credit.csv.changed";
  if (code === "CREDIT_PRICE_CSV_INVALID" || code === "VALIDATION_ERROR")
    return "credit.csv.invalid";
  return creditErrorKey(error);
}

export function useCreditPriceImport() {
  const { t } = useTranslation();
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const input = useRef<HTMLInputElement>(null);
  const attachInput = useCallback((element: HTMLInputElement | null) => {
    input.current = element;
  }, []);
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const applying = useRef(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CreditPriceImportPreview | null>(null);
  const [result, setResult] = useState<CreditPriceImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"preview" | "apply" | null>(null);
  const [needsReview, setNeedsReview] = useState(false);
  useEffect(
    () => () => {
      generation.current++;
      controller.current?.abort();
    },
    [],
  );

  const choose = () => {
    if (!applying.current) input.current?.click();
  };
  const select = async (selected: File) => {
    if (applying.current) return;
    const version = ++generation.current;
    controller.current?.abort();
    setFile(selected);
    setPreview(null);
    setResult(null);
    setError(null);
    setNeedsReview(false);
    setBusy(null);
    if (!selected.name.toLowerCase().endsWith(".csv")) {
      setError("credit.csv.issue.FILE_TYPE");
      return;
    }
    if (selected.size === 0) {
      setError("credit.csv.issue.FILE_EMPTY");
      return;
    }
    if (selected.size > MAX_BYTES) {
      setError("credit.csv.issue.FILE_SIZE");
      return;
    }
    const pending = new AbortController();
    controller.current = pending;
    setBusy("preview");
    try {
      const data = await service.preview(selected, pending.signal);
      if (generation.current === version) setPreview(data);
    } catch (failure) {
      if (!pending.signal.aborted && generation.current === version)
        setError(importError(failure));
    } finally {
      if (generation.current === version) setBusy(null);
    }
  };
  const reset = () => {
    if (applying.current) return;
    generation.current++;
    controller.current?.abort();
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setNeedsReview(false);
    setBusy(null);
  };
  const apply = async () => {
    if (applying.current || busy || !file || !preview?.valid || needsReview)
      return;
    applying.current = true;
    setBusy("apply");
    setError(null);
    try {
      const applied = await service.apply(file, {
        sha256: preview.sha256,
        expectedRevisions: preview.rows.map((row) => ({
          operation: row.proposal.operation,
          revision: row.current?.revision ?? "0",
        })),
      });
      const key = creditKeys.prices(userId);
      client.setQueryData<CreditPrice[]>(key, (current = []) => [
        ...current.filter(
          (price) =>
            !applied.updatedPrices.some(
              (next) => next.operation === price.operation,
            ),
        ),
        ...applied.updatedPrices,
      ]);
      void client.invalidateQueries({ queryKey: key });
      setResult(applied);
      setFile(null);
      setPreview(null);
      setNeedsReview(false);
      toast.success(
        t("credit.csv.success", {
          count: applied.updatedPrices.length,
          unchanged: applied.unchangedOperations.length,
        }),
      );
    } catch (failure) {
      setError(importError(failure));
      setNeedsReview(true);
    } finally {
      applying.current = false;
      setBusy(null);
    }
  };
  return {
    attachInput,
    file,
    preview,
    result,
    error,
    busy,
    needsReview,
    choose,
    select,
    reset,
    apply,
  };
}
