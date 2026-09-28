import { useRef } from "react";

/**
 * Magnetic spotlight hover: set CSS var --x/--y trực tiếp qua ref, không
 * qua useState — tránh re-render toàn card mỗi mousemove frame. Card CSS
 * tự đọc var để vẽ radial-gradient (`bg-[radial-gradient(...)]` với
 * `var(--x)`/`var(--y)`).
 */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const onMouseMove = (e: React.MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  return { ref, onMouseMove };
}
