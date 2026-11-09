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
  Minus,
  Plus,
  Wand2,
  CaseUpper,
  CaseLower,
  CaseSensitive,
  Sparkles,
  SeparatorHorizontal,
  FileSpreadsheet,
  Copy,
  Check,
  Type,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AttrsOrMixed, DeltaOp, RunAttrs } from "./richText";
import { EmojiPicker } from "./EmojiPicker";
import {
  copyTextToClipboard,
  CREATIVE_TEMPLATES,
  styleRunText,
  ZANTEXT_STYLE_PRESETS,
  type TextCaseMode,
} from "../contentUtils";

export const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Montserrat (Sans Đậm)", value: "Montserrat, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: '"Times New Roman", serif' },
  { label: "Playfair Display", value: '"Playfair Display", serif' },
  { label: "Courier New", value: '"Courier New", monospace' },
  { label: "Brush Script", value: '"Brush Script MT", cursive' },
  { label: "Pacifico (Script Đậm)", value: "Pacifico, cursive" },
  { label: "Double Struck", value: '"Double Struck", serif' },
  {
    label: "Fraktur Gothic",
    value: '"UnifrakturMaguntia", "Old English Text MT", serif',
  },
  { label: "Small Caps (ᴀʙᴄ)", value: '"Small Caps", sans-serif' },
  { label: "Circled (ⒶⒷⒸ)", value: '"Circled", sans-serif' },
  { label: "Squared (🄰🄱🄲)", value: '"Squared", sans-serif' },
  { label: "Fullwidth (ＡＢＣ)", value: '"Fullwidth", monospace' },
];

export const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

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

export type HeadingPreset = "normal" | "h1" | "h2" | "h3";

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
  onTransformCase?: (mode: TextCaseMode) => void;
  onWrapSelection?: (prefix: string, suffix: string) => void;
  onInsertSnippet?: (text: string) => void;
  onInsertTemplateOps?: (ops: DeltaOp[]) => void;
  onApplyHeadingPreset?: (preset: HeadingPreset) => void;
  selectedPlainText?: string;
  onApplyZantextPreset?: (attrs: RunAttrs, customText?: string) => void;
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
 * Authentic Google-Docs pill toolbar + Microsoft Word Ribbon mode for CanvasTextEditor (FR 3.6.10).
 * Purely presentational — all CRDT-touching logic lives in CanvasTextEditor.
 */
