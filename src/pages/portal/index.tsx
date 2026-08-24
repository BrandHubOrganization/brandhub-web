import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import {
  approveQueueItem,
  getApprovalQueue,
  requestQueueItemRevision,
} from "@/services/mock/mockPortalService";
import type { ApprovalQueueItem } from "@/types/portal";
import { ApprovalQueueList } from "./components/ApprovalQueueList";

export function PortalPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ApprovalQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadQueue() {
      setIsLoading(true);
      try {
        const queue = await getApprovalQueue();
        if (!cancelled) setItems(queue);
      } catch (err) {
        console.error("Failed to load approval queue:", err);
        if (!cancelled) toast.error(t("dashboard.portal.loadError"));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadQueue();
    return () => {
      cancelled = true;
    };
  }, [t]);

  async function handleApprove(id: string) {
    try {
      await approveQueueItem(id);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "APPROVED" as const } : item,
        ),
      );
      toast.success(t("dashboard.portal.approveSuccess"));
    } catch (err) {
      console.error("Failed to approve item:", err);
      toast.error(t("dashboard.portal.approveError"));
    }
  }

  async function handleRequestRevision(id: string) {
    try {
      await requestQueueItemRevision(id);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "REVISION_REQUESTED" as const }
            : item,
        ),
      );
      toast.success(t("dashboard.portal.revisionSuccess"));
    } catch (err) {
      console.error("Failed to request revision:", err);
      toast.error(t("dashboard.portal.revisionError"));
    }
  }

  return (
    <PageWrapper
      title={t("dashboard.portal.title")}
      description={t("dashboard.portal.description")}
    >
      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <ApprovalQueueList
          items={items}
          onApprove={handleApprove}
          onRequestRevision={handleRequestRevision}
        />
      )}
    </PageWrapper>
  );
}

export default PortalPage;
