import { toast } from "sonner";

export type DownloadFormat = "png" | "jpg" | "webp" | "mp4";

export interface DownloadFormatOption {
  format: DownloadFormat;
  label: string;
  extension: string;
  mimeType: string;
  description: string;
}

export const IMAGE_DOWNLOAD_FORMATS: DownloadFormatOption[] = [
  {
    format: "png",
    label: "PNG (.png)",
    extension: "png",
    mimeType: "image/png",
    description: "Chất lượng gốc, không nén",
  },
  {
    format: "jpg",
    label: "JPG (.jpg)",
    extension: "jpg",
    mimeType: "image/jpeg",
    description: "Dung lượng nhẹ, nền trắng",
  },
  {
    format: "webp",
    label: "WebP (.webp)",
    extension: "webp",
    mimeType: "image/webp",
    description: "Tối ưu cho website",
  },
];

export const VIDEO_DOWNLOAD_FORMATS: DownloadFormatOption[] = [
  {
    format: "mp4",
    label: "MP4 (.mp4)",
    extension: "mp4",
    mimeType: "video/mp4",
    description: "Định dạng video tiêu chuẩn",
  },
];

export function stripExtension(filename: string): string {
  const cleaned = (filename || "brandhub-media").trim();
  const dotIdx = cleaned.lastIndexOf(".");
  return dotIdx > 0 ? cleaned.slice(0, dotIdx) : cleaned;
}

export function buildFormattedFilename(baseFilename: string, format: DownloadFormat): string {
  const stem = stripExtension(baseFilename);
  return `${stem}.${format}`;
}

function triggerBlobDownload(blobUrl: string, filename: string): void {
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

async function convertImageUrlToBlob(
  sourceUrl: string,
  format: "png" | "jpg" | "webp",
): Promise<Blob> {
  const img = new Image();
  if (!sourceUrl.startsWith("data:") && !sourceUrl.startsWith("blob:")) {
    img.crossOrigin = "anonymous";
  }

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"));
    img.src = sourceUrl;
  });

  const width = img.naturalWidth || img.width || 1024;
  const height = img.naturalHeight || img.height || 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("CANVAS_CONTEXT_UNAVAILABLE");
  }

  if (format === "jpg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(img, 0, 0, width, height);

  const mimeType =
    format === "jpg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
  const quality = format === "png" ? undefined : 0.92;

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("CANVAS_BLOB_EMPTY"));
        }
      },
      mimeType,
      quality,
    );
  });
}

export async function downloadMediaWithFormat(params: {
  url: string;
  filename: string;
  format: DownloadFormat;
  mediaKind?: "IMAGE" | "VIDEO" | "FILE";
}): Promise<void> {
  const { url, filename, format, mediaKind = format === "mp4" ? "VIDEO" : "IMAGE" } = params;
  const targetFilename = buildFormattedFilename(filename, format);

  try {
    if (mediaKind === "IMAGE" && (format === "png" || format === "jpg" || format === "webp")) {
      try {
        const blob = await convertImageUrlToBlob(url, format);
        const objectUrl = URL.createObjectURL(blob);
        try {
          triggerBlobDownload(objectUrl, targetFilename);
        } finally {
          window.setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
        }
        return;
      } catch {
        // Fallback when remote CORS prevents canvas tainting
        const response = await fetch(url);
        if (response.ok) {
          const rawBlob = await response.blob();
          const localBlobUrl = URL.createObjectURL(rawBlob);
          try {
            const convertedBlob = await convertImageUrlToBlob(localBlobUrl, format);
            const finalUrl = URL.createObjectURL(convertedBlob);
            try {
              triggerBlobDownload(finalUrl, targetFilename);
            } finally {
              window.setTimeout(() => URL.revokeObjectURL(finalUrl), 5000);
            }
            return;
          } finally {
            URL.revokeObjectURL(localBlobUrl);
          }
        }
      }
    }

    if (url.startsWith("data:") || url.startsWith("blob:")) {
      triggerBlobDownload(url, targetFilename);
      return;
    }

    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        try {
          triggerBlobDownload(objectUrl, targetFilename);
        } finally {
          window.setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
        }
        return;
      }
    } catch {
      // Fallback to direct anchor click
    }

    triggerBlobDownload(url, targetFilename);
  } catch {
    toast.error("Không thể tải tệp xuống. Vui lòng thử lại.");
  }
}
