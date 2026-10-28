import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { chatComposerRequest } from "@/pages/chat/utils/chatComposerRequest";
import type { ChatRichComposerProps } from "@/pages/chat/types/chatComposer";

export function useChatDraftSchedule(
  editor: Editor | null,
  props: ChatRichComposerProps,
) {
  const [scheduling, setScheduling] = useState(false);
  const pending = useRef(false);
  const retry = useRef<{ signature: string; id: string } | null>(null);
  useEffect(() => {
    if (editor && !editor.isDestroyed)
      editor.setEditable(props.canPost && !scheduling);
  }, [editor, props.canPost, scheduling]);
  const schedule = async (scheduledAt: string, timeZone: string) => {
    if (pending.current || !props.onSchedule)
      throw new Error("CHAT_SCHEDULE_BUSY");
    const message = chatComposerRequest(editor, props);
    if (!message || !editor) throw new Error("CHAT_DRAFT_INVALID");
    const captured = JSON.stringify(message.richContent);
    const signature = JSON.stringify({
      ...message,
      clientMessageId: "",
      scheduledAt,
      timeZone,
    });
    if (retry.current?.signature === signature)
      message.clientMessageId = retry.current.id;
    else retry.current = { signature, id: message.clientMessageId };
    pending.current = true;
    setScheduling(true);
    try {
      await props.onSchedule(message, scheduledAt, timeZone);
      retry.current = null;
      if (!editor.isDestroyed && JSON.stringify(editor.getJSON()) === captured)
        editor.commands.clearContent();
      requestAnimationFrame(() => {
        if (!editor.isDestroyed) editor.commands.focus();
      });
    } finally {
      pending.current = false;
      setScheduling(false);
    }
  };
  return { scheduling, schedule, pending };
}
