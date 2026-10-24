import { z } from "zod";
import type { CollaborationMessage } from "@/types/chatCollaboration";

const messageSchema = z.object({
  mentionUserIds: z.array(z.string()).optional(),
  id: z.string().min(1),
  workspaceId: z.string(),
  senderMemberId: z.string(),
  senderUserId: z.string(),
  senderRole: z.enum(["MANAGER", "CREATOR", "CLIENT"]),
  senderDisplayName: z.string(),
  content: z.string(),
  clientMessageId: z.string(),
  contextType: z.enum(["GENERAL", "MEDIA_PACKAGE", "MEDIA_CAMPAIGN"]),
  contextId: z.string().nullable(),
  createdAt: z.string().refine((value) => Number.isFinite(Date.parse(value))),
  channelId: z.string().default("general"),
  threadRootId: z.string().nullable().default(null),
  reactions: z
    .object({
      like: z.array(z.string()).optional(),
      heart: z.array(z.string()).optional(),
      celebrate: z.array(z.string()).optional(),
    })
    .default({}),
  pinned: z.boolean().default(false),
  replyCount: z.number().default(0),
});

export function parseChatEvent(body: string): CollaborationMessage | null {
  try {
    const result = z
      .object({
        type: z.enum(["MESSAGE_CREATED", "MESSAGE_UPDATED"]),
        message: messageSchema,
      })
      .safeParse(JSON.parse(body));
    return result.success ? result.data.message : null;
  } catch {
    return null;
  }
}

export function mergeChatMessages(
  messages: CollaborationMessage[],
): CollaborationMessage[] {
  const result = new Map<string, CollaborationMessage>();
  for (const message of messages) {
    const key = JSON.stringify([message.senderUserId, message.clientMessageId]);
    const existing = result.get(key);
    if (
      existing &&
      !existing.id.startsWith("optimistic:") &&
      message.id.startsWith("optimistic:")
    )
      continue;
    result.set(key, message);
  }
  return [...result.values()].sort(
    (left, right) =>
      Date.parse(left.createdAt) - Date.parse(right.createdAt) ||
      (left.id < right.id ? -1 : Number(left.id > right.id)),
  );
}
