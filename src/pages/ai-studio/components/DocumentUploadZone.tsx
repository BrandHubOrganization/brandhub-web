import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DocumentFileType } from "../types/knowledgeBase";

function inferFileType(fileName: string): DocumentFileType | null {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "PDF";
  if (ext === "docx") return "DOCX";
  if (ext === "txt") return "TXT";
  return null;
}

export interface DocumentUploadZoneProps {
  onUpload: (fileName: string, fileType: DocumentFileType) => void;
}

export function DocumentUploadZone({ onUpload }: DocumentUploadZoneProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const fileType = inferFileType(file.name);
    if (!fileType) {
      window.alert(t("aiStudio.knowledgeBase.unsupportedType"));
      return;
    }
    onUpload(file.name, fileType);
  }

  return (
    <div className="border-border bg-card flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
      <Upload className="text-muted-foreground size-8" />
      <div className="space-y-1">
        <p className="text-foreground text-sm font-medium">
          {t("aiStudio.knowledgeBase.uploadTitle")}
        </p>
        <p className="text-muted-foreground text-xs">
          {t("aiStudio.knowledgeBase.uploadHint")}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="orange"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        {t("aiStudio.knowledgeBase.selectFile")}
      </Button>
    </div>
  );
}

export default DocumentUploadZone;
