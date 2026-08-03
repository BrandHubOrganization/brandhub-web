import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Heart } from "lucide-react";

interface FloatingHeart {
  id: number;
  left: number;
  duration: number;
}

interface FloatingHeartsProps {
  anchorClassName?: string;
  minIntervalMs?: number;
  maxIntervalMs?: number;
}

/** Handle để component cha force-spawn 1 tim (dùng khi ghost cursor click like). */
export interface FloatingHeartsHandle {
  emit: () => void;
}

/**
 * Tim đỏ bay lên + mờ dần từ 1 điểm neo, kiểu IG/TikTok live.
 * Tự spawn theo interval, tự huỷ sau khi animation kết thúc.
 * Expose `emit()` qua ref để component cha gọi khi có tương tác ghost.
 */
export const FloatingHearts = forwardRef<
  FloatingHeartsHandle,
  FloatingHeartsProps
>(function FloatingHearts(
  {
    anchorClassName = "right-3 bottom-16",
    minIntervalMs = 1800,
    maxIntervalMs = 3200,
  },
  ref,
) {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const idRef = useRef(0);

  const spawn = () => {
    const id = idRef.current++;
    const duration = 1.2 + Math.random() * 0.6;
    setHearts((prev) => [
      ...prev,
      { id, left: Math.random() * 16 - 8, duration },
    ]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    }, duration * 1000);
  };

  useImperativeHandle(ref, () => ({ emit: spawn }), []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const delay =
        minIntervalMs + Math.random() * (maxIntervalMs - minIntervalMs);
      timer = setTimeout(() => {
        if (cancelled) return;
        spawn();
        schedule();
      }, delay);
    };

    schedule();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minIntervalMs, maxIntervalMs]);

  return (
    <div className={`pointer-events-none absolute ${anchorClassName} z-30`}>
      {hearts.map((h) => (
        <Heart
          key={h.id}
          className="float-heart absolute size-3.5 fill-red-500 text-red-500"
          style={{
            left: `${h.left}px`,
            animationDuration: `${h.duration}s`,
          }}
        />
      ))}
    </div>
  );
});

export default FloatingHearts;
