import { create } from "zustand";

export interface LightboxMediaItem {
  url: string;
  filename: string;
  mimeType: string;
  byteSize: number;
  senderName?: string;
  senderAvatar?: string;
  sentAt?: string;
  channelName?: string;
  workspaceId?: string;
  channelId?: string;
  attachmentId?: string;
}

interface ChatMediaLightboxStore {
  isOpen: boolean;
  item: LightboxMediaItem | null;
  openLightbox: (item: LightboxMediaItem) => void;
  closeLightbox: () => void;
}

export const useChatMediaLightbox = create<ChatMediaLightboxStore>((set) => ({
  isOpen: false,
  item: null,
  openLightbox: (item) => set({ isOpen: true, item }),
  closeLightbox: () => set({ isOpen: false, item: null }),
}));
