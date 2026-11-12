"use client";

import { useEffect, useId, useState } from "react";
import { Pause, Play, Plus, RotateCcw, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEditor } from "@/editor/use-editor";
import {
	isShortcutTextTarget,
	useKeybindingsStore,
} from "@/actions/keybindings-store";
import { ResourceArtwork } from "./artwork";
import { useResourcePreviewStore } from "./preview-store";
import { applyLibraryItem } from "./apply";
import type { LibraryItem } from "./catalog";

export function ResourcePlayer() {
	const item = useResourcePreviewStore((state) => state.item);
	return item ? <ResourcePlayerContent key={item.id} item={item} /> : null;
}

function ResourcePlayerContent({ item }: { item: LibraryItem }) {
	const editor = useEditor();
	const close = useResourcePreviewStore((state) => state.close);
	const overlayId = useId();
	const duration = item.template?.duration ?? item.duration ?? 5;
	const [time, setTime] = useState(0);
	const [playing, setPlaying] = useState(
		() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
	);
	const [adding, setAdding] = useState(false);

	useEffect(() => {
		const bindings = useKeybindingsStore.getState();
		bindings.openOverlay(overlayId);
		const keydown = (event: KeyboardEvent) => {
			if (event.isComposing) return;
			if (event.key === "Escape") {
				event.preventDefault();
				close();
			}
			if (isShortcutTextTarget(event.target)) return;
			if (
				event.code === "Space" &&
				!event.ctrlKey &&
				!event.altKey &&
				!event.metaKey
			) {
				event.preventDefault();
				setPlaying((value) => !value);
			}
		};
		const leavePreview = (event: PointerEvent) => {
			if (
				event.target instanceof Element &&
				!event.target.closest(
					".bh-resource-player, .bh-resource-library, .bh-tools-bar",
				)
			)
				close();
		};
		document.addEventListener("keydown", keydown);
		document.addEventListener("pointerdown", leavePreview, true);
		return () => {
			bindings.closeOverlay(overlayId);
			document.removeEventListener("keydown", keydown);
			document.removeEventListener("pointerdown", leavePreview, true);
		};
	}, [close, overlayId]);

	useEffect(() => {
		if (!playing) return;
		let frame = 0;
		let previous = performance.now();
		const tick = (now: number) => {
			const delta = (now - previous) / 1000;
			previous = now;
			setTime((value) => (value + delta) % duration);
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [duration, playing]);

	const add = async () => {
		setAdding(true);
		try {
			await applyLibraryItem({ editor, item });
			toast.success(
				item.kind === "font"
					? `${item.name} applied to selected text`
					: `${item.name} added to timeline`,
			);
			if (useResourcePreviewStore.getState().item?.id === item.id) close();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Couldn't add this resource.",
			);
		} finally {
			setAdding(false);
		}
	};

	return (
		<section className="bh-resource-player" aria-label={`${item.name} preview`}>
			<header>
				<div>
					<span>Resource preview</span>
					<strong>{item.name}</strong>
				</div>
				<button
					type="button"
					onClick={close}
					aria-label="Về bản dựng"
					title="Về bản dựng (Esc)"
					className="shrink-0"
				>
					<ArrowLeft size={16} />
					<span>Về bản dựng</span>
				</button>
			</header>
			<div className="bh-resource-player-stage">
				<div className={`bh-resource-player-art bh-player-${item.kind}`}>
					<ResourceArtwork item={item} time={time} />
				</div>
			</div>
			<div className="bh-resource-player-controls">
				<button
					type="button"
					aria-label={
						playing ? "Pause resource preview" : "Play resource preview"
					}
					onClick={() => setPlaying(!playing)}
				>
					{playing ? <Pause size={17} /> : <Play size={17} />}
				</button>
				<button
					type="button"
					aria-label="Replay resource preview"
					onClick={() => {
						setTime(0);
						setPlaying(true);
					}}
				>
					<RotateCcw size={16} />
				</button>
				<span>
					{time.toFixed(1)} / {duration.toFixed(1)}s
				</span>
				<input
					type="range"
					min={0}
					max={duration}
					step={0.01}
					value={time}
					aria-label="Resource preview position"
					onChange={(event) => setTime(Number(event.target.value))}
				/>
			</div>
			<footer>
				<div>
					<p>
						{item.description ??
							"Xem trước tài nguyên. Bản dựng chưa thay đổi."}
					</p>
					<small>
						{item.author} · {item.license}
					</small>
				</div>
				<button
					type="button"
					className="bh-resource-preview-add"
					disabled={adding}
					onClick={() => void add()}
				>
					{adding ? (
						<Loader2 size={15} className="animate-spin" />
					) : (
						<Plus size={15} />
					)}
					{item.kind === "font" ? "Apply to selected text" : "Add to timeline"}
				</button>
			</footer>
		</section>
	);
}
