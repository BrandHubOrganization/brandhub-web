import { create } from "zustand";
import type { LibraryItem } from "./catalog";

export const useResourcePreviewStore = create<{
	item: LibraryItem | null;
	open: (item: LibraryItem) => void;
	close: () => void;
}>((set) => ({
	item: null,
	open: (item) => set({ item }),
	close: () => set({ item: null }),
}));
