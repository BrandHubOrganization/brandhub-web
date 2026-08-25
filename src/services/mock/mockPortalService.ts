import type {
  ApprovalQueueItem,
  ApprovalStage,
  ApprovalStageEntry,
} from "@/types/portal";

function initialChain(upToStage: ApprovalStage): ApprovalStageEntry[] {
  const order: ApprovalStage[] = ["CREATOR", "MANAGER", "CLIENT"];
  const idx = order.indexOf(upToStage);
  return order.map((stage, i) => {
    if (i < idx) {
      return {
        stage,
        status: "APPROVED",
        actorName: stage === "CREATOR" ? "Nguyễn Văn Minh" : "Trần Thị Thu Hà",
        actedAt: "2026-07-15T09:00:00Z",
      };
    }
    return { stage, status: "PENDING" };
  });
}

const MOCK_QUEUE: ApprovalQueueItem[] = [
  {
    id: "req-1",
    title: "Social Post: Giới thiệu Nike Air Max Pulse",
    workspaceName: "Nike Vietnam",
    status: "AWAITING_APPROVAL",
    createdAt: "2026-07-17",
    revisionRound: 1,
    approvalChain: initialChain("CLIENT"),
  },
  {
    id: "req-2",
    title: "Blog Post: Lợi ích của sữa hạt organic hàng ngày",
    workspaceName: "Sữa Hạt Organic",
    status: "APPROVED",
    createdAt: "2026-07-16",
    revisionRound: 1,
    approvalChain: [
      {
        stage: "CREATOR",
        status: "APPROVED",
        actorName: "Trần Thị Thu Hà",
        actedAt: "2026-07-14T10:00:00Z",
      },
      {
        stage: "MANAGER",
        status: "APPROVED",
        actorName: "Lê Hoàng Nam",
        actedAt: "2026-07-14T15:00:00Z",
      },
      {
        stage: "CLIENT",
        status: "APPROVED",
        actorName: "Sữa Hạt Organic",
        actedAt: "2026-07-16T09:00:00Z",
      },
    ],
  },
  {
    id: "req-3",
    title: "Video Campaign: Heineken Silver Chill Vibes",
    workspaceName: "Heineken Campaign",
    status: "REVISION_REQUESTED",
    createdAt: "2026-07-15",
    revisionRound: 2,
    approvalChain: [
      {
        stage: "CREATOR",
        status: "APPROVED",
        actorName: "Phạm Phương Anh",
        actedAt: "2026-07-13T09:00:00Z",
      },
      {
        stage: "MANAGER",
        status: "APPROVED",
        actorName: "Lê Hoàng Nam",
        actedAt: "2026-07-13T14:00:00Z",
      },
      {
        stage: "CLIENT",
        status: "REVISION_REQUESTED",
        actorName: "Heineken Campaign",
        actedAt: "2026-07-15T11:00:00Z",
        comment: "Màu sắc ổn, nhưng caption hơi dài — nên rút gọn.",
      },
    ],
  },
];

async function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function currentPendingStage(
  item: ApprovalQueueItem,
): ApprovalStageEntry | undefined {
  return item.approvalChain.find((e) => e.status === "PENDING");
}

export async function getApprovalQueue(): Promise<ApprovalQueueItem[]> {
  await delay(300);
  return MOCK_QUEUE;
}

export async function approveQueueItem(id: string): Promise<void> {
  await delay(300);
  const item = MOCK_QUEUE.find((i) => i.id === id);
  if (!item) return;

  const pending = currentPendingStage(item);
  if (!pending) return;

  pending.status = "APPROVED";
  pending.actedAt = new Date().toISOString();
  pending.actorName = pending.actorName ?? "Client";

  const stillPending = currentPendingStage(item);
  item.status = stillPending ? "AWAITING_APPROVAL" : "APPROVED";
}

export async function requestQueueItemRevision(
  id: string,
  comment?: string,
): Promise<void> {
  await delay(300);
  const item = MOCK_QUEUE.find((i) => i.id === id);
  if (!item) return;

  const pending = currentPendingStage(item);
  if (!pending) return;

  pending.status = "REVISION_REQUESTED";
  pending.actedAt = new Date().toISOString();
  pending.comment = comment;
  item.status = "REVISION_REQUESTED";
}

export async function resubmitQueueItem(id: string): Promise<void> {
  await delay(300);
  const item = MOCK_QUEUE.find((i) => i.id === id);
  if (!item) return;

  item.revisionRound += 1;
  item.approvalChain = initialChain("CREATOR");
  item.status = "AWAITING_APPROVAL";
}
