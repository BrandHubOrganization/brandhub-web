const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const EXTENSION_MIME_FALLBACK: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  mp4: "video/mp4",
  mov: "video/quicktime",
  pdf: "application/pdf",
  txt: "text/plain",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

const IGNORED_FILENAMES = new Set([
  ".ds_store",
  "thumbs.db",
  "desktop.ini",
]);

export const MAX_REPOSITORY_FILE_BYTES = 1024 * 1024 * 1024; // 1 GiB

export interface QueuedUploadFile {
  file: File;
  /** Relative folder segments from the selected/dropped root, e.g. ["Campaign Q4", "Banners"] */
  folderSegments: string[];
}

export interface ExtractedUploadBatch {
  validFiles: QueuedUploadFile[];
  skippedCount: number;
  skippedReasons: string[];
  rootFolderName?: string;
}

function normalizeMimeFile(file: File): File {
  if (ALLOWED_MIME_TYPES.has(file.type)) {
    return file;
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const inferred = EXTENSION_MIME_FALLBACK[ext];
  if (inferred) {
    return new File([file], file.name, {
      type: inferred,
      lastModified: file.lastModified,
    });
  }
  return file;
}

function parseRelativeSegments(relativePath?: string): string[] {
  if (!relativePath) return [];
  const parts = relativePath
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (parts.length <= 1) return [];
  return parts.slice(0, -1);
}

export function extractFromFileList(fileList: FileList | File[]): ExtractedUploadBatch {
  const files = Array.from(fileList);
  const validFiles: QueuedUploadFile[] = [];
  let skippedCount = 0;
  const skippedReasons: string[] = [];
  let rootFolderName: string | undefined;

  for (const rawFile of files) {
    const lowerName = rawFile.name.toLowerCase();
    if (IGNORED_FILENAMES.has(lowerName) || lowerName.startsWith("._")) {
      continue;
    }
    const relPath = (rawFile as File & { webkitRelativePath?: string }).webkitRelativePath;
    const folderSegments = parseRelativeSegments(relPath);
    if (!rootFolderName && folderSegments.length > 0) {
      rootFolderName = folderSegments[0];
    }

    const normalized = normalizeMimeFile(rawFile);
    if (!ALLOWED_MIME_TYPES.has(normalized.type)) {
      skippedCount += 1;
      if (skippedReasons.length < 3) {
        skippedReasons.push(`${rawFile.name}: định dạng không hỗ trợ`);
      }
      continue;
    }
    if (normalized.size <= 0 || normalized.size > MAX_REPOSITORY_FILE_BYTES) {
      skippedCount += 1;
      if (skippedReasons.length < 3) {
        skippedReasons.push(`${rawFile.name}: vượt quá 1 GiB hoặc tệp rỗng`);
      }
      continue;
    }

    validFiles.push({
      file: normalized,
      folderSegments,
    });
  }

  return {
    validFiles,
    skippedCount,
    skippedReasons,
    rootFolderName,
  };
}

interface WebkitFileSystemEntry {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  file?: (
    success: (file: File) => void,
    error?: (err: DOMException) => void,
  ) => void;
  createReader?: () => {
    readEntries: (
      success: (entries: WebkitFileSystemEntry[]) => void,
      error?: (err: DOMException) => void,
    ) => void;
  };
}

async function readDirectoryEntries(
  entry: WebkitFileSystemEntry,
  parentSegments: string[],
): Promise<Array<{ file: File; segments: string[] }>> {
  if (entry.isFile && entry.file) {
    const file = await new Promise<File | null>((resolve) => {
      entry.file?.(
        (f) => resolve(f),
        () => resolve(null),
      );
    });
    return file ? [{ file, segments: parentSegments }] : [];
  }

  if (entry.isDirectory && entry.createReader) {
    const reader = entry.createReader();
    const nextSegments = [...parentSegments, entry.name.trim()].filter(Boolean);
    const allEntries: WebkitFileSystemEntry[] = [];

    // readEntries returns batches until an empty array is returned
    while (true) {
      const batch = await new Promise<WebkitFileSystemEntry[]>((resolve) => {
        reader.readEntries(
          (entries) => resolve(entries || []),
          () => resolve([]),
        );
      });
      if (!batch.length) break;
      allEntries.push(...batch);
    }

    const nestedResults: Array<{ file: File; segments: string[] }> = [];
    for (const child of allEntries) {
      const childFiles = await readDirectoryEntries(child, nextSegments);
      nestedResults.push(...childFiles);
    }
    return nestedResults;
  }

  return [];
}

export async function extractFromDataTransfer(
  dataTransfer: DataTransfer,
): Promise<ExtractedUploadBatch> {
  const items = Array.from(dataTransfer.items || []);
  const entries = items
    .map((item) =>
      typeof item.webkitGetAsEntry === "function"
        ? (item.webkitGetAsEntry() as WebkitFileSystemEntry | null)
        : null,
    )
    .filter((entry): entry is WebkitFileSystemEntry => Boolean(entry));

  if (entries.length === 0) {
    return extractFromFileList(dataTransfer.files);
  }

  const collected: Array<{ file: File; segments: string[] }> = [];
  let rootFolderName: string | undefined;

  for (const entry of entries) {
    if (entry.isDirectory && !rootFolderName) {
      rootFolderName = entry.name;
    }
    const itemsFromEntry = await readDirectoryEntries(entry, []);
    collected.push(...itemsFromEntry);
  }

  const validFiles: QueuedUploadFile[] = [];
  let skippedCount = 0;
  const skippedReasons: string[] = [];

  for (const { file: rawFile, segments } of collected) {
    const lowerName = rawFile.name.toLowerCase();
    if (IGNORED_FILENAMES.has(lowerName) || lowerName.startsWith("._")) {
      continue;
    }
    const normalized = normalizeMimeFile(rawFile);
    if (!ALLOWED_MIME_TYPES.has(normalized.type)) {
      skippedCount += 1;
      if (skippedReasons.length < 3) {
        skippedReasons.push(`${rawFile.name}: định dạng không hỗ trợ`);
      }
      continue;
    }
    if (normalized.size <= 0 || normalized.size > MAX_REPOSITORY_FILE_BYTES) {
      skippedCount += 1;
      if (skippedReasons.length < 3) {
        skippedReasons.push(`${rawFile.name}: vượt quá 1 GiB hoặc tệp rỗng`);
      }
      continue;
    }
    validFiles.push({
      file: normalized,
      folderSegments: segments,
    });
  }

  return {
    validFiles,
    skippedCount,
    skippedReasons,
    rootFolderName,
  };
}
