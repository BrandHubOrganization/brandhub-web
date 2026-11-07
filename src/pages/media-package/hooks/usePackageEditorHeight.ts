import { useLayoutEffect, useRef, useState } from "react";

export function usePackageEditorHeight(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  useLayoutEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    const main = element.closest("main");
    let frame = 0;
    const measure = () => {
      const viewBottom = Math.min(
        window.innerHeight,
        window.visualViewport
          ? window.visualViewport.height + window.visualViewport.offsetTop
          : window.innerHeight,
      );
      const bottom = main
        ? Math.min(
            viewBottom,
            main.getBoundingClientRect().bottom -
              parseFloat(getComputedStyle(main).paddingBottom),
          )
        : viewBottom;
      // Ancestor scroll must not change the editor's allocated layout height.
      let top = element.getBoundingClientRect().top;
      for (
        let parent = element.parentElement;
        parent;
        parent = parent.parentElement
      )
        top += parent.scrollTop;
      const next = Math.max(280, Math.floor(bottom - top - 8));
      setHeight((previous) => (previous === next ? previous : next));
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    if (element.parentElement) observer.observe(element.parentElement);
    if (main) observer.observe(main);
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
    };
  }, [enabled]);
  return { ref, height };
}
