import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
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
} from "./types/knowledgeBase";
import { DocumentUploadZone } from "./components/DocumentUploadZone";
import { DocumentList } from "./components/DocumentList";
import { SemanticSearchBar } from "./components/SemanticSearchBar";

export function KnowledgeBasePage() {
  const { t } = useTranslation();
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

  async function handleUpload(fileName: string, fileType: DocumentFileType) {
    try {
      const doc = await uploadDocument(fileName, fileType);
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
    >
      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}

      {isError && !isLoading && (
        <div className="border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center gap-3 rounded-xl border p-6 text-center">
          <div className="text-destructive flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="size-4" />
            <span>{t("aiStudio.knowledgeBase.loadError")}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="gap-2 text-xs"
          >
            <RefreshCw className="size-3.5" />{" "}
            {t("aiStudio.knowledgeBase.retry")}
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-6">
          <DocumentUploadZone onUpload={handleUpload} />
          <SemanticSearchBar onSearch={semanticSearch} />
          <DocumentList documents={documents} onDelete={handleDelete} />
        </div>
      )}
    </PageWrapper>
  );
}

export default KnowledgeBasePage;
