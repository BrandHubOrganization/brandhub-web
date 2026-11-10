export const TRANSITIONS = [
	{ id: "dissolve", name: "Dissolve", description: "Hòa hình mềm" },
	{ id: "slide-left", name: "Slide Left", description: "Trượt sang trái" },
	{ id: "slide-right", name: "Slide Right", description: "Trượt sang phải" },
	{ id: "slide-up", name: "Slide Up", description: "Trượt lên" },
	{ id: "slide-down", name: "Slide Down", description: "Trượt xuống" },
	{ id: "zoom-out", name: "Zoom", description: "Phóng và hòa hình" },
	{ id: "spin", name: "Spin", description: "Xoay và hòa hình" },
] as const;
export type TransitionKind = (typeof TRANSITIONS)[number]["id"];
export const CLIP_MOTIONS = [
	{ id: "fade", name: "Fade" },
	{ id: "slide-left", name: "Slide Left" },
	{ id: "slide-right", name: "Slide Right" },
	{ id: "slide-up", name: "Slide Up" },
	{ id: "slide-down", name: "Slide Down" },
	{ id: "zoom-out", name: "Zoom" },
	{ id: "spin", name: "Spin" },
] as const;
export type ClipMotionKind = (typeof CLIP_MOTIONS)[number]["id"];
export function motionChannels(
	kind: TransitionKind | ClipMotionKind,
): readonly string[] {
	const channels = ["opacity"];
	if (kind === "slide-left" || kind === "slide-right")
		channels.push("transform.positionX");
	if (kind === "slide-up" || kind === "slide-down")
		channels.push("transform.positionY");
	if (kind === "zoom-out" || kind === "spin")
		channels.push("transform.scaleX", "transform.scaleY");
	if (kind === "spin") channels.push("transform.rotate");
	return channels;
}
export interface Motion {
	x: number;
	y: number;
	scale: number;
	rotate: number;
	opacity: number;
}
export function isTransitionKind(value: unknown): value is TransitionKind {
	return TRANSITIONS.some((item) => item.id === value);
}
export function transitionDuration({
	requested,
	previous,
	next,
}: {
	requested: number;
	previous: number;
	next: number;
}): number {
	if (![requested, previous, next].every(Number.isFinite)) return 0;
	return Math.max(0, Math.min(requested, previous / 2, next / 2));
}
export function transitionMotion({
	kind,
	progress,
	width,
	height,
}: {
	kind: TransitionKind;
	progress: number;
	width: number;
	height: number;
}): Motion {
	const p = Math.max(0, Math.min(1, progress));
	const motion: Motion = {
		x: 0,
		y: 0,
		scale: 1,
		rotate: 0,
		opacity: p === 1 ? 0 : 1,
	};
	if (p === 0) return motion;
	if (kind === "dissolve") motion.opacity = 1 - p;
	if (kind === "slide-left") motion.x = -width * p;
	if (kind === "slide-right") motion.x = width * p;
	if (kind === "slide-up") motion.y = -height * p;
	if (kind === "slide-down") motion.y = height * p;
	if (kind === "zoom-out") {
		motion.scale = 1 + 0.4 * p;
		motion.opacity = 1 - p;
	}
	if (kind === "spin") {
		motion.rotate = 25 * p;
		motion.scale = 1 + 0.15 * p;
		motion.opacity = 1 - p;
	}
	return motion;
}
export function clipMotion({
	kind,
	edge,
	progress,
	width,
	height,
}: {
	kind: ClipMotionKind;
	edge: "in" | "out";
	progress: number;
	width: number;
	height: number;
}): Motion {
	const p = edge === "out" ? progress : 1 - progress;
	const motion = transitionMotion({
		kind: kind === "fade" ? "dissolve" : kind,
		progress: p,
		width,
		height,
	});
	if (edge === "in") motion.opacity = 1 - p;
	return motion;
}
