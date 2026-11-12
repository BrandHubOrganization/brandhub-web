import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { AdminMailTemplatesPanel } from "@/pages/admin/components/AdminMailTemplatesPanel";
import { SendMailDialog } from "@/pages/mail-templates/components/SendMailDialog";
import { SCOPES_BY_AUDIENCE } from "@/pages/mail-templates/blocks";
import { agencyMailTemplateService } from "@/pages/mail-templates/services/mailTemplateService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type { MailTemplateSummary } from "@/pages/mail-templates/types";

/** Addendum B (B5): AGENCY_INTERNAL / AGENCY_CLIENT templates; the API allows the Agency OWNER and the MANAGER of a Workspace of this Agency. */
export function AgencyMailTemplatesPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [sendTemplate, setSendTemplate] = useState<MailTemplateSummary | null>(null);

  const workspaceList = useWorkspaceStore((state) => state.workspaceList);
  const fetchWorkspaces = useWorkspaceStore((state) => state.fetchWorkspaces);

  useEffect(() => {
    if (workspaceList.length === 0) {
      void fetchWorkspaces();
    }
  }, [workspaceList.length, fetchWorkspaces]);

  const targetWorkspace = useMemo(
    () => workspaceList.find((w) => w.agencyId === id) ?? workspaceList[0],
    [workspaceList, id],
  );

  const handleSendTemplate = (template: MailTemplateSummary) => {
    if (!targetWorkspace) {
      toast.error(t("mailTemplate.agency.noWorkspace", "Cần ít nhất một không gian làm việc để gửi email."));
      return;
    }
    setSendTemplate(template);
  };

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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => navigate(`/agency/${id}/mail-templates/suppressions`)}
          >
            {t("mailTemplate.suppressions.link")}
          </Button>
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => navigate(`/agency/${id}`)}>
            {t("agency.detail.backToProfile")}
          </Button>
        </div>
      }
    >
      <AdminMailTemplatesPanel
        service={service}
        scopes={SCOPES_BY_AUDIENCE.agency}
        agencyId={id}
        draftKey={`mail-template-draft:agency:${id}`}
        onSendTemplate={handleSendTemplate}
      />

      {sendTemplate && targetWorkspace && (
        <SendMailDialog
          open={Boolean(sendTemplate)}
          workspaceId={targetWorkspace.id}
          agencyId={id}
          template={sendTemplate}
          onClose={() => setSendTemplate(null)}
        />
      )}
    </PageWrapper>
  );
}
