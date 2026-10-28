import type { Editor } from "@tiptap/react";
import {
  isChatRichDocument,
  richMentionIds,
  richPlainText,
} from "@/pages/chat/utils/chatRichContent";
import type { ChatRichComposerProps } from "@/pages/chat/types/chatComposer";
import type { ChatRichNode } from "@/pages/chat/types/chatRichContent";
import type { ChannelMessageRequest } from "@/types/chatCollaboration";

export function chatComposerRequest(
  editor: Editor | null,
  props: ChatRichComposerProps,
): ChannelMessageRequest | null {
  if (!editor || editor.isDestroyed || !props.canPost) return null;
  const richContent = editor.getJSON() as ChatRichNode;
  const content = richPlainText(richContent).trim();
  const mentionUserIds = richMentionIds(richContent);
  if (
    !content ||
    content.length > 4000 ||
    mentionUserIds.length > 20 ||
    !isChatRichDocument(richContent)
  )
    return null;
  return {
    clientMessageId: crypto.randomUUID(),
    content,
    richContent,
    mentionUserIds,
    contextType: props.contextType,
    contextId: props.contextId,
    threadRootId: props.threadRootId ?? null,
  };
}
