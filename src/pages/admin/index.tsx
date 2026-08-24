import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PageWrapper from "@/components/layout/PageWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getModerationQueue,
  getPlatformStats,
  getSystemHealth,
  getUsers,
} from "@/services/mock/mockAdminService";
import type {
  AdminUser,
  ModerationItem,
  PlatformStat,
  SystemHealthMetric,
} from "./types/admin";
import { AdminUserTable } from "./components/AdminUserTable";
import { ModerationQueueList } from "./components/ModerationQueueList";
import { SystemHealthPanel } from "./components/SystemHealthPanel";
import { PlatformStatsGrid } from "./components/PlatformStatsGrid";
import { AdminErrorBanner } from "./components/AdminErrorBanner";
import { useAdminActions } from "./hooks/useAdminActions";

export function AdminPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [moderation, setModeration] = useState<ModerationItem[]>([]);
  const [health, setHealth] = useState<SystemHealthMetric[]>([]);
  const [stats, setStats] = useState<PlatformStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setIsError(false);
      try {
        const [usersData, moderationData, healthData, statsData] =
          await Promise.all([
            getUsers(),
            getModerationQueue(),
            getSystemHealth(),
            getPlatformStats(),
          ]);
        if (!cancelled) {
          setUsers(usersData);
          setModeration(moderationData);
          setHealth(healthData);
          setStats(statsData);
        }
      } catch (err) {
        console.error("Failed to load admin data:", err);
        if (!cancelled) setIsError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    handleVerify,
    handleToggleDisable,
    handleDeleteUser,
    handleApproveModeration,
    handleRemoveModeration,
  } = useAdminActions(setUsers, setModeration);

  return (
    <PageWrapper
      title={t("dashboard.admin.title")}
      description={t("dashboard.admin.description")}
    >
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-80 rounded-lg" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}

      {isError && !isLoading && <AdminErrorBanner />}

      {!isLoading && !isError && (
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">
              {t("dashboard.admin.tabs.users")}
            </TabsTrigger>
            <TabsTrigger value="moderation">
              {t("dashboard.admin.tabs.moderation")}
            </TabsTrigger>
            <TabsTrigger value="health">
              {t("dashboard.admin.tabs.health")}
            </TabsTrigger>
            <TabsTrigger value="stats">
              {t("dashboard.admin.tabs.stats")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <AdminUserTable
              users={users}
              onVerify={handleVerify}
              onToggleDisable={handleToggleDisable}
              onDelete={handleDeleteUser}
            />
          </TabsContent>

          <TabsContent value="moderation" className="mt-4">
            <ModerationQueueList
              items={moderation}
              onApprove={handleApproveModeration}
              onRemove={handleRemoveModeration}
            />
          </TabsContent>

          <TabsContent value="health" className="mt-4">
            <SystemHealthPanel metrics={health} />
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <PlatformStatsGrid stats={stats} />
          </TabsContent>
        </Tabs>
      )}
    </PageWrapper>
  );
}

export default AdminPage;
