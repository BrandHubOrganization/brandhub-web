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
          className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer text-xs text-white"
          onClick={() => navigate("/workspaces/create")}
        >
          {t("workspace.list.createButton")}
        </Button>
      }
    >
      {workspaces.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {t("workspace.list.empty")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => navigate(`/workspaces/${ws.id}/settings`)}
              className="border-border bg-card hover:border-brand-orange/50 flex cursor-pointer flex-col justify-between overflow-hidden rounded-lg border text-left transition-colors"
            >
              <div className="bg-brand-orange h-1.5" />
              <div className="flex-1 space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-orange-soft text-brand-orange flex size-10 items-center justify-center rounded-md text-sm font-bold">
                    {ws.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-foreground text-sm font-bold">
                      {ws.name}
                    </h3>
                    <p className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
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
