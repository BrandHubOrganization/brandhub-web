import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { Bold, Italic, List, Link2, Heading2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (html: string) => void;
}

/** Rich text nhẹ dùng chung (bold/italic/list) — lưu HTML, khác
 * RichTextEditor của Editor page (lưu plain text, toolbar nặng hơn
 * cho social content). Dùng cho các field mô tả ngắn (agency/workspace). */
export function RichTextInput({ label, placeholder, value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  const setLink = () => {
    if (!editor) return;
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
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <Label className="text-xs font-semibold tracking-wide">{label}</Label>
      )}
      <div className="border-input bg-input-background overflow-hidden rounded-md border">
        <div className="border-border bg-muted/50 flex items-center gap-1 border-b p-1.5">
          <button
            type="button"
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
          className="prose prose-sm dark:prose-invert [&_a]:text-brand-orange min-h-20 max-w-none px-3 py-2 text-sm focus:outline-none [&_.ProseMirror]:outline-none [&_a]:underline"
        />
      </div>
    </div>
  );
}
