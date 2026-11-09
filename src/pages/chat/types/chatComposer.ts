import type { ChatContextType } from "@/types/chat";
import type {
  ChannelMessageRequest,
  ChatDirectoryMember,
} from "@/types/chatCollaboration";
export interface ChatRichComposerProps {
  canPost: boolean;
  workspaceId?: string;
  channelId?: string;
  attachmentIds?: string[];
  attachmentBusy?: boolean;
  onDraftSent?: () => void;
  allowMentions?: boolean;
  people: ChatDirectoryMember[];
  contextType: ChatContextType;
  contextId: string | null;
  threadRootId?: string;
  onSend: (request: ChannelMessageRequest) => boolean;
  onSchedule?: (
    request: ChannelMessageRequest,
    scheduledAt: string,
    timeZone: string,
  ) => Promise<void>;
}
export interface ChatComposerSuggestion {
  from: number;
  to: number;
  query: string;
  left: number;
  bottom: number;
}
