export type DocumentStatus = "PROCESSING" | "INDEXED" | "FAILED";
export type DocumentFileType = "PDF" | "DOCX" | "TXT";

export interface KnowledgeDocument {
  id: string;
  fileName: string;
  fileType: DocumentFileType;
  status: DocumentStatus;
  chunksCount?: number;
  uploadedAt: string;
}

export interface SearchResult {
  documentId: string;
  fileName: string;
  excerpt: string;
  relevanceScore: number;
}
