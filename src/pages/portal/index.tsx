import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import {
  approveQueueItem,
  getApprovalQueue,
  requestQueueItemRevision,
  resubmitQueueItem,
} from "@/services/mock/mockPortalService";
import type { ApprovalQueueItem } from "@/types/portal";
import { ApprovalQueueList } from "./components/ApprovalQueueList";
import { PortalCalendarView } from "./components/PortalCalendarView";

type PortalTab = "approvals" | "calendar";

export function PortalPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ApprovalQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PortalTab>("approvals");

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

  async function reloadQueue() {
    const queue = await getApprovalQueue();
    setItems(queue);
  }

  async function handleApprove(id: string) {
    try {
      await approveQueueItem(id);
      await reloadQueue();
      toast.success(t("dashboard.portal.approveSuccess"));
    } catch (err) {
      console.error("Failed to approve item:", err);
      toast.error(t("dashboard.portal.approveError"));
    }
  }

  async function handleRequestRevision(id: string, comment: string) {
    if (!comment.trim()) {
      toast.error(t("dashboard.portal.rejectReasonRequired"));
      return;
    }
    try {
      await requestQueueItemRevision(id, comment.trim());
      await reloadQueue();
      toast.success(t("dashboard.portal.revisionSuccess"));
    } catch (err) {
      console.error("Failed to request revision:", err);
      toast.error(t("dashboard.portal.revisionError"));
    }
  }

  async function handleResubmit(id: string) {
    try {
      await resubmitQueueItem(id);
      await reloadQueue();
      toast.success(t("dashboard.portal.resubmitSuccess"));
    } catch (err) {
      console.error("Failed to resubmit item:", err);
      toast.error(t("dashboard.portal.resubmitError"));
    }
  }

  return (
    <PageWrapper
      title={t("dashboard.portal.title")}
      description={t("dashboard.portal.description")}
    >
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("approvals")}
          className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === "approvals"
              ? "bg-brand-orange text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {t("dashboard.portal.tabApprovals")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("calendar")}
          className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === "calendar"
              ? "bg-brand-orange text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {t("dashboard.portal.tabCalendar")}
        </button>
      </div>

      {activeTab === "calendar" ? (
        <PortalCalendarView />
      ) : isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <ApprovalQueueList
          items={items}
          onApprove={handleApprove}
          onRequestRevision={handleRequestRevision}
          onResubmit={handleResubmit}
        />
      )}
    </PageWrapper>
  );
}

export default PortalPage;
