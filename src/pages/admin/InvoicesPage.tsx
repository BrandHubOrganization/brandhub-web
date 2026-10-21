import { useState } from "react";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { InvoiceHistory } from "@/pages/subscription/components/InvoiceHistory";

export default function AdminInvoicesPage() {
  const { t } = useTranslation();
  const userId = useAuthStore((state) => state.user?.id);
  const [draft, setDraft] = useState("");
  const [agencyId, setAgencyId] = useState("");
  const valid =
    !draft.trim() ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      draft.trim(),
    );
  return (
    <PageWrapper
      title={t("subscription.invoices.adminTitle")}
      description={t("subscription.invoices.adminDescription")}
    >
      <form
        className="mb-5 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (valid) setAgencyId(draft.trim());
        }}
      >
        <label className="min-w-0 flex-1 text-sm">
          {t("subscription.invoices.agencyFilter")}
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t("subscription.invoices.allAgencies")}
            aria-invalid={!valid}
            className="mt-2 min-h-11"
          />
        </label>
        <Button variant="outline" type="submit" disabled={!valid}>
          {t("subscription.invoices.apply")}
        </Button>
      </form>
      {userId && (
        <InvoiceHistory
          key={`${userId}:${agencyId}`}
          agencyId={agencyId}
          userId={userId}
          admin
        />
      )}
    </PageWrapper>
  );
}
