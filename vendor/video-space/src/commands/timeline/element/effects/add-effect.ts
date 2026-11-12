import { Command, type CommandResult } from "@/commands/base-command";
import { EditorCore } from "@/core";
import { isVisualElement, updateElementInSceneTracks } from "@/timeline";
import type { SceneTracks } from "@/timeline";
import { buildDefaultEffectInstance } from "@/effects";
import type { Effect } from "@/effects/types";

export class AddClipEffectCommand extends Command {
	private savedState: SceneTracks | null = null;
	private effectId: string | null = null;
	private effect: Effect | null = null;
	private readonly trackId: string;
	private readonly elementId: string;
	private readonly effectType: string;

	constructor({
		trackId,
		elementId,
		effectType,
	}: {
		trackId: string;
		elementId: string;
		effectType: string;
	}) {
		super();
		this.trackId = trackId;
		this.elementId = elementId;
		this.effectType = effectType;
	}

	execute(): CommandResult | undefined {
		const editor = EditorCore.getInstance();
		this.savedState = editor.scenes.getActiveScene().tracks;

		const updatedTracks = updateElementInSceneTracks({
			tracks: this.savedState,
			trackId: this.trackId,
			elementId: this.elementId,
			elementPredicate: isVisualElement,
			update: (element) => {
				if (!isVisualElement(element)) return element;
				// Later commands refer to this ID, so redo must reuse the instance.
				this.effect ??= buildDefaultEffectInstance({
					effectType: this.effectType,
				});
				this.effectId = this.effect.id;
				return { ...element, effects: [...(element.effects ?? []), this.effect] };
			},
		});

		editor.timeline.updateTracks(updatedTracks);
		return undefined;
	}

	undo(): void {
		if (this.savedState) {
			const editor = EditorCore.getInstance();
			editor.timeline.updateTracks(this.savedState);
		}
	}

	getEffectId(): string | null {
		return this.effectId;
	}
}
