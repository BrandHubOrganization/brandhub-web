import { z } from "zod";

const assetUrl = z.string().startsWith("/video-space/library/assets/");

export const templateRecipeSchema = z.object({
	title: z.string().min(1).max(160),
	subtitle: z.string().max(240),
	accent: z.string().regex(/^#[\da-f]{6}$/i),
	fontFamily: z.string().min(1),
	duration: z.number().min(1).max(60),
	placement: z.enum(["title", "lower-third", "outro"]),
	animation: z.enum(["fade", "slide", "pop", "none"]),
});

export const libraryManifestSchema = z.object({
	data: z.object({
		version: z.literal(1),
		items: z
			.array(
				z.object({
					id: z.string().min(1),
					kind: z.enum(["sound", "music", "sticker", "font", "template"]),
					name: z.string().min(1),
					category: z.string().min(1),
					tags: z.array(z.string()),
					description: z.string().optional(),
					url: assetUrl.optional(),
					previewUrl: assetUrl.optional(),
					duration: z.number().positive().optional(),
					license: z.string(),
					author: z.string(),
					fontFamily: z.string().optional(),
					template: templateRecipeSchema.optional(),
				}),
			)
			.max(500),
	}),
});

export type LibraryItem = z.infer<
	typeof libraryManifestSchema
>["data"]["items"][number];
export type TemplateRecipe = z.infer<typeof templateRecipeSchema>;

let manifestPromise: Promise<LibraryItem[]> | null = null;

export function loadLibrary(): Promise<LibraryItem[]> {
	if (!manifestPromise) {
		manifestPromise = fetch("/video-space/library/manifest.json")
			.then(async (response) => {
				if (!response.ok)
					throw new Error("The resource library could not be loaded.");
				return libraryManifestSchema.parse(await response.json()).data.items;
			})
			.catch((error: unknown) => {
				manifestPromise = null;
				throw error;
			});
	}
	return manifestPromise;
}

export function filterLibrary({
	items,
	kinds,
	category,
	query,
}: {
	items: LibraryItem[];
	kinds: LibraryItem["kind"][];
	category: string;
	query: string;
}): LibraryItem[] {
	const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
	return items.filter(
		(item) =>
			kinds.includes(item.kind) &&
			(category === "All" || item.category === category) &&
			words.every((word) =>
				[item.name, item.category, item.description ?? "", ...item.tags]
					.join(" ")
					.toLocaleLowerCase()
					.includes(word),
			),
	);
}
