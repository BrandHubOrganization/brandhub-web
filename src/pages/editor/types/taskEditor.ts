import type { TaskPost } from "@/pages/editor/services/taskPostService";
import type { TaskReview } from "@/pages/tasks/types/taskApproval";

export interface TaskEditorSession {
  linked: TaskPost;
  review: TaskReview;
}
export interface TaskEditorState {
  isLoading: boolean;
  errorCode: string | null;
  blockedReason: string | null;
  isReadOnly: boolean;
  canSubmit: boolean;
  reload: () => void;
  save: () => Promise<void>;
}
