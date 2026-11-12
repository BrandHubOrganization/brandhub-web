import Image from "next/image";
import type { CSSProperties } from "react";
import type { LibraryItem } from "./catalog";

export function ResourceArtwork({
	item,
	time,
}: {
	item: LibraryItem;
	time?: number;
}) {
	if (item.kind === "sticker" && item.url)
		return (
			<Image
				src={item.previewUrl ?? item.url}
				alt={item.name}
				width={640}
				height={640}
				unoptimized
				className="bh-resource-sticker"
			/>
		);
	if (item.template) {
		const recipe = item.template;
		const progress =
			time === undefined || recipe.animation === "none"
				? 1
				: Math.min(time / 0.4, 1);
		const motion: CSSProperties | undefined =
			time === undefined
				? undefined
				: {
						opacity: progress,
						transform:
							recipe.animation === "slide"
								? `translateY(${(1 - progress) * 24}px)`
								: recipe.animation === "pop"
									? `scale(${0.75 + progress * 0.25})`
									: undefined,
					};
		const style: CSSProperties & { "--recipe-accent": string } = {
			"--recipe-accent": recipe.accent,
			fontFamily: recipe.fontFamily,
		};
		return (
			<div
				className={`bh-resource-template bh-template-${recipe.placement} bh-motion-${recipe.animation}`}
				style={style}
			>
				<i style={motion} />
				<strong style={motion}>{recipe.title}</strong>
				<span style={motion}>{recipe.subtitle}</span>
			</div>
		);
	}
	return (
		<div className="bh-resource-font" style={{ fontFamily: item.fontFamily }}>
			<span>Aa</span>
			<small>Sáng tạo theo cách của bạn</small>
		</div>
	);
}