function Divider({ ribbon }: { ribbon: boolean }) {
  return ribbon ? (
    <div className="bg-border mx-1 h-10 w-px self-center" />
  ) : (
    <div className="mx-0.5 h-4 w-px bg-[#c7d0dd] dark:bg-zinc-700" />
  );
}

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
  onTransformCase,
  onWrapSelection,
  onInsertSnippet,
  onInsertTemplateOps,
  onApplyHeadingPreset,
  selectedPlainText,
  onApplyZantextPreset,
}: FormattingToolbarProps) {
  const [linkInput, setLinkInput] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [creativeOpen, setCreativeOpen] = useState(false);
  const [zantextOpen, setZantextOpen] = useState(false);
  const [zantextInput, setZantextInput] = useState("");
  const [copiedPresetId, setCopiedPresetId] = useState<string | null>(null);
  // Docs mode: Google Docs rounded pill bar (default). Ribbon mode: Word-style grouped row.
  const [ribbon, setRibbon] = useState(false);

  const effectiveZantextSource =
    zantextInput.trim() ||
    (selectedPlainText && selectedPlainText.trim()) ||
    "Chiến dịch Ra mắt Mùa Hè 2026";

  const currentNumericSize =
    typeof currentAttrs.size === "number" ? currentAttrs.size : 16;

  const currentHeadingPreset: HeadingPreset =
    currentNumericSize >= 28
      ? "h1"
      : currentNumericSize >= 22
        ? "h2"
        : currentNumericSize >= 18 && isActive(currentAttrs.bold)
          ? "h3"
          : "normal";

  const stepFontSize = (delta: number) => {
    const idx = FONT_SIZES.findIndex((s) => s >= currentNumericSize);
    const curIdx = idx === -1 ? FONT_SIZES.length - 1 : idx;
    const nextIdx = Math.max(0, Math.min(FONT_SIZES.length - 1, curIdx + delta));
    onSetSize(FONT_SIZES[nextIdx]);
  };

  return (
    <div className="border-border bg-[#f9fbfd] px-2.5 pt-2 pb-1.5 dark:bg-zinc-900">
      <div
        className={
          ribbon
            ? "border-border bg-card flex flex-wrap items-stretch gap-x-1 gap-y-1.5 rounded-xl border p-2 shadow-2xs"
            : "flex flex-wrap items-center gap-x-0.5 gap-y-1.5 rounded-2xl bg-[#edf2fa] px-3 py-1.5 dark:bg-zinc-800/90"
        }
      >
        {/* Undo / Redo */}
        <ToolGroup label="Hoàn tác" ribbon={ribbon}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-full"
            onClick={onUndo}
            title="Hoàn tác (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-full"
            onClick={onRedo}
            title="Làm lại (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo2 className="size-3.5" />
          </Button>
        </ToolGroup>

        <Divider ribbon={ribbon} />

        {/* Paragraph / Heading Style + Font family + Size stepper (Google Docs layout) */}
        <ToolGroup label="Phông chữ" ribbon={ribbon}>
          {onApplyHeadingPreset && (
            <Select
              aria-label="Kiểu văn bản"
              title="Kiểu đoạn văn (Heading)"
              className="h-7 w-[118px] rounded-md border-transparent bg-transparent px-1 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10"
              value={currentHeadingPreset}
              onChange={(e) =>
                onApplyHeadingPreset(e.target.value as HeadingPreset)
              }
            >
              <option value="normal">Văn bản thường</option>
              <option value="h1">Tiêu đề 1 (H1)</option>
              <option value="h2">Tiêu đề 2 (H2)</option>
              <option value="h3">Tiêu đề 3 (H3)</option>
            </Select>
          )}

          <Select
            className="h-7 w-28 rounded-md border-transparent bg-transparent px-1 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10"
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

          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-testid="decrease-font-size-btn"
              className="size-6 rounded-full"
              onClick={() => stepFontSize(-1)}
              title="Giảm cỡ chữ"
              aria-label="Decrease font size"
            >
              <Minus className="size-3" />
            </Button>
            <Select
              className="h-7 w-12 rounded-md border-transparent bg-white/80 px-1 text-center text-xs font-semibold tabular-nums dark:bg-zinc-900/70"
              value={String(currentNumericSize)}
              onChange={(e) => onSetSize(Number(e.target.value))}
              title="Cỡ chữ"
            >
              {FONT_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-testid="increase-font-size-btn"
              className="size-6 rounded-full"
              onClick={() => stepFontSize(1)}
              title="Tăng cỡ chữ"
              aria-label="Increase font size"
            >
              <Plus className="size-3" />
            </Button>
          </div>
        </ToolGroup>

        <Divider ribbon={ribbon} />

        {/* Bold / Italic / Underline / Strikethrough */}
        <ToolGroup label="Kiểu chữ" ribbon={ribbon}>
          <Button
            type="button"
            variant={isActive(currentAttrs.bold) ? "secondary" : "ghost"}
            size="icon"
            className={`size-7 rounded-md ${
              isActive(currentAttrs.bold)
                ? "bg-[#d3e3fd] text-[#041e49] dark:bg-blue-500/30 dark:text-blue-200"
                : ""
            }`}
            aria-pressed={isActive(currentAttrs.bold)}
            onClick={() => onToggle("bold")}
            title="In đậm (Ctrl+B)"
          >
            <Bold className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant={isActive(currentAttrs.italic) ? "secondary" : "ghost"}
            size="icon"
            className={`size-7 rounded-md ${
              isActive(currentAttrs.italic)
                ? "bg-[#d3e3fd] text-[#041e49] dark:bg-blue-500/30 dark:text-blue-200"
                : ""
            }`}
            aria-pressed={isActive(currentAttrs.italic)}
            onClick={() => onToggle("italic")}
            title="In nghiêng (Ctrl+I)"
          >
            <Italic className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant={isActive(currentAttrs.underline) ? "secondary" : "ghost"}
            size="icon"
            className={`size-7 rounded-md ${
              isActive(currentAttrs.underline)
                ? "bg-[#d3e3fd] text-[#041e49] dark:bg-blue-500/30 dark:text-blue-200"
                : ""
            }`}
            aria-pressed={isActive(currentAttrs.underline)}
            onClick={() => onToggle("underline")}
            title="Gạch dưới (Ctrl+U)"
          >
            <Underline className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant={
              isActive(currentAttrs.strikethrough) ? "secondary" : "ghost"
            }
            size="icon"
            className={`size-7 rounded-md ${
              isActive(currentAttrs.strikethrough)
                ? "bg-[#d3e3fd] text-[#041e49] dark:bg-blue-500/30 dark:text-blue-200"
                : ""
            }`}
            aria-pressed={isActive(currentAttrs.strikethrough)}
            onClick={() => onToggle("strikethrough")}
            title="Gạch ngang"
          >
            <Strikethrough className="size-3.5" />
          </Button>
        </ToolGroup>

        <Divider ribbon={ribbon} />

        {/* Text color + highlight */}
        <ToolGroup label="Màu sắc" ribbon={ribbon}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 rounded-md"
                title="Màu chữ"
              >
                <div className="relative">
                  <Palette className="size-3.5" />
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 rounded-md"
                title="Tô sáng"
              >
                <div className="relative">
                  <Highlighter className="size-3.5" />
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

        <Divider ribbon={ribbon} />

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
            className="size-7 rounded-md"
            onClick={() => onSetAlign("left")}
            title="Căn trái"
          >
            <AlignLeft className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant={currentAttrs.align === "center" ? "secondary" : "ghost"}
            size="icon"
            className="size-7 rounded-md"
            onClick={() => onSetAlign("center")}
            title="Căn giữa"
          >
            <AlignCenter className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant={currentAttrs.align === "right" ? "secondary" : "ghost"}
            size="icon"
            className="size-7 rounded-md"
            onClick={() => onSetAlign("right")}
            title="Căn phải"
          >
            <AlignRight className="size-3.5" />
          </Button>
        </ToolGroup>

        <Divider ribbon={ribbon} />

        {/* Lists */}
        <ToolGroup label="Danh sách" ribbon={ribbon}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-md"
            onClick={() => onToggleList("bullet")}
            title="Danh sách gạch đầu dòng"
            aria-label="Bulleted list"
          >
            <List className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-md"
            onClick={() => onToggleList("ordered")}
            title="Danh sách đánh số"
            aria-label="Numbered list"
          >
            <ListOrdered className="size-3.5" />
          </Button>
        </ToolGroup>

        <Divider ribbon={ribbon} />

        {/* Link + Emoji + Creative Content Tools */}
        <ToolGroup label="Chèn & Sáng tạo" ribbon={ribbon}>
          <DropdownMenu open={linkOpen} onOpenChange={setLinkOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant={
                  typeof currentAttrs.link === "string" ? "secondary" : "ghost"
                }
                size="icon"
                className="size-7 rounded-md"
                title="Chèn liên kết"
              >
                <Link2 className="size-3.5" />
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
                className="size-7 rounded-md"
                title="Chèn emoji"
              >
                <Smile className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="p-0" sideOffset={4}>
              <EmojiPicker onSelect={onInsertEmoji} />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Creative Content Writing Studio Toolkit */}
          <DropdownMenu open={creativeOpen} onOpenChange={setCreativeOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-testid="creative-tools-trigger"
                className="h-6 gap-1 rounded-full bg-amber-500/15 px-2 text-[11px] font-semibold whitespace-nowrap text-amber-800 hover:bg-amber-500/25 dark:bg-amber-500/20 dark:text-amber-300"
                title="Bộ công cụ sáng tạo nội dung & biến đổi chữ"
              >
                <Wand2 className="size-3" />
                <span className="hidden md:inline">Sáng tạo</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="bottom"
              sideOffset={6}
              collisionPadding={16}
              onCloseAutoFocus={(e) => e.preventDefault()}
              className="border-border bg-card w-80 space-y-2.5 p-3 text-xs shadow-xl"
            >
              {/* 1. Case Transformations */}
              <div>
                <p className="text-muted-foreground mb-1.5 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
                  <CaseSensitive className="size-3" />
                  Chuyển đổi kiểu chữ (Vùng chọn / Toàn bài)
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    data-testid="transform-case-upper"
                    onClick={() => {
                      onTransformCase?.("upper");
                      setCreativeOpen(false);
                    }}
                    className="border-border hover:bg-muted flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors"
                  >
                    <CaseUpper className="size-3.5" />
                    IN HOA
                  </button>
                  <button
                    type="button"
                    data-testid="transform-case-lower"
                    onClick={() => {
                      onTransformCase?.("lower");
                      setCreativeOpen(false);
                    }}
                    className="border-border hover:bg-muted flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors"
                  >
                    <CaseLower className="size-3.5" />
                    chữ thường
                  </button>
                  <button
                    type="button"
                    data-testid="transform-case-title"
                    onClick={() => {
                      onTransformCase?.("title");
                      setCreativeOpen(false);
                    }}
                    className="border-border hover:bg-muted flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors"
                  >
                    <CaseSensitive className="size-3.5" />
                    Hoa Đầu Từ
                  </button>
                </div>
              </div>

              {/* 2. Highlight Callout Wrappers */}
              <div>
                <p className="text-muted-foreground mb-1.5 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
                  <Sparkles className="size-3" />
                  Đóng khung nhấn mạnh (Hook / Callout)
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    data-testid="wrap-callout-brackets"
                    onClick={() => {
                      onWrapSelection?.("【", "】");
                      setCreativeOpen(false);
                    }}
                    className="border-border hover:bg-muted rounded-lg border px-2 py-1 text-left text-[11px] font-medium transition-colors"
                  >
                    【 Khung tiêu đề 】
                  </button>
                  <button
                    type="button"
                    data-testid="wrap-callout-sparkles"
                    onClick={() => {
                      onWrapSelection?.("✨ ", " ✨");
                      setCreativeOpen(false);
                    }}
                    className="border-border hover:bg-muted rounded-lg border px-2 py-1 text-left text-[11px] font-medium transition-colors"
                  >
                    ✨ Điểm nhấn ✨
                  </button>
                  <button
                    type="button"
                    data-testid="wrap-callout-fire"
                    onClick={() => {
                      onWrapSelection?.("🔥 ", " 🔥");
                      setCreativeOpen(false);
                    }}
                    className="border-border hover:bg-muted rounded-lg border px-2 py-1 text-left text-[11px] font-medium transition-colors"
                  >
                    🔥 Hot Deal 🔥
                  </button>
                  <button
                    type="button"
                    data-testid="wrap-callout-quote"
                    onClick={() => {
                      onWrapSelection?.("❝ ", " ❞");
                      setCreativeOpen(false);
                    }}
                    className="border-border hover:bg-muted rounded-lg border px-2 py-1 text-left text-[11px] font-medium transition-colors"
                  >
                    ❝ Trích dẫn ❞
                  </button>
                </div>
              </div>

              {/* 3. Aesthetic Dividers */}
              <div>
                <p className="text-muted-foreground mb-1.5 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
                  <SeparatorHorizontal className="size-3" />
                  Chèn dòng phân cách nghệ thuật
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    data-testid="insert-divider-solid"
                    onClick={() => {
                      onInsertSnippet?.("\n━━━━━━━━━━━━━━\n");
                      setCreativeOpen(false);
                    }}
                    className="border-border hover:bg-muted rounded-lg border px-2 py-1 text-center font-mono text-[11px] transition-colors"
                  >
                    ━━━━━━━━━━
                  </button>
                  <button
                    type="button"
                    data-testid="insert-divider-stars"
                    onClick={() => {
                      onInsertSnippet?.("\n✦ • ✦ • ✦ • ✦\n");
                      setCreativeOpen(false);
                    }}
                    className="border-border hover:bg-muted rounded-lg border px-2 py-1 text-center text-[11px] transition-colors"
                  >
                    ✦ • ✦ • ✦ • ✦
                  </button>
                </div>
              </div>

              {/* 4. Copywriting Frameworks */}
              <div>
                <p className="text-muted-foreground mb-1.5 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
                  <FileSpreadsheet className="size-3" />
                  Chèn khung mẫu Copywriting
                </p>
                <div className="space-y-1">
                  {CREATIVE_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      data-testid={`insert-template-${tpl.id}`}
                      onClick={() => {
                        onInsertTemplateOps?.(tpl.ops);
                        setCreativeOpen(false);
                      }}
                      className="border-border hover:bg-muted flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-[11px] font-semibold">
                          {tpl.label}
                        </p>
                        <p className="text-muted-foreground truncate text-[10px]">
                          {tpl.description}
                        </p>
                      </div>
                      <span className="bg-brand-orange/15 text-brand-orange shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold">
                        {tpl.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Zantext / YayText Built-in Social Font Converter & 1-Click Copy */}
          <DropdownMenu
            open={zantextOpen}
            onOpenChange={(open) => {
              setZantextOpen(open);
              if (open && selectedPlainText?.trim()) {
                setZantextInput(selectedPlainText);
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-testid="zantext-panel-trigger"
                className="border-brand-orange/30 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20 h-6 gap-1 rounded-full border px-2 text-[11px] font-semibold whitespace-nowrap"
                title="Bảng chuyển đổi & Copy Font chữ nhanh kiểu Zantext / YayText (dán trực tiếp lên Facebook)"
              >
                <Type className="size-3" />
                <span className="hidden md:inline">Font Zantext</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="bottom"
              sideOffset={6}
              collisionPadding={16}
              onCloseAutoFocus={(e) => e.preventDefault()}
              className="border-border bg-card w-96 space-y-2.5 p-3 text-xs shadow-xl"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                    <Type className="text-brand-orange size-3.5" />
                    Bộ Chuyển & Copy Font Nhanh (Kiểu Zantext)
                  </p>
                  <span className="bg-brand-orange/15 text-brand-orange rounded-full px-2 py-0.5 text-[10px] font-bold">
                    14 Font MXH
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-snug">
                  Tự động đổi chữ sang Unicode chuẩn Facebook / Instagram / TikTok / Threads. Bấm <strong>Copy</strong> để dán thẳng lên bài đăng hoặc <strong>Áp dụng</strong> vào trình soạn thảo.
                </p>
              </div>

              <div>
                <Input
                  data-testid="zantext-preview-input"
                  value={zantextInput}
                  onChange={(e) => setZantextInput(e.target.value)}
                  placeholder={
                    selectedPlainText?.trim()
                      ? `Đang chọn: "${selectedPlainText.slice(0, 36)}"`
                      : "Nhập hoặc bôi đen chữ cần đổi font (VD: Khuyến mãi Mùa Hè 2026)…"
                  }
                  className="h-8 text-xs"
                />
              </div>

              <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
                {ZANTEXT_STYLE_PRESETS.map((preset) => {
                  const converted = styleRunText(
                    effectiveZantextSource,
                    preset.attrs,
                  );
                  const isCopied = copiedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      data-testid={`zantext-row-${preset.id}`}
                      className="border-border bg-muted/20 hover:bg-muted/50 flex items-center justify-between gap-2 rounded-xl border p-2 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground text-[10px] font-semibold">
                            {preset.label}
                          </span>
                          <span className="bg-muted text-foreground rounded px-1 py-0.2 text-[9px] font-bold">
                            {preset.badge}
                          </span>
                        </div>
                        <p
                          data-testid={`zantext-preview-${preset.id}`}
                          className="text-foreground mt-0.5 truncate text-xs font-medium"
                          style={{
                            fontFamily:
                              'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Segoe UI Symbol", "Noto Sans Math", "Apple Symbols", sans-serif',
                          }}
                        >
                          {converted}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          data-testid={`zantext-copy-${preset.id}`}
                          onClick={async () => {
                            await copyTextToClipboard(converted);
                            setCopiedPresetId(preset.id);
                            toast.success(
                              `Đã copy font "${preset.label}"! Dán (Ctrl+V) trực tiếp lên Facebook.`,
                              { id: "brandhub-editor-toast" },
                            );
                            setTimeout(() => setCopiedPresetId(null), 1500);
                          }}
                          className="border-border bg-card hover:bg-muted flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition-colors"
                          title="Copy kiểu chữ này để dán trực tiếp lên Facebook"
                        >
                          {isCopied ? (
                            <Check className="size-3 text-emerald-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                          <span>{isCopied ? "Đã copy" : "Copy"}</span>
                        </button>
                        {onApplyZantextPreset && (
                          <button
                            type="button"
                            data-testid={`zantext-apply-${preset.id}`}
                            onClick={() => {
                              onApplyZantextPreset(
                                preset.attrs,
                                zantextInput.trim() || undefined,
                              );
                              setZantextOpen(false);
                            }}
                            className="bg-brand-orange hover:bg-brand-orange/90 rounded-lg px-2 py-1 text-[10px] font-semibold text-white transition-colors"
                            title="Áp dụng kiểu font này vào vùng văn bản trong trình soạn thảo"
                          >
                            Áp dụng
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </ToolGroup>

        <Divider ribbon={ribbon} />

        {/* Clear formatting */}
        <ToolGroup label="Xóa định dạng" ribbon={ribbon}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 rounded-md"
            onClick={onClearFormatting}
            title="Xóa định dạng (chọn text trước)"
          >
            <RemoveFormatting className="size-3.5" />
          </Button>
        </ToolGroup>

        {/* Right-aligned Mode Switch: Google Docs pill bar vs. Word Ribbon */}
        <div className="ml-auto flex items-center gap-0.5 pl-1">
          <Button
            type="button"
            variant={!ribbon ? "secondary" : "ghost"}
            size="sm"
            className="h-6 gap-1 rounded-full px-2 text-[11px]"
            onClick={() => setRibbon(false)}
            title="Chế độ thanh công cụ (Google Docs)"
          >
            <Rows3 className="size-3" />
            Docs
          </Button>
          <Button
            type="button"
            variant={ribbon ? "secondary" : "ghost"}
            size="sm"
            className="h-6 gap-1 rounded-full px-2 text-[11px]"
            onClick={() => setRibbon(true)}
            title="Chế độ dải lệnh (Microsoft Word)"
          >
            <LayoutGrid className="size-3" />
            Ribbon
          </Button>
        </div>
      </div>
    </div>
  );
}
