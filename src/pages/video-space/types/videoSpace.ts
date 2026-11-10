export interface VideoUploadSession {
  sessionId: string;
  uploadUrl: string | null;
  headers: Record<string, string>;
  expiresAt: string | null;
}

export interface VideoSpaceResult {
  status: number;
  body: unknown;
}
