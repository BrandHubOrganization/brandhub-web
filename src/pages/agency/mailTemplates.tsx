import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { AdminMailTemplatesPanel } from "@/pages/admin/components/AdminMailTemplatesPanel";
import { SCOPES_BY_AUDIENCE } from "@/pages/mail-templates/blocks";
import { agencyMailTemplateService } from "@/pages/mail-templates/services/mailTemplateService";

/** Addendum B (B5): AGENCY_INTERNAL / AGENCY_CLIENT templates; the API allows the Agency OWNER and the MANAGER of a Workspace of this Agency. */
export function AgencyMailTemplatesPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const service = useMemo(
    () => ({
      list: (params: { q?: string; page?: number; size?: number }) => agencyMailTemplateService.list(id!, params),
      get: (templateId: string) => agencyMailTemplateService.get(id!, templateId),
      create: (payload: Parameters<typeof agencyMailTemplateService.create>[1]) =>
        agencyMailTemplateService.create(id!, payload),
      update: (templateId: string, payload: Parameters<typeof agencyMailTemplateService.update>[2]) =>
        agencyMailTemplateService.update(id!, templateId, payload),
      remove: (templateId: string) => agencyMailTemplateService.remove(id!, templateId),
    }),
    [id],
  );

  if (!id) return null;

  return (
    <PageWrapper
      title={t("mailTemplate.agency.title")}
      description={t("mailTemplate.agency.description")}
      actions={
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => navigate(`/agency/${id}`)}>
          {t("agency.detail.backToProfile")}
        </Button>
      }
    >
      <AdminMailTemplatesPanel
        service={service}
        scopes={SCOPES_BY_AUDIENCE.agency}
        agencyId={id}
        draftKey={`mail-template-draft:agency:${id}`}
      />
    </PageWrapper>
  );
}
