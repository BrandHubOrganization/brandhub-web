import { useLayoutEffect, useState } from "react";

/** Keep the badge whole; the heading may truncate independently. */
export function useTimelineStatusWidth(labels: string[]) {
  const key = [...new Set(labels)].sort().join("\u0000");
  const [minimum, setMinimum] = useState(88);
  useLayoutEffect(() => {
    let disposed = false;
    const measure = () => {
      if (disposed) return;
      const context = document.createElement("canvas").getContext("2d");
      if (!context) return;
      context.font = `500 10px ${getComputedStyle(document.body).fontFamily}`;
      // Badge padding, border, dot/gap and cell padding use the existing UI tokens.
      const width = Math.max(
        88,
        ...key
          .split("\u0000")
          .map((label) => Math.ceil(context.measureText(label).width + 46)),
      );
      setMinimum(width);
    };
    measure();
    void document.fonts?.ready.then(measure);
    return () => {
      disposed = true;
    };
  }, [key]);
  return minimum;
}
