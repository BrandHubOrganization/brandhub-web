let namespace: string | undefined;

export function initializeStorageScope(userId: string, workspaceId: string): void {
  if (!userId.trim() || !workspaceId.trim()) throw new Error("Missing storage context");
  const encoded = Array.from(new TextEncoder().encode(JSON.stringify([userId, workspaceId])),
    (byte) => String.fromCharCode(byte)).join("");
  const next = `brandhub-video-space-v1-${btoa(encoded).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")}`;
  if (namespace && namespace !== next) throw new Error("Reload the editor to change storage context");
  namespace = next;
}

export function scopeStorageName(name: string): string {
  if (!namespace) throw new Error("Storage context must be initialized before editor imports");
  return `${namespace}--${name}`;
}
