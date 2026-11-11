import type { EffectDefinition } from "@/effects/types";

const controls = [
	{ key: "brightness", label: "Độ sáng", default: 100, min: 0, max: 200 },
	{ key: "contrast", label: "Tương phản", default: 100, min: 0, max: 200 },
	{ key: "saturation", label: "Bão hòa", default: 100, min: 0, max: 200 },
	{ key: "temperature", label: "Ấm / lạnh", default: 0, min: -100, max: 100 },
	{ key: "sepia", label: "Sắc nâu", default: 0, min: 0, max: 100 },
	{ key: "grayscale", label: "Đen trắng", default: 0, min: 0, max: 100 },
] as const;

export function colorDefinition({
	type,
	name,
	defaults = {},
	category = "filter",
}: {
	type: string;
	name: string;
	defaults?: Record<string, number>;
	category?: "filter" | "adjustment";
}): EffectDefinition {
	return {
		type,
		name,
		category,
		keywords: [name, "color", "màu", category],
		params: controls.map((control) => ({
			...control,
			type: "number",
			step: 1,
			default: defaults[control.key] ?? control.default,
		})),
		renderer: {
			passes: [
				{
					shader: "color-adjust",
					uniforms: ({ effectParams }) =>
						Object.fromEntries(
							controls.map((control) => [
								`u_${control.key}`,
								Number(
									effectParams[control.key] ??
										defaults[control.key] ??
										control.default,
								) / 100,
							]),
						),
				},
			],
		},
	};
}

export const colorEffectDefinitions: EffectDefinition[] = [
	colorDefinition({
		type: "color-adjust",
		name: "Điều chỉnh màu",
		category: "adjustment",
	}),
	colorDefinition({
		type: "filter-warm",
		name: "Ấm áp",
		defaults: {
			brightness: 104,
			contrast: 105,
			saturation: 110,
			temperature: 35,
		},
	}),
	colorDefinition({
		type: "filter-cool",
		name: "Mát dịu",
		defaults: {
			brightness: 102,
			contrast: 105,
			saturation: 95,
			temperature: -35,
		},
	}),
	colorDefinition({
		type: "filter-cinema",
		name: "Điện ảnh",
		defaults: {
			brightness: 98,
			contrast: 120,
			saturation: 82,
			temperature: -8,
		},
	}),
	colorDefinition({
		type: "filter-vintage",
		name: "Hoài cổ",
		defaults: { brightness: 106, contrast: 88, saturation: 78, sepia: 35 },
	}),
	colorDefinition({
		type: "filter-mono",
		name: "Đen trắng",
		defaults: { contrast: 112, grayscale: 100 },
	}),
	colorDefinition({
		type: "filter-vivid",
		name: "Rực rỡ",
		defaults: { contrast: 108, saturation: 140 },
	}),
	colorDefinition({
		type: "filter-soft",
		name: "Mềm mại",
		defaults: { brightness: 108, contrast: 90, saturation: 92 },
	}),
	colorDefinition({
		type: "filter-sepia",
		name: "Nâu cổ điển",
		defaults: { contrast: 102, sepia: 85, saturation: 85 },
	}),
];
