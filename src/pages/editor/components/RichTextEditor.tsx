import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Link } from "lucide-react";
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
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Bắt đầu soạn thảo nội dung bài đăng của bạn tại đây...",
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
    <div className="border-border bg-card flex min-h-[320px] flex-col overflow-hidden rounded-2xl border shadow-xs">
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 bg-zinc-50/80 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/40">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`rounded-lg p-1.5 text-xs transition-colors ${
              editor.isActive("bold")
                ? "text-foreground bg-zinc-200 font-bold dark:bg-zinc-700"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
            title="In đậm (Bold)"
          >
            <Bold className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`rounded-lg p-1.5 text-xs transition-colors ${
              editor.isActive("italic")
                ? "text-foreground bg-zinc-200 italic dark:bg-zinc-700"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
            title="In nghiêng (Italic)"
          >
            <Italic className="h-4 w-4" />
          </button>

          <div className="mx-1 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`rounded-lg p-1.5 text-xs transition-colors ${
              editor.isActive("bulletList")
                ? "text-foreground bg-zinc-200 dark:bg-zinc-700"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
            title="Danh sách gạch đầu dòng"
          >
            <List className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`rounded-lg p-1.5 text-xs transition-colors ${
              editor.isActive("orderedList")
                ? "text-foreground bg-zinc-200 dark:bg-zinc-700"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
            title="Danh sách đánh số"
          >
            <ListOrdered className="h-4 w-4" />
          </button>

          <div className="mx-1 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

          <button
            type="button"
            onClick={() => {
              const url = window.prompt("Nhập đường dẫn URL:");
              if (url) {
                editor.chain().focus().setMark("link", { href: url }).run();
              }
            }}
            className="rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            title="Chèn liên kết"
          >
            <Link className="h-4 w-4" />
          </button>
        </div>

        <span className="font-mono text-[11px] text-zinc-400">
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50/50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-3">
          {targetPlatforms.map((platform) => {
            const limitInfo = PLATFORM_LIMITS[platform];
            if (!limitInfo) return null;
            const isOverLimit = textLength > limitInfo.max;
            return (
              <div
                key={platform}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] ${
                  isOverLimit
                    ? "border-red-200 bg-red-50 font-bold text-red-600 dark:border-red-900 dark:bg-red-950/50"
                    : "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
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

        <span className="font-mono text-[11px] text-zinc-400">
          Tổng số ký tự: {textLength}
        </span>
      </div>
    </div>
  );
};
