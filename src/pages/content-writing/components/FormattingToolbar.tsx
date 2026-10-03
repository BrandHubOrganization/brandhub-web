import { useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Highlighter,
  Undo2,
  Redo2,
  RemoveFormatting,
  Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AttrsOrMixed, RunAttrs } from "./richText";
import { EmojiPicker } from "./EmojiPicker";

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: '"Times New Roman", serif' },
  { label: "Courier New", value: '"Courier New", monospace' },
  { label: "Verdana", value: "Verdana, sans-serif" },
];

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

const SWATCHES = [
  "#1f2937",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ffffff",
  "#6b7280",
];

const HIGHLIGHT_SWATCHES = [
  "#fef08a",
  "#bbf7d0",
  "#bfdbfe",
  "#fecaca",
  "#e9d5ff",
  "#fed7aa",
  "#f0fdf4",
  "#fdf4ff",
];

export interface FormattingToolbarProps {
  currentAttrs: AttrsOrMixed;
  onToggle: (key: "bold" | "italic" | "underline" | "strikethrough") => void;
  onSetColor: (color?: string) => void;
  onSetHighlight: (color?: string) => void;
  onSetFont: (font?: string) => void;
  onSetSize: (size?: number) => void;
  onSetAlign: (align: RunAttrs["align"]) => void;
  onSetLink: (url?: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearFormatting: () => void;
  onInsertEmoji: (emoji: string) => void;
}

function isActive(value: unknown): boolean {
  return value === true;
}

/**
 * Google-Docs-style formatting toolbar for CanvasTextEditor (FR 3.6.10).
 * Purely presentational — all CRDT-touching logic lives in CanvasTextEditor.
 */
export function FormattingToolbar({
  currentAttrs,
  onToggle,
  onSetColor,
  onSetHighlight,
  onSetFont,
  onSetSize,
  onSetAlign,
  onSetLink,
  onUndo,
  onRedo,
  onClearFormatting,
  onInsertEmoji,
}: FormattingToolbarProps) {
  const [linkInput, setLinkInput] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  return (
    <div className="border-border bg-card flex flex-wrap items-center gap-0.5 rounded-t-xl border border-b-0 p-1.5">
      {/* Undo / Redo */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onUndo}
        title="Hoàn tác (Ctrl+Z)"
        aria-label="Undo"
      >
        <Undo2 className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRedo}
        title="Làm lại (Ctrl+Y)"
        aria-label="Redo"
      >
        <Redo2 className="size-4" />
      </Button>

      <div className="bg-border mx-1 h-6 w-px" />

      {/* Font family */}
      <Select
        className="h-8 w-36 text-xs"
        value={typeof currentAttrs.font === "string" ? currentAttrs.font : ""}
        onChange={(e) => onSetFont(e.target.value || undefined)}
        title="Font chữ"
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </Select>

      {/* Font size */}
      <Select
        className="h-8 w-16 text-xs"
        value={
          typeof currentAttrs.size === "number"
            ? String(currentAttrs.size)
            : "16"
        }
        onChange={(e) => onSetSize(Number(e.target.value))}
        title="Cỡ chữ"
      >
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>

      <div className="bg-border mx-1 h-6 w-px" />

      {/* Bold */}
      <Button
        type="button"
        variant={isActive(currentAttrs.bold) ? "secondary" : "ghost"}
        size="icon"
        aria-pressed={isActive(currentAttrs.bold)}
        onClick={() => onToggle("bold")}
        title="In đậm (Ctrl+B)"
      >
        <Bold className="size-4" />
      </Button>

      {/* Italic */}
      <Button
        type="button"
        variant={isActive(currentAttrs.italic) ? "secondary" : "ghost"}
        size="icon"
        aria-pressed={isActive(currentAttrs.italic)}
        onClick={() => onToggle("italic")}
        title="In nghiêng (Ctrl+I)"
      >
        <Italic className="size-4" />
      </Button>

      {/* Underline */}
      <Button
        type="button"
        variant={isActive(currentAttrs.underline) ? "secondary" : "ghost"}
        size="icon"
        aria-pressed={isActive(currentAttrs.underline)}
        onClick={() => onToggle("underline")}
        title="Gạch dưới (Ctrl+U)"
      >
        <Underline className="size-4" />
      </Button>

      {/* Strikethrough */}
      <Button
        type="button"
        variant={isActive(currentAttrs.strikethrough) ? "secondary" : "ghost"}
        size="icon"
        aria-pressed={isActive(currentAttrs.strikethrough)}
        onClick={() => onToggle("strikethrough")}
        title="Gạch ngang"
      >
        <Strikethrough className="size-4" />
      </Button>

      <div className="bg-border mx-1 h-6 w-px" />

      {/* Text color */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon" title="Màu chữ">
            <div className="relative">
              <Palette className="size-4" />
              {typeof currentAttrs.color === "string" && (
                <span
                  className="absolute -bottom-0.5 left-0.5 h-1 w-3 rounded-full"
                  style={{ backgroundColor: currentAttrs.color }}
                />
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex w-auto flex-wrap gap-1 p-2">
          {SWATCHES.map((color) => (
            <button
              key={color}
              type="button"
              className="size-6 rounded border shadow-sm transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
              onClick={() => onSetColor(color)}
              aria-label={color}
            />
          ))}
          <button
            type="button"
            className="text-muted-foreground col-span-full mt-1 text-xs underline"
            onClick={() => onSetColor(undefined)}
          >
            Xóa màu
          </button>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Highlight */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon" title="Tô sáng">
            <div className="relative">
              <Highlighter className="size-4" />
              {typeof currentAttrs.highlight === "string" && (
                <span
                  className="absolute -bottom-0.5 left-0.5 h-1 w-3 rounded-full"
                  style={{ backgroundColor: currentAttrs.highlight }}
                />
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex w-auto flex-wrap gap-1 p-2">
          {HIGHLIGHT_SWATCHES.map((color) => (
            <button
              key={color}
              type="button"
              className="size-6 rounded border shadow-sm transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
              onClick={() => onSetHighlight(color)}
              aria-label={color}
            />
          ))}
          <button
            type="button"
            className="text-muted-foreground col-span-full mt-1 text-xs underline"
            onClick={() => onSetHighlight(undefined)}
          >
            Xóa tô sáng
          </button>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="bg-border mx-1 h-6 w-px" />

      {/* Alignment */}
      <Button
        type="button"
        variant={
          currentAttrs.align === "left" || !currentAttrs.align
            ? "secondary"
            : "ghost"
        }
        size="icon"
        onClick={() => onSetAlign("left")}
        title="Căn trái"
      >
        <AlignLeft className="size-4" />
      </Button>
      <Button
        type="button"
        variant={currentAttrs.align === "center" ? "secondary" : "ghost"}
        size="icon"
        onClick={() => onSetAlign("center")}
        title="Căn giữa"
      >
        <AlignCenter className="size-4" />
      </Button>
      <Button
        type="button"
        variant={currentAttrs.align === "right" ? "secondary" : "ghost"}
        size="icon"
        onClick={() => onSetAlign("right")}
        title="Căn phải"
      >
        <AlignRight className="size-4" />
      </Button>

      <div className="bg-border mx-1 h-6 w-px" />

      {/* Link */}
      <DropdownMenu open={linkOpen} onOpenChange={setLinkOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant={
              typeof currentAttrs.link === "string" ? "secondary" : "ghost"
            }
            size="icon"
            title="Chèn liên kết"
          >
            <Link2 className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex w-72 flex-col gap-2 p-2">
          <Input
            placeholder="https://…"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSetLink(linkInput || undefined);
                setLinkInput("");
                setLinkOpen(false);
              }
            }}
            className="h-8 text-xs"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              className="flex-1"
              onClick={() => {
                onSetLink(linkInput || undefined);
                setLinkInput("");
                setLinkOpen(false);
              }}
            >
              Áp dụng
            </Button>
            {typeof currentAttrs.link === "string" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSetLink(undefined);
                  setLinkOpen(false);
                }}
              >
                Xóa
              </Button>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear formatting */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClearFormatting}
        title="Xóa định dạng (chọn text trước)"
      >
        <RemoveFormatting className="size-4" />
      </Button>

      <div className="bg-border mx-1 h-6 w-px" />

      {/* Emoji picker */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Chèn emoji"
          >
            <Smile className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="p-0"
          sideOffset={4}
        >
          <EmojiPicker onSelect={onInsertEmoji} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
