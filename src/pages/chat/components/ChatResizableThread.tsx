import { useId, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { GripVertical } from "lucide-react";
import type { ChatThreadWidth } from "@/pages/chat/hooks/useChatThreadWidth";

interface Props {
  sizing: ChatThreadWidth;
  children: ReactNode;
}

export function ChatResizableThread({ sizing, children }: Props) {
  const { t } = useTranslation();
  const id = useId();
  const hint = useId();
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ id: number; x: number; width: number } | null>(null);
  const stop = (target: HTMLElement, cancel: boolean) => {
    const current = drag.current;
    if (!current) return;
    drag.current = null;
    if (cancel) sizing.resize(current.width);
    if (target.hasPointerCapture(current.id))
      target.releasePointerCapture(current.id);
    setDragging(false);
  };
  return (
    <aside
      id={id}
      aria-label={t("chat.thread.title")}
      className="border-border/80 relative min-h-0 min-w-0 shrink-0 border-l"
      style={{ width: sizing.width }}
    >
      <div
        role="separator"
        tabIndex={0}
        aria-label={t("chat.thread.resize")}
        aria-describedby={hint}
        aria-controls={id}
        aria-orientation="vertical"
        aria-valuemin={sizing.min}
        aria-valuemax={sizing.max}
        aria-valuenow={Math.round(sizing.width)}
        aria-valuetext={t("chat.thread.width", {
          width: Math.round(sizing.width),
        })}
        data-resizing={dragging}
        className="group hover:text-brand-orange focus-visible:text-brand-orange text-muted-foreground focus-visible:ring-ring data-[resizing=true]:text-brand-orange absolute inset-y-0 -left-2 z-20 flex w-4 cursor-col-resize touch-none items-center justify-center outline-none select-none focus-visible:ring-2"
        onPointerDown={(event) => {
          if (event.button !== 0 || !event.isPrimary) return;
          event.preventDefault();
          event.currentTarget.focus();
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = {
            id: event.pointerId,
            x: event.clientX,
            width: sizing.width,
          };
          setDragging(true);
        }}
        onPointerMove={(event) => {
          const current = drag.current;
          if (current?.id === event.pointerId)
            sizing.resize(current.width + current.x - event.clientX);
        }}
        onPointerUp={(event) => {
          if (drag.current?.id === event.pointerId)
            stop(event.currentTarget, false);
        }}
        onPointerCancel={(event) => {
          if (drag.current?.id === event.pointerId)
            stop(event.currentTarget, true);
        }}
        onLostPointerCapture={(event) => stop(event.currentTarget, true)}
        onDoubleClick={sizing.reset}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 50 : 20;
          if (event.key === "ArrowLeft") sizing.resize(sizing.width + step);
          else if (event.key === "ArrowRight")
            sizing.resize(sizing.width - step);
          else if (event.key === "Home") sizing.resize(sizing.min);
          else if (event.key === "End") sizing.resize(sizing.max);
          else if (event.key === "Enter") sizing.reset();
          else if (event.key === "Escape" && drag.current)
            stop(event.currentTarget, true);
          else return;
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <span className="bg-border/80 group-hover:bg-brand-orange/50 group-focus-visible:bg-brand-orange/50 group-data-[resizing=true]:bg-brand-orange/50 absolute inset-y-0 left-1/2 w-px" />
        <span className="border-border bg-card relative flex h-9 w-3.5 items-center justify-center rounded-full border shadow-xs">
          <GripVertical className="size-3" aria-hidden="true" />
        </span>
      </div>
      <span id={hint} className="sr-only">
        {t("chat.thread.resizeHint")}
      </span>
      {children}
    </aside>
  );
}
