import type { TaskStatus } from "@/types/task";
export type CanonicalTaskStatus =
  "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "CANCELLED" | "FINISHED";
export function canonicalTaskStatus(status: TaskStatus): CanonicalTaskStatus {
  switch (status) {
    case "BACKLOG":
    case "DETAIL_IDENTIFIED":
    case "ASSIGNED":
      return "TODO";
    case "QC_REVIEW":
    case "MANAGER_REVIEW":
    case "CLIENT_REVIEW":
      return "IN_REVIEW";
    case "COMPLETED":
      return "FINISHED";
    default:
      return status;
  }
}
