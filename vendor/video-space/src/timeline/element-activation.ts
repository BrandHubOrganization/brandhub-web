import type {
	ElementRef,
	SceneTracks,
	TimelineElement,
	TimelineTrack,
} from "./types";

// Params travel with clips through clipboard, project snapshots and Undo/Redo.
const DISABLED = "editor.disabled";
const PREVIOUS_HIDDEN = "editor.disabled.hidden";
const PREVIOUS_MUTED = "editor.disabled.muted";
const UNSET = "unset";

export function toggleSelectedElementsEnabled({
	tracks,
	elements,
}: {
	tracks: SceneTracks;
	elements: readonly ElementRef[];
}): SceneTracks {
	const selected = new Map<string, Set<string>>();
	for (const { trackId, elementId } of elements) {
		const ids = selected.get(trackId) ?? new Set<string>();
		ids.add(elementId);
		selected.set(trackId, ids);
	}
	const targets = [...tracks.overlay, tracks.main, ...tracks.audio].flatMap(
		(track) =>
			track.elements.filter((element) =>
				selected.get(track.id)?.has(element.id),
			),
	);
	if (targets.length === 0) return tracks;
	const disable = targets.some((element) => element.params[DISABLED] !== true);
	const updateTrack = <T extends TimelineTrack>(track: T): T => ({
		...track,
		elements: track.elements.map((element) =>
			selected.get(track.id)?.has(element.id)
				? setElementDisabled({ element, disable })
				: element,
		),
	});
	return {
		overlay: tracks.overlay.map(updateTrack),
		main: updateTrack(tracks.main),
		audio: tracks.audio.map(updateTrack),
	};
}

function setElementDisabled({
	element,
	disable,
}: {
	element: TimelineElement;
	disable: boolean;
}): TimelineElement {
	if ((element.params[DISABLED] === true) === disable) return element;
	const params = { ...element.params };
	const hasAudio = element.type === "video" || element.type === "audio";
	const visual: TimelineElement & { hidden?: boolean } = element;
	if (disable) {
		params[DISABLED] = true;
		if (element.type !== "audio")
			params[PREVIOUS_HIDDEN] = visual.hidden ?? UNSET;
		if (hasAudio) {
			params[PREVIOUS_MUTED] = params.muted ?? UNSET;
			params.muted = true;
		}
		if (element.type === "audio") return { ...element, params };
		const disabled: TimelineElement & { hidden?: boolean } = {
			...visual,
			params,
			hidden: true,
		};
		return disabled;
	}
	const hidden = params[PREVIOUS_HIDDEN];
	const muted = params[PREVIOUS_MUTED];
	delete params[DISABLED];
	delete params[PREVIOUS_HIDDEN];
	delete params[PREVIOUS_MUTED];
	if (hasAudio) {
		if (muted === UNSET) delete params.muted;
		else params.muted = muted;
	}
	if (element.type === "audio") return { ...element, params };
	const restored = { ...visual, params };
	if (hidden === UNSET) delete restored.hidden;
	else restored.hidden = hidden === true;
	return restored;
}
