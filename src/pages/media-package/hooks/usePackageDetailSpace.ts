import { useEffect, useRef, useState } from "react";

/** Decide once per opening/content/viewport size; own clamp height changes must not oscillate. */
export function usePackageDetailSpace(open: boolean, contentKey: string) {
  const fieldsRef = useRef<HTMLDivElement>(null);
  const [limited, setLimited] = useState(false);
  useEffect(() => {
    const fields = fieldsRef.current;
    const proposal = fields?.closest<HTMLElement>("[data-package-proposal]");
    if (!open || !fields || !proposal) return;
    const viewport = proposal.closest<HTMLElement>("[data-package-viewport]");
    let measuredSize = "";
    const measure = () => {
      const scrollsIndependently =
        viewport &&
        ["auto", "scroll"].includes(getComputedStyle(viewport).overflowY);
      const available = scrollsIndependently
        ? viewport.clientHeight
        : Math.max(
            48,
            window.innerHeight -
              Math.max(0, proposal.getBoundingClientRect().top) -
              24,
          );
      const size = `${fields.getBoundingClientRect().width}:${available}`;
      if (size === measuredSize) return;
      measuredSize = size;
      const paragraphs = [
        ...fields.querySelectorAll<HTMLElement>("[data-package-text]"),
      ];
      const buttons = [
        ...fields.querySelectorAll<HTMLElement>("[data-package-text-toggle]"),
      ];
      const clamps = paragraphs.map((element) => element.style.webkitLineClamp);
      const displays = buttons.map((element) => element.style.display);
      let fullHeight: number;
      try {
        paragraphs.forEach((element) => {
          element.style.webkitLineClamp = "unset";
        });
        buttons.forEach((element) => {
          element.style.display = "none";
        });
        fullHeight = proposal.getBoundingClientRect().height;
      } finally {
        paragraphs.forEach((element, index) => {
          element.style.webkitLineClamp = clamps[index];
        });
        buttons.forEach((element, index) => {
          element.style.display = displays[index];
        });
      }
      setLimited(fullHeight > available + 1);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(fields);
    if (viewport) observer.observe(viewport);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [open, contentKey]);
  return { fieldsRef, limited };
}
