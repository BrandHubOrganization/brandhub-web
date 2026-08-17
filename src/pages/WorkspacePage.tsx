import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { workspaceService } from "@/services/workspaceService";
import { extractErrorMessage } from "@/utils/error";
import type { Workspace } from "@/types/workspace";

export function WorkspacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    workspaceService
      .list()
      .then(({ data }) => setWorkspaces(data.data))
      .catch((err: unknown) =>
        toast.error(extractErrorMessage(err, t("common.loadFailed"))),
      )
      .finally(() => setLoading(false));
  }, [t]);

  if (loading) return null;

  return (
    <PageWrapper
      title={t("workspace.list.title")}
      description={t("workspace.list.description")}
      actions={
        <Button
          className="bg-[#f05a28] hover:bg-[#f05a28]/90 text-white cursor-pointer text-xs"
          onClick={() => navigate("/workspaces/create")}
        >
          {t("workspace.list.createButton")}
        </Button>
      }
    >
      {workspaces.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("workspace.list.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => navigate(`/workspaces/${ws.id}/settings`)}
              className="border border-border bg-card rounded-lg overflow-hidden flex flex-col justify-between text-left cursor-pointer hover:border-[#f05a28]/50 transition-colors"
            >
              <div className="h-1.5 bg-[#f05a28]" />
              <div className="p-6 space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-md bg-[#fff0eb] text-[#f05a28] font-bold text-sm">
                    {ws.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{ws.name}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                      {ws.slug}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

export default WorkspacePage;
