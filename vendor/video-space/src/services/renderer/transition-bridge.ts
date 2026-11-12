import type { ImageElement, VideoElement } from "@/timeline";
import type { MediaAsset } from "@/media/types";
import type { TCanvasSize } from "@/project/types";
import {
	buildTransformFromParams,
	readOpacityFromParams,
	readBlendModeFromParams,
} from "@/rendering";
import { getSourceTimeAtClipTime } from "@/retime";
import { mediaTimeFromSeconds, roundMediaTime } from "@/wasm";
import {
	isTransitionKind,
	transitionDuration,
} from "@/brandhub/transitions/motion";
import { motionAnimation, paramsAtEnd } from "@/brandhub/transitions/animation";
import { VideoNode } from "./nodes/video-node";
import { ImageNode } from "./nodes/image-node";

export function buildTransitionBridge({
	previous,
	next,
	media,
	canvasSize,
}: {
	previous: VideoElement | ImageElement;
	next: VideoElement | ImageElement;
	media: MediaAsset | undefined;
	canvasSize: TCanvasSize;
}): VideoNode | ImageNode | null {
	const kind = next.params["bh.transition"];
	if (
		!isTransitionKind(kind) ||
		!media?.file ||
		!media.url ||
		Math.abs(previous.startTime + previous.duration - next.startTime) > 1
	)
		return null;
	const requested = next.params["bh.transition.duration"];
	const duration = roundMediaTime({
		time: transitionDuration({
			requested:
				typeof requested === "number"
					? requested
					: mediaTimeFromSeconds({ seconds: 0.5 }),
			previous: previous.duration,
			next: next.duration,
		}),
	});
	if (duration <= 0) return null;
	const params = paramsAtEnd(previous);
	const common = {
		duration,
		timeOffset: next.startTime,
		trimStart: 0,
		trimEnd: 0,
		transform: buildTransformFromParams({ params }),
		opacity: readOpacityFromParams({ params }),
		blendMode: readBlendModeFromParams({ params }),
		animations: motionAnimation({
			params,
			duration,
			kind,
			width: canvasSize.width,
			height: canvasSize.height,
		}),
		effects: previous.effects ?? [],
		masks: previous.masks ?? [],
	};
	if (previous.type === "image")
		return new ImageNode({ ...common, url: media.url });
	const sourceEnd =
		previous.trimStart +
		getSourceTimeAtClipTime({
			clipTime: previous.duration,
			retime: previous.retime,
		});
	// Continue source handles where available; hold the last decodable frame at a source boundary.
	const maxSourceTime = media.duration
		? Math.max(
				0,
				mediaTimeFromSeconds({ seconds: media.duration }) -
					mediaTimeFromSeconds({ seconds: 1 / (media.fps || 30) }),
			)
		: sourceEnd;
	return new VideoNode({
		...common,
		mediaId: media.id,
		file: media.file,
		url: media.url,
		retime: previous.retime,
		trimStart: Math.min(sourceEnd, maxSourceTime),
		maxSourceTime,
	});
}
