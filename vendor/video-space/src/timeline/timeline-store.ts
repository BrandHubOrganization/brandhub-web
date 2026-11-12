import { scopeStorageName } from "@/platform/storage-scope";
/**
 * UI state for the timeline
 * For core logic, use EditorCore instead.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TimelineStore {
	toolMode: "select" | "razor";
	setToolMode: (mode: "select" | "razor") => void;
	snappingEnabled: boolean;
	toggleSnapping: () => void;
	rippleEditingEnabled: boolean;
	toggleRippleEditing: () => void;
	mainTrackMagnetEnabled: boolean;
	toggleMainTrackMagnet: () => void;
	expandedElementIds: Set<string>;
	toggleElementExpanded: (elementId: string) => void;
}

export const useTimelineStore = create<TimelineStore>()(
	persist(
		(set) => ({
			toolMode: "select",
			setToolMode: (toolMode) => set({ toolMode }),
			snappingEnabled: true,

			toggleSnapping: () => {
				set((state) => ({ snappingEnabled: !state.snappingEnabled }));
			},

			rippleEditingEnabled: false,
			mainTrackMagnetEnabled: false,
			toggleMainTrackMagnet: () => {
				set((state) => ({
					mainTrackMagnetEnabled: !state.mainTrackMagnetEnabled,
				}));
			},

			toggleRippleEditing: () => {
				set((state) => ({
					rippleEditingEnabled: !state.rippleEditingEnabled,
				}));
			},

			expandedElementIds: new Set<string>(),

			toggleElementExpanded: (elementId) => {
				set((state) => {
					const next = new Set(state.expandedElementIds);
					if (next.has(elementId)) {
						next.delete(elementId);
					} else {
						next.add(elementId);
					}
					return { expandedElementIds: next };
				});
			},
		}),
		{
			name: scopeStorageName("timeline-store"),
			partialize: (state) => ({
				snappingEnabled: state.snappingEnabled,
				rippleEditingEnabled: state.rippleEditingEnabled,
				mainTrackMagnetEnabled: state.mainTrackMagnetEnabled,
			}),
		},
	),
);
