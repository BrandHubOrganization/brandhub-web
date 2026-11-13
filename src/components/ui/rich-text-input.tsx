import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, Link2, Heading2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
  id?: string;
  label?: React.ReactNode;
  placeholder?: string;
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  editorClassName?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function stripRichTextHtml(value: string): string {
  if (!value) return "";
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<h[1-6][^>]*>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<li[^>]*>\s*<p[^>]*>/gi, "- ")
    .replace(/<\/p>\s*<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/(p|li|div|ul|ol)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const RICH_TEXT_PROSE_CLASS =
  "prose prose-sm dark:prose-invert max-w-none text-foreground/90 [&_a]:text-brand-orange [&_a]:underline [&_h2]:mt-3.5 [&_h2]:mb-1.5 [&_h2]:border-b [&_h2]:border-border/60 [&_h2]:pb-1 [&_h2]:text-[13px] [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2:first-child]:mt-0 [&_h3]:mt-2.5 [&_h3]:mb-1 [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul_li::marker]:text-brand-orange [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_li>p]:my-0 [&_strong]:font-semibold [&_strong]:text-foreground";

function sanitizeRichTextHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/href\s*=\s*(["'])\s*javascript:[^"']*\1/gi, 'href="#"');
}

export function RichTextContent({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(trimmed);
  if (!hasHtmlTags) {
    return (
      <div className={cn("whitespace-pre-line", className)}>{trimmed}</div>
    );
  }
  return (
    <div
      className={cn(RICH_TEXT_PROSE_CLASS, className)}
      dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(trimmed) }}
    />
  );
}

/** Rich text nhẹ dùng chung (bold/italic/list) — lưu HTML, khác
 * RichTextEditor của Editor page (lưu plain text, toolbar nặng hơn
 * cho social content). Dùng cho các field mô tả ngắn (agency/workspace/profile/package). */
export function RichTextInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  className,
  editorClassName,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) =>
      onChange(editor.isEmpty ? "" : editor.getHTML()),
    onBlur: () => onBlur?.(),
  });

  const setLink = () => {
    if (!editor || disabled) return;
    const prevUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prevUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const nextValue = value ?? "";
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (nextValue !== current) {
      editor.commands.setContent(nextValue, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const focusEditor = () => {
    if (!disabled) {
      editor.commands.focus("end");
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label
          htmlFor={id}
          onClick={focusEditor}
          className="text-foreground cursor-pointer text-sm font-bold tracking-normal"
        >
          {label}
        </Label>
      )}
      <div
        id={id}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className={cn(
          "border-input bg-background focus-within:border-brand-orange/70 focus-within:ring-brand-orange/20 overflow-hidden rounded-md border transition-colors focus-within:ring-2",
          ariaInvalid && "border-destructive",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <div className="border-border bg-muted/50 flex items-center gap-1 border-b p-1.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "rounded p-1 transition-colors",
              editor.isActive("bold")
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Bold className="size-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "rounded p-1 transition-colors",
              editor.isActive("italic")
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Italic className="size-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "rounded p-1 transition-colors",
              editor.isActive("bulletList")
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <List className="size-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={cn(
              "rounded p-1 transition-colors",
              editor.isActive("heading", { level: 2 })
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Heading2 className="size-3.5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={setLink}
            className={cn(
              "rounded p-1 transition-colors",
              editor.isActive("link")
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Link2 className="size-3.5" />
          </button>
        </div>
        <EditorContent
          editor={editor}
          onMouseDown={(event) => {
            if (disabled) return;
            if (!editor.view.dom.contains(event.target as Node)) {
              event.preventDefault();
              focusEditor();
            }
          }}
          className={cn(
            RICH_TEXT_PROSE_CLASS,
            "flex min-h-20 cursor-text flex-col px-3 py-2 text-sm focus:outline-none [&_.ProseMirror]:w-full [&_.ProseMirror]:flex-1 [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground/70 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
            editorClassName,
          )}
        />
      </div>
    </div>
  );
}
