import type { ChatContextType } from "@/types/chat";
import type {
  ChannelMessageRequest,
  ChatDirectoryMember,
} from "@/types/chatCollaboration";
export interface ChatRichComposerProps {
  canPost: boolean;
  people: ChatDirectoryMember[];
  contextType: ChatContextType;
  contextId: string | null;
  threadRootId?: string;
  onSend: (request: ChannelMessageRequest) => boolean;
}
export interface ChatComposerSuggestion {
  from: number;
  to: number;
  query: string;
  left: number;
  bottom: number;
}
