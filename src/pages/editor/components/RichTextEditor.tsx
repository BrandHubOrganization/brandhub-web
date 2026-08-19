import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Link } from 'lucide-react';
import type { SocialPlatform } from '@/types/editor';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  targetPlatforms?: SocialPlatform[];
}

const PLATFORM_LIMITS: Record<SocialPlatform, { max: number; label: string }> = {
  FACEBOOK: { max: 63206, label: 'Facebook' },
  INSTAGRAM: { max: 2200, label: 'Instagram' },
  TIKTOK: { max: 2200, label: 'TikTok' },
  THREADS: { max: 500, label: 'Threads' },
  YOUTUBE: { max: 5000, label: 'YouTube' },
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  targetPlatforms = ['FACEBOOK', 'INSTAGRAM', 'TIKTOK'],
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Bắt đầu soạn thảo nội dung bài đăng của bạn tại đây...',
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
    <div className="border border-border rounded-2xl bg-card shadow-xs overflow-hidden flex flex-col min-h-[320px]">
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              editor.isActive('bold')
                ? 'bg-zinc-200 dark:bg-zinc-700 text-foreground font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title="In đậm (Bold)"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              editor.isActive('italic')
                ? 'bg-zinc-200 dark:bg-zinc-700 text-foreground italic'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title="In nghiêng (Italic)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              editor.isActive('bulletList')
                ? 'bg-zinc-200 dark:bg-zinc-700 text-foreground'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title="Danh sách gạch đầu dòng"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              editor.isActive('orderedList')
                ? 'bg-zinc-200 dark:bg-zinc-700 text-foreground'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title="Danh sách đánh số"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />

          <button
            type="button"
            onClick={() => {
              const url = window.prompt('Nhập đường dẫn URL:');
              if (url) {
                editor.chain().focus().setMark('link', { href: url }).run();
              }
            }}
            className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title="Chèn liên kết"
          >
            <Link className="w-4 h-4" />
          </button>
        </div>

        <span className="text-[11px] font-mono text-zinc-400">
          TipTap Rich Text Editor
        </span>
      </div>

      {/* Editor Main Content Area */}
      <div className="p-4 flex-1 text-sm leading-relaxed text-foreground outline-none min-h-[220px]">
        <EditorContent editor={editor} className="prose dark:prose-invert max-w-none focus:outline-hidden min-h-[200px]" />
      </div>

      {/* Character Count Indicators Per Platform */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {targetPlatforms.map((platform) => {
            const limitInfo = PLATFORM_LIMITS[platform];
            if (!limitInfo) return null;
            const isOverLimit = textLength > limitInfo.max;
            return (
              <div
                key={platform}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono ${
                  isOverLimit
                    ? 'bg-red-50 text-red-600 border-red-200 font-bold dark:bg-red-950/50 dark:border-red-900'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <span>{limitInfo.label}:</span>
                <span>
                  {textLength.toLocaleString()} / {limitInfo.max.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        <span className="text-[11px] text-zinc-400 font-mono">
          Tổng số ký tự: {textLength}
        </span>
      </div>
    </div>
  );
};
