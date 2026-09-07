import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Upload, Volume2 } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  deleteDocument,
  getDocuments,
  semanticSearch,
  uploadDocument,
} from "@/services/mock/mockKnowledgeBaseService";
import type {
  DocumentFileType,
  KnowledgeDocument,
} from "../types/knowledgeBase";
import { DocumentList } from "../components/DocumentList";
import { SemanticSearchBar } from "../components/SemanticSearchBar";
import { AiStudioErrorBanner } from "../components/AiStudioErrorBanner";

const EXT_TO_TYPE: Record<string, DocumentFileType> = {
  pdf: "PDF",
  docx: "DOCX",
  txt: "TXT",
};

function BrandVoiceCard() {
  const { t } = useTranslation();
  return (
    <div className="border-border bg-card rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="text-brand-orange size-4" />
          <h3 className="text-foreground text-sm font-semibold">
            {t("aiStudio.knowledgeBase.brandVoice.title")}
          </h3>
        </div>
        <Badge variant="PUBLISHED">
          {t("aiStudio.knowledgeBase.brandVoice.trained")}
        </Badge>
      </div>
      <p className="text-muted-foreground mt-2 text-xs">
        {t("aiStudio.knowledgeBase.brandVoice.tone")} ·{" "}
        {t("aiStudio.knowledgeBase.brandVoice.updatedAt")}
      </p>
    </div>
  );
}

export function KnowledgeBasePage() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await getDocuments();
        if (!cancelled) setDocuments(data);
      } catch (err) {
        console.error("Failed to load documents:", err);
        if (!cancelled) setIsError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const fileType = EXT_TO_TYPE[ext];
    if (!fileType) {
      toast.error(t("aiStudio.knowledgeBase.unsupportedType"));
      return;
    }

    try {
      const doc = await uploadDocument(file.name, fileType);
      setDocuments((prev) => [...prev, doc]);
      toast.success(t("aiStudio.knowledgeBase.uploadSuccess"));
    } catch (err) {
      console.error("Failed to upload document:", err);
      toast.error(t("aiStudio.knowledgeBase.uploadError"));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("aiStudio.knowledgeBase.deleteConfirm"))) return;
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.success(t("aiStudio.knowledgeBase.deleteSuccess"));
    } catch (err) {
      console.error("Failed to delete document:", err);
      toast.error(t("aiStudio.knowledgeBase.deleteError"));
    }
  }

  return (
    <PageWrapper
      title={t("aiStudio.knowledgeBase.title")}
      description={t("aiStudio.knowledgeBase.description")}
      actions={
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleFileSelected}
          />
          <Button
            variant="orange"
            size="sm"
            className="gap-1.5"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-4" />
            {t("aiStudio.knowledgeBase.selectFile")}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <BrandVoiceCard />
        <SemanticSearchBar onSearch={semanticSearch} />

        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        )}

        {isError && !isLoading && (
          <AiStudioErrorBanner
            messageKey="aiStudio.knowledgeBase.loadError"
            retryKey="aiStudio.knowledgeBase.retry"
          />
        )}

        {!isLoading && !isError && (
          <DocumentList documents={documents} onDelete={handleDelete} />
        )}
      </div>
    </PageWrapper>
  );
}

export default KnowledgeBasePage;
