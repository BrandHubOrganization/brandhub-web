import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { FolderOpen, Users } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage } from "@/utils/error";
import type { AgencyStatsResponse } from "@/types/agency";
import {
  BarStatChart,
  LineStatChart,
  PieStatChart,
} from "./components/stats/StatCharts";

export function AgencyStatsPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AgencyStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    agencyService
      .getStats(id)
      .then(({ data }) => setStats(data.data))
      .catch((err: unknown) =>
        toast.error(extractErrorMessage(err, t("agency.errors.loadOneFailed"))),
      )
      .finally(() => setLoading(false));
  }, [id, t]);

  if (loading || !stats) return null;

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-card rounded-xl border p-4">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Users className="size-3.5" />
            {t("agency.detail.statsMembers")}
          </div>
          <p className="mt-1 text-2xl font-bold">{stats.memberCount}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <FolderOpen className="size-3.5" />
            {t("agency.detail.statsWorkspaces")}
          </div>
          <p className="mt-1 text-2xl font-bold">{stats.workspaceCount}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarStatChart
          title={t("agency.detail.statsMembersByRole")}
          data={stats.membersByRole}
        />
        <PieStatChart
          title={t("agency.detail.statsWorkspacesByIndustry")}
          data={stats.workspacesByIndustry}
        />
        <LineStatChart
          title={t("agency.detail.statsMemberGrowth")}
          data={stats.memberGrowthByMonth}
        />
        <PieStatChart
          title={t("agency.detail.statsContentByStatus")}
          data={stats.contentByStatus}
        />
        <LineStatChart
          title={t("agency.detail.statsPostsPublished")}
          data={stats.postsPublishedByMonth}
        />
      </div>
    </PageWrapper>
  );
}

export default AgencyStatsPage;
