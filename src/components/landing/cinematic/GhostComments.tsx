import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";
import {
  GHOST_COMMENTERS,
  GHOST_HEADLINE_KEYS,
  type GhostCommenter,
} from "./feedContent";

/**
 * Vòng đời 1 ghost comment — mô phỏng optimistic UI thật (Apollo/Remix
 * pattern): comment xuất hiện NGAY khi "gửi" ở trạng thái mờ, trước khi
 * server phản hồi, rồi mới sáng đầy đủ. Không bỏ giai đoạn nào:
 *
 * 1. typing  — composer hiện, text gõ từng ký tự (con trỏ nhấp nháy)
 * 2. posting — comment xuất hiện ngay, opacity-60 + "Đang đăng…"
 * 3. posted  — sáng đầy đủ, meta row (Thích · Phản hồi · thời gian) hiện ra
 * 4. fade    — mờ dần rồi biến mất, trả quyền điều khiển lại cho CursorGhost
 */
export type GhostPhase = "typing" | "posting" | "posted" | "fade";

export interface GhostCommentState {
  phase: GhostPhase;
  typed: string;
  commenter: GhostCommenter;
  headline: string;
  text: string;
}

const PHASE_MS = {
  posting: 600,
  posted: 2500,
  fade: 400,
} as const;

/**
 * Điều khiển vòng đời ghost comment. `active=true` khởi động chu trình
 * typing→posting→posted→fade→(gọi onDone). Chọn ngẫu nhiên 1 commenter +
 * 1 câu bình luận từ `pool` mỗi lần kích hoạt.
 */
export function useGhostTyping(
  active: boolean,
  pool: string[],
  onPosted?: () => void,
  onDone?: () => void,
): GhostCommentState | null {
  const [state, setState] = useState<GhostCommentState | null>(null);
  const pickRef = useRef({
    commenter: GHOST_COMMENTERS[0],
    headline: GHOST_HEADLINE_KEYS[0],
    text: pool[0],
  });

  useEffect(() => {
    if (!active) {
      setState(null);
      return;
    }

    const idx = Math.floor(Math.random() * GHOST_COMMENTERS.length);
    pickRef.current = {
      commenter: GHOST_COMMENTERS[idx],
      headline: GHOST_HEADLINE_KEYS[idx % GHOST_HEADLINE_KEYS.length],
      text: pool[Math.floor(Math.random() * pool.length)],
    };
    const { commenter, headline, text } = pickRef.current;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    let i = 0;
    const typeNext = () => {
      if (cancelled) return;
      setState({
        phase: "typing",
        typed: text.slice(0, i),
        commenter,
        headline,
        text,
      });
      i++;
      if (i <= text.length) {
        timers.push(setTimeout(typeNext, 45 + Math.random() * 35));
        return;
      }
      setState({ phase: "posting", typed: text, commenter, headline, text });
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setState({ phase: "posted", typed: text, commenter, headline, text });
          onPosted?.();
          timers.push(
            setTimeout(() => {
              if (cancelled) return;
              setState({
                phase: "fade",
                typed: text,
                commenter,
                headline,
                text,
              });
              timers.push(
                setTimeout(() => {
                  if (cancelled) return;
                  setState(null);
                  onDone?.();
                }, PHASE_MS.fade),
              );
            }, PHASE_MS.posted),
          );
        }, PHASE_MS.posting),
      );
    };
    typeNext();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return state;
}

