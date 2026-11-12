import type { SceneTracks, VideoElement, ImageElement } from "./types";

/** Close empty main-track intervals without changing overlaps or other tracks. */
export function compactMainTrack({
	tracks,
}: {
	tracks: SceneTracks;
}): SceneTracks {
	let occupiedEnd = 0;
	let removedGap = 0;
	const moved = new Map<string, VideoElement | ImageElement>();
	for (const element of [...tracks.main.elements].sort(
		(a, b) => a.startTime - b.startTime,
	)) {
		removedGap += Math.max(0, element.startTime - occupiedEnd);
		occupiedEnd = Math.max(occupiedEnd, element.startTime + element.duration);
		if (removedGap > 0) {
			// Integer tick subtraction preserves the MediaTime brand.
			// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
			moved.set(element.id, {
				...element,
				startTime: element.startTime - removedGap,
			} as typeof element);
		}
	}
	if (moved.size === 0) return tracks;
	return {
		...tracks,
		main: {
			...tracks.main,
			elements: tracks.main.elements.map(
				(element) => moved.get(element.id) ?? element,
			),
		},
	};
}
