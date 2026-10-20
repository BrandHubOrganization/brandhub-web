import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { CreditQueryState } from "@/pages/credit/components/CreditQueryState";
import { CreditIntegrationNote } from "@/pages/credit/components/CreditIntegrationNote";
import { CreditCatalog } from "@/pages/credit/components/CreditCatalog";
import { OwnerCreditView } from "@/pages/credit/components/OwnerCreditView";
import { PersonalCreditView } from "@/pages/credit/components/PersonalCreditView";
import { useCreditContext } from "@/pages/credit/hooks/useCreditReporting";

export default function AgencyCreditPage() {
  const { id } = useParams();
  return id ? <AgencyCreditContent key={id} agencyId={id} /> : null;
}

function AgencyCreditContent({ agencyId }: { agencyId: string }) {
  const { t } = useTranslation();
  const { query, userId, isOwner } = useCreditContext(agencyId);
  return (
    <PageWrapper compact showGuideButton={false} title={t("credit.title")}>
      {query.isPending || query.isError ? (
        <CreditQueryState
          loading={query.isPending}
          error={query.error}
          retry={() => query.refetch()}
        />
      ) : (
        <div key={`${userId}:${agencyId}:${isOwner}`} className="space-y-5">
          <CreditIntegrationNote />
          {isOwner ? (
            <OwnerCreditView agencyId={agencyId} />
          ) : (
            <PersonalCreditView agencyId={agencyId} />
          )}
          <CreditCatalog />
        </div>
      )}
    </PageWrapper>
  );
}
