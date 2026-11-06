import { useEffect, useRef, useState } from "react";

export function usePackageDisclosure(contentKey: string) {
  const proposalRef = useRef<HTMLElement>(null);
  const [automatic, setAutomatic] = useState<Set<string>>(() => new Set());
  const [manual, setManual] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const proposal = proposalRef.current;
    if (!proposal) return;
    const viewport = proposal.closest<HTMLElement>("[data-package-viewport]");
    const measure = () => {
      const rows = [
        ...proposal.querySelectorAll<HTMLTableRowElement>(
          "[data-package-detail-row]",
        ),
      ];
      const independentlyScrollable =
        viewport &&
        ["auto", "scroll"].includes(getComputedStyle(viewport).overflowY);
      const available = independentlyScrollable
        ? viewport.clientHeight
        : Math.max(
            48,
            window.innerHeight -
              Math.max(0, proposal.getBoundingClientRect().top) -
              24,
          );
      const manualHeight = rows.reduce(
        (height, row) =>
          manual[row.dataset.packageItemId!] === true
            ? height + row.getBoundingClientRect().height
            : height,
        0,
      );
      const hidden = rows.map((row) => row.hidden);
      const paragraphs = rows.flatMap((row) => [
        ...row.querySelectorAll<HTMLElement>("[data-package-text]"),
      ]);
      const toggles = rows.flatMap((row) => [
        ...row.querySelectorAll<HTMLElement>("[data-package-text-toggle]"),
      ]);
      const clamps = paragraphs.map((element) => element.style.webkitLineClamp);
      const displays = toggles.map((element) => element.style.display);
      let baseHeight: number;
      let heights: number[];
      try {
        rows.forEach((row) => {
          row.hidden = false;
        });
        paragraphs.forEach((element) => {
          element.style.webkitLineClamp = "unset";
        });
        toggles.forEach((element) => {
          element.style.display = "none";
        });
        heights = rows.map((row) => row.getBoundingClientRect().height);
        baseHeight =
          proposal.getBoundingClientRect().height -
          heights.reduce((sum, height) => sum + height, 0);
      } finally {
        rows.forEach((row, index) => {
          row.hidden = hidden[index];
        });
        paragraphs.forEach((element, index) => {
          element.style.webkitLineClamp = clamps[index];
        });
        toggles.forEach((element, index) => {
          element.style.display = displays[index];
        });
      }
      let remaining = available - baseHeight - manualHeight - 4;
      const next = new Set<string>();
      rows.forEach((row, index) => {
        const id = row.dataset.packageItemId!;
        if (Object.hasOwn(manual, id)) return;
        if (heights[index] <= remaining) {
          next.add(id);
          remaining -= heights[index];
        }
      });
      setAutomatic((previous) =>
        previous.size === next.size && [...next].every((id) => previous.has(id))
          ? previous
          : next,
      );
    };
    let frame = 0;
    const scheduleMeasure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(proposal);
    if (viewport) observer.observe(viewport);
    window.addEventListener("resize", scheduleMeasure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [contentKey, manual]);
  return {
    proposalRef,
    isOpen: (id: string) => manual[id] ?? automatic.has(id),
    toggle: (id: string) =>
      setManual((previous) => ({
        ...previous,
        [id]: !(previous[id] ?? automatic.has(id)),
      })),
  };
}
