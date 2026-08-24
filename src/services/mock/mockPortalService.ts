import type { ApprovalQueueItem } from "@/types/portal";

const MOCK_QUEUE: ApprovalQueueItem[] = [
  {
    id: "req-1",
    title: "Social Post: Giới thiệu Nike Air Max Pulse",
    workspaceName: "Nike Vietnam",
    status: "AWAITING_APPROVAL",
    createdAt: "2026-07-17",
  },
  {
    id: "req-2",
    title: "Blog Post: Lợi ích của sữa hạt organic hàng ngày",
    workspaceName: "Sữa Hạt Organic",
    status: "APPROVED",
    createdAt: "2026-07-16",
  },
  {
    id: "req-3",
    title: "Video Campaign: Heineken Silver Chill Vibes",
    workspaceName: "Heineken Campaign",
    status: "REVISION_REQUESTED",
    createdAt: "2026-07-15",
  },
];

export async function getApprovalQueue(): Promise<ApprovalQueueItem[]> {
  return Promise.resolve(MOCK_QUEUE);
}

export async function approveQueueItem(id: string): Promise<void> {
  console.log("Mock approve:", id);
  return Promise.resolve();
}

export async function requestQueueItemRevision(id: string): Promise<void> {
  console.log("Mock revision request:", id);
  return Promise.resolve();
}
