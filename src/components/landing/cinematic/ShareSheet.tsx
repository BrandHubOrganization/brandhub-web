import { useEffect, useState } from "react";
import {
  Check,
  Search,
  Link2,
  Send,
  MessageCircle,
  BookmarkPlus,
  Users,
} from "lucide-react";
import { GHOST_COMMENTERS, type GhostCommenter } from "./feedContent";

/**
 * Vòng đời chung cho mọi share sheet — nhưng UI RIÊNG từng platform vì
 * hành vi share thật khác nhau hoàn toàn:
 *
 * - Instagram: search box + carousel avatar bạn bè, nút "Gửi" riêng
 *   từng người (không phải chọn 1 người duy nhất).
 * - TikTok: hàng bạn bè/app ngang + hàng nút hành động xám bên dưới
 *   (Copy link, Duet...).
 * - Facebook: KHÔNG phải friend-picker — là menu dọc "Chia sẻ ngay /
 *   Chia sẻ lên Feed / Chia sẻ vào Story / Gửi qua Messenger".
 * - LinkedIn: ô "Nhập tên..." + carousel connection gần đây + ô
 *   "Viết tin nhắn" (giống compose message, không phải quick-send).
 *
 * Nguồn tham khảo hành vi thật: Instagram Help Center (Send To carousel
 * + search, tối đa 15 người), TikTok share sheet (2 hàng: contacts/apps
 * + action buttons), Facebook Share menu (4 lựa chọn cố định), LinkedIn
 * Send popup ("Type a name" + recent connections carousel + message box).
 */
export type SharePhase = "open" | "picking" | "sent";

export interface ShareState {
  phase: SharePhase;
  pickedFriend: GhostCommenter;
}

const SHARE_MS = { pick: 550, sent: 1200 } as const;

export function useShareSheet(
  active: boolean,
  onDone?: () => void,
): ShareState | null {
  const [state, setState] = useState<ShareState | null>(null);

  useEffect(() => {
    if (!active) {
      setState(null);
      return;
    }
    const friend =
      GHOST_COMMENTERS[Math.floor(Math.random() * GHOST_COMMENTERS.length)];
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    setState({ phase: "open", pickedFriend: friend });
    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        setState({ phase: "picking", pickedFriend: friend });
        timers.push(
          setTimeout(() => {
            if (cancelled) return;
            setState({ phase: "sent", pickedFriend: friend });
            timers.push(
              setTimeout(() => {
                if (cancelled) return;
                setState(null);
                onDone?.();
              }, SHARE_MS.sent),
            );
          }, SHARE_MS.pick),
        );
      }, 300),
    );

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return state;
}

