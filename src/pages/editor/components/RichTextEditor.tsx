import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Link } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SocialPlatform } from "@/types/editor";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  targetPlatforms?: SocialPlatform[];
}

const PLATFORM_LIMITS: Record<SocialPlatform, { max: number; label: string }> =
  {
    FACEBOOK: { max: 63206, label: "Facebook" },
    INSTAGRAM: { max: 2200, label: "Instagram" },
    TIKTOK: { max: 2200, label: "TikTok" },
    THREADS: { max: 500, label: "Threads" },
    YOUTUBE: { max: 5000, label: "YouTube" },
  };

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  targetPlatforms = ["FACEBOOK", "INSTAGRAM", "TIKTOK"],
}) => {
  const { t } = useTranslation();
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: t("editor.richText.contentPlaceholder"),
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      onChange(text);
    },
  });

  // Sync external value updates (e.g. from AI auto-populate)
  useEffect(() => {
    if (editor && value !== editor.getText()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  const textLength = value.length;

  return (
    <div className="border-border bg-card flex min-h-[320px] flex-col overflow-hidden rounded-xl border shadow-xs">
      {/* Formatting Toolbar */}
      <div className="border-border bg-muted/80 flex flex-wrap items-center justify-between gap-2 border-b p-2.5">
        <div className="flex items-center gap-1">
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
        </div>

        <span className="text-2xs text-muted-foreground font-mono">
          TipTap Rich Text Editor
        </span>
      </div>

      {/* Editor Main Content Area */}
      <div className="text-foreground min-h-[220px] flex-1 p-4 text-sm leading-relaxed outline-none">
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
