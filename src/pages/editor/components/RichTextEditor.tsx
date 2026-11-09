import React, { useEffect, useRef } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Link,
  Video,
  Loader2,
  FileUp,
  Copy,
  Check,
  Wand2,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SocialPlatform } from "@/types/editor";
import { toast } from "sonner";
import { taskService } from "@/services/taskService";
import {
  ZANTEXT_CATEGORIES,
  ZANTEXT_STYLE_PRESETS,
  type ZantextCategory,
  convertPlainTextToSocialStyle,
  copyTextToClipboard,
  stripUnicodeStyling,
  styleRunText,
  toPublishText,
} from "@/pages/content-writing/contentUtils";
import { FONT_FAMILIES } from "@/pages/content-writing/components/FormattingToolbar";
import { ImportDocumentModal } from "@/pages/content-writing/components/ImportDocumentModal";
import type {
  DeltaOp,
  RunAttrs,
} from "@/pages/content-writing/components/richText";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  targetPlatforms?: SocialPlatform[];
  readOnly?: boolean;
  workspaceId?: string;
  taskId?: string;
}

const PLATFORM_LIMITS: Record<SocialPlatform, { max: number; label: string }> =
  {
    FACEBOOK: { max: 63206, label: "Facebook" },
    INSTAGRAM: { max: 2200, label: "Instagram" },
    TIKTOK: { max: 2200, label: "TikTok" },
    THREADS: { max: 500, label: "Threads" },
  };

/**
 * Converts plain multi-line strings (`\n`) into `<p>...</p>` paragraphs for TipTap
 * while passing through strings that already contain block HTML tags.
 */
