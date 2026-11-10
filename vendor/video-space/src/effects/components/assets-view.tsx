"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { toast } from "sonner";
import {
	AddClipEffectCommand,
	RemoveClipEffectCommand,
	BatchCommand,
	type Command,
} from "@/commands";
import { isVisualElement } from "@/timeline";
import { usePropertiesStore } from "@/components/editor/panels/properties/stores/properties-store";
import { useResourcePreviewStore } from "@/brandhub/resources/preview-store";
import "./color-library.css";
import { PanelView } from "@/components/editor/panels/assets/views/base-panel";
import { DraggableItem } from "@/components/editor/panels/assets/draggable-item";
import { effectsRegistry, EFFECT_TARGET_ELEMENT_TYPES } from "@/effects";
import { effectPreviewService } from "@/services/renderer/effect-preview";
import { useEditor } from "@/editor/use-editor";
import { buildEffectElement } from "@/timeline/element-utils";
import type { EffectDefinition } from "@/effects/types";

export function EffectsView() {
	const effects = effectsRegistry
		.getAll()
		.filter((effect) => effect.category !== "filter");

	return (
		<PanelView title="Effects · Điều chỉnh">
			<p className="bh-filter-hint">
				Chọn clip để thêm hiệu ứng; chỉnh thông số ở tab Effects bên phải.
			</p>
			<EffectsGrid effects={effects} />
		</PanelView>
	);
}

export function FiltersView() {
	const editor = useEditor();
	const selected = useEditor((e) => e.selection.getSelectedElements());
	useEditor((e) => e.scenes.getActiveScene().tracks);
	const [query, setQuery] = useState("");
	const targets = editor.timeline.getElementsWithTracks({ elements: selected });
	const hasTarget = targets.some(({ element }) => isVisualElement(element));
	const filters = effectsRegistry
		.getAll()
		.filter((effect) => effect.category === "filter");
	const shown = filters.filter((effect) =>
		`${effect.name} ${effect.type}`
			.toLocaleLowerCase()
			.includes(query.trim().toLocaleLowerCase()),
	);
	const selectedFilter = targets
		.flatMap(({ element }) =>
			isVisualElement(element) ? (element.effects ?? []) : [],
		)
		.find(
			(effect) =>
				effectsRegistry.has(effect.type) &&
				effectsRegistry.get(effect.type).category === "filter",
		);

	function applyFilter(effectType?: string) {
		const commands: Command[] = [];
		for (const { element, track } of targets) {
			if (!isVisualElement(element)) continue;
			for (const effect of element.effects ?? []) {
				if (
					effectsRegistry.has(effect.type) &&
					effectsRegistry.get(effect.type).category === "filter"
				) {
					commands.push(
						new RemoveClipEffectCommand({
							trackId: track.id,
							elementId: element.id,
							effectId: effect.id,
						}),
					);
				}
			}
			if (effectType)
				commands.push(
					new AddClipEffectCommand({
						trackId: track.id,
						elementId: element.id,
						effectType,
					}),
				);
			usePropertiesStore
				.getState()
				.setActiveTab({ elementType: element.type, tabId: "effects" });
		}
		if (!commands.length) return;
		editor.command.execute({ command: new BatchCommand(commands) });
		useResourcePreviewStore.getState().close();
		toast.success(
			effectType
				? `Đã áp dụng ${effectsRegistry.get(effectType).name}`
				: "Đã bỏ bộ lọc",
		);
	}

	return (
		<PanelView title="Filters · Bộ lọc màu" aria-label="Bộ lọc màu">
			<input
				className="bh-filter-search"
				aria-label="Tìm bộ lọc"
				placeholder="Tìm bộ lọc..."
				value={query}
				onChange={(event) => setQuery(event.target.value)}
			/>
			<p className="bh-filter-hint">
				{hasTarget
					? "Bấm mẫu để áp dụng. Mẫu mới thay bộ lọc cũ; chỉnh màu ở bên phải."
					: "Chọn một clip hoặc ảnh trên timeline để áp dụng bộ lọc."}
			</p>
			<button
				className="bh-filter-clear"
				type="button"
				disabled={!hasTarget || !selectedFilter}
				onClick={() => applyFilter()}
			>
				Bỏ bộ lọc
			</button>
			<div className="bh-filter-grid">
				{shown.map((effect) => (
					<button
						className="bh-filter-card"
						key={effect.type}
						type="button"
						disabled={!hasTarget}
						aria-label={`Áp dụng ${effect.name}`}
						aria-pressed={selectedFilter?.type === effect.type}
						onClick={() => applyFilter(effect.type)}
					>
						<div className="bh-filter-art">
							<EffectPreviewCanvas effectType={effect.type} />
						</div>
						<span>{effect.name}</span>
					</button>
				))}
			</div>
			{shown.length === 0 && (
				<p className="bh-filter-hint">Không tìm thấy bộ lọc.</p>
			)}
		</PanelView>
	);
}

function EffectsGrid({ effects }: { effects: EffectDefinition[] }) {
	return (
		<div
			className="grid gap-2"
			style={{ gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))" }}
		>
			{effects.map((effect) => (
				<div
					key={effect.type}
					role="group"
					aria-label={`${effect.name} effect`}
				>
					<EffectItem effect={effect} />
				</div>
			))}
		</div>
	);
}

function EffectPreviewCanvas({ effectType }: { effectType: string }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const render = () => {
			if (canvasRef.current) {
				effectPreviewService.renderPreview({
					effectType,
					params: {},
					targetCanvas: canvasRef.current,
				});
			}
		};

		render();
		return effectPreviewService.onPreviewImageReady({ callback: render });
	}, [effectType]);

	return <canvas ref={canvasRef} className="size-full" />;
}

function EffectItem({ effect }: { effect: EffectDefinition }) {
	const editor = useEditor();

	const handleAddToTimeline = useCallback(() => {
		const selected = editor.timeline.getElementsWithTracks({
			elements: editor.selection.getSelectedElements(),
		});
		const target = selected.find(({ element }) => isVisualElement(element));
		if (target && isVisualElement(target.element)) {
			const { element, track } = target;
			if (
				effect.category !== "adjustment" ||
				!element.effects?.some((existing) => existing.type === effect.type)
			) {
				editor.timeline.addClipEffect({
					trackId: track.id,
					elementId: element.id,
					effectType: effect.type,
				});
			}
			usePropertiesStore
				.getState()
				.setActiveTab({ elementType: element.type, tabId: "effects" });
			return;
		}
		const currentTime = editor.playback.getCurrentTime();
		const element = buildEffectElement({
			effectType: effect.type,
			startTime: currentTime,
		});

		editor.timeline.insertElement({
			placement: { mode: "auto", trackType: "effect" },
			element,
		});
	}, [editor, effect.type, effect.category]);

	const preview = <EffectPreviewCanvas effectType={effect.type} />;

	return (
		<DraggableItem
			name={effect.name}
			preview={preview}
			dragData={{
				id: effect.type,
				name: effect.name,
				type: "effect",
				effectType: effect.type,
				targetElementTypes: EFFECT_TARGET_ELEMENT_TYPES,
			}}
			onAddToTimeline={handleAddToTimeline}
			aspectRatio={1}
			isRounded
			variant="card"
			containerClassName="w-full"
		/>
	);
}
