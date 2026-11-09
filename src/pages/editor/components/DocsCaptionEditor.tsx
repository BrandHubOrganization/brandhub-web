import { useEffect, useRef, useState } from "react";
import { Download, FileUp, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as Y from "yjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CanvasTextEditor,
  type CanvasTextEditorHandle,
} from "@/pages/content-writing/components/CanvasTextEditor";
import { ImportDocumentModal } from "@/pages/content-writing/components/ImportDocumentModal";
import type { DeltaOp } from "@/pages/content-writing/components/richText";
import {
  CREATIVE_TEMPLATES,
  deltaToDocxZip,
  deltaToMarkdown,
  toPublishText,
} from "@/pages/content-writing/contentUtils";

interface DocsCaptionEditorProps {
  value: string;
  onChange: (caption: string) => void;
  readOnly?: boolean;
}

const menuTrigger =
  "rounded px-1.5 py-0.5 font-medium hover:bg-black/5 dark:hover:bg-white/10";

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Docs-style canvas editor for the post caption. The caption stays the source
 * of truth: the local Y.Doc only lives while this mode is open, and every edit
 * is emitted as Unicode-styled publish text.
 */
export function DocsCaptionEditor({
  value,
  onChange,
  readOnly,
}: DocsCaptionEditorProps) {
  const editorRef = useRef<CanvasTextEditorHandle>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [yDoc] = useState(() => {
    const doc = new Y.Doc();
    doc.getText("content").insert(0, value);
    return doc;
  });
  const lastEmitted = useRef(value);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const yText = yDoc.getText("content");
    const sync = () => {
      const text = toPublishText(yText.toDelta());
      if (text === lastEmitted.current) return;
      lastEmitted.current = text;
      onChangeRef.current(text);
    };
    yText.observe(sync);
    return () => yText.unobserve(sync);
  }, [yDoc]);

  // AI results and templates replace the caption from outside this editor.
  useEffect(() => {
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    const yText = yDoc.getText("content");
    yDoc.transact(() => {
      yText.delete(0, yText.length);
      yText.insert(0, value);
    });
  }, [value, yDoc]);

  const delta = () => yDoc.getText("content").toDelta() as DeltaOp[];

  const handleImport = (ops: DeltaOp[], mode: "replace" | "append") => {
    editorRef.current?.applyDeltaOps(ops, mode);
    toast.success("Đã tự động điền nội dung tài liệu vào trình soạn thảo!");
  };

  const clearAll = () => {
    const yText = yDoc.getText("content");
    yText.delete(0, yText.length);
  };

  return (
    <div inert={readOnly} className="flex flex-col">
      <div className="border-border flex flex-wrap items-center justify-between gap-2 rounded-t-xl border border-b-0 bg-[#f9fbfd] px-3 py-1.5 text-[11px] text-[#444746] dark:bg-zinc-900 dark:text-zinc-300">
        <div className="flex flex-wrap items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={menuTrigger}>
                Tệp
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 text-xs">
              <DropdownMenuItem onSelect={() => setImportOpen(true)}>
                <FileUp className="size-3.5 text-blue-600" />
                Nhập từ Google Docs / Word (.docx)…
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  download(
                    new Blob([deltaToDocxZip(delta()).buffer as ArrayBuffer], {
                      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    }),
                    "brandhub-content.docx",
                  )
                }
              >
                <Download className="size-3.5 text-blue-600" />
                Xuất tệp Word / Google Docs (.docx)
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  download(
                    new Blob([deltaToMarkdown(delta())], {
                      type: "text/markdown;charset=utf-8",
                    }),
                    "brandhub-content.md",
                  )
                }
              >
                <Download className="size-3.5" />
                Xuất tệp Markdown (.md)
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  download(
                    new Blob([toPublishText(delta())], {
                      type: "text/plain;charset=utf-8",
                    }),
                    "brandhub-content.txt",
                  )
                }
              >
                <Download className="size-3.5" />
                Tải xuống bản đăng Unicode (.txt)
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={clearAll} className="text-red-600">
                <Trash2 className="size-3.5" />
                Xóa toàn bộ nội dung
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={menuTrigger}>
                Chỉnh sửa
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 text-xs">
              <DropdownMenuItem
                onSelect={() => editorRef.current?.transformCase("upper")}
              >
                Chuyển sang CHỮ IN HOA
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => editorRef.current?.transformCase("title")}
              >
                Viết Hoa Chữ Cái Đầu Từ
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => editorRef.current?.transformCase("lower")}
              >
                Chuyển sang chữ thường
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={menuTrigger}>
                Chèn
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60 text-xs">
              {CREATIVE_TEMPLATES.map((tpl) => (
                <DropdownMenuItem
                  key={tpl.id}
                  onSelect={() =>
                    editorRef.current?.applyDeltaOps(tpl.ops, "append")
                  }
                  className="justify-between"
                >
                  <span className="truncate">{tpl.label}</span>
                  <span className="bg-brand-orange/15 text-brand-orange rounded px-1 py-0.5 text-[9px] font-bold">
                    {tpl.badge}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <button
          type="button"
          onClick={() => setImportOpen(true)}
          className="flex items-center gap-1 rounded-full border border-blue-600/30 bg-blue-600/10 px-2.5 py-1 font-semibold whitespace-nowrap text-blue-700 transition-colors hover:bg-blue-600/20 dark:border-blue-400/30 dark:bg-blue-500/20 dark:text-blue-300"
        >
          <FileUp className="size-3.5" />
          Nhập Google Docs / File
        </button>
      </div>

      <CanvasTextEditor ref={editorRef} yDoc={yDoc} />

      <ImportDocumentModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}
