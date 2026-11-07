import type { TaskListItem } from "@/types/task";

export type UrgencyType = "OVERDUE" | "DUE_TODAY" | "IN_REVIEW" | "URGENT";
export type RecommendedAction = "edit" | "review" | "view";

export interface RecommendedTask {
  task: TaskListItem;
  score: number;
  urgencyType: UrgencyType;
  urgencyLabel: string;
  reason: string;
  recommendedAction: RecommendedAction;
  actionLabel: string;
}

interface DeadlineInfo {
  isOverdue: boolean;
  overdueDays: number;
  isToday: boolean;
  isTomorrow: boolean;
  isThisWeek: boolean;
  formattedDueTime?: string;
}

/**
 * Phân tích khoảng cách thời gian giữa deadline và thời điểm hiện tại.
 */
function analyzeDeadline(dueDateStr?: string | null): DeadlineInfo | null {
  if (!dueDateStr) return null;
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return null;

  const now = new Date();
  const diffMs = due.getTime() - now.getTime();

  // Kiểm tra cùng ngày theo lịch
  const isToday =
    due.getFullYear() === now.getFullYear() &&
    due.getMonth() === now.getMonth() &&
    due.getDate() === now.getDate();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    due.getFullYear() === tomorrow.getFullYear() &&
    due.getMonth() === tomorrow.getMonth() &&
    due.getDate() === tomorrow.getDate();

  const isOverdue = diffMs < 0 && !isToday;
  const overdueDays = isOverdue
    ? Math.max(1, Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24)))
    : 0;

  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const isThisWeek = diffDays >= 0 && diffDays <= 7;

  // Giờ cụ thể nếu có
  const hours = due.getHours();
  const minutes = due.getMinutes();
  const hasSpecificTime = hours !== 0 || minutes !== 0;
  const formattedDueTime = hasSpecificTime
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
    : undefined;

  return {
    isOverdue,
    overdueDays,
    isToday,
    isTomorrow,
    isThisWeek,
    formattedDueTime,
  };
}

/**
 * Tính điểm ưu tiên cho một Task theo công thức Smart Priority Scoring (SPS):
 * Score = S_deadline + S_priority + S_bottleneck + S_role
 */
export function calculatePriorityScore(
  task: TaskListItem,
  currentUserId?: string | null
): number {
  // Task đã hoàn thành hoặc hủy bỏ không tính điểm ưu tiên
  if (task.status === "FINISHED" || task.status === "CANCELLED") {
    return 0;
  }

  let sDeadline = 5; // Mặc định không deadline hoặc hạn xa
  const deadline = analyzeDeadline(task.dueDate);

  if (deadline) {
    if (deadline.isOverdue) {
      // Quá hạn: +100 + 15 * số ngày trễ (max 160)
      sDeadline = Math.min(160, 100 + 15 * deadline.overdueDays);
    } else if (deadline.isToday) {
      // Đến hạn hôm nay: +80
      sDeadline = 80;
    } else if (deadline.isTomorrow) {
      // Đến hạn ngày mai: +50
      sDeadline = 50;
    } else if (deadline.isThisWeek) {
      // Trong tuần: +25
      sDeadline = 25;
    }
  }

  // S_priority: URGENT (+50), HIGH (+35), MEDIUM (+15), LOW (+5)
  let sPriority: number;
  switch (task.priority) {
    case "URGENT":
      sPriority = 50;
      break;
    case "HIGH":
      sPriority = 35;
      break;
    case "MEDIUM":
      sPriority = 15;
      break;
    case "LOW":
      sPriority = 5;
      break;
    default:
      sPriority = 15;
      break;
  }

  // S_bottleneck:
  // - IN_REVIEW hoặc có feedback cần sửa: +45
  // - TODO cận hạn (dưới 24h hoặc quá hạn): +40
  // - IN_PROGRESS: +20
  let sBottleneck = 0;
  const hasFeedbackOrReview =
    task.status === "IN_REVIEW" ||
    (task.resolution && task.resolution.toLowerCase().includes("fix")) ||
    (task.description &&
      task.description.toLowerCase().includes("chỉnh sửa"));

  if (hasFeedbackOrReview) {
    sBottleneck = 45;
  } else if (
    task.status === "TODO" &&
    deadline &&
    (deadline.isOverdue || deadline.isToday)
  ) {
    sBottleneck = 40;
  } else if (task.status === "IN_PROGRESS") {
    sBottleneck = 20;
  }

  // S_role:
  // - Assignee là current user: +30
  // - Reporter là current user khi task IN_REVIEW: +35
  let sRole = 0;
  if (currentUserId) {
    if (task.assigneeId === currentUserId) {
      sRole += 30;
    }
    if (task.reporterId === currentUserId && task.status === "IN_REVIEW") {
      sRole += 35;
    }
  }

  return sDeadline + sPriority + sBottleneck + sRole;
}

