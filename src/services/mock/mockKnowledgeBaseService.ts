import type {
  DocumentFileType,
  KnowledgeDocument,
  SearchResult,
} from "@/pages/ai-studio/types/knowledgeBase";

const MOCK_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: "doc-1",
    fileName: "Brand-Guidelines-2026.pdf",
    fileType: "PDF",
    status: "INDEXED",
    chunksCount: 48,
    uploadedAt: "2026-06-10T00:00:00Z",
  },
  {
    id: "doc-2",
    fileName: "Product-Catalog-Q3.docx",
    fileType: "DOCX",
    status: "INDEXED",
    chunksCount: 112,
    uploadedAt: "2026-07-02T00:00:00Z",
  },
  {
    id: "doc-3",
    fileName: "FAQ-Customer-Support.txt",
    fileType: "TXT",
    status: "INDEXED",
    chunksCount: 23,
    uploadedAt: "2026-07-18T00:00:00Z",
  },
  {
    id: "doc-4",
    fileName: "Marketing-Playbook.pdf",
    fileType: "PDF",
    status: "PROCESSING",
    uploadedAt: "2026-08-22T00:00:00Z",
  },
  {
    id: "doc-5",
    fileName: "Legacy-Pricing-Sheet.docx",
    fileType: "DOCX",
    status: "FAILED",
    uploadedAt: "2026-08-19T00:00:00Z",
  },
  {
    id: "doc-6",
    fileName: "Tone-of-Voice.txt",
    fileType: "TXT",
    status: "INDEXED",
    chunksCount: 9,
    uploadedAt: "2026-05-30T00:00:00Z",
  },
];

export async function getDocuments(): Promise<KnowledgeDocument[]> {
  return Promise.resolve(MOCK_DOCUMENTS.map((d) => ({ ...d })));
}

export async function uploadDocument(
  fileName: string,
  fileType: DocumentFileType,
): Promise<KnowledgeDocument> {
  const newDoc: KnowledgeDocument = {
    id: `doc-${Date.now()}`,
    fileName,
    fileType,
    status: "PROCESSING",
    uploadedAt: new Date().toISOString(),
  };
  MOCK_DOCUMENTS.push(newDoc);
  return Promise.resolve({ ...newDoc });
}

export async function deleteDocument(id: string): Promise<void> {
  const idx = MOCK_DOCUMENTS.findIndex((d) => d.id === id);
  if (idx !== -1) MOCK_DOCUMENTS.splice(idx, 1);
  return Promise.resolve();
}

export async function semanticSearch(query: string): Promise<SearchResult[]> {
  const indexed = MOCK_DOCUMENTS.filter((d) => d.status === "INDEXED");
  const picks = indexed.slice(0, 3);
  return Promise.resolve(
    picks.map((doc, i) => ({
      documentId: doc.id,
      fileName: doc.fileName,
      excerpt: `"...liên quan đến '${query}', tài liệu ${doc.fileName} đề cập chi tiết ở phần tương ứng..."`,
      relevanceScore: Math.max(0.5, 0.92 - i * 0.15),
    })),
  );
}
