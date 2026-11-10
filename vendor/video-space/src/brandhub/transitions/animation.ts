import type {
	ChannelData,
	ElementAnimations,
	ScalarAnimationChannel,
} from "@/animation/types";
import { isScalarChannel } from "@/animation/interpolation";
import { isLeafChannelData } from "@/animation/channel-data";
import { resolveAnimationPathValueAtTime } from "@/animation/resolve";
import type { ParamValues } from "@/params";
import type { VisualElement } from "@/timeline";
import { roundMediaTime, type MediaTime } from "@/wasm";
import {
	clipMotion,
	transitionMotion,
	motionChannels,
	type ClipMotionKind,
	type TransitionKind,
} from "./motion";

const KEYS = [
	"opacity",
	"transform.positionX",
	"transform.positionY",
	"transform.scaleX",
	"transform.scaleY",
	"transform.rotate",
] as const;
const BASE = [1, 0, 0, 1, 1, 0];
export function paramsAtEnd(element: VisualElement): ParamValues {
	return {
		...element.params,
		...Object.fromEntries(
			KEYS.map((path, index) => [
				path,
				resolveAnimationPathValueAtTime({
					animations: element.animations,
					propertyPath: path,
					localTime: element.duration,
					fallbackValue:
						typeof element.params[path] === "number"
							? element.params[path]
							: BASE[index],
				}),
			]),
		),
	};
}

export function motionAnimation({
	params,
	duration,
	kind,
	width,
	height,
	edge,
	start = 0,
	original,
}: {
	params: ParamValues;
	duration: MediaTime;
	kind: TransitionKind | ClipMotionKind;
	width: number;
	height: number;
	edge?: "in" | "out";
	start?: number;
	original?: ElementAnimations;
}): ElementAnimations {
	const result = { ...original };
	for (const [index, path] of KEYS.entries()) {
		if (!motionChannels(kind).includes(path)) continue;
		const baseline = resolveAnimationPathValueAtTime({
			animations: original,
			propertyPath: path,
			localTime: edge === "out" ? start : start + duration,
			fallbackValue:
				typeof params[path] === "number" ? params[path] : BASE[index],
		});
		const data: ChannelData | undefined = original?.[path];
		const oldKeys =
			isLeafChannelData(data) && isScalarChannel(data) ? data.keys : [];
		const tag = edge ?? "transition";
		const channel: ScalarAnimationChannel = {
			...(isLeafChannelData(data) && isScalarChannel(data) ? data : {}),
			keys: [
				...oldKeys.filter(
					(key) =>
						!key.id.startsWith(`bh-motion-${tag}:`) &&
						(key.time < start || key.time > start + duration),
				),
				...[0, 0.25, 0.5, 0.75, 1].map((point) => {
					const eased = point * point * (3 - 2 * point);
					const motion = edge
						? clipMotion({
								kind: kind === "dissolve" ? "fade" : kind,
								edge,
								progress: eased,
								width,
								height,
							})
						: transitionMotion({
								kind: kind === "fade" ? "dissolve" : kind,
								progress: eased,
								width,
								height,
							});
					const values = [
						baseline * motion.opacity,
						baseline + motion.x,
						baseline + motion.y,
						baseline * motion.scale,
						baseline * motion.scale,
						baseline + motion.rotate,
					];
					const time = roundMediaTime({ time: start + point * duration });
					return {
						id: `bh-motion-${tag}:${path}:${time}`,
						time,
						value: values[index],
						segmentToNext: "linear" as const,
						tangentMode: "auto" as const,
					};
				}),
			].sort((a, b) => a.time - b.time),
		};
		// A flat channel is still an anchor, preventing inherited animation outside this window from jumping.
		result[path] = channel;
	}
	return result;
}

export function removeMotion({
	animations,
	edge,
}: {
	animations: ElementAnimations | undefined;
	edge: "in" | "out";
}): ElementAnimations {
	const next = { ...animations };
	for (const path of KEYS) {
		const channel = next[path];
		if (isLeafChannelData(channel) && isScalarChannel(channel)) {
			const keys = channel.keys.filter(
				(key) => !key.id.startsWith(`bh-motion-${edge}:`),
			);
			if (keys.length) next[path] = { ...channel, keys };
			else delete next[path];
		}
	}
	return next;
}
