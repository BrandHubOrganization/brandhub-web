import type { ChatContextType, ChatMessage } from "@/types/chat";
import type { MemberRole } from "@/types/workspace";
import type { ChatRichNode } from "@/pages/chat/types/chatRichContent";

export type ChatChannelType = "PUBLIC" | "PRIVATE" | "DIRECT";
export type ChatReaction =
  | "check"
  | "eyes"
  | "like"
  | "hands"
  | "fire"
  | "heart"
  | "celebrate"
  | "rocket"
  | "laugh"
  | "pray";

export interface ChatChannel {
  id: string;
  name: string;
  description: string | null;
  type: ChatChannelType;
  memberUserIds: string[];
  createdBy: string | null;
  archived: boolean;
  managersOnly: boolean;
  canManage: boolean;
  canPost: boolean;
  unreadCount: number;
  createdAt: string;
}

export interface ChatDirectoryMember {
  userId: string;
  displayName: string;
  role: MemberRole;
}

export interface CollaborationMessage extends ChatMessage {
  richContent?: ChatRichNode | null;
  mentionUserIds?: string[];
  channelId: string;
  threadRootId: string | null;
  reactions: Partial<Record<ChatReaction, string[]>>;
  pinned: boolean;
  replyCount: number;
}

export interface ChannelMessageRequest {
  richContent?: ChatRichNode | null;
  mentionUserIds?: string[];
  clientMessageId: string;
  content: string;
  contextType: ChatContextType;
  contextId: string | null;
  threadRootId: string | null;
}

export interface ChatNotificationPreference {
  dnd: boolean;
  muted: boolean;
  alertsEnabled: boolean;
}

export interface ChannelHistory {
  items: CollaborationMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ChannelFilters {
  q?: string;
  root?: string;
  pinned?: boolean;
  contextType?: ChatContextType;
  contextId?: string;
}

export interface CreateChannelRequest {
  requestId: string;
  name: string;
  description: string;
  type: ChatChannelType;
  memberUserIds: string[];
}

export interface UpdateChannelRequest {
  name: string;
  description: string;
  archived: boolean;
  managersOnly: boolean;
}
