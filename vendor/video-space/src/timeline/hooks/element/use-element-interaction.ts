import { useEffect, useReducer, useState, type RefObject } from "react";
import { useEditor } from "@/editor/use-editor";
import { useCommittedRef } from "@/hooks/use-committed-ref";
import { useShiftKey } from "@/hooks/use-shift-key";
import { useElementSelection } from "@/timeline/hooks/element/use-element-selection";
import { registerCanceller } from "@/editor/cancel-interaction";
import {
	ElementInteractionController,
	type ElementInteractionDeps,
	type ElementInteractionDepsRef,
} from "@/timeline/controllers/element-interaction-controller";
import type { SnapPoint } from "@/timeline/snapping";
import { useTimelineStore } from "@/timeline/timeline-store";
import { BASE_TIMELINE_PIXELS_PER_SECOND } from "@/timeline/scale";
import { roundFrameTime, roundMediaTime, TICKS_PER_SECOND } from "@/wasm";

interface UseElementInteractionProps {
	zoomLevel: number;
	tracksContainerRef: RefObject<HTMLDivElement | null>;
	tracksScrollRef: RefObject<HTMLDivElement | null>;
	headerRef?: RefObject<HTMLElement | null>;
	snappingEnabled: boolean;
	onSnapPointChange?: (snapPoint: SnapPoint | null) => void;
}

export function useElementInteraction({
	zoomLevel,
	tracksContainerRef,
	tracksScrollRef,
	headerRef,
	snappingEnabled,
	onSnapPointChange,
}: UseElementInteractionProps) {
	const editor = useEditor();
	const isShiftHeldRef = useShiftKey();
	const selection = useElementSelection();

	const deps: ElementInteractionDeps = {
		viewport: {
			getZoomLevel: () => zoomLevel,
			getTracksScrollEl: () => tracksScrollRef.current,
			getTracksContainerEl: () => tracksContainerRef.current,
			getHeaderEl: () => headerRef?.current ?? null,
		},
		input: {
			isShiftHeld: () => isShiftHeldRef.current,
		},
		scene: {
			getTracks: () => editor.scenes.getActiveScene().tracks,
			getActiveFps: () => editor.project.getActive()?.settings.fps ?? null,
		},
		selection: {
			getSelected: () => selection.selectedElements,
			isSelected: selection.isElementSelected,
			select: selection.selectElement,
			handleClick: selection.handleElementClick,
			clearKeyframeSelection: () => editor.selection.clearKeyframeSelection(),
		},
		playback: {
			getCurrentTime: () => editor.playback.getCurrentTime(),
		},
		timeline: {
			moveElements: (args) => editor.timeline.moveElements(args),
		},
		snap: {
			isEnabled: () => snappingEnabled,
			onChange: onSnapPointChange,
		},
	};
	const depsRef = useCommittedRef(deps) as ElementInteractionDepsRef;
	const [controller] = useState(
		() => new ElementInteractionController({ depsRef }),
	);

	const [, rerender] = useReducer((n: number) => n + 1, 0);
	useEffect(() => controller.subscribe(rerender), [controller]);

	useEffect(() => {
		if (!controller.isActive) return;
		return registerCanceller({ fn: () => controller.cancel() });
	}, [controller.isActive, controller]);

	useEffect(() => () => controller.destroy(), [controller]);

	return {
		dragView: controller.view,
		handleElementMouseDown: (
			args: Parameters<typeof controller.onElementMouseDown>[0],
		) => {
			if (
				useTimelineStore.getState().toolMode === "razor" &&
				args.event.button === 0
			) {
				args.event.stopPropagation();
				return;
			}
			controller.onElementMouseDown(args);
		},
		handleElementClick: (
			args: Parameters<typeof controller.onElementClick>[0],
		) => {
			if (
				useTimelineStore.getState().toolMode !== "razor" ||
				args.event.button !== 0
			) {
				controller.onElementClick(args);
				return;
			}
			const { event, element, track } = args;
			event.stopPropagation();
			const fps = editor.project.getActive().settings.fps;
			const offset =
				(event.clientX - event.currentTarget.getBoundingClientRect().left) /
				(BASE_TIMELINE_PIXELS_PER_SECOND * zoomLevel);
			const splitTime = roundFrameTime({
				time: roundMediaTime({
					time: element.startTime + offset * TICKS_PER_SECOND,
				}),
				fps,
			});
			if (
				splitTime <= element.startTime ||
				splitTime >= element.startTime + element.duration
			)
				return;
			editor.timeline.splitElements({
				elements: [{ trackId: track.id, elementId: element.id }],
				splitTime,
			});
		},
	};
}
