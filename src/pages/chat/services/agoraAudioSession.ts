import type { IAgoraRTCClient, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import { chatCallService } from "@/pages/chat/services/chatCallService";

interface SessionOptions {
  userId: string;
  workspaceId: string;
  callId: string;
  onConnected: () => Promise<void>;
  onError: () => void;
  onBusy: () => void;
}

/** Loaded only after a user explicitly starts or accepts a call. */
export function createAgoraAudioSession(options: SessionOptions) {
  let closed = false;
  let client: IAgoraRTCClient | undefined;
  let microphone: IMicrophoneAudioTrack | undefined;
  let renewal: ReturnType<typeof setInterval> | undefined;
  let renewing = false;
  let acknowledged = false;
  let releaseLock: (() => void) | undefined;

  const stop = () => {
    closed = true;
    releaseLock?.();
    clearInterval(renewal);
    microphone?.close();
    client?.removeAllListeners();
    void client?.leave().catch(() => options.onError());
  };
  const fail = () => {
    if (closed) return;
    stop();
    options.onError();
  };
  const renew = async () => {
    if (closed || renewing || !client) return;
    renewing = true;
    try {
      const credentials = await chatCallService.token(
        options.workspaceId,
        options.callId,
      );
      if (!closed) await client.renewToken(credentials.token);
    } catch {
      fail();
    } finally {
      renewing = false;
    }
  };
  const initialize = async () => {
    try {
      const { default: AgoraRTC } = await import("agora-rtc-sdk-ng");
      if (closed) return;
      AgoraRTC.setLogLevel(3);
      client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      client.on("user-published", async (user, kind) => {
        if (kind !== "audio" || closed || !client) return;
        try {
          await client.subscribe(user, "audio");
          if (closed) return;
          user.audioTrack?.play();
          if (!acknowledged) {
            await options.onConnected();
            acknowledged = true;
          }
        } catch {
          fail();
        }
      });
      client.on("token-privilege-will-expire", () => void renew());
      client.on("token-privilege-did-expire", fail);
      client.on("user-left", fail);
      client.on("connection-state-change", (state, previous) => {
        if (state === "DISCONNECTED" && previous !== "DISCONNECTED") fail();
      });
      const credentials = await chatCallService.token(
        options.workspaceId,
        options.callId,
      );
      if (closed) return;
      microphone = await AgoraRTC.createMicrophoneAudioTrack();
      if (closed) {
        microphone.close();
        return;
      }
      await client.join(
        credentials.appId,
        credentials.channel,
        credentials.token,
        credentials.uid,
      );
      if (closed) {
        await client.leave();
        return;
      }
      await client.publish(microphone);
      if (closed) {
        microphone.close();
        await client.leave();
        return;
      }
      renewal = setInterval(() => void renew(), 20_000);
    } catch {
      fail();
    }
  };
  const start = async () => {
    if (!navigator.locks) {
      fail();
      return;
    }
    try {
      await navigator.locks.request(
        `brandhub-chat-voice:${options.userId}`,
        { ifAvailable: true },
        async (lock) => {
          if (closed) return;
          if (!lock) {
            options.onBusy();
            return;
          }
          await initialize();
          if (!closed)
            await new Promise<void>((resolve) => {
              releaseLock = resolve;
            });
        },
      );
    } catch {
      fail();
    }
  };
  return {
    resumeAudio() {
      client?.remoteUsers.forEach((user) => user.audioTrack?.play());
    },
    start,
    stop,
    async mute(muted: boolean) {
      await microphone?.setMuted(muted);
    },
  };
}
