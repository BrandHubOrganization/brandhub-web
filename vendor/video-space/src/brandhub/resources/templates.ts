import {
	buildGraphicElement,
	buildTextElement,
} from "@/timeline/element-utils";
import type { CreateTimelineElement } from "@/timeline";
import type {
	ElementAnimations,
	ScalarAnimationChannel,
} from "@/animation/types";
import { mediaTimeFromSeconds, type MediaTime } from "@/wasm";
import { generateUUID } from "@/utils/id";
import type { TemplateRecipe } from "./catalog";
export function entranceAnimation({
	animation,
	y,
}: {
	animation: TemplateRecipe["animation"];
	y: number;
}): ElementAnimations | undefined {
	if (animation === "none") return undefined;
	const channel = ({
		values,
	}: {
		values: number[];
	}): ScalarAnimationChannel => ({
		keys: values.map((value, index) => ({
			id: generateUUID(),
			time: mediaTimeFromSeconds({ seconds: index === 0 ? 0 : 0.4 }),
			value,
			segmentToNext: "linear",
			tangentMode: "auto",
		})),
	});
	const animations: ElementAnimations = {
		opacity: channel({ values: [0, 1] }),
	};
	if (animation === "slide")
		animations["transform.positionY"] = channel({ values: [y + 48, y] });
	if (animation === "pop") {
		animations["transform.scaleX"] = channel({ values: [0.75, 1] });
		animations["transform.scaleY"] = channel({ values: [0.75, 1] });
	}
	return animations;
}

export function buildTemplateElements({
	recipe,
	name,
	startTime,
	canvasSize,
}: {
	recipe: TemplateRecipe;
	name: string;
	startTime: MediaTime;
	canvasSize: { width: number; height: number };
}): CreateTimelineElement[] {
	const { width, height } = canvasSize;
	const isLower = recipe.placement === "lower-third";
	const titleY = isLower ? height * 0.29 : -height * 0.035;
	const x = isLower ? -width * 0.24 : 0;
	const duration = mediaTimeFromSeconds({ seconds: recipe.duration });
	const text = ({
		content,
		y,
		size,
		color,
		bold,
	}: {
		content: string;
		y: number;
		size: number;
		color: string;
		bold: boolean;
	}): CreateTimelineElement => ({
		...buildTextElement({
			raw: {
				name: `${name} - ${bold ? "Title" : "Subtitle"}`,
				duration,
				params: {
					content,
					fontFamily: recipe.fontFamily,
					fontSize: Math.min(
						size,
						(width * (isLower ? 0.38 : 0.84) * 90) /
							(Math.max(content.length, 1) * 0.65 * height),
					),
					fontWeight: bold ? "bold" : "normal",
					color,
					textAlign: "center",
					"transform.positionX": x,
					"transform.positionY": y,
				},
			},
			startTime,
		}),
		animations: entranceAnimation({ animation: recipe.animation, y }),
	});
	const accent = buildGraphicElement({
		definitionId: "rectangle",
		name: `${name} - Accent`,
		startTime,
		params: {
			fill: recipe.accent,
			"transform.scaleX": isLower ? 0.035 : 0.28,
			"transform.scaleY": isLower ? 0.17 : 0.008,
			"transform.positionX": isLower ? -width * 0.44 : 0,
			"transform.positionY": isLower ? height * 0.32 : -height * 0.16,
		},
	});
	accent.duration = duration;
	const elements: CreateTimelineElement[] = [
		text({
			content: recipe.title,
			y: titleY,
			size: isLower ? 5.2 : 7.5,
			color: "#ffffff",
			bold: true,
		}),
		text({
			content: recipe.subtitle || "Your story, your way",
			y: titleY + height * 0.095,
			size: 2.8,
			color: "#e5e5e5",
			bold: false,
		}),
		accent,
	];
	if (recipe.placement === "outro") {
		const background = buildGraphicElement({
			definitionId: "rectangle",
			name: `${name} - Background`,
			startTime,
			params: {
				fill: "#111216",
				"transform.scaleX": width / Math.min(width, height),
				"transform.scaleY": height / Math.min(width, height),
			},
		});
		background.duration = duration;
		elements.push(background);
	}
	return elements;
}
