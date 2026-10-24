export type ChatCallState =
  | "RINGING"
  | "CONNECTING"
  | "ACTIVE"
  | "DECLINED"
  | "CANCELLED"
  | "MISSED"
  | "ENDED"
  | "FAILED";

export interface ChatCall {
  id: string;
  workspaceId: string;
  channelId: string;
  callerId: string;
  calleeId: string;
  state: ChatCallState;
  revision: number;
  createdAt: string;
  expiresAt: string;
  connectedAt: string | null;
  endedAt: string | null;
  endReason: string | null;
}

export interface ChatCallToken {
  provider: "AGORA";
  appId: string;
  channel: string;
  uid: number;
  token: string;
  expiresAt: string;
}

export type ChatCallAction =
  "accept" | "decline" | "cancel" | "end" | "connected" | "heartbeat";
