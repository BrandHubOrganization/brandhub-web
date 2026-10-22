import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { creditErrorKey } from "@/pages/credit/utils/creditInput";

export function CreditQueryState({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error: unknown;
  retry: () => unknown;
}) {
  const { t } = useTranslation();
  const errorKey = creditErrorKey(error);
  if (loading)
    return (
      <div role="status" className="flex items-center gap-2 p-4">
        <Spinner />
        {t("credit.loading")}
      </div>
    );
  return (
    <div
      role={errorKey === "credit.errors.account" ? "status" : "alert"}
      className="border-border bg-card space-y-3 rounded-xl border p-4"
    >
      <p className="text-sm">{t(errorKey)}</p>
      <Button variant="outline" onClick={() => void retry()}>
        {t("credit.retry")}
      </Button>
    </div>
  );
}
