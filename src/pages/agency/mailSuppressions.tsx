import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import {
  SuppressionsPanel,
  type SuppressionApi,
} from "@/pages/mail-templates/suppressions";
import { agencyMailSuppressionService } from "@/pages/mail-templates/services/mailTemplateService";

/** People who unsubscribed from this agency's mail; the Agency OWNER and its Workspace MANAGERs may re-subscribe them. */
export function AgencyMailSuppressionsPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const api = useMemo<SuppressionApi | null>(
    () =>
      id
        ? {
            list: (params) => agencyMailSuppressionService.list(id, params),
            remove: (email) => agencyMailSuppressionService.remove(id, email),
          }
        : null,
    [id],
  );
  if (!id || !api) return null;
  return (
    <PageWrapper
      title={t("mailTemplate.suppressions.title")}
      description={t("mailTemplate.suppressions.agencySubtitle")}
    >
      <SuppressionsPanel
        key={id}
        api={api}
        backTo={`/agency/${id}/mail-templates`}
      />
    </PageWrapper>
  );
}
