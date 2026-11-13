import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardIdentity } from "@/pages/dashboard/components/DashboardIdentity";
import { DashboardSkeleton } from "@/pages/dashboard/components/DashboardSkeleton";
import { useAgencyStore } from "@/store/agencyStore";
import { useAgencyDashboard } from "@/pages/agency/dashboard/hooks/useAgencyDashboard";
import { AgencyTaskSection } from "@/pages/agency/dashboard/components/AgencyTaskSection";
import { AgencyWorkspaceSection } from "@/pages/agency/dashboard/components/AgencyWorkspaceSection";
export function AgencyDashboardPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const setAgency = useAgencyStore((s) => s.setCurrentAgencyId);
  const data = useAgencyDashboard(id);
  const queryClient = useQueryClient();
  useEffect(() => {
    if (id) setAgency(id);
  }, [id, setAgency]);
  const agency = data.agency.data;
  const workspaces = data.workspaces.data || [];
  if (data.agency.isPending)
    return (
      <div className="p-4">
        <DashboardSkeleton />
      </div>
    );
  if (data.agency.isError || !agency)
    return (
      <div className="p-6" role="alert">
        {t("dashboard.experience.loadError")}
        <Button variant="ghost" onClick={() => void data.agency.refetch()}>
          {t("dashboard.experience.retry")}
        </Button>
      </div>
    );
  const refresh = () => {
    void queryClient.invalidateQueries({
      queryKey: ["agency-dashboard-tasks"],
    });
    void data.agency.refetch();
    void data.workspaces.refetch();
    if (data.isOwner) {
      void data.members.refetch();
      void data.credits.refetch();
    }
    void data.clients.refetch();
  };
  return (
    <PageWrapper
      title={agency.name}
      hideHeader
      compact
      contentClassName="space-y-4"
      fullWidth
      className="space-y-4 p-4 md:p-6"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <DashboardIdentity name={agency.name} src={agency.logoUrl} />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold" title={agency.name}>
              {agency.name}
            </h1>
            <p className="text-muted-foreground text-xs">
              {t(
                `dashboard.experience.${data.isOwner ? "ownerHint" : "memberHint"}`,
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("dashboard.experience.refresh")}
            onClick={refresh}
          >
            <RefreshCw
              className={`size-4 ${data.agency.isFetching || data.workspaces.isFetching ? "animate-spin" : ""}`}
            />
          </Button>
          {data.isOwner && (
            <>
              <Button asChild variant="secondary" size="sm">
                <Link to={`/agency/${id}/members`}>
                  {t("dashboard.experience.manageMembers")}
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to={`/workspaces/create?agencyId=${id}`}>
                  {t("dashboard.experience.createWorkspace")}
                </Link>
              </Button>
            </>
          )}
        </div>
      </header>
      {data.isOwner && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric
            label={t("dashboard.experience.workspaces")}
            value={data.workspaces.isError ? null : workspaces.length}
            loading={data.workspaces.isPending}
          />
          <Metric
            label={t("dashboard.experience.members")}
            value={data.members.isError ? null : data.members.data?.length}
            loading={data.members.isPending}
          />
          <Metric
            label={t("dashboard.experience.credits")}
            value={
              data.credits.data?.visible &&
              Number.isFinite(Number(data.credits.data.available))
                ? Number(data.credits.data.available).toLocaleString(
                    i18n.language,
                  )
                : null
            }
            loading={data.credits.isPending}
          />
        </div>
      )}
      {data.isOwner && (data.members.isError || data.credits.isError) && (
        <div
          role="alert"
          className="bg-card flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm"
        >
          <span>{t("dashboard.experience.partial")}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (data.members.isError) void data.members.refetch();
              if (data.credits.isError) void data.credits.refetch();
            }}
          >
            {t("dashboard.experience.retry")}
          </Button>
        </div>
      )}
      {data.workspaces.isPending ? (
        <DashboardSkeleton />
      ) : data.workspaces.isError ? (
        <div role="alert" className="rounded-xl border p-4">
          {t("dashboard.experience.loadError")}
          <Button
            variant="ghost"
            onClick={() => void data.workspaces.refetch()}
          >
            {t("dashboard.experience.retry")}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {!data.isOwner && (
            <AgencyTaskSection
              key={`${id}-member`}
              workspaces={workspaces}
              isOwner={false}
            />
          )}
          <AgencyWorkspaceSection
            key={id}
            workspaces={workspaces}
            clients={data.clients.data}
          />
          {data.isOwner && (
            <AgencyTaskSection
              key={`${id}-owner`}
              workspaces={workspaces}
              isOwner
            />
          )}
        </div>
      )}
    </PageWrapper>
  );
}
function Metric({
  label,
  value,
  loading,
}: {
  label: string;
  value?: string | number | null;
  loading: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-card rounded-xl border p-4">
      <p className="text-muted-foreground text-xs">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-24" />
      ) : (
        <p className="mt-2 text-2xl font-semibold tabular-nums">
          {value ?? (
            <span className="text-muted-foreground text-sm">
              {t("dashboard.experience.unavailable")}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
export default AgencyDashboardPage;
