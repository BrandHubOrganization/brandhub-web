import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { errorCode } from "@/services/adminRevenueService";
import { SCOPES_BY_AUDIENCE } from "./blocks";
import { MailTemplateEditor, type FormAdapter } from "./components/MailTemplateEditor";
import { mailTemplateService } from "./services/mailTemplateService";
import type { MailTemplate } from "./types";

interface MailTemplateEditPageProps {
  mode?: "create" | "edit";
}

export function MailTemplateEditPage({ mode }: MailTemplateEditPageProps) {
  const { id: workspaceId = "", templateId = "" } = useParams<{ id: string; templateId?: string }>();
  const [searchParams] = useSearchParams();
  const cloneFrom = searchParams.get("cloneFrom");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const effectiveMode: "create" | "edit" = templateId ? "edit" : "create";
  const [template, setTemplate] = useState<MailTemplate | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(templateId || cloneFrom));

  useEffect(() => {
    const targetId = templateId || cloneFrom;
    if (!workspaceId || !targetId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    mailTemplateService
      .get(workspaceId, targetId)
      .then((data) => {
        if (!cancelled) setTemplate(data);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(
            t(`mailTemplate.errors.${errorCode(err)}`, {
              defaultValue: t("mailTemplate.errors.generic"),
            }),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, templateId, cloneFrom, t]);

  const adapter = useMemo<FormAdapter>(
    () => ({
      save: (payload, existing) =>
        existing
          ? mailTemplateService.update(workspaceId, existing.id, payload)
          : mailTemplateService.create(workspaceId, payload),
      scopes: SCOPES_BY_AUDIENCE.workspace,
      uploadAttachment: async (file) => {
        const u = await mailTemplateService.upload(workspaceId, file, "attachments");
        return { attachmentId: u.id, name: u.name, contentType: u.contentType, size: u.size };
      },
    }),
    [workspaceId],
  );

  const backToList = () => navigate(`/workspaces/${workspaceId}/mail-templates`);

  return (
    <PageWrapper
      title={
        effectiveMode === "edit"
          ? t("mailTemplate.form.editTitle", "Chỉnh sửa mẫu email")
          : t("mailTemplate.form.createTitle", "Tạo mẫu email mới")
      }
      description={t("mailTemplate.subtitle")}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={backToList}
          className="gap-1.5"
        >
          <ArrowLeft className="size-3.5" />
          {t("mailTemplate.backToList", "Quay lại danh sách mẫu")}
        </Button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <MailTemplateEditor
          key={`${effectiveMode}-${template?.id ?? "new"}`}
          mode={effectiveMode}
          template={template}
          adapter={adapter}
          draftKey={`mail-template-draft:${workspaceId}`}
          onClose={backToList}
          onSaved={() => {
            toast.success(t("mailTemplate.form.saved"));
            backToList();
          }}
        />
      )}
    </PageWrapper>
  );
}

export default MailTemplateEditPage;
