import type { EditorCore } from "@/core";
import type { Command, CommandResult } from "@/commands";
import type { EditorSelectionSnapshot } from "@/selection/editor-selection";
import { applyRippleAdjustments, computeRippleAdjustments } from "@/ripple";
import type { SceneTracks } from "@/timeline/types";
import { compactMainTrack } from "@/timeline/main-track-magnet";

interface CommandHistoryEntry {
	command: Command;
	previousSelection: EditorSelectionSnapshot;
	selectionOverride?: EditorSelectionSnapshot;
	magnetSnapshot?: { before: SceneTracks; after: SceneTracks };
}

export class CommandManager {
	public isRippleEnabled = false;
	public isMainTrackMagnetEnabled = false;
	private history: CommandHistoryEntry[] = [];
	private redoStack: CommandHistoryEntry[] = [];
	private reactors: Array<() => void> = [];

	constructor(private editor: EditorCore) {}

	setMainTrackMagnetEnabled({ enabled }: { enabled: boolean }): void {
		this.isMainTrackMagnetEnabled = enabled;
	}

	execute({ command }: { command: Command }): Command {
		const beforeTracks =
			this.isRippleEnabled || this.isMainTrackMagnetEnabled
				? (this.editor.scenes.getActiveSceneOrNull()?.tracks ?? null)
				: null;
		const previousSelection = this.getSelectionSnapshot();
		const result = command.execute();
		this.applyRippleIfEnabled({ beforeTracks });
		const magnetChanged = this.applyMainTrackMagnet();
		const selectionOverride = this.applySelectionOverride(result);
		this.runReactors();
		this.history.push({
			command,
			previousSelection,
			selectionOverride,
			magnetSnapshot:
				magnetChanged && beforeTracks
					? {
							before: beforeTracks,
							after: this.editor.scenes.getActiveScene().tracks,
						}
					: undefined,
		});
		this.redoStack = [];
		return command;
	}

	push({ command }: { command: Command }): void {
		this.history.push({
			command,
			previousSelection: this.getSelectionSnapshot(),
		});
		this.redoStack = [];
	}

	registerReactor(reactor: () => void): void {
		this.reactors.push(reactor);
	}

	undo(): void {
		if (this.history.length === 0) return;
		const entry = this.history.pop();
		entry?.command.undo();
		if (entry?.magnetSnapshot)
			this.editor.timeline.updateTracks(entry.magnetSnapshot.before);
		if (entry) {
			// Only restore selection for commands that explicitly changed it.
			// Commands without selection intent leave selection untouched,
			// preserving any UI-driven selection changes (clicks, box select)
			// that happened between commands. Commands that remove editor-owned
			// selection targets must declare a selection override to clear stale refs.
			if (entry.selectionOverride !== undefined) {
				this.editor.selection.restoreSnapshot({
					snapshot: entry.previousSelection,
				});
			}
			this.redoStack.push(entry);
		}
	}

	redo(): void {
		if (this.redoStack.length === 0) return;
		const entry = this.redoStack.pop();
		if (!entry) {
			return;
		}

		const beforeTracks = this.isRippleEnabled
			? (this.editor.scenes.getActiveSceneOrNull()?.tracks ?? null)
			: null;
		const previousSelection = this.getSelectionSnapshot();
		const result = entry.command.redo();
		if (entry.magnetSnapshot)
			this.editor.timeline.updateTracks(entry.magnetSnapshot.after);
		else this.applyRippleIfEnabled({ beforeTracks });
		const selectionOverride = this.applySelectionOverride(result);
		this.runReactors();

		this.history.push({
			command: entry.command,
			previousSelection,
			selectionOverride,
			magnetSnapshot: entry.magnetSnapshot,
		});
	}

	canUndo(): boolean {
		return this.history.length > 0;
	}

	canRedo(): boolean {
		return this.redoStack.length > 0;
	}

	clear(): void {
		this.history = [];
		this.redoStack = [];
	}

	private getSelectionSnapshot(): EditorSelectionSnapshot {
		return this.editor.selection.getSnapshot();
	}

	private applySelectionOverride(
		result: CommandResult | undefined,
	): EditorSelectionSnapshot | undefined {
		if (!result?.selection) {
			return undefined;
		}
		return this.editor.selection.applySelectionPatch({
			patch: result.selection,
		});
	}

	private runReactors(): void {
		for (const reactor of this.reactors) {
			reactor();
		}
	}

	private applyRippleIfEnabled({
		beforeTracks,
	}: {
		beforeTracks: SceneTracks | null;
	}): void {
		if (!this.isRippleEnabled || !beforeTracks) {
			return;
		}

		const afterTracks = this.editor.scenes.getActiveSceneOrNull()?.tracks;
		if (!afterTracks) {
			return;
		}
		const adjustments = computeRippleAdjustments({
			beforeTracks,
			afterTracks,
		});
		if (adjustments.length === 0) {
			return;
		}

		const tracksWithRipple = applyRippleAdjustments({
			tracks: afterTracks,
			adjustments,
		});
		this.editor.timeline.updateTracks(tracksWithRipple);
	}

	private applyMainTrackMagnet(): boolean {
		if (!this.isMainTrackMagnetEnabled) return false;
		const tracks = this.editor.scenes.getActiveSceneOrNull()?.tracks;
		if (!tracks) return false;
		const compacted = compactMainTrack({ tracks });
		if (compacted === tracks) return false;
		this.editor.timeline.updateTracks(compacted);
		return true;
	}
}
