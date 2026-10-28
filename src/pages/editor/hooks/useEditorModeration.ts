import { useLayoutEffect, useState, useSyncExternalStore } from "react";
import { EditorModeration } from "@/pages/editor/services/editorModeration";
import { checkCaption } from "@/services/textModerationService";

export function useEditorModeration(
  workspaceId: string | undefined,
  text: string,
) {
  const [moderation] = useState(() => new EditorModeration(checkCaption));
  const snapshot = useSyncExternalStore(
    moderation.subscribe,
    moderation.getSnapshot,
  );
  useLayoutEffect(() => {
    moderation.update(workspaceId, text);
  }, [moderation, workspaceId, text]);
  useLayoutEffect(() => () => moderation.dispose(), [moderation]);
  return { snapshot, ensure: moderation.ensure };
}