function AvatarInitials({
  initials,
  gradient,
  size = "size-6",
}: {
  initials: string;
  gradient: string;
  size?: string;
}) {
  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-linear-to-br ${gradient} text-[9px] font-bold text-white`}
    >
      {initials}
    </div>
  );
}

const fadeClass = (phase: GhostPhase) =>
  phase === "fade" ? "opacity-0 transition-opacity duration-400" : "";

// ── Instagram ─────────────────────────────────────────────────────
// Inline dưới caption: avatar 24px tròn, username BOLD + text CÙNG DÒNG,
// meta row riêng "Vừa xong · Trả lời" + ♡ nhỏ bên phải.

export function InstagramGhostComment({
  state,
}: {
  state: GhostCommentState | null;
}) {
  const { t } = useTranslation();
  if (!state) return null;
  const { phase, typed, commenter } = state;

  if (phase === "typing") {
    return (
      <div className="flex items-center gap-1.5 border-t border-zinc-100 px-3.5 py-2 dark:border-zinc-800">
        <AvatarInitials
          initials={commenter.initials}
          gradient={commenter.avatarGradient}
        />
        <p className="min-w-0 flex-1 truncate text-[10px] text-zinc-700 dark:text-zinc-300">
          {typed || t("landing.heroFeed.ui.typingPlaceholder")}
          <span className="cursor-blink ml-0.5">|</span>
        </p>
      </div>
    );
  }

  return (
    <div
      className={`ghost-comment-in flex items-start gap-1.5 border-t border-zinc-100 px-3.5 py-2 dark:border-zinc-800 ${fadeClass(phase)}`}
      style={{ opacity: phase === "posting" ? 0.6 : undefined }}
    >
      <AvatarInitials
        initials={commenter.initials}
        gradient={commenter.avatarGradient}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] leading-snug text-zinc-800 dark:text-zinc-200">
          <span className="mr-1 font-semibold">{commenter.handle}</span>
          {typed}
        </p>
        <p className="mt-0.5 text-[9px] text-zinc-400 dark:text-zinc-500">
          {phase === "posting"
            ? t("landing.heroFeed.ui.posting")
            : t("landing.heroFeed.ui.justNowReply")}
        </p>
      </div>
      {phase === "posted" && (
        <Heart className="mt-0.5 size-3 shrink-0 text-zinc-400 dark:text-zinc-500" />
      )}
    </div>
  );
}

// ── TikTok ────────────────────────────────────────────────────────
// Bottom sheet tối phủ 1 phần video: header count, avatar 28px, @username
// XÁM dòng trên, text TRẮNG dòng dưới, ♡+count DỌC bên phải, badge "Bình
// luận đầu tiên" (TikTok 2026 thay cho pin comment đã bị gỡ).

export function TikTokGhostComment({
  state,
}: {
  state: GhostCommentState | null;
}) {
  const { t } = useTranslation();
  if (!state) return null;
  const { phase, typed, commenter } = state;

  // TikTok: comment sheet trượt lên PHỦ video (đúng hành vi thật khi mở
  // comment) — nhưng chỉ chiếm phần TRÁI, chừa right-16 để không đè lên
  // action bar dọc (Heart/Comment/Share/Save) đang cố định bên phải.
  if (phase === "typing") {
    return (
      <div className="absolute right-16 bottom-0 left-0 z-50 rounded-t-xl bg-zinc-900/95 px-2.5 py-2 backdrop-blur">
        <div className="flex items-center gap-1.5">
          <AvatarInitials
            initials={commenter.initials}
            gradient={commenter.avatarGradient}
          />
          <p className="min-w-0 flex-1 truncate text-[10px] text-white/90">
            {typed || t("landing.heroFeed.ui.typingPlaceholderDots")}
            <span className="cursor-blink ml-0.5">|</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`ghost-comment-in absolute right-16 bottom-0 left-0 z-50 rounded-t-xl bg-zinc-900/95 px-2.5 py-2 backdrop-blur ${fadeClass(phase)}`}
      style={{ opacity: phase === "posting" ? 0.6 : undefined }}
    >
      <p className="mb-1.5 text-[9px] font-medium text-white/50">
        {t("landing.heroFeed.ui.comment")}
      </p>
      <div className="flex items-start gap-1.5">
        <AvatarInitials
          initials={commenter.initials}
          gradient={commenter.avatarGradient}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[9px] text-white/50">@{commenter.handle}</p>
          <p className="text-[10px] leading-snug text-white">{typed}</p>
          <div className="mt-0.5 flex items-center gap-2 text-[9px] text-white/40">
            <span>
              {phase === "posting"
                ? t("landing.heroFeed.ui.posting")
                : t("landing.heroFeed.ui.timeAgoSeconds2")}
            </span>
            {phase === "posted" && (
              <span>{t("landing.heroFeed.ui.reply")}</span>
            )}
          </div>
        </div>
        {phase === "posted" && (
          <div className="flex shrink-0 flex-col items-center gap-0.5">
            <Heart className="size-3 text-white/40" />
            <span className="text-[8px] text-white/40">0</span>
          </div>
        )}
      </div>
      {phase === "posted" && (
        <span className="mt-1.5 inline-block rounded bg-pink-500/20 px-1.5 py-0.5 text-[8px] font-medium text-pink-300">
          {t("landing.heroFeed.ui.firstComment")}
        </span>
      )}
    </div>
  );
}

// ── Facebook ──────────────────────────────────────────────────────
// Avatar 28px, BUBBLE XÁM bo tròn chứa Tên bold + text, meta row NGOÀI
// bubble "Thích · Phản hồi · vừa xong".

export function FacebookGhostComment({
  state,
}: {
  state: GhostCommentState | null;
}) {
  const { t } = useTranslation();
  if (!state) return null;
  const { phase, typed, commenter } = state;

  if (phase === "typing") {
    return (
      <div className="flex items-center gap-1.5 border-t border-zinc-100 px-3 py-2 dark:border-zinc-800">
        <AvatarInitials
          initials={commenter.initials}
          gradient={commenter.avatarGradient}
        />
        <div className="min-w-0 flex-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1.5 dark:border-zinc-600 dark:bg-zinc-800">
          <p className="truncate text-[10px] text-zinc-600 dark:text-zinc-300">
            {typed || t("landing.heroFeed.ui.fbTypingPlaceholder")}
            <span className="cursor-blink ml-0.5">|</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`ghost-comment-in flex items-start gap-1.5 border-t border-zinc-100 px-3 py-2 dark:border-zinc-800 ${fadeClass(phase)}`}
      style={{ opacity: phase === "posting" ? 0.6 : undefined }}
    >
      <AvatarInitials
        initials={commenter.initials}
        gradient={commenter.avatarGradient}
      />
      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-zinc-100 px-3 py-1.5 dark:bg-zinc-700">
          <p className="text-[10px] font-semibold text-zinc-900 dark:text-zinc-100">
            {t(commenter.nameKey)}
          </p>
          <p className="text-[10px] leading-snug text-zinc-800 dark:text-zinc-200">
            {typed}
          </p>
        </div>
        <div className="mt-0.5 flex items-center gap-2 px-3 text-[9px] font-medium text-zinc-500 dark:text-zinc-400">
          <span>
            {phase === "posting"
              ? t("landing.heroFeed.ui.posting")
              : t("landing.heroFeed.ui.like")}
          </span>
          {phase === "posted" && (
            <>
              <span>{t("landing.heroFeed.ui.reply")}</span>
              <span>{t("landing.heroFeed.ui.justNow")}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── LinkedIn ──────────────────────────────────────────────────────
// Avatar 32px, Tên bold + headline nghề nghiệp xám nhỏ, text riêng dòng,
// meta "Thích · Phản hồi" formal, không emoji.

export function LinkedInGhostComment({
  state,
}: {
  state: GhostCommentState | null;
}) {
  const { t } = useTranslation();
  if (!state) return null;
  const { phase, typed, commenter, headline } = state;

  if (phase === "typing") {
    return (
      <div className="flex items-center gap-1.5 border-t border-zinc-100 px-3 py-2 dark:border-zinc-800">
        <AvatarInitials
          initials={commenter.initials}
          gradient={commenter.avatarGradient}
          size="size-7"
        />
        <div className="min-w-0 flex-1 rounded-full border border-zinc-300 bg-white px-2.5 py-1.5 dark:border-zinc-600 dark:bg-zinc-800">
          <p className="truncate text-[10px] text-zinc-600 dark:text-zinc-300">
            {typed || t("landing.heroFeed.ui.typingPlaceholder")}
            <span className="cursor-blink ml-0.5">|</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`ghost-comment-in flex items-start gap-1.5 border-t border-zinc-100 px-3 py-2 dark:border-zinc-800 ${fadeClass(phase)}`}
      style={{ opacity: phase === "posting" ? 0.6 : undefined }}
    >
      <AvatarInitials
        initials={commenter.initials}
        gradient={commenter.avatarGradient}
        size="size-7"
      />
      <div className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 dark:border-zinc-700 dark:bg-zinc-800">
        <p className="text-[10px] font-semibold text-zinc-900 dark:text-zinc-100">
          {t(commenter.nameKey)}
        </p>
        <p className="text-[9px] text-zinc-500 dark:text-zinc-400">
          {t(headline)}
        </p>
        <p className="mt-0.5 text-[10px] leading-snug text-zinc-800 dark:text-zinc-200">
          {typed}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[9px] font-medium text-zinc-500 dark:text-zinc-400">
          <span>
            {phase === "posting"
              ? t("landing.heroFeed.ui.posting")
              : t("landing.heroFeed.ui.like")}
          </span>
          {phase === "posted" && (
            <span>{t("landing.heroFeed.ui.reply")}</span>
          )}
        </div>
      </div>
    </div>
  );
}
