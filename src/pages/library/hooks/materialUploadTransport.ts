export function materialUploadLimit(mime: string): number {
  if (["image/jpeg", "image/png", "image/webp"].includes(mime))
    return 20 * 1024 ** 2;
  if (["video/mp4", "video/quicktime"].includes(mime)) return 200 * 1024 ** 2;
  return mime === "application/pdf" ? 25 * 1024 ** 2 : 0;
}

export function putMaterialBytes(
  url: string,
  file: File,
  signal: AbortSignal,
  progress: (percent: number) => void,
): Promise<void> {
  if (signal.aborted)
    return Promise.reject(new DOMException("Upload aborted", "AbortError"));
  const target = new URL(url);
  if (
    target.protocol !== "https:" &&
    !["localhost", "127.0.0.1"].includes(target.hostname)
  ) {
    return Promise.reject(new Error("Unsafe upload endpoint"));
  }
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const abort = () => request.abort();
    request.open("PUT", url);
    request.withCredentials = false;
    request.timeout = 10 * 60 * 1000;
    request.setRequestHeader("Content-Type", file.type);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable)
        progress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      signal.removeEventListener("abort", abort);
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error("Storage upload failed"));
    };
    request.onerror = request.ontimeout = () => {
      signal.removeEventListener("abort", abort);
      reject(new Error("Storage connection failed"));
    };
    request.onabort = () => {
      signal.removeEventListener("abort", abort);
      reject(new DOMException("Upload aborted", "AbortError"));
    };
    signal.addEventListener("abort", abort, { once: true });
    request.send(file);
  });
}
