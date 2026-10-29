import { useState, type ReactNode } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Palette,
  Highlighter,
  Undo2,
  Redo2,
  RemoveFormatting,
  Smile,
  LayoutGrid,
  Rows3,
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
  onToggleList: (kind: "bullet" | "ordered") => void;
  onSetLink: (url?: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearFormatting: () => void;
  onInsertEmoji: (emoji: string) => void;
}

/** A labeled group wrapper — Word ribbon groups controls under a caption; Docs mode ignores the label. */
function ToolGroup({
  label,
  ribbon,
  children,
}: {
  label: string;
  ribbon: boolean;
  children: ReactNode;
}) {
  if (!ribbon) {
    return <div className="flex items-center gap-0.5">{children}</div>;
  }
  return (
    <div className="flex flex-col items-center gap-1 px-2">
      <div className="flex items-center gap-0.5">{children}</div>
      <span className="text-muted-foreground text-[10px] leading-none">
        {label}
      </span>
    </div>
  );
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
  onToggleList,
  onSetLink,
  onUndo,
  onRedo,
  onClearFormatting,
  onInsertEmoji,
}: FormattingToolbarProps) {
  const [linkInput, setLinkInput] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  // Docs mode: one compact icon row (default). Ribbon mode: Word-style
  // grouped row with captions underneath each group.
  const [ribbon, setRibbon] = useState(false);

  const Divider = () =>
    ribbon ? (
      <div className="bg-border mx-1 h-10 w-px self-center" />
    ) : (
      <div className="bg-border mx-1 h-6 w-px" />
    );

  return (
    <div className="bg-muted/40 border-border rounded-t-xl border border-b-0">
      {/* Mode switch — Google Docs icon bar vs. Word ribbon */}
      <div className="border-border flex items-center justify-end gap-1 border-b px-2 py-1">
        <Button
          type="button"
          variant={!ribbon ? "secondary" : "ghost"}
          size="sm"
          className="h-6 gap-1 px-2 text-[11px]"
          onClick={() => setRibbon(false)}
          title="Chế độ thanh công cụ (Google Docs)"
        >
          <Rows3 className="size-3.5" />
          Docs
        </Button>
        <Button
          type="button"
          variant={ribbon ? "secondary" : "ghost"}
          size="sm"
          className="h-6 gap-1 px-2 text-[11px]"
          onClick={() => setRibbon(true)}
          title="Chế độ dải lệnh (Microsoft Word)"
        >
          <LayoutGrid className="size-3.5" />
          Ribbon
        </Button>
      </div>

      <div
        className={`bg-card flex flex-wrap items-center gap-0.5 p-1.5 ${ribbon ? "items-stretch" : ""}`}
      >
        {/* Undo / Redo */}
        <ToolGroup label="Hoàn tác" ribbon={ribbon}>
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
        </ToolGroup>

        <Divider />

        {/* Font family + size */}
        <ToolGroup label="Phông chữ" ribbon={ribbon}>
          <Select
            className="h-8 w-36 text-xs"
            value={
              typeof currentAttrs.font === "string" ? currentAttrs.font : ""
            }
            onChange={(e) => onSetFont(e.target.value || undefined)}
            title="Font chữ"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
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
        </ToolGroup>

        <Divider />

        {/* Bold / Italic / Underline / Strikethrough */}
        <ToolGroup label="Kiểu chữ" ribbon={ribbon}>
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
          <Button
            type="button"
            variant={
              isActive(currentAttrs.strikethrough) ? "secondary" : "ghost"
            }
            size="icon"
            aria-pressed={isActive(currentAttrs.strikethrough)}
            onClick={() => onToggle("strikethrough")}
            title="Gạch ngang"
          >
            <Strikethrough className="size-4" />
          </Button>
        </ToolGroup>

        <Divider />

        {/* Text color + highlight */}
        <ToolGroup label="Màu sắc" ribbon={ribbon}>
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
        </ToolGroup>

        <Divider />

        {/* Alignment */}
        <ToolGroup label="Căn lề" ribbon={ribbon}>
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
        </ToolGroup>

        <Divider />

        {/* Lists */}
        <ToolGroup label="Danh sách" ribbon={ribbon}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onToggleList("bullet")}
            title="Danh sách gạch đầu dòng"
            aria-label="Bulleted list"
          >
            <List className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onToggleList("ordered")}
            title="Danh sách đánh số"
            aria-label="Numbered list"
          >
            <ListOrdered className="size-4" />
          </Button>
        </ToolGroup>

        <Divider />

        {/* Link */}
        <ToolGroup label="Chèn" ribbon={ribbon}>
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
            <DropdownMenuContent align="end" className="p-0" sideOffset={4}>
              <EmojiPicker onSelect={onInsertEmoji} />
            </DropdownMenuContent>
          </DropdownMenu>
        </ToolGroup>

        <Divider />

        {/* Clear formatting */}
        <ToolGroup label="Xóa định dạng" ribbon={ribbon}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClearFormatting}
            title="Xóa định dạng (chọn text trước)"
          >
            <RemoveFormatting className="size-4" />
          </Button>
        </ToolGroup>
      </div>
    </div>
  );
}
