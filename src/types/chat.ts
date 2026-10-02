import type { MemberRole } from "@/types/workspace";

export type ChatContextType =
  | "GENERAL"
  | "MEDIA_PACKAGE"
  | "MEDIA_CAMPAIGN";

export type ChatConnectionState =
  | "CONNECTING"
  | "CONNECTED"
  | "RECONNECTING"
  | "DISCONNECTED";

export type ChatDeliveryStatus = "SENDING" | "SENT" | "FAILED";

export interface ChatMessage {
  id: string;
  workspaceId: string;
  senderMemberId: string;
  senderUserId: string;
  senderRole: Exclude<MemberRole, "OWNER">;
  senderDisplayName: string;
  content: string;
  contextType: ChatContextType;
  contextId: string | null;
  clientMessageId: string;
  createdAt: string;
  deliveryStatus?: ChatDeliveryStatus;
}

export interface ChatHistory {
  items: ChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ChatEvent {
  type: "MESSAGE_CREATED";
  message: ChatMessage;
}

export interface ChatError {
  code: string;
  message: string;
}

export interface SendChatMessage {
  clientMessageId: string;
  content: string;
  contextType: ChatContextType;
  contextId: string | null;
}
