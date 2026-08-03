import { useEffect, useRef, useState } from "react";

interface UseLiveCounterOptions {
  minIntervalMs?: number;
  maxIntervalMs?: number;
  step?: number;
}

/**
 * Số like/comment tự tăng ngẫu nhiên theo thời gian, mô phỏng hoạt động
 * "sống" trên mini-post. Trả về giá trị hiện tại + cờ `bumped` bật trong
 * 400ms sau mỗi lần tăng để component cha trigger animation "pop".
 */
export function useLiveCounter(
  initial: number,
  {
    minIntervalMs = 2500,
    maxIntervalMs = 5500,
    step = 1,
  }: UseLiveCounterOptions = {},
) {
  const [value, setValue] = useState(initial);
  const [bumped, setBumped] = useState(false);
  const bumpTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const delay =
        minIntervalMs + Math.random() * (maxIntervalMs - minIntervalMs);
      timer = setTimeout(() => {
        if (cancelled) return;
        setValue((v) => v + Math.ceil(Math.random() * step));
        setBumped(true);
        clearTimeout(bumpTimeout.current);
        bumpTimeout.current = setTimeout(() => setBumped(false), 400);
        tick();
      }, delay);
    };

    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearTimeout(bumpTimeout.current);
    };
  }, [minIntervalMs, maxIntervalMs, step]);

  return { value, bumped };
}

/** "2384" -> "2,384" (kiểu Instagram/Facebook) */
export function formatComma(n: number): string {
  return n.toLocaleString("en-US");
}

/** "45200" -> "45.2K" (kiểu TikTok) */
export function formatCompactK(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1)}K`;
}
