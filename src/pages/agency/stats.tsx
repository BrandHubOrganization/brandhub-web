import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { BarChart3, FolderOpen, Users } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { agencyService } from "@/services/agencyService";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { extractErrorMessage } from "@/utils/error";
import type { AgencyMember } from "@/types/agency";

export function AgencyStatsPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const workspaces = useWorkspaceStore((s) => s.workspaceList);

  const [members, setMembers] = useState<AgencyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    agencyService
      .listMembers(id)
      .then(({ data }) => setMembers(data.data))
      .catch((err: unknown) =>
        toast.error(extractErrorMessage(err, t("agency.errors.loadOneFailed"))),
      )
      .finally(() => setLoading(false));
  }, [id, t]);

  const agencyWorkspaceCount = workspaces.filter(
    (ws) => ws.agencyId === id,
  ).length;

  if (loading) return null;

  return (
    <PageWrapper
      title={t("agency.detail.nav.stats")}
      description={t("agency.detail.statsDescription")}
      actions={
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => navigate(`/agency/${id}`)}
        >
          {t("agency.detail.backToProfile")}
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-xl border p-4">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Users className="size-3.5" />
            {t("agency.detail.statsMembers")}
          </div>
          <p className="mt-1 text-2xl font-bold">{members.length}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <FolderOpen className="size-3.5" />
            {t("agency.detail.statsWorkspaces")}
          </div>
          <p className="mt-1 text-2xl font-bold">{agencyWorkspaceCount}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <BarChart3 className="size-3.5" />
            {t("agency.detail.statsActivity")}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("agency.detail.statsActivityPlaceholder")}
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}

export default AgencyStatsPage;