/**
 * Trả về danh sách Top các nhiệm vụ cần làm trước kèm nhãn mức độ, lý do và gợi ý hành động.
 */
export function getTopPriorityRecommendations(
  tasks: TaskListItem[],
  currentUserId?: string | null,
  limit = 3
): RecommendedTask[] {
  if (!tasks || tasks.length === 0) return [];

  // Lọc bỏ task đã hoàn thành hoặc hủy
  const activeTasks = tasks.filter(
    (t) => t.status !== "FINISHED" && t.status !== "CANCELLED"
  );

  const scoredTasks = activeTasks.map((task) => {
    const score = calculatePriorityScore(task, currentUserId);
    const deadline = analyzeDeadline(task.dueDate);

    // Xác định mức độ khẩn cấp (Urgency Type & Label)
    let urgencyType: UrgencyType = "URGENT";
    let urgencyLabel = "Ưu tiên cao";
    let reason = "Nhiệm vụ có điểm ưu tiên cao cần được giải quyết trong tuần.";

    if (deadline?.isOverdue) {
      urgencyType = "OVERDUE";
      urgencyLabel =
        deadline.overdueDays === 1
          ? "Quá hạn 1 ngày"
          : `Quá hạn ${deadline.overdueDays} ngày`;
      reason =
        task.status === "IN_REVIEW"
          ? "Đã trễ hạn và đang chờ phê duyệt/chỉnh sửa, cần ưu tiên xử lý gấp."
          : `Đã trễ hạn ${deadline.overdueDays} ngày, cần xử lý ngay để không ảnh hưởng tiến độ.`;
    } else if (deadline?.isToday) {
      urgencyType = "DUE_TODAY";
      urgencyLabel = deadline.formattedDueTime
        ? `Hôm nay ${deadline.formattedDueTime}`
        : "Đến hạn hôm nay";
      reason =
        "Đến hạn hoàn thành trong hôm nay, cần nộp duyệt hoặc xuất bản sớm.";
    } else if (task.status === "IN_REVIEW") {
      urgencyType = "IN_REVIEW";
      urgencyLabel = "Chờ duyệt bài";
      reason =
        task.reporterId === currentUserId
          ? "Thành viên đã nộp bài, đang chờ bạn phê duyệt để chuẩn bị xuất bản."
          : "Nội dung đang trong vòng xét duyệt, cần kiểm tra hoặc điều chỉnh theo góp ý.";
    } else if (task.priority === "URGENT") {
      urgencyType = "URGENT";
      urgencyLabel = "Khẩn cấp";
      reason =
        "Nhiệm vụ được đánh dấu Khẩn cấp (URGENT), ưu tiên hoàn thành trước.";
    }

    // Xác định hành động đề xuất 1-click
    let recommendedAction: RecommendedAction = "view";
    let actionLabel = "Chi tiết task";

    if (task.status === "IN_REVIEW" && task.reporterId === currentUserId) {
      recommendedAction = "review";
      actionLabel = "Kiểm tra & Duyệt bài";
    } else if (task.type === "POST") {
      recommendedAction = "edit";
      actionLabel = "Mở Soạn thảo";
    }

    return {
      task,
      score,
      urgencyType,
      urgencyLabel,
      reason,
      recommendedAction,
      actionLabel,
    };
  });

  // Sắp xếp điểm số giảm dần
  scoredTasks.sort((a, b) => b.score - a.score);

  return scoredTasks.slice(0, limit);
}