function FriendAvatar({
  commenter,
  size = "size-8",
}: {
  commenter: GhostCommenter;
  size?: string;
}) {
  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-linear-to-br ${commenter.avatarGradient} text-[9px] font-bold text-white`}
    >
      {commenter.initials}
    </div>
  );
}

// ── Instagram: "Gửi tới" — search + carousel avatar + nút Gửi riêng ──

export function InstagramShareSheet({ state }: { state: ShareState | null }) {
  if (!state) return null;
  const { phase, pickedFriend } = state;
  const others = GHOST_COMMENTERS.filter((c) => c !== pickedFriend).slice(0, 3);

  return (
    <div className="ghost-comment-in absolute inset-x-2 bottom-1/2 z-[60] translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-600 dark:bg-zinc-800">
      <div className="mb-2.5 flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1.5 dark:bg-zinc-700">
        <Search className="size-3 text-zinc-400" />
        <span className="text-[10px] text-zinc-400">Tìm kiếm</span>
      </div>
      <div className="flex items-start gap-3 overflow-hidden">
        {[pickedFriend, ...others].map((friend) => (
          <div key={friend.name} className="flex flex-col items-center gap-1">
            <div className="relative">
              <FriendAvatar commenter={friend} />
              {friend === pickedFriend && phase !== "open" && (
                <div className="absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-full bg-blue-500 ring-2 ring-white dark:ring-zinc-800">
                  <Check className="size-2 text-white" />
                </div>
              )}
            </div>
            <span className="max-w-[44px] truncate text-[8px] text-zinc-600 dark:text-zinc-300">
              {friend.name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
      {phase === "sent" && (
        <p className="mt-2.5 text-center text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
          Đã gửi tới {pickedFriend.name}
        </p>
      )}
    </div>
  );
}

// ── TikTok: hàng bạn bè + hàng action xám (Copy link...) ─────────────

export function TikTokShareSheet({ state }: { state: ShareState | null }) {
  if (!state) return null;
  const { phase, pickedFriend } = state;
  const others = GHOST_COMMENTERS.filter((c) => c !== pickedFriend).slice(0, 2);

  return (
    <div className="ghost-comment-in absolute right-16 bottom-0 left-0 z-[60] rounded-t-2xl bg-zinc-900/98 p-3 backdrop-blur">
      <p className="mb-2 text-[9px] font-medium text-white/50">Chia sẻ tới</p>
      <div className="mb-3 flex items-start gap-3">
        {[pickedFriend, ...others].map((friend) => (
          <div key={friend.name} className="flex flex-col items-center gap-1">
            <div className="relative">
              <FriendAvatar commenter={friend} />
              {friend === pickedFriend && phase === "sent" && (
                <div className="absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-full bg-cyan-400 ring-2 ring-zinc-900">
                  <Check className="size-2 text-zinc-900" />
                </div>
              )}
            </div>
            <span className="max-w-[40px] truncate text-[8px] text-white/70">
              {friend.name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 border-t border-white/10 pt-2.5">
        <div className="flex flex-col items-center gap-1">
          <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
            <Link2 className="size-3.5 text-white" />
          </div>
          <span className="text-[8px] text-white/60">Sao chép</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex size-8 items-center justify-center rounded-full bg-white/10">
            <Send className="size-3.5 text-white" />
          </div>
          <span className="text-[8px] text-white/60">Chia sẻ</span>
        </div>
      </div>
      {phase === "sent" && (
        <p className="mt-2 text-center text-[9px] font-medium text-cyan-300">
          Đã gửi tới {pickedFriend.name}
        </p>
      )}
    </div>
  );
}

// ── Facebook: menu dọc — KHÔNG phải friend picker ────────────────────

export function FacebookShareSheet({ state }: { state: ShareState | null }) {
  if (!state) return null;
  const { phase } = state;

  const options = [
    { icon: Users, label: "Chia sẻ ngay", desc: "Bạn bè" },
    { icon: BookmarkPlus, label: "Chia sẻ lên Feed", desc: "Thêm chú thích" },
    { icon: MessageCircle, label: "Gửi qua Messenger", desc: "Riêng tư" },
  ];

  return (
    <div className="ghost-comment-in absolute inset-x-3 bottom-1/2 z-[60] translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-600 dark:bg-zinc-800">
      {options.map((opt, i) => (
        <div
          key={opt.label}
          className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
            phase === "sent" && i === 0 ? "bg-blue-50 dark:bg-blue-900/30" : ""
          }`}
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-700">
            <opt.icon className="size-3 text-zinc-600 dark:text-zinc-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-medium text-zinc-800 dark:text-zinc-100">
              {opt.label}
            </p>
            <p className="text-[8px] text-zinc-400 dark:text-zinc-500">
              {opt.desc}
            </p>
          </div>
          {phase === "sent" && i === 0 && (
            <Check className="size-3 shrink-0 text-blue-600 dark:text-blue-400" />
          )}
        </div>
      ))}
    </div>
  );
}

// ── LinkedIn: "Nhập tên..." + carousel connection + ô tin nhắn ──────

export function LinkedInShareSheet({ state }: { state: ShareState | null }) {
  if (!state) return null;
  const { phase, pickedFriend } = state;
  const others = GHOST_COMMENTERS.filter((c) => c !== pickedFriend).slice(0, 2);

  return (
    <div className="ghost-comment-in absolute inset-x-3 bottom-1/2 z-[60] translate-y-1/2 rounded-xl border border-zinc-300 bg-white p-3 shadow-xl dark:border-zinc-600 dark:bg-zinc-800">
      <p className="mb-2 text-[10px] font-semibold text-zinc-800 dark:text-zinc-100">
        Gửi cho
      </p>
      <div className="mb-2.5 flex items-center gap-1.5 rounded-md border border-zinc-300 px-2 py-1.5 dark:border-zinc-600">
        <span className="text-[10px] text-zinc-400">
          {phase === "open" ? "Nhập tên..." : pickedFriend.name}
        </span>
      </div>
      <div className="mb-2.5 flex items-start gap-2.5 overflow-hidden">
        {[pickedFriend, ...others].map((friend) => (
          <div key={friend.name} className="flex flex-col items-center gap-1">
            <div
              className={`rounded-full ${
                friend === pickedFriend && phase !== "open"
                  ? "ring-2 ring-blue-600 ring-offset-1 dark:ring-offset-zinc-800"
                  : ""
              }`}
            >
              <FriendAvatar commenter={friend} size="size-7" />
            </div>
            <span className="max-w-[42px] truncate text-[8px] text-zinc-600 dark:text-zinc-300">
              {friend.name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-zinc-200 px-2 py-1.5 text-[9px] text-zinc-400 dark:border-zinc-700">
        Viết tin nhắn (không bắt buộc)
      </div>
      {phase === "sent" && (
        <p className="mt-2 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
          Đã gửi tới {pickedFriend.name}
        </p>
      )}
    </div>
  );
}
