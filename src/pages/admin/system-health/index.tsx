import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { useMonitoringFeed } from "@/pages/admin/system-health/hooks/useMonitoringFeed";
import {
  readServers,
  readTargets,
} from "@/pages/admin/system-health/services/monitoringService";
import { MonitoringFilters } from "@/pages/admin/system-health/components/MonitoringFilters";
import { ServerCards } from "@/pages/admin/system-health/components/ServerCards";
import { TargetCards } from "@/pages/admin/system-health/components/TargetCards";
import { TargetDetails } from "@/pages/admin/system-health/components/TargetDetails";
import type { Filters } from "@/pages/admin/system-health/components/MonitoringFilters";

export default function SystemHealthPage() {
  const { t, i18n } = useTranslation();
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.systemRole);
  const [denied, setDenied] = useState(false);
  const [tab, setTab] = useState("servers");
  const [selected, setSelected] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    environment: "",
    serverId: "",
    kind: "",
    status: "",
  });
  const onDenied = useCallback((status: number) => {
    setDenied(true);
    setSelected(null);
    if (status === 401) useAuthStore.getState().clearAuth();
  }, []);
  const enabled = authenticated && role === "ADMIN" && !denied;
  const hosts = useMonitoringFeed(readServers, onDenied, enabled);
  const health = useMonitoringFeed(readTargets, onDenied, enabled);
  const servers = hosts.snapshot?.rows ?? [];
  const targets = health.snapshot?.rows ?? [];
  const environments = [
    ...new Set([...servers, ...targets].map((row) => row.environment)),
  ].sort();
  const visibleServers = servers.filter(
    (row) =>
      (!filters.environment || row.environment === filters.environment) &&
      (!filters.serverId || row.serverId === filters.serverId),
  );
  const visibleTargets = targets.filter(
    (row) =>
      (!filters.environment || row.environment === filters.environment) &&
      (!filters.serverId || row.serverId === filters.serverId) &&
      (!filters.kind || row.kind === filters.kind) &&
      (!filters.status || row.status === filters.status),
  );
  const feed = tab === "servers" ? hosts : health;
  if (!enabled)
    return (
      <PageWrapper title={t("monitoring.title")}>
        <p role="alert">{t("monitoring.denied")}</p>
      </PageWrapper>
    );
  return (
    <PageWrapper
      title={t("monitoring.title")}
      description={t("monitoring.description")}
    >
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="servers">{t("monitoring.servers")}</TabsTrigger>
          <TabsTrigger value="health">{t("monitoring.health")}</TabsTrigger>
        </TabsList>
        <MonitoringFilters
          value={filters}
          onChange={setFilters}
          environments={environments}
          servers={servers}
          health={tab === "health"}
        />
        {feed.failed && (
          <p role="alert" className="text-destructive">
            {t("monitoring.unavailable")}
          </p>
        )}
        {feed.snapshot && (
          <p className="text-muted-foreground text-xs">
            {t("monitoring.updated")}:{" "}
            {new Date(feed.snapshot.serverTime).toLocaleString(i18n.language)}
          </p>
        )}
        {feed.loading && <Spinner aria-label={t("monitoring.loading")} />}
        <TabsContent value="servers">
          <ServerCards servers={visibleServers} />
        </TabsContent>
        <TabsContent value="health">
          <TargetCards targets={visibleTargets} onSelect={setSelected} />
        </TabsContent>
        <TargetDetails
          target={targets.find((row) => row.targetId === selected)}
          onClose={() => setSelected(null)}
        />
      </Tabs>
    </PageWrapper>
  );
}
