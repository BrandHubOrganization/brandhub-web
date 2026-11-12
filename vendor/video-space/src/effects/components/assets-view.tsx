"use client";

import {
	useEffect,
	useRef,
	useCallback,
	useState,
	useSyncExternalStore,
} from "react";
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
import { getHostContext, subscribeHostContext } from "@/platform/host";
import {
	editorResourceMessages,
	effectName,
} from "@/brandhub/resources/messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PanelView } from "@/components/editor/panels/assets/views/base-panel";
import { DraggableItem } from "@/components/editor/panels/assets/draggable-item";
import { effectsRegistry, EFFECT_TARGET_ELEMENT_TYPES } from "@/effects";
import { effectPreviewService } from "@/services/renderer/effect-preview";
import { useEditor } from "@/editor/use-editor";
import { buildEffectElement } from "@/timeline/element-utils";
import type { EffectDefinition } from "@/effects/types";

export function EffectsView() {
	const { locale } = useSyncExternalStore(subscribeHostContext, getHostContext);
	const t = editorResourceMessages[locale];
	const effects = effectsRegistry
		.getAll()
		.filter((effect) => effect.category !== "filter");

	return (
		<PanelView title={t.effects}>
			<p className="bh-filter-hint">{t.effectHint}</p>
			<EffectsGrid effects={effects} />
		</PanelView>
	);
}

export function FiltersView() {
	const { locale } = useSyncExternalStore(subscribeHostContext, getHostContext);
	const t = editorResourceMessages[locale];
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
		`${effectName(effect.type, locale, effect.name)} ${effect.type}`
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
				? t.applied.replace(
						"{name}",
						effectName(
							effectType,
							locale,
							effectsRegistry.get(effectType).name,
						),
					)
				: t.cleared,
		);
	}

	return (
		<PanelView title={t.filters} aria-label={t.filters}>
			<Input
				className="bh-filter-search"
				aria-label={t.searchFilters}
				placeholder={t.searchFilters}
				value={query}
				onChange={(event) => setQuery(event.target.value)}
			/>
			<p className="bh-filter-hint">
				{hasTarget ? t.filterHint : t.selectClip}
			</p>
			<Button
				variant="outline"
				size="sm"
				className="bh-filter-clear"
				type="button"
				disabled={!hasTarget || !selectedFilter}
				onClick={() => applyFilter()}
			>
				{t.clearFilter}
			</Button>
			<div className="bh-filter-grid">
				{shown.map((effect) => (
					<button
						className="bh-filter-card"
						key={effect.type}
						type="button"
						disabled={!hasTarget}
						aria-label={t.apply.replace(
							"{name}",
							effectName(effect.type, locale, effect.name),
						)}
						aria-pressed={selectedFilter?.type === effect.type}
						onClick={() => applyFilter(effect.type)}
					>
						<div className="bh-filter-art">
							<EffectPreviewCanvas effectType={effect.type} />
						</div>
						<span>{effectName(effect.type, locale, effect.name)}</span>
					</button>
				))}
			</div>
			{shown.length === 0 && <p className="bh-filter-hint">{t.noFilters}</p>}
		</PanelView>
	);
}

function EffectsGrid({ effects }: { effects: EffectDefinition[] }) {
	const { locale } = useSyncExternalStore(subscribeHostContext, getHostContext);
	return (
		<div
			className="grid gap-2"
			style={{ gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))" }}
		>
			{effects.map((effect) => (
				<div
					key={effect.type}
					role="group"
					aria-label={`${effectName(effect.type, locale, effect.name)} effect`}
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
	const { locale } = useSyncExternalStore(subscribeHostContext, getHostContext);
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
			name={effectName(effect.type, locale, effect.name)}
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
