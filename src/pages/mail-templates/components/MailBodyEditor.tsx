import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, ImagePlus, Italic, Link2, List, ListOrdered, Braces } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (html: string) => void;
  /** Uploads an image and resolves with its public URL; omit to hide the image button. */
  onUploadImage?: (file: File) => Promise<string>;
  disabled?: boolean;
}

const QUICK_VARIABLES = ["name", "workspaceName", "senderName"];

/** TipTap editor for mail bodies: bold, italic, lists, links, {{variables}} and images. */
export function MailBodyEditor({ value, onChange, onUploadImage, disabled }: Props) {
  const { t } = useTranslation();
  const fileInput = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: t("mailTemplate.form.bodyPlaceholder") }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value);
  }, [value, editor]);

  if (!editor) return null;

  const button = (active: boolean) =>
    cn(
      "rounded p-1.5 transition-colors disabled:opacity-50",
      active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted",
    );

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(t("mailTemplate.form.linkPrompt"), previous ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertVariable = (name: string) =>
    editor.chain().focus().insertContent(`{{${name}}}`).run();

  const customVariable = () => {
    const name = window.prompt(t("mailTemplate.form.variablePrompt"), "");
    if (name && /^[A-Za-z0-9_]+$/.test(name)) insertVariable(name);
  };

  const pickImage = async (file: File | undefined) => {
    if (!file || !onUploadImage) return;
    const url = await onUploadImage(file);
    editor.chain().focus().setImage({ src: url, alt: file.name }).run();
  };

  return (
    <div className="border-input bg-input-background overflow-hidden rounded-md border">
      <div className="border-border bg-muted/50 flex flex-wrap items-center gap-1 border-b p-1.5">
        <button type="button" disabled={disabled} aria-label={t("mailTemplate.form.bold")}
          className={button(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="size-3.5" /></button>
        <button type="button" disabled={disabled} aria-label={t("mailTemplate.form.italic")}
          className={button(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="size-3.5" /></button>
        <button type="button" disabled={disabled} aria-label={t("mailTemplate.form.bulletList")}
          className={button(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="size-3.5" /></button>
        <button type="button" disabled={disabled} aria-label={t("mailTemplate.form.orderedList")}
          className={button(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="size-3.5" /></button>
        <button type="button" disabled={disabled} aria-label={t("mailTemplate.form.link")}
          className={button(editor.isActive("link"))} onClick={setLink}><Link2 className="size-3.5" /></button>
        {onUploadImage && (
          <>
            <button type="button" disabled={disabled} aria-label={t("mailTemplate.form.insertImage")}
              className={button(false)} onClick={() => fileInput.current?.click()}>
              <ImagePlus className="size-3.5" />
            </button>
            <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/gif" className="hidden"
              data-testid="mail-image-input"
              onChange={(e) => {
                void pickImage(e.target.files?.[0]);
                e.target.value = "";
              }} />
          </>
        )}
        <span className="bg-border mx-1 h-4 w-px" aria-hidden />
        <Braces className="text-muted-foreground size-3.5" aria-hidden />
        {QUICK_VARIABLES.map((name) => (
          <button key={name} type="button" disabled={disabled}
            className="text-muted-foreground hover:bg-muted rounded px-1.5 py-1 font-mono text-[11px]"
            onClick={() => insertVariable(name)}>{`{{${name}}}`}</button>
        ))}
        <button type="button" disabled={disabled}
          className="text-muted-foreground hover:bg-muted rounded px-1.5 py-1 text-[11px]"
          onClick={customVariable}>{t("mailTemplate.form.otherVariable")}</button>
      </div>
      <EditorContent editor={editor}
        className="prose prose-sm text-foreground max-w-none p-3 [&_.ProseMirror]:min-h-[160px] [&_.ProseMirror]:outline-none" />
    </div>
  );
}
