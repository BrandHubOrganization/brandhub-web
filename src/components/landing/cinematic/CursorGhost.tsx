import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface CursorGhostProps {
  /** Màu chấm tròn con trỏ (theo brand color từng platform). */
  color?: string;
  /** CSS selectors cho các phần tử tương tác (like, comment, share, save...)
   *  trong cùng card. Cursor sẽ tìm trong DOM, di chuyển đến từng target,
   *  dừng + "click" rồi qua target tiếp theo. */
  targets?: string[];
  /** Gọi khi cursor "click" vào 1 target thật — nhận giá trị
   *  `data-cursor-target` của phần tử đó (like, comment, share, save...). */
  onInteract?: (targetType: string) => void;
}

/**
 * Con trỏ giả lập "người khác đang xem" — kiểu multiplayer cursor
 * Figma/Notion, nhưng thay vì trôi ngẫu nhiên, nó chủ động di chuyển đến
 * các nút tương tác (like, comment, share, save...) trên post, dừng lại
 * rồi "click" (hiệu ứng ripple + pulse). Khi click vào target thật,
 * gọi `onInteract` để component cha tạo tương tác thật (tim bay, comment...).
 */
export function CursorGhost({
  color = "#f05a28",
  targets = [],
  onInteract,
}: CursorGhostProps) {
  const dotRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!dotRef.current || targets.length === 0) return;
    const dot = dotRef.current;
    const ripple = rippleRef.current;
    const ring = ringRef.current;
    const container = dot.parentElement;
    if (!container) return;

    const findTarget = (): HTMLElement | null => {
      const shuffled = [...targets].sort(() => Math.random() - 0.5);
      for (const sel of shuffled) {
        const el = container.querySelector<HTMLElement>(sel);
        if (el) return el;
      }
      return null;
    };

    const getTargetPos = (target: HTMLElement) => {
      const cr = container.getBoundingClientRect();
      const tr = target.getBoundingClientRect();
      return {
        left: ((tr.left + tr.width / 2 - cr.left) / cr.width) * 100,
        top: ((tr.top + tr.height / 2 - cr.top) / cr.height) * 100,
      };
    };

    const clickPulse = () => {
      if (!ripple || !ring) return;
      const x = parseFloat(dot.style.left as string) || 0;
      const y = parseFloat(dot.style.top as string) || 0;

      gsap.set(ripple, {
        left: `${x}%`,
        top: `${y}%`,
        xPercent: -50,
        yPercent: -50,
        width: 0,
        height: 0,
        opacity: 0.7,
        borderWidth: 3,
      });
      gsap.to(ripple, {
        width: 36,
        height: 36,
        opacity: 0,
        borderWidth: 0,
        duration: 0.7,
        ease: "power2.out",
      });

      gsap.to(ring, {
        scale: 2.2,
        opacity: 0,
        duration: 0.35,
        ease: "power2.out",
        onComplete: () => {
          gsap.set(ring, { scale: 1, opacity: 1 });
        },
      });

      gsap.to(dot, {
        scale: 1.8,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      });
    };

    const visit = () => {
      const target = findTarget();
      const targetType = target?.getAttribute("data-cursor-target") ?? null;
      let left: number;
      let top: number;

      if (target) {
        const pos = getTargetPos(target);
        left = pos.left;
        top = pos.top;
      } else {
        left = 15 + Math.random() * 70;
        top = 20 + Math.random() * 60;
      }

      gsap.to(dot, {
        left: `${left}%`,
        top: `${top}%`,
        duration: 0.9 + Math.random() * 1.1,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.to(dot, {
            duration: 0.4 + Math.random() * 0.5,
            onComplete: () => {
              if (target) {
                clickPulse();
                if (targetType) onInteract?.(targetType);
              }
              gsap.to(dot, {
                duration: 0.7 + Math.random() * 1.2,
                onComplete: visit,
              });
            },
          });
        },
      });
    };

    gsap.to(dot, {
      duration: 0.3 + Math.random() * 2.5,
      onComplete: visit,
    });
  });

  return (
    <>
      <div
        ref={rippleRef}
        className="pointer-events-none absolute z-40 rounded-full border-[var(--brand-orange)]"
        style={{ borderColor: color, left: "20%", top: "30%" }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none absolute z-40 flex items-center justify-center"
        style={{ left: "20%", top: "30%" }}
      >
        <div
          ref={ringRef}
          className="absolute size-4 rounded-full border opacity-40"
          style={{ borderColor: color, borderWidth: 2 }}
        />
        <div
          className="size-1.5 rounded-full shadow-[0_0_0_1.5px_rgba(255,255,255,0.9)]"
          style={{ backgroundColor: color }}
        />
      </div>
    </>
  );
}

export default CursorGhost;
