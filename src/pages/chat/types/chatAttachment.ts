export interface ChatAttachment {
  id: string;
  source: "UPLOAD" | "REPOSITORY";
  filename: string;
  mimeType: string;
  byteSize: number;
  materialId?: string | null;
  versionNumber?: number | null;
}

export interface ChatAttachmentDraft {
  key: string;
  filename: string;
  status: "uploading" | "ready" | "error";
  attachment?: ChatAttachment;
  file?: File;
  previewUrl?: string;
}
