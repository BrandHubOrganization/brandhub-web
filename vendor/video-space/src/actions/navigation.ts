export function getAdjacentClipBoundary({
	elements,
	time,
	direction,
}: {
	elements: readonly { startTime: number; duration: number }[];
	time: number;
	direction: "previous" | "next";
}): number | null {
	let nearest: number | null = null;
	for (const element of elements) {
		for (const boundary of [
			element.startTime,
			element.startTime + element.duration,
		]) {
			if (
				direction === "previous" &&
				boundary < time &&
				(nearest === null || boundary > nearest)
			)
				nearest = boundary;
			if (
				direction === "next" &&
				boundary > time &&
				(nearest === null || boundary < nearest)
			)
				nearest = boundary;
		}
	}
	return nearest;
}
