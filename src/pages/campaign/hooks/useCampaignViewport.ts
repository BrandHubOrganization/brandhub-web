import { useLayoutEffect, useRef, useState } from "react";

/** Use the real page offset rather than a guessed header height. */
export function useCampaignViewport() {
  const ref = useRef<HTMLElement>(null);
  const [height, setHeight] = useState(700);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () =>
      setHeight(
        Math.max(
          440,
          window.innerHeight - element.getBoundingClientRect().top - 16,
        ),
      );
    measure();
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    if (element.parentElement) observer.observe(element.parentElement);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  return { ref, height };
}
