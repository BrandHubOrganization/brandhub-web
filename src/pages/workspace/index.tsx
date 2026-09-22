import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { useAgencyStore } from "@/store/agencyStore";
import { useWorkspaceList } from "./hooks/useWorkspaceList";
import { WorkspaceCardGrid } from "./components/WorkspaceCardGrid";

export function WorkspacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { workspaces, loading } = useWorkspaceList();
  const currentAgencyId = useAgencyStore((s) => s.currentAgencyId);

  if (loading) return null;

  const handleCreateClick = () => {
    // Đã có agency active: đi thẳng vào form tạo. Chưa có: bắt chọn agency trước.
    if (currentAgencyId) {
      navigate(`/workspaces/create?agencyId=${currentAgencyId}`);
    } else {
      navigate("/agency");
    }
  };

  return (
    <PageWrapper
      title={t("workspace.list.title")}
      description={t("workspace.list.description")}
      actions={
        <Button
          className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer text-xs text-white"
          onClick={handleCreateClick}
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
