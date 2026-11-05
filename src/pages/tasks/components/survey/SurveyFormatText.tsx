import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import {
  Bold,
  Check,
  Italic,
  Link2,
  RemoveFormatting,
  Underline,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
};

export function stripHtmlTags(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:nbsp|amp|lt|gt);/gi, (m) => ENTITIES[m.toLowerCase()] ?? m)
    .trim();
}

export function sanitizeFormattedHtml(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<(?!\/?(?:b|strong|i|em|u|a|br)\b)[^>]*>/gi, "")
    .replace(/<a\b[^>]*href=["']([^"']*)["'][^>]*>/gi, (_, href: string) => {
      const safeHref = /^(https?:\/\/|mailto:|tel:)/i.test(href.trim())
        ? href.trim()
        : `https://${href.trim()}`;
      return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="text-brand-orange underline underline-offset-2">`;
    });
}

export function FormattedText(p: { text?: string; className?: string }) {
  if (!p.text) return null;
  if (!/<\/?[a-z][\s\S]*>/i.test(p.text))
    return <span className={p.className}>{p.text}</span>;
  return (
    <span
      className={p.className}
      dangerouslySetInnerHTML={{ __html: sanitizeFormattedHtml(p.text) }}
    />
  );
}

export interface SurveyFormattedInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  variant?: "underline" | "box";
}

type ActiveFormats = Record<"bold" | "italic" | "underline", boolean>;

const TOOLBAR_BTNS = [
  { key: "bold", title: "Bold (Ctrl+B)", Icon: Bold },
  { key: "italic", title: "Italic (Ctrl+I)", Icon: Italic },
  { key: "underline", title: "Underline (Ctrl+U)", Icon: Underline },
  { key: "link", title: "Insert link", Icon: Link2 },
  { key: "removeFormat", title: "Clear formatting", Icon: RemoveFormatting },
] as const;

const BASE_BTN = "size-8 rounded-md p-1.5 transition-colors cursor-pointer";
const ACTIVE_BTN =
  "bg-foreground text-background hover:bg-foreground/90 hover:text-background shadow-2xs";
const INACTIVE_BTN =
  "text-muted-foreground hover:bg-muted hover:text-foreground";
const btnCls = (active: boolean) =>
  cn(BASE_BTN, active ? ACTIVE_BTN : INACTIVE_BTN);

export function SurveyFormattedInput(p: SurveyFormattedInputProps) {
  const variant = p.variant ?? "underline";
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>({
    bold: false,
    italic: false,
    underline: false,
  });

  const refreshActiveFormats = useCallback(() => {
    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
      });
    } catch {
      // Ignore queryCommandState errors when no selection exists
    }
  }, []);

  useEffect(() => {
    const el = editorRef.current;
    if (el && el.innerHTML !== p.value) el.innerHTML = p.value || "";
  }, [p.value]);

  useEffect(() => {
    if (!isFocused) return;
    document.addEventListener("selectionchange", refreshActiveFormats);
    return () =>
      document.removeEventListener("selectionchange", refreshActiveFormats);
  }, [isFocused, refreshActiveFormats]);

  const syncValue = () => {
    const el = editorRef.current;
    if (!el) return;
    const isBlank = stripHtmlTags(el.innerHTML).length === 0;
    if (isBlank && el.innerHTML !== "") el.innerHTML = "";
    const cleaned = isBlank ? "" : sanitizeFormattedHtml(el.innerHTML);
    if (cleaned !== p.value) p.onChange(cleaned);
    refreshActiveFormats();
  };

  const applyCommand = (e: MouseEvent<HTMLButtonElement>, command: string) => {
    e.preventDefault();
    editorRef.current?.focus();
    document.execCommand(command, false);
    syncValue();
  };

  const handleToggleLink = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0)
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    setShowLinkInput((prev) => !prev);
  };

  const handleConfirmLink = () => {
    const trimmed = linkUrl.trim();
    if (editorRef.current && trimmed) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel && savedRangeRef.current) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
      const href = /^(https?:\/\/|mailto:)/i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
      const aTag = `<a href="${href}" target="_blank" rel="noopener noreferrer">${trimmed}</a>`;
      document.execCommand(
        sel && !sel.isCollapsed ? "createLink" : "insertHTML",
        false,
        sel && !sel.isCollapsed ? href : aTag,
      );
      syncValue();
    }
    setLinkUrl("");
    setShowLinkInput(false);
  };

  const isEmpty = stripHtmlTags(p.value).length === 0;
  const activeBar = isFocused || showLinkInput;
  const variantCls =
    variant === "underline"
      ? cn(
          "border-b bg-transparent pb-1.5",
          activeBar
            ? "border-brand-orange text-foreground border-b-2"
            : "border-border/70",
        )
      : cn(
          "min-h-9 rounded-md border px-3 py-1.5",
          activeBar
            ? "border-brand-orange bg-background ring-brand-orange/15 ring-2"
            : "border-border/60 hover:border-border hover:bg-muted/20 bg-transparent",
        );

  return (
    <div className={cn("w-full", p.className)}>
      <div className="relative w-full">
        {isEmpty && p.placeholder && (
          <span
            className={cn(
              "text-muted-foreground/50 pointer-events-none absolute inset-0 truncate select-none",
              variant === "underline" ? "pb-1.5" : "px-3 py-1.5",
              p.inputClassName,
            )}
          >
            {p.placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => (setIsFocused(true), refreshActiveFormats())}
          onBlur={() => setIsFocused(false)}
          onKeyUp={refreshActiveFormats}
          onMouseUp={refreshActiveFormats}
          onInput={syncValue}
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) =>
            e.key === "Enter" && variant === "underline" && e.preventDefault()
          }
          className={cn(
            "w-full break-words transition-all outline-none",
            variantCls,
            p.inputClassName,
          )}
        />
      </div>
      {activeBar && (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {TOOLBAR_BTNS.map(({ key, title, Icon }) => {
            const active =
              key === "link"
                ? showLinkInput
                : key === "removeFormat"
                  ? false
                  : activeFormats[key];
            return (
              <Button
                key={key}
                type="button"
                variant="ghost"
                size="icon"
                onMouseDown={(e) =>
                  key === "link" ? handleToggleLink(e) : applyCommand(e, key)
                }
                className={btnCls(active)}
                title={title}
              >
                <Icon className="size-4" strokeWidth={2.25} />
              </Button>
            );
          })}
          {showLinkInput && (
            <div className="border-border bg-background ml-1 flex items-center gap-1 rounded-md border px-2 py-0.5 shadow-2xs">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleConfirmLink())
                }
                placeholder="https://..."
                autoFocus
                className="text-foreground placeholder:text-muted-foreground/50 w-36 bg-transparent text-xs outline-none"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onMouseDown={(e) => (e.preventDefault(), handleConfirmLink())}
                className="text-brand-orange hover:bg-brand-orange/10 size-5 rounded p-0.5"
              >
                <Check className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onMouseDown={(e) => (
                  e.preventDefault(),
                  setShowLinkInput(false),
                  setLinkUrl("")
                )}
                className="text-muted-foreground hover:text-foreground size-5 rounded p-0.5"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
