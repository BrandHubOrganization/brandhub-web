import { useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Highlighter,
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

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: '"Times New Roman", serif' },
  { label: "Courier New", value: '"Courier New", monospace' },
  { label: "Verdana", value: "Verdana, sans-serif" },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 32];

const SWATCHES = [
  "#1f2937",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#2563eb",
  "#7c3aed",
  "#db2777",
];

const HIGHLIGHT_SWATCHES = [
  "#fef08a",
  "#bbf7d0",
  "#bfdbfe",
  "#fecaca",
  "#e9d5ff",
  "#fed7aa",
];

export interface FormattingToolbarProps {
  currentAttrs: AttrsOrMixed;
  onToggle: (key: "bold" | "italic" | "underline") => void;
  onSetColor: (color?: string) => void;
  onSetHighlight: (color?: string) => void;
  onSetFont: (font?: string) => void;
  onSetSize: (size?: number) => void;
  onSetAlign: (align: RunAttrs["align"]) => void;
  onSetLink: (url?: string) => void;
}

function isActive(value: unknown): boolean {
  return value === true;
}

/**
 * Google-Docs-style formatting toolbar for CanvasTextEditor (FR 3.6.10
 * Phase 5). Purely presentational — all CRDT-touching logic (yText.format,
 * pendingAttrs) lives in CanvasTextEditor, which owns selection/caret state
 * this needs to compute currentAttrs.
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
}: FormattingToolbarProps) {
  const [linkInput, setLinkInput] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  return (
    <div className="border-border bg-card flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 p-1.5">
      <Button
        type="button"
        variant={isActive(currentAttrs.bold) ? "secondary" : "ghost"}
        size="icon"
        aria-pressed={isActive(currentAttrs.bold)}
        onClick={() => onToggle("bold")}
        title="Bold"
      >
        <Bold className="size-4" />
      </Button>
      <Button
        type="button"
        variant={isActive(currentAttrs.italic) ? "secondary" : "ghost"}
        size="icon"
        aria-pressed={isActive(currentAttrs.italic)}
        onClick={() => onToggle("italic")}
        title="Italic"
      >
        <Italic className="size-4" />
      </Button>
      <Button
        type="button"
        variant={isActive(currentAttrs.underline) ? "secondary" : "ghost"}
        size="icon"
        aria-pressed={isActive(currentAttrs.underline)}
        onClick={() => onToggle("underline")}
        title="Underline"
      >
        <Underline className="size-4" />
      </Button>

      <div className="bg-border mx-1 h-6 w-px" />

      <Select
        className="h-8 w-36 text-xs"
        value={typeof currentAttrs.font === "string" ? currentAttrs.font : ""}
        onChange={(e) => onSetFont(e.target.value || undefined)}
        title="Font family"
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
        title="Font size"
      >
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>

      <div className="bg-border mx-1 h-6 w-px" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon" title="Text color">
            <Palette className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex w-auto flex-wrap gap-1 p-2">
          {SWATCHES.map((color) => (
            <button
              key={color}
              type="button"
              className="size-6 rounded border"
              style={{ backgroundColor: color }}
              onClick={() => onSetColor(color)}
              aria-label={color}
            />
          ))}
          <button
            type="button"
            className="text-muted-foreground col-span-full text-xs underline"
            onClick={() => onSetColor(undefined)}
          >
            Clear
          </button>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon" title="Highlight">
            <Highlighter className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex w-auto flex-wrap gap-1 p-2">
          {HIGHLIGHT_SWATCHES.map((color) => (
            <button
              key={color}
              type="button"
              className="size-6 rounded border"
              style={{ backgroundColor: color }}
              onClick={() => onSetHighlight(color)}
              aria-label={color}
            />
          ))}
          <button
            type="button"
            className="text-muted-foreground col-span-full text-xs underline"
            onClick={() => onSetHighlight(undefined)}
          >
            Clear
          </button>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="bg-border mx-1 h-6 w-px" />

      <Button
        type="button"
        variant={
          currentAttrs.align === "left" || !currentAttrs.align
            ? "secondary"
            : "ghost"
        }
        size="icon"
        onClick={() => onSetAlign("left")}
        title="Align left"
      >
        <AlignLeft className="size-4" />
      </Button>
      <Button
        type="button"
        variant={currentAttrs.align === "center" ? "secondary" : "ghost"}
        size="icon"
        onClick={() => onSetAlign("center")}
        title="Align center"
      >
        <AlignCenter className="size-4" />
      </Button>
      <Button
        type="button"
        variant={currentAttrs.align === "right" ? "secondary" : "ghost"}
        size="icon"
        onClick={() => onSetAlign("right")}
        title="Align right"
      >
        <AlignRight className="size-4" />
      </Button>

      <div className="bg-border mx-1 h-6 w-px" />

      <DropdownMenu open={linkOpen} onOpenChange={setLinkOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant={
              typeof currentAttrs.link === "string" ? "secondary" : "ghost"
            }
            size="icon"
            title="Link"
          >
            <Link2 className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex w-64 gap-2 p-2">
          <Input
            placeholder="https://…"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            className="h-8 text-xs"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onSetLink(linkInput || undefined);
              setLinkInput("");
              setLinkOpen(false);
            }}
          >
            OK
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
