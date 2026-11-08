import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { chatAttachmentService } from "@/pages/chat/services/chatAttachmentService";
import type { ChatAttachmentDraft } from "@/pages/chat/types/chatAttachment";
import type { MaterialItem } from "@/types/material";

export function useChatAttachmentDraft(workspace?: string, channel?: string) {
  const { t } = useTranslation();
  const [items, setItems] = useState<ChatAttachmentDraft[]>([]);
  const [error, setError] = useState("");
  const current = useRef<ChatAttachmentDraft[]>([]);
  const controllers = useRef(new Set<AbortController>());
  const update = (next: ChatAttachmentDraft[]) => {
    current.current = next;
    setItems(next);
  };
  useEffect(() => {
    const requests = controllers.current;
    return () => {
      requests.forEach((c) => c.abort());
      requests.clear();
    };
  }, []);
  const run = async (
    key: string,
    load: (
      signal: AbortSignal,
    ) => ReturnType<typeof chatAttachmentService.upload>,
  ) => {
    const controller = new AbortController();
    controllers.current.add(controller);
    try {
      const attachment = await load(controller.signal);
      if (!controller.signal.aborted)
        update(
          current.current.map((item) =>
            item.key === key ? { ...item, status: "ready", attachment } : item,
          ),
        );
    } catch {
      if (!controller.signal.aborted) {
        update(
          current.current.map((item) =>
            item.key === key ? { ...item, status: "error" } : item,
          ),
        );
        setError(t("chat.attachments.failed"));
      }
    } finally {
      controllers.current.delete(controller);
    }
  };
  const addFiles = (files: File[]) => {
    if (!workspace || !channel) return;
    setError("");
    for (const file of files) {
      if (
        !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
          file.type,
        ) ||
        file.size === 0 ||
        file.size > 10 * 1024 * 1024
      ) {
        setError(t("chat.attachments.invalidFile"));
        continue;
      }
      if (current.current.length >= 5) {
        setError(t("chat.attachments.limit"));
        break;
      }
      const key = crypto.randomUUID();
      update([
        ...current.current,
        { key, filename: file.name, status: "uploading", file },
      ]);
      void run(key, (signal) =>
        chatAttachmentService.upload(workspace, channel, file, signal),
      );
    }
  };
  const addMaterial = async (material: MaterialItem) => {
    if (!workspace || !channel || current.current.length >= 5) return;
    setError("");
    const key = crypto.randomUUID();
    update([
      ...current.current,
      { key, filename: material.name, status: "uploading" },
    ]);
    await run(key, (signal) =>
      chatAttachmentService.repository(
        workspace,
        channel,
        material.id,
        material.currentVersionNumber ?? 1,
        signal,
      ),
    );
  };
  const retry = (key: string) => {
    const item = current.current.find((value) => value.key === key);
    if (!item?.file || !workspace || !channel) return;
    update(
      current.current.map((value) =>
        value.key === key ? { ...value, status: "uploading" } : value,
      ),
    );
    void run(key, (signal) =>
      chatAttachmentService.upload(workspace, channel, item.file!, signal),
    );
  };
  return {
    items,
    error,
    addFiles,
    addMaterial,
    retry,
    ids: items.flatMap((item) =>
      item.status === "ready" && item.attachment ? [item.attachment.id] : [],
    ),
    busy: items.some((item) => item.status !== "ready"),
    remove: (key: string) => {
      update(current.current.filter((item) => item.key !== key));
      if (!current.current.some((item) => item.status === "error"))
        setError("");
    },
    clear: () => {
      update([]);
      setError("");
    },
  };
}
