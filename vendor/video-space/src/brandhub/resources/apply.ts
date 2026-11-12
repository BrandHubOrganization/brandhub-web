import type { EditorCore } from "@/core";
import {
	AddTrackCommand,
	BatchCommand,
	InsertElementCommand,
	UpdateElementsCommand,
} from "@/commands";
import { loadFullFont } from "@/fonts/google-fonts";
import { processMediaAssets } from "@/media/processing";
import { buildElementFromMedia } from "@/timeline/element-utils";
import { DEFAULT_NEW_ELEMENT_DURATION } from "@/timeline/creation";
import { addMediaTime, mediaTimeFromSeconds } from "@/wasm";
import type { LibraryItem } from "./catalog";
import { buildTemplateElements } from "./templates";
import { guardResourceTarget } from "./target";
export async function applyLibraryItem({
	editor,
	item,
}: {
	editor: EditorCore;
	item: LibraryItem;
}): Promise<void> {
	const project = editor.project.getActive();
	const assertCurrent = guardResourceTarget({ editor });
	const requestedTime = editor.playback.getCurrentTime();
	const selected = [...editor.selection.getSelectedElements()];
	if (item.kind === "font") {
		if (!item.fontFamily)
			throw new Error("This font is missing its family name.");
		const fontFamily = item.fontFamily;
		await loadFullFont({ family: fontFamily });
		assertCurrent();
		const tracks = editor.scenes.getActiveScene().tracks;
		const updates = selected.flatMap((ref) => {
			const track = [...tracks.overlay, tracks.main].find(
				(entry) => entry.id === ref.trackId,
			);
			const element = track?.elements.find(
				(entry) => entry.id === ref.elementId,
			);
			return element?.type === "text"
				? [{ ...ref, patch: { params: { fontFamily } } }]
				: [];
		});
		if (!updates.length)
			throw new Error(
				"Select a text layer on the timeline, then apply a font.",
			);
		editor.command.execute({ command: new UpdateElementsCommand({ updates }) });
		return;
	}
	if (item.kind === "template") {
		if (!item.template) throw new Error("This template recipe is missing.");
		await loadFullFont({ family: item.template.fontFamily });
		assertCurrent();
		const startTime =
			item.template.placement === "outro"
				? editor.timeline.getTotalDuration()
				: requestedTime;
		const elements = buildTemplateElements({
			recipe: item.template,
			name: item.name,
			startTime,
			canvasSize: editor.project.getActive().settings.canvasSize,
		});
		// Dedicated tracks preserve layer order even when existing tracks have space at the playhead.
		const commands = [...elements].reverse().flatMap((element) => {
			const track = new AddTrackCommand({
				type: element.type === "text" ? "text" : "graphic",
				index: 0,
			});
			return [
				track,
				new InsertElementCommand({
					element,
					placement: { mode: "explicit", trackId: track.getTrackId() },
				}),
			];
		});
		editor.command.execute({ command: new BatchCommand(commands) });
		editor.playback.seek({
			time: addMediaTime({
				a: startTime,
				b: mediaTimeFromSeconds({
					seconds: Math.min(0.5, item.template.duration),
				}),
			}),
		});
		return;
	}
	if (!item.url) throw new Error("This resource has no download URL.");
	const response = await fetch(item.url);
	assertCurrent();
	if (!response.ok)
		throw new Error("The resource could not be downloaded. Try again.");
	const blob = await response.blob();
	assertCurrent();
	const extension =
		item.kind === "sticker"
			? "png"
			: blob.type.includes("mpeg")
				? "mp3"
				: "wav";
	const file = new File([blob], `${item.name}.${extension}`, {
		type: blob.type,
	});
	const [processed] = await processMediaAssets({ files: [file] });
	assertCurrent();
	if (!processed) throw new Error("The resource could not be imported.");
	const asset = await editor.media.addMediaAsset({
		projectId: project.metadata.id,
		asset: processed,
	});
	assertCurrent();
	if (!asset)
		throw new Error("The resource could not be saved to this project.");
	const element = buildElementFromMedia({
		mediaId: asset.id,
		mediaType: asset.type,
		name: item.name,
		duration: asset.duration
			? mediaTimeFromSeconds({ seconds: asset.duration })
			: DEFAULT_NEW_ELEMENT_DURATION,
		startTime: requestedTime,
	});
	if (item.kind === "sticker") {
		element.params = {
			...element.params,
			"transform.scaleX": 0.3,
			"transform.scaleY": 0.3,
		};
	}
	editor.command.execute({
		command: new InsertElementCommand({ element, placement: { mode: "auto" } }),
	});
}
