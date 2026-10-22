import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MessageSquareText, Sparkles, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ContentCreatorAiPanel } from "@/pages/editor/components/ContentCreatorAiPanel";
import type { ComponentProps } from "react";

type AiContentPopoverProps = ComponentProps<typeof ContentCreatorAiPanel> & {
  disabled?: boolean;
};

export function AiContentPopover({
  disabled = false,
  ...panelProps
}: AiContentPopoverProps) {
  const { t } = useTranslation();
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 420,
    maxHeight: 640,
  });
  const visible = open && !disabled;

  const updatePosition = useCallback(() => {
    const anchor = triggerRef.current?.getBoundingClientRect();
    if (!anchor) return;
    const width = Math.min(420, window.innerWidth - 32);
    const below = window.innerHeight - anchor.bottom - 24;
    const above = anchor.top - 24;
    const desiredHeight = Math.min(640, window.innerHeight - 32);
    let top = 16;
    let maxHeight = desiredHeight;
    if (below >= Math.min(360, desiredHeight)) {
      top = anchor.bottom + 8;
      maxHeight = Math.min(desiredHeight, below);
    } else if (above >= Math.min(360, desiredHeight)) {
      maxHeight = Math.min(desiredHeight, above);
      top = anchor.top - maxHeight - 8;
    }
    setPosition({
      top,
      left: Math.max(
        16,
        Math.min(anchor.right - width, window.innerWidth - width - 16),
      ),
      width,
      maxHeight,
    });
  }, []);

  const show = (focus = false) => {
    if (disabled) return;
    updatePosition();
    setOpen(true);
    if (focus) requestAnimationFrame(() => closeRef.current?.focus());
  };

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!visible) return;
    const handleOutside = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (
        panelRef.current?.contains(event.target) ||
        triggerRef.current?.contains(event.target)
      )
        return;
      setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const dialog =
        event.target instanceof Element
          ? event.target.closest('[role="dialog"]')
          : null;
      if (dialog && dialog !== panelRef.current) return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [visible, updatePosition]);

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={visible}
        aria-controls={id}
        onPointerEnter={(event) => event.pointerType === "mouse" && show()}
        onClick={() => show(true)}
        className="border-brand-orange/30 text-brand-orange hover:bg-brand-orange-soft hover:text-brand-orange h-8 rounded-lg text-xs"
      >
        <Sparkles className="size-3.5" />
        {t("editor.studio.aiContent.button")}
      </Button>
      {createPortal(
        <section
          ref={panelRef}
          id={id}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-description`}
          hidden={!visible}
          style={{ ...position, display: visible ? "flex" : "none" }}
          className="border-border bg-popover text-popover-foreground fixed z-40 flex-col overflow-hidden rounded-2xl border shadow-xl"
        >
          <header className="border-border flex shrink-0 items-center gap-3 border-b px-4 py-3">
            <Sparkles className="text-brand-orange size-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 id={`${id}-title`} className="text-sm font-semibold">
                {t("editor.studio.aiContent.button")}
              </h2>
              <p
                id={`${id}-description`}
                className="text-muted-foreground mt-0.5 text-xs"
              >
                {t("editor.studio.aiContent.description")}
              </p>
            </div>
            <Button
              ref={closeRef}
              type="button"
              variant="ghost"
              size="icon"
              onClick={close}
              aria-label={t("editor.studio.aiContent.close")}
              className="size-8"
            >
              <X className="size-4" />
            </Button>
          </header>
          <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain p-3">
            <div className="flex items-start gap-2 px-1">
              <MessageSquareText className="text-muted-foreground mt-2 size-4 shrink-0" />
              <p className="bg-muted text-foreground rounded-xl rounded-tl-sm px-3 py-2 text-xs leading-relaxed">
                {t("editor.studio.aiContent.greeting")}
              </p>
            </div>
            <ContentCreatorAiPanel {...panelProps} />
          </div>
        </section>,
        document.body,
      )}
    </>
  );
}
