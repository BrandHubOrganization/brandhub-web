import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { GraphBounds, GraphPoint } from "@/pages/admin/utils/graphLayout";

const ZOOM_STEP = 1.3;
const LABEL_PIXELS = 14;

export function useGraphViewport(initialView: GraphBounds) {
  const [view, setView] = useState(initialView);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 800, height: 540 });
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    origin: GraphBounds;
  } | null>(null);
  const zoom = initialView.width / view.width;
  const pixelsPerUnit = Math.min(
    size.width / view.width,
    size.height / view.height,
  );
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width && entry.contentRect.height) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.15 : 1 / 1.15;
      const rect = svg.getBoundingClientRect();
      const relX =
        rect.width > 0
          ? Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
          : 0.5;
      const relY =
        rect.height > 0
          ? Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
          : 0.5;
      setView((current) => {
        const nextZoom = Math.min(
          4,
          Math.max(0.5, (initialView.width / current.width) * factor),
        );
        const width = initialView.width / nextZoom;
        const height = initialView.height / nextZoom;
        return {
          x: current.x + (current.width - width) * relX,
          y: current.y + (current.height - height) * relY,
          width,
          height,
        };
      });
    };
    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheel);
  }, [initialView.width, initialView.height]);
  const svgPointFromClient = useCallback(
    (clientX: number, clientY: number): GraphPoint | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const matrix = svg.getScreenCTM();
      if (!matrix) return null;
      const point = new DOMPoint(clientX, clientY).matrixTransform(
        matrix.inverse(),
      );
      return { x: point.x, y: point.y };
    },
    [],
  );
  const scale = (factor: number) =>
    setView((current) => {
      const nextZoom = Math.min(
        4,
        Math.max(0.5, (initialView.width / current.width) * factor),
      );
      const width = initialView.width / nextZoom,
        height = initialView.height / nextZoom;
      return {
        x: current.x + (current.width - width) / 2,
        y: current.y + (current.height - height) / 2,
        width,
        height,
      };
    });
  const pan = (x: number, y: number) =>
    setView((current) => ({
      ...current,
      x: current.x + x * current.width * 0.15,
      y: current.y + y * current.height * 0.15,
    }));
  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    if (
      event.button !== 0 ||
      (event.target as Element).closest("[data-graph-item]")
    )
      return;
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      origin: view,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const start = drag.current;
    const matrix = event.currentTarget.getScreenCTM();
    if (!start || start.id !== event.pointerId || !matrix) return;
    setView({
      ...start.origin,
      x: start.origin.x - (event.clientX - start.x) / matrix.a,
      y: start.origin.y - (event.clientY - start.y) / matrix.d,
    });
  };
  const stop = () => {
    drag.current = null;
  };
  const fit = () => {
    stop();
    setView(initialView);
  };
  return {
    zoom,
    svgRef,
    labelSize: LABEL_PIXELS / pixelsPerUnit,
    pan,
    fit,
    zoomIn: () => scale(ZOOM_STEP),
    zoomOut: () => scale(1 / ZOOM_STEP),
    svgPointFromClient,
    viewBox: `${view.x} ${view.y} ${view.width} ${view.height}`,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: stop,
      onPointerCancel: stop,
      onLostPointerCapture: stop,
    },
  };
}
