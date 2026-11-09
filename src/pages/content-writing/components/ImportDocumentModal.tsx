import { useRef, useState } from "react";
import {
  FileText,
  Upload,
  Link2,
  CheckCircle2,
  Sparkles,
  X,
  Loader2,
  FileUp,
  FileCode2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DeltaOp } from "./richText";
import {
  extractGoogleDocId,
  extractTextFromDocxBuffer,
  GOOGLE_DOCS_SAMPLES,
  parseImportedDocumentToDelta,
} from "../contentUtils";

export interface ImportDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (
    ops: DeltaOp[],
    mode: "replace" | "append",
    importedTitle?: string,
  ) => void;
}

export function ImportDocumentModal({
  open,
  onClose,
  onImport,
}: ImportDocumentModalProps) {
  const [activeTab, setActiveTab] = useState<"gdoc" | "file">("gdoc");
  const [gdocUrl, setGdocUrl] = useState("");
  const [isLoadingGdoc, setIsLoadingGdoc] = useState(false);
  const [gdocError, setGdocError] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState("");
  const [contentFormat, setContentFormat] = useState<"txt" | "md" | "html">(
    "md",
  );
  const [importedTitle, setImportedTitle] = useState("");
  const [sourceBadge, setSourceBadge] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<"replace" | "append">("replace");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFetchGoogleDoc = async () => {
    setGdocError(null);
    const trimmed = gdocUrl.trim();
    if (!trimmed) {
      setGdocError("Vui lòng nhập đường dẫn (URL) hoặc ID tài liệu Google Docs.");
      return;
    }

    // Check built-in sample match first
    const matchedSample = GOOGLE_DOCS_SAMPLES.find(
      (s) =>
        s.url.toLowerCase() === trimmed.toLowerCase() ||
        s.id.toLowerCase() === trimmed.toLowerCase() ||
        trimmed.includes(s.id),
    );
    if (matchedSample) {
      setRawContent(matchedSample.markdown);
      setContentFormat("md");
      setImportedTitle(matchedSample.title.replace(/\s*-\s*Google Docs$/i, ""));
      setSourceBadge(`Google Docs · ${matchedSample.title}`);
      return;
    }

    const docId = extractGoogleDocId(trimmed);
    if (!docId) {
      setGdocError(
        "Đường dẫn chưa đúng định dạng Google Docs (ví dụ: https://docs.google.com/document/d/<ID>/edit).",
      );
      return;
    }

    setIsLoadingGdoc(true);
    try {
      const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
      const response = await fetch(exportUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const text = await response.text();
      if (!text.trim()) {
        throw new Error("Empty document");
      }
      setRawContent(text.trim());
      setContentFormat("md");
      setImportedTitle(`Tài liệu Google Docs (${docId.slice(0, 8)})`);
      setSourceBadge(`Google Docs ID: ${docId.slice(0, 12)}…`);
    } catch {
      // Fallback when CORS blocks private Google Doc: provide helpful guidance and allow direct paste
      setGdocError(
        "Tài liệu đang để quyền riêng tư hoặc chặn truy cập trực tiếp. Bạn có thể bật 'Bất kỳ ai có đường liên kết' trên Google Docs, tải file .docx/.txt về để tải lên ở tab bên cạnh, hoặc chọn mẫu Google Docs bên dưới.",
      );
    } finally {
      setIsLoadingGdoc(false);
    }
  };

  const handleSelectSample = (sampleIndex: number) => {
    const sample = GOOGLE_DOCS_SAMPLES[sampleIndex];
    if (!sample) return;
    setGdocError(null);
    setGdocUrl(sample.url);
    setRawContent(sample.markdown);
    setContentFormat("md");
    setImportedTitle(sample.title.replace(/\s*-\s*Google Docs$/i, ""));
    setSourceBadge(`Google Docs · ${sample.title}`);
  };

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setGdocError(null);
    const cleanName = file.name.replace(/\.[^.]+$/, "");
    setImportedTitle(cleanName);
    setSourceBadge(`Tệp tin · ${file.name}`);

    const lowerName = file.name.toLowerCase();
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const isPkZip =
      bytes.length >= 4 &&
      bytes[0] === 0x50 &&
      bytes[1] === 0x4b &&
      bytes[2] === 0x03 &&
      bytes[3] === 0x04;
    if (lowerName.endsWith(".docx") || isPkZip) {
      const extracted = await extractTextFromDocxBuffer(buffer);
      setRawContent(extracted);
      setContentFormat("md");
      return;
    }

    const text = new TextDecoder("utf-8").decode(bytes);
    if (lowerName.endsWith(".html") || lowerName.endsWith(".htm") || lowerName.endsWith(".doc")) {
      setRawContent(text);
      setContentFormat("html");
    } else if (lowerName.endsWith(".md")) {
      setRawContent(text);
      setContentFormat("md");
    } else {
      // Plain .txt still supports markdown headings/bullets if present
      setRawContent(text);
      setContentFormat("md");
    }
  };

  const parsedOps = parseImportedDocumentToDelta(rawContent, contentFormat);
  const canConfirm = parsedOps.length > 0 && rawContent.trim().length > 0;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onImport(parsedOps, importMode, importedTitle || undefined);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-doc-modal-title"
    >
      <div className="border-border bg-card w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b bg-[#f8fafd] px-5 py-3.5 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <FileText className="size-5" />
            </div>
            <div>
              <h3
                id="import-doc-modal-title"
                className="text-foreground text-sm font-bold"
              >
                Nhập nội dung từ Google Docs / Word / Tệp tài liệu
              </h3>
              <p className="text-muted-foreground text-[11px]">
                Tự động trích xuất tiêu đề, in đậm, in nghiêng, danh sách và điền thẳng vào trình soạn thảo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors"
            aria-label="Đóng hộp thoại nhập tài liệu"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Source Tabs */}
        <div className="border-border bg-muted/30 flex gap-1 border-b px-5 pt-2.5">
          <button
            type="button"
            data-testid="import-tab-gdoc"
            onClick={() => setActiveTab("gdoc")}
            className={`flex items-center gap-1.5 rounded-t-lg border-b-2 px-3.5 py-2 text-xs font-semibold transition-colors ${
              activeTab === "gdoc"
                ? "border-blue-600 bg-white text-blue-600 dark:bg-zinc-900 dark:text-blue-400"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            <Link2 className="size-3.5" />
            Link Google Docs
          </button>
          <button
            type="button"
            data-testid="import-tab-file"
            onClick={() => setActiveTab("file")}
            className={`flex items-center gap-1.5 rounded-t-lg border-b-2 px-3.5 py-2 text-xs font-semibold transition-colors ${
              activeTab === "file"
                ? "border-blue-600 bg-white text-blue-600 dark:bg-zinc-900 dark:text-blue-400"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            <Upload className="size-3.5" />
            Tải tệp (.docx, .txt, .md, .html)
          </button>
        </div>

        <div className="space-y-4 p-5">
          {activeTab === "gdoc" ? (
            <div className="space-y-3">
              <div>
                <label className="text-foreground mb-1.5 block text-xs font-medium">
                  Đường liên kết (URL) hoặc ID tài liệu Google Docs
                </label>
                <div className="flex gap-2">
                  <Input
                    data-testid="import-gdoc-url-input"
                    value={gdocUrl}
                    onChange={(e) => setGdocUrl(e.target.value)}
                    placeholder="https://docs.google.com/document/d/1aBcDeFg.../edit"
                    className="h-9 flex-1 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleFetchGoogleDoc();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    data-testid="fetch-gdoc-btn"
                    size="sm"
                    onClick={() => void handleFetchGoogleDoc()}
                    disabled={isLoadingGdoc}
                    className="h-9 bg-blue-600 px-3.5 text-xs text-white hover:bg-blue-700"
                  >
                    {isLoadingGdoc ? (
                      <>
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        Đang đồng bộ…
                      </>
                    ) : (
                      "Lấy nội dung"
                    )}
                  </Button>
                </div>
                {gdocError && (
                  <p
                    data-testid="import-gdoc-error"
                    className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400"
                  >
                    {gdocError}
                  </p>
                )}
              </div>

              {/* Quick sample Google Docs templates for 1-click testing / inspiration */}
              <div>
                <span className="text-muted-foreground mb-1.5 flex items-center gap-1 text-[11px] font-medium">
                  <Sparkles className="text-brand-orange size-3" />
                  Tài liệu Google Docs mẫu sẵn có (Nhấn để nạp nhanh):
                </span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {GOOGLE_DOCS_SAMPLES.map((sample, idx) => (
                    <button
                      key={sample.id}
                      type="button"
                      data-testid={`gdoc-sample-${idx}`}
                      onClick={() => handleSelectSample(idx)}
                      className="border-border hover:border-blue-500/50 hover:bg-blue-500/5 flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-colors"
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-foreground line-clamp-1 text-xs font-semibold">
                          {sample.title}
                        </span>
                        <span className="shrink-0 rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                          Docs
                        </span>
                      </div>
                      <span className="text-muted-foreground text-[10px]">
                        {sample.author} · {sample.updatedAt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  void handleFileChange(e.dataTransfer.files);
                }}
                className="border-border hover:border-blue-500/60 hover:bg-blue-500/5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors"
              >
                <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <FileUp className="size-5" />
                </div>
                <p className="text-foreground text-xs font-semibold">
                  Nhấn để chọn tệp hoặc kéo thả tệp tài liệu vào đây
                </p>
                <p className="text-muted-foreground mt-1 text-[11px]">
                  Hỗ trợ Microsoft Word (<strong>.docx</strong>), Google Docs xuất ra (<strong>.docx, .html, .txt, .md</strong>)
                </p>
                <input
                  ref={fileInputRef}
                  data-testid="import-doc-file-input"
                  type="file"
                  accept=".docx,.doc,.txt,.md,.html,.htm"
                  className="hidden"
                  onChange={(e) => void handleFileChange(e.target.files)}
                />
              </div>
            </div>
          )}

          {/* Editable Preview before filling into editor */}
          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="import-doc-preview"
                className="text-foreground flex items-center gap-1.5 text-xs font-semibold"
              >
                <FileCode2 className="size-3.5 text-blue-600" />
                <span>Xem trước & chỉnh sửa nội dung trước khi điền:</span>
                {rawContent.trim() && (
                  <span className="text-muted-foreground font-normal tabular-nums">
                    ({rawContent.trim().length} ký tự)
                  </span>
                )}
              </label>
              {sourceBadge && (
                <span className="inline-flex max-w-[280px] items-center gap-1 truncate rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="size-3 shrink-0" />
                  <span className="truncate">{sourceBadge}</span>
                </span>
              )}
            </div>
            <textarea
              id="import-doc-preview"
              data-testid="import-doc-preview"
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              rows={6}
              placeholder="Nội dung từ Google Docs hoặc file .docx / .md / .txt sẽ hiển thị tại đây (hoặc bạn có thể dán trực tiếp nội dung từ Google Docs vào ô này)..."
              className="border-border bg-muted/20 text-foreground w-full rounded-xl border p-3 font-sans text-xs leading-relaxed focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Import mode options & Actions Footer */}
          <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-muted-foreground font-medium">
                Chế độ điền:
              </span>
              <button
                type="button"
                data-testid="import-mode-replace"
                onClick={() => setImportMode("replace")}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  importMode === "replace"
                    ? "border-blue-600 bg-blue-600/10 text-blue-600 dark:text-blue-400"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Thay thế nội dung hiện tại
              </button>
              <button
                type="button"
                data-testid="import-mode-append"
                onClick={() => setImportMode("append")}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  importMode === "append"
                    ? "border-blue-600 bg-blue-600/10 text-blue-600 dark:text-blue-400"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Chèn nối tiếp vào cuối bài
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8 text-xs"
              >
                Hủy
              </Button>
              <Button
                type="button"
                data-testid="confirm-import-doc-btn"
                size="sm"
                disabled={!canConfirm}
                onClick={handleConfirm}
                className="bg-brand-orange hover:bg-brand-orange/90 h-8 px-3.5 text-xs font-semibold text-white"
              >
                Điền vào trình soạn thảo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
