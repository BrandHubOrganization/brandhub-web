import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { workspaceTemplateService } from "@/services/workspaceTemplateService";
import { extractErrorMessage } from "@/utils/error";
import type { WorkspaceTemplate } from "@/types/workspace";

export function WorkspaceTemplatesPage() {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<WorkspaceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    workspaceTemplateService
      .list()
      .then(({ data }) => setTemplates(data.data))
      .catch((err: unknown) =>
        toast.error(
          extractErrorMessage(err, t("workspace.templates.loadError")),
        ),
      )
      .finally(() => setLoading(false));
  }, [t]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await workspaceTemplateService.remove(id);
      setTemplates((prev) => prev.filter((tpl) => tpl.id !== id));
      toast.success(t("workspace.templates.deleteSuccess"));
    } catch (err) {
      toast.error(
        extractErrorMessage(err, t("workspace.templates.deleteError")),
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return null;

  return (
    <PageWrapper
      title={t("workspace.templates.title")}
      description={t("workspace.templates.description")}
    >
      {templates.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {t("workspace.templates.empty")}
        </p>
      ) : (
        <div className="flex max-w-lg flex-col gap-3">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="border-border bg-card rounded-xl border p-4"
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="text-foreground cursor-pointer text-left text-sm font-medium hover:underline"
                  onClick={() =>
                    setExpandedId(expandedId === tpl.id ? null : tpl.id)
                  }
                >
                  {tpl.name}
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={deletingId === tpl.id}
                  onClick={() => handleDelete(tpl.id)}
                >
                  <Trash2 className="size-3.5 text-rose-500" />
                </Button>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                {new Date(tpl.createdAt).toLocaleDateString()}
              </p>
              {expandedId === tpl.id && (
                <pre className="bg-muted mt-3 overflow-x-auto rounded-md p-3 text-xs">
                  {tpl.configSnapshot}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

export default WorkspaceTemplatesPage;