function plainTextOrHtmlToTiptapContent(raw: string): string {
  if (!raw) return "";
  if (/^\s*<(p|ul|ol|h[1-6]|div|blockquote)\b/i.test(raw)) {
    return raw;
  }
  if (!raw.includes("\n")) {
    return raw;
  }
  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return raw
    .split("\n")
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

/**
 * Extracts a DeltaOp[] from TipTap's JSON document (or selection slice) so bold,
 * italic, underline, strikethrough, and list marks are converted to Unicode styled
 * characters via `toPublishText`.
 * When no formatting marks are present, returns the exact plain text unchanged.
 */
function tiptapDocToPublishText(
  doc: JSONContent,
  plainFallback: string,
  activeFontFamily: string,
): string {
  const ops: DeltaOp[] = [];
  let hasRichMarks = Boolean(activeFontFamily);

  const walkInline = (nodes: JSONContent[] | undefined) => {
    if (!nodes) return;
    for (const node of nodes) {
      if (node.type === "text" && typeof node.text === "string") {
        const attrs: RunAttrs = {};
        if (activeFontFamily) attrs.font = activeFontFamily;
        for (const mark of node.marks ?? []) {
          if (mark.type === "bold") {
            attrs.bold = true;
            hasRichMarks = true;
          } else if (mark.type === "italic") {
            attrs.italic = true;
            hasRichMarks = true;
          } else if (mark.type === "strike") {
            attrs.strikethrough = true;
            hasRichMarks = true;
          } else if (mark.type === "underline") {
            attrs.underline = true;
            hasRichMarks = true;
          }
        }
        ops.push({ insert: node.text, attributes: attrs });
      } else if (node.type === "hardBreak") {
        ops.push({ insert: "\n" });
      }
    }
  };

  const blocks = doc.content ?? [];
  blocks.forEach((block, blockIdx) => {
    if (block.type === "text" || block.type === "hardBreak") {
      walkInline([block]);
      return;
    }
    if (blockIdx > 0) {
      ops.push({ insert: "\n" });
    }
    if (block.type === "bulletList") {
      hasRichMarks = true;
      (block.content ?? []).forEach((item, idx) => {
        if (idx > 0) ops.push({ insert: "\n" });
        ops.push({ insert: "• " });
        (item.content ?? []).forEach((p) => walkInline(p.content));
      });
    } else if (block.type === "orderedList") {
      hasRichMarks = true;
      (block.content ?? []).forEach((item, idx) => {
        if (idx > 0) ops.push({ insert: "\n" });
        ops.push({ insert: `${idx + 1}. ` });
        (item.content ?? []).forEach((p) => walkInline(p.content));
      });
    } else if (block.type === "listItem") {
      hasRichMarks = true;
      ops.push({ insert: "• " });
      (block.content ?? []).forEach((p) => walkInline(p.content));
    } else {
      walkInline(block.content);
    }
  });

  if (!hasRichMarks) {
    return plainFallback;
  }
  return toPublishText(ops);
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  targetPlatforms = ["FACEBOOK", "INSTAGRAM", "TIKTOK"],
  readOnly = false,
  workspaceId,
  taskId,
}) => {
  const { t } = useTranslation();
  const [isGeneratingMeet, setIsGeneratingMeet] = React.useState(false);
  const [selectedFont, setSelectedFont] = React.useState("");
  const [importOpen, setImportOpen] = React.useState(false);
  const [copiedStudio, setCopiedStudio] = React.useState(false);
  const [zantextOpen, setZantextOpen] = React.useState(false);
  const [copiedZantextId, setCopiedZantextId] = React.useState<string | null>(
    null,
  );
  const [activeCategory, setActiveCategory] = React.useState<
    "all" | "favorites" | ZantextCategory
  >("all");
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem("brandhub-zantext-favorites");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage error
    }
    return ["sans-bold", "serif-bold", "black-bubble", "slashthrough"];
  });

  const toggleFavoriteStyle = (styleId: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(styleId)
        ? prev.filter((id) => id !== styleId)
        : [...prev, styleId];
      try {
        window.localStorage.setItem(
          "brandhub-zantext-favorites",
          JSON.stringify(next),
        );
      } catch {
        // ignore storage error
      }
      return next;
    });
  };
  const selectedFontRef = useRef<string>("");
  const lastEmittedValueRef = useRef<string>(value);

  const handleInsertGoogleMeet = async () => {
    if (!workspaceId || !taskId) {
      toast.info(
        t(
          "editor.richText.meetRequiresTask",
          "Vui lòng lưu hoặc mở bài viết từ một Task để tự động tạo link Google Meet.",
        ),
      );
      return;
    }

    setIsGeneratingMeet(true);
    try {
      const result = await taskService.generateLivestreamMeetingLink(
        workspaceId,
        taskId,
        { forceNew: false },
      );
      const meetingUrl = result.data?.meetingUrl;
      if (meetingUrl) {
        const textToInsert = editor?.isEmpty
          ? `Link Meet: ${meetingUrl}\n`
          : `\nLink Meet: ${meetingUrl}\n`;
        editor?.chain().focus().insertContent(textToInsert).run();
        toast.success(
          t(
            "editor.richText.meetInserted",
            "Đã tạo và chèn link Google Meet vào bài viết!",
          ),
        );
      }
    } catch {
      toast.error(
        t(
          "editor.richText.meetError",
          "Không thể tạo link Google Meet. Vui lòng thử lại sau.",
        ),
      );
    } finally {
      setIsGeneratingMeet(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: t("editor.richText.contentPlaceholder"),
      }),
    ],
    content: plainTextOrHtmlToTiptapContent(value),
    editable: !readOnly,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-label": t("editor.page.captionLabel"),
        "aria-multiline": "true",
      },
      handleKeyDown: (_view, event) => {
        const ctrl = event.ctrlKey || event.metaKey;
        if (ctrl && !event.shiftKey && event.key.toLowerCase() === "c") {
          const styled = lastEmittedValueRef.current;
          if (styled) {
            void copyTextToClipboard(styled);
          }
        }
        return false;
      },
      handleDOMEvents: {
        copy: (_view, event) => {
          const styled = lastEmittedValueRef.current;
          if (styled && event.clipboardData) {
            event.clipboardData.setData("text/plain", styled);
            void copyTextToClipboard(styled);
            event.preventDefault();
            return true;
          }
          return false;
        },
      },
    },
    onUpdate: ({ editor }) => {
      const plain = editor.getText();
      const currentFont = selectedFontRef.current;
      let hasFormatting = Boolean(currentFont);
      if (!hasFormatting) {
        editor.state.doc.descendants((node) => {
          if (
            node.marks.length > 0 ||
            node.type.name === "bulletList" ||
            node.type.name === "orderedList"
          ) {
            hasFormatting = true;
            return false;
          }
          return true;
        });
      }
      const converted = hasFormatting
        ? tiptapDocToPublishText(editor.getJSON(), plain, currentFont)
        : plain;
      lastEmittedValueRef.current = converted;
      onChange(converted);
    },
  });

  // Apply font conversion when the user picks a font from the studio toolbar
  const handleSelectFont = (fontValue: string) => {
    setSelectedFont(fontValue);
    if (!editor || editor.isDestroyed) return;
    const { from, to, empty } = editor.state.selection;
    if (!empty) {
      // Only convert the selected range so other words in the post keep their own fonts
      selectedFontRef.current = "";
      const selectedSlice = editor.state.doc.textBetween(from, to, "\n");
      const baseSlice = stripUnicodeStyling(selectedSlice);
      const convertedSlice = fontValue
        ? styleRunText(baseSlice, {
            font: fontValue,
            bold: editor.isActive("bold") ? true : undefined,
            italic: editor.isActive("italic") ? true : undefined,
            underline: editor.isActive("underline") ? true : undefined,
            strikethrough: editor.isActive("strike") ? true : undefined,
          })
        : baseSlice;
      editor
        .chain()
        .focus()
        .unsetBold()
        .unsetItalic()
        .unsetUnderline()
        .unsetStrike()
        .insertContentAt({ from, to }, convertedSlice)
        .run();
      return;
    }
    selectedFontRef.current = fontValue;
    const plain = stripUnicodeStyling(editor.getText());
    if (plain.trim()) {
      const converted = tiptapDocToPublishText(
        editor.getJSON(),
        plain,
        fontValue,
      );
      lastEmittedValueRef.current = converted;
      onChange(converted);
    }
  };

  // Sync external value updates (e.g. from AI auto-populate or template)
  useEffect(() => {
    if (!editor || editor.isDestroyed || !editor.isInitialized) return;
    if (value !== lastEmittedValueRef.current && value !== editor.getText()) {
      lastEmittedValueRef.current = value;
      editor.commands.setContent(plainTextOrHtmlToTiptapContent(value), {
        emitUpdate: false,
      });
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!readOnly);
      editor.view.dom.setAttribute("aria-readonly", String(readOnly));
    }
  }, [editor, readOnly]);

  if (!editor) return null;

  const textLength = value.length;

  return (
    <div className="border-border bg-card flex min-h-[320px] flex-col overflow-hidden rounded-xl border shadow-xs">
      {/* Formatting Toolbar */}
      <div
        inert={readOnly}
        className="border-border bg-muted/80 flex flex-wrap items-center justify-between gap-2 border-b p-2.5"
      >
        <div className="flex flex-wrap items-center gap-1">
          <select
            aria-label="Font chữ bài đăng"
            title="Font chữ bài đăng (tự động chuyển Unicode khi xuất bản)"
            value={selectedFont}
            onChange={(e) => handleSelectFont(e.target.value)}
            className="border-border bg-card text-foreground h-7 rounded-lg border px-2 text-xs font-medium focus:outline-hidden"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          <div className="bg-border mx-1 h-4 w-px" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rounded-lg p-1.5 text-xs transition-colors ${
              editor.isActive("bold")
                ? "text-foreground bg-muted font-bold"
                : "text-muted-foreground hover:bg-muted"
            }`}
            title={t("editor.richText.boldTooltip")}
          >
            <Bold className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rounded-lg p-1.5 text-xs transition-colors ${
              editor.isActive("italic")
                ? "text-foreground bg-muted italic"
                : "text-muted-foreground hover:bg-muted"
            }`}
            title={t("editor.richText.italicTooltip")}
          >
            <Italic className="size-4" />
          </button>

          <button
            type="button"
            data-testid="studio-underline-btn"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`rounded-lg p-1.5 text-xs transition-colors ${
              editor.isActive("underline")
                ? "text-foreground bg-muted"
                : "text-muted-foreground hover:bg-muted"
            }`}
            title="Gạch dưới (Ctrl+U)"
          >
            <UnderlineIcon className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`rounded-lg p-1.5 text-xs transition-colors ${
              editor.isActive("strike")
                ? "text-foreground bg-muted"
                : "text-muted-foreground hover:bg-muted"
            }`}
            title="Gạch ngang"
          >
            <Strikethrough className="size-4" />
          </button>

          <div className="bg-border mx-1 h-4 w-px" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`rounded-lg p-1.5 text-xs transition-colors ${
              editor.isActive("bulletList")
                ? "text-foreground bg-muted"
                : "text-muted-foreground hover:bg-muted"
            }`}
            title={t("editor.richText.bulletListTooltip")}
          >
            <List className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`rounded-lg p-1.5 text-xs transition-colors ${
              editor.isActive("orderedList")
                ? "text-foreground bg-muted"
                : "text-muted-foreground hover:bg-muted"
            }`}
            title={t("editor.richText.orderedListTooltip")}
          >
            <ListOrdered className="size-4" />
          </button>

          <div className="bg-border mx-1 h-4 w-px" />

          <button
            type="button"
            onClick={() => {
              const url = window.prompt(t("editor.richText.linkUrlPrompt"));
              if (url) {
                editor.chain().focus().setMark("link", { href: url }).run();
              }
            }}
            className="text-muted-foreground hover:bg-muted rounded-lg p-1.5 transition-colors"
            title={t("editor.richText.linkTooltip")}
          >
            <Link className="size-4" />
          </button>

          <button
            type="button"
            onClick={handleInsertGoogleMeet}
            disabled={readOnly || isGeneratingMeet}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors disabled:opacity-50"
            title={t("editor.richText.meetTooltip", "Chèn Google Meet")}
            aria-label={t("editor.richText.meetTooltip", "Chèn Google Meet")}
          >
            {isGeneratingMeet ? (
              <Loader2 className="text-brand-orange size-4 animate-spin" />
            ) : (
              <Video className="size-4" />
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Zantext & YayText 36-Style Quick Converter & 1-Click Copy Popover */}
          <div className="relative">
            <button
              type="button"
              data-testid="studio-zantext-btn"
              disabled={readOnly}
              onClick={() => setZantextOpen((o) => !o)}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-purple-700 transition-colors hover:bg-purple-500/20 disabled:opacity-50 dark:border-purple-400/30 dark:bg-purple-500/20 dark:text-purple-300"
              title="Bộ đổi Font Zantext & YayText (36 kiểu chữ Unicode cho Facebook / Instagram / TikTok / Threads)"
            >
              <Wand2 className="size-3.5" />
              <span>Font Zantext</span>
              <span className="py-0.2 rounded bg-purple-600 px-1 text-[9px] font-bold text-white">
                36
              </span>
            </button>

            {zantextOpen && (
              <div
                data-testid="studio-zantext-popover"
                className="border-border bg-popover text-popover-foreground absolute top-full right-0 z-50 mt-1 w-96 rounded-xl border p-3 shadow-xl"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold">
                      Bộ chuyển đổi 36 Font MXH (Zantext & YayText)
                    </p>
                    <p className="text-muted-foreground text-[10px]">
                      Chọn kiểu font để áp dụng hoặc Copy dán thẳng lên Facebook
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setZantextOpen(false)}
                    className="text-muted-foreground hover:text-foreground text-xs font-semibold"
                  >
                    Đóng
                  </button>
                </div>

                {/* Category Filter Tabs */}
                <div className="mb-2 flex flex-wrap gap-1">
                  {ZANTEXT_CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        data-testid={`studio-zantext-cat-${cat.id}`}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                          isActive
                            ? "bg-purple-600 text-white"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                  {ZANTEXT_STYLE_PRESETS.filter((preset) => {
                    if (activeCategory === "all") return true;
                    if (activeCategory === "favorites") {
                      return favoriteIds.includes(preset.id);
                    }
                    return preset.category === activeCategory;
                  }).map((preset) => {
                    const sourceText =
                      stripUnicodeStyling(value).trim() ||
                      "BrandHub Social Font";
                    const converted = convertPlainTextToSocialStyle(
                      sourceText,
                      preset.id,
                    );
                    const isCopied = copiedZantextId === preset.id;
                    const isFav = favoriteIds.includes(preset.id);
                    return (
                      <div
                        key={preset.id}
                        className="border-border bg-muted/30 hover:bg-muted/60 flex items-center justify-between gap-2 rounded-lg border p-2 transition-colors"
                      >
                        <button
                          type="button"
                          data-testid={`studio-zantext-fav-${preset.id}`}
                          onClick={() => toggleFavoriteStyle(preset.id)}
                          title={
                            isFav ? "Bỏ ghim yêu thích" : "Ghim vào Yêu thích"
                          }
                          className={`shrink-0 rounded p-0.5 transition-colors ${
                            isFav
                              ? "text-amber-500"
                              : "text-muted-foreground/40 hover:text-amber-400"
                          }`}
                        >
                          <Star
                            className="size-3.5"
                            fill={isFav ? "currentColor" : "none"}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            lastEmittedValueRef.current = converted;
                            editor.commands.setContent(
                              plainTextOrHtmlToTiptapContent(converted),
                              { emitUpdate: false },
                            );
                            onChange(converted);
                            setZantextOpen(false);
                          }}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground text-[10px] font-medium">
                              {preset.label}
                            </span>
                            <span className="bg-muted text-foreground py-0.2 rounded px-1 text-[9px] font-bold">
                              {preset.badge}
                            </span>
                            {preset.vietnameseMode === "strip-accents-auto" && (
                              <span className="py-0.2 rounded bg-amber-500/15 px-1 text-[8px] font-semibold text-amber-700 dark:text-amber-300">
                                Tự lược dấu
                              </span>
                            )}
                          </div>
                          <p
                            className="text-foreground truncate text-xs font-medium"
                            style={{
                              fontFamily:
                                'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", "Noto Sans Math", "Apple Symbols", sans-serif',
                            }}
                          >
                            {converted}
                          </p>
                        </button>
                        <button
                          type="button"
                          data-testid={`studio-zantext-copy-${preset.id}`}
                          onClick={async () => {
                            await copyTextToClipboard(converted);
                            setCopiedZantextId(preset.id);
                            toast.success(
                              `Đã copy kiểu "${preset.label}"! Dán trực tiếp lên Facebook / MXH.`,
                              { id: "brandhub-editor-toast" },
                            );
                            setTimeout(() => setCopiedZantextId(null), 1600);
                          }}
                          className="bg-brand-orange/15 text-brand-orange hover:bg-brand-orange flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-colors hover:text-white"
                        >
                          {isCopied ? (
                            <Check className="size-3" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                          <span>{isCopied ? "Đã copy" : "Copy"}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            data-testid="studio-copy-publish-btn"
            disabled={!value.trim()}
            onClick={async () => {
              const ok = await copyTextToClipboard(value);
              if (ok) {
                setCopiedStudio(true);
                toast.success(
                  "Đã copy bài viết chuẩn Font Unicode! Dán (Ctrl+V) trực tiếp lên Facebook / MXH.",
                  { id: "brandhub-editor-toast" },
                );
                setTimeout(() => setCopiedStudio(false), 1800);
              }
            }}
            className="border-brand-orange/30 bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20 flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors disabled:opacity-50"
            title="Copy toàn bộ văn bản đã chuyển Font Unicode (kiểu Zantext) để dán trực tiếp lên Facebook"
          >
            {copiedStudio ? (
              <Check className="size-3.5 text-emerald-600" />
            ) : (
              <Copy className="size-3.5" />
            )}
            <span>{copiedStudio ? "Đã copy Font!" : "Copy dán Facebook"}</span>
          </button>

          <button
            type="button"
            data-testid="studio-import-doc-btn"
            disabled={readOnly}
            onClick={() => setImportOpen(true)}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-blue-600/30 bg-blue-600/10 px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-blue-700 transition-colors hover:bg-blue-600/20 disabled:opacity-50 dark:border-blue-400/30 dark:bg-blue-500/20 dark:text-blue-300"
            title="Nhập nội dung từ Google Docs hoặc file .docx, .txt, .md"
          >
            <FileUp className="size-3.5" />
            <span>Nhập Google Docs / File</span>
          </button>
        </div>
      </div>

      <ImportDocumentModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={(ops, mode) => {
          const importedText = toPublishText(
            ops.map((op) => ({
              insert: op.insert,
              attributes: {
                ...op.attributes,
                ...(selectedFontRef.current
                  ? { font: selectedFontRef.current }
                  : {}),
              },
            })),
          );
          const nextValue =
            mode === "append" && value.trim()
              ? `${value}\n\n${importedText}`
              : importedText;
          lastEmittedValueRef.current = nextValue;
          editor.commands.setContent(
            nextValue
              .split("\n")
              .map((line) => `<p>${line || ""}</p>`)
              .join(""),
            { emitUpdate: false },
          );
          onChange(nextValue);
          toast.success(
            "Đã tự động điền nội dung tài liệu vào trình soạn thảo!",
          );
        }}
      />

      {/* Editor Main Content Area */}
      <div
        className="text-foreground min-h-[220px] flex-1 p-4 text-sm leading-relaxed outline-none"
        style={{
          fontFamily:
            selectedFont ||
            'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", "Noto Sans Math", "Apple Symbols", sans-serif',
        }}
      >
        <EditorContent
          editor={editor}
          className="prose dark:prose-invert min-h-[200px] max-w-none focus:outline-hidden"
        />
      </div>

      {/* Character Count Indicators Per Platform */}
      <div className="border-border bg-muted/50 flex flex-wrap items-center justify-between gap-3 border-t p-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {targetPlatforms.map((platform) => {
            const limitInfo = PLATFORM_LIMITS[platform];
            if (!limitInfo) return null;
            const isOverLimit = textLength > limitInfo.max;
            return (
              <div
                key={platform}
                className={`text-2xs flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono ${
                  isOverLimit
                    ? "border-red-200 bg-red-50 font-bold text-red-600 dark:border-red-900 dark:bg-red-950/50"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span>{limitInfo.label}:</span>
                <span>
                  {textLength.toLocaleString()} /{" "}
                  {limitInfo.max.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        <span className="text-2xs text-muted-foreground font-mono">
          {t("editor.richText.totalChars", { count: textLength })}
        </span>
      </div>
    </div>
  );
};
