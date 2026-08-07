import { useEffect, useRef, useState } from "react";

interface UseFeedRotationOptions {
  intervalMs?: number;
  /** Thời gian trượt (ms) — bài cũ trượt lên trong lúc bài mới trượt vào từ dưới. */
  slideMs?: number;
}

/**
 * Xoay vòng qua 1 mảng "bài viết" theo thời gian, kiểu lướt feed dọc
 * (TikTok/Reels): bài cũ trượt lên + mờ dần, bài mới trượt từ dưới lên
 * thay thế — CÙNG LÚC, không phải crossfade tại chỗ. Component cha cần
 * render CẢ `outgoing` (nếu có) VÀ `slide` chồng lên nhau trong 1 khung
 * `overflow-hidden`, dùng `phase` để biết lúc nào áp transform trượt.
 *
 * `phase`:
 * - "idle": đứng yên ở `slide`, không có `outgoing`.
 * - "sliding": đang chuyển — `outgoing` (bài vừa rời) render phía trên
 *   translateY(-100%), `slide` (bài mới) render tại translateY(0) từ
 *   translateY(100%). Component cha tự áp class transition theo `phase`.
 */
export function useFeedRotation<T>(
  slides: T[],
  { intervalMs = 6000, slideMs = 500 }: UseFeedRotationOptions = {},
) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"idle" | "sliding">("idle");
  const outgoingRef = useRef<T | null>(null);

  useEffect(() => {
    if (slides.length <= 1) return;
    let cancelled = false;
    let settleTimer: ReturnType<typeof setTimeout>;

    const cycle = () => {
      const waitTimer = setTimeout(() => {
        if (cancelled) return;
        setIndex((i) => {
          outgoingRef.current = slides[i];
          return (i + 1) % slides.length;
        });
        setPhase("sliding");
        settleTimer = setTimeout(() => {
          if (cancelled) return;
          setPhase("idle");
          outgoingRef.current = null;
          cycle();
        }, slideMs);
      }, intervalMs);
      return waitTimer;
    };

    const waitTimer = cycle();
    return () => {
      cancelled = true;
      clearTimeout(waitTimer);
      clearTimeout(settleTimer);
    };
  }, [slides.length, intervalMs, slideMs]);

  return {
    slide: slides[index],
    outgoing: phase === "sliding" ? outgoingRef.current : null,
    index,
    phase,
    slideMs,
  };
}
