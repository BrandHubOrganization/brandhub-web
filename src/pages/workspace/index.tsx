import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { useWorkspaceList } from "./hooks/useWorkspaceList";
import { WorkspaceCardGrid } from "./components/WorkspaceCardGrid";

export function WorkspacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { workspaces, loading } = useWorkspaceList();

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
        <WorkspaceCardGrid
          workspaces={workspaces}
          onOpen={(id) => navigate(`/workspaces/${id}/settings`)}
        />
      )}
    </PageWrapper>
  );
}

export default WorkspacePage;
