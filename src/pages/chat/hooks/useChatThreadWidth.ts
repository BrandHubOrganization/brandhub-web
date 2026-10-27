import { useLayoutEffect, useState, type RefObject } from "react";

const DEFAULT_WIDTH = 480;

export function useChatThreadWidth(
  container: RefObject<HTMLElement | null>,
  navigation: RefObject<HTMLElement | null>,
) {
  const [preferred, setPreferred] = useState(DEFAULT_WIDTH);
  const [bounds, setBounds] = useState({ min: 360, max: 800 });
  useLayoutEffect(() => {
    const element = container.current;
    if (!element) return;
    const measure = () => {
      const available = Math.max(
        0,
        element.clientWidth -
          (navigation.current?.getBoundingClientRect().width ?? 0),
      );
      if (!available) return;
      const max = Math.floor(
        Math.min(800, Math.max(available / 2, available - 320)),
      );
      const min = Math.min(360, max);
      setBounds((current) =>
        current.min === min && current.max === max ? current : { min, max },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (navigation.current) observer.observe(navigation.current);
    return () => observer.disconnect();
  }, [container, navigation]);
  const clamp = (value: number) =>
    Math.max(bounds.min, Math.min(bounds.max, value));
  return {
    ...bounds,
    width: clamp(preferred),
    standard: clamp(DEFAULT_WIDTH),
    resize: (value: number) => setPreferred(clamp(value)),
    reset: () => setPreferred(DEFAULT_WIDTH),
  };
}

export type ChatThreadWidth = ReturnType<typeof useChatThreadWidth>;
