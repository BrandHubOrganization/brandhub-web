export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  authorDisplayName: string;
  authorRole: string;
  content: string;
  mentions: string[];
  attachmentIds: string[];
  clientRequestId: string;
  createdAt: string;
}
export interface TaskCommentPage {
  items: TaskComment[];
  nextCursor: string | null;
}
export interface CommentMember {
  userId: string;
  displayName: string;
  role: string;
}
export interface CommentUpload {
  id: string;
  name: string;
  contentType: string;
  byteSize: number;
}
export interface CommentDraft {
  content: string;
  mentions: CommentMember[];
  uploads: CommentUpload[];
}
export interface CommentRequest {
  content: string;
  mentions: string[];
  attachmentIds: string[];
  clientRequestId: string;
}
