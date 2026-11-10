"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useEditor } from "@/editor/use-editor";
import { UpdateElementsCommand } from "@/commands";
import { isVisualElement } from "@/timeline";
import {
	mediaTimeFromSeconds,
	mediaTimeToSeconds,
	roundMediaTime,
} from "@/wasm";
import { motionAnimation, removeMotion } from "./animation";
import {
	CLIP_MOTIONS,
	TRANSITIONS,
	transitionDuration,
	type ClipMotionKind,
	type TransitionKind,
} from "./motion";
import "./view.css";

export function TransitionsView() {
	const editor = useEditor();
	const [mode, setMode] = useState<"transition" | "in" | "out">("transition");
	const [duration, setDuration] = useState(0.5);
	const selected = useEditor((e) => e.selection.getSelectedElements());
	const tracks = useEditor((e) => e.scenes.getActiveScene().tracks);
	const [busy, setBusy] = useState(false);
	const ref = selected[0];
	const track = [tracks.main, ...tracks.overlay].find(
		(item) => item.id === ref?.trackId,
	);
	const target = track?.elements.find((item) => item.id === ref?.elementId);
	const sorted = [...tracks.main.elements].sort(
		(a, b) => a.startTime - b.startTime,
	);
	const next = target && sorted.find((item) => item.id === target.id);
	const previous = next
		? sorted[sorted.findIndex((item) => item.id === next.id) - 1]
		: undefined;
	const adjacent =
		previous &&
		next &&
		Math.abs(previous.startTime + previous.duration - next.startTime) <= 1;
	const canApply =
		mode === "transition"
			? Boolean(adjacent && ref?.trackId === tracks.main.id)
			: Boolean(target && isVisualElement(target));
	const active =
		mode === "transition"
			? target?.params["bh.transition"]
			: target?.params[`bh.motion.${mode}`];
	const choices = mode === "transition" ? TRANSITIONS : CLIP_MOTIONS;
	function apply(kind?: TransitionKind | ClipMotionKind) {
		if (!target || !ref || !canApply || busy) return;
		setBusy(true);
		try {
			if (mode === "transition" && previous && next) {
				const time = transitionDuration({
					requested: mediaTimeFromSeconds({ seconds: duration }),
					previous: previous.duration,
					next: next.duration,
				});
				editor.command.execute({
					command: new UpdateElementsCommand({
						updates: [
							{
								trackId: ref.trackId,
								elementId: target.id,
								patch: {
									params: {
										"bh.transition": kind ?? "",
										"bh.transition.duration": roundMediaTime({ time }),
									},
								},
							},
						],
					}),
				});
			} else if (isVisualElement(target)) {
				const length = roundMediaTime({
					time: Math.min(
						mediaTimeFromSeconds({ seconds: duration }),
						target.duration / 2,
					),
				});
				const { width, height } =
					editor.project.getActive().settings.canvasSize;
				const original = removeMotion({
					animations: target.animations,
					edge: mode === "in" ? "in" : "out",
				});
				const animations = kind
					? motionAnimation({
							params: target.params,
							duration: length,
							kind,
							width,
							height,
							edge: mode === "in" ? "in" : "out",
							start: mode === "in" ? 0 : target.duration - length,
							original,
						})
					: original;
				editor.command.execute({
					command: new UpdateElementsCommand({
						updates: [
							{
								trackId: ref.trackId,
								elementId: target.id,
								patch: {
									animations,
									params: { [`bh.motion.${mode}`]: kind ?? "" },
								},
							},
						],
					}),
				});
			}
			toast.success(kind ? "Đã áp dụng. Ctrl+Z để hoàn tác." : "Đã bỏ preset.");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Không áp dụng được preset.",
			);
		} finally {
			setBusy(false);
		}
	}
	function preview() {
		if (!target) return;
		const start =
			mode === "out"
				? target.startTime +
					target.duration -
					mediaTimeFromSeconds({ seconds: duration + 0.15 })
				: target.startTime;
		editor.playback.seek({
			time: roundMediaTime({ time: Math.max(0, start) }),
		});
		editor.playback.play();
	}
	return (
		<section className="bh-transitions" aria-label="Chuyển cảnh và animation">
			<header>
				<h2>Transitions & Animation</h2>
				<p>Chuyển cảnh, vào và kết thúc clip</p>
			</header>
			<div
				className="bh-transition-modes"
				role="tablist"
				aria-label="Loại hiệu ứng"
			>
				{(
					[
						["transition", "Chuyển cảnh"],
						["in", "Vào clip"],
						["out", "Kết thúc"],
					] as const
				).map(([value, label]) => (
					<button
						type="button"
						role="tab"
						aria-selected={mode === value}
						key={value}
						onClick={() => setMode(value)}
					>
						{label}
					</button>
				))}
			</div>
			<label className="bh-transition-duration">
				Thời lượng{" "}
				<input
					aria-label="Thời lượng hiệu ứng"
					type="number"
					min={0.1}
					max={3}
					step={0.1}
					value={duration}
					onChange={(event) => {
						const value = Number(event.target.value);
						if (Number.isFinite(value))
							setDuration(Math.max(0.1, Math.min(3, value)));
					}}
				/>{" "}
				giây
			</label>
			<div className="bh-transition-target">
				<strong>
					{canApply
						? mode === "transition"
							? `${previous?.name} → ${next?.name}`
							: target?.name
						: "Chọn clip trên timeline"}
				</strong>
				<p>
					{mode === "transition"
						? "Chọn clip đến, liền sau một clip khác trên main track."
						: "Chọn clip hoặc lớp chữ/sticker để áp dụng animation."}
				</p>
				{mode === "transition" && adjacent && next && previous && (
					<small>
						Áp dụng{" "}
						{mediaTimeToSeconds({
							time: roundMediaTime({
								time: transitionDuration({
									requested: mediaTimeFromSeconds({ seconds: duration }),
									previous: previous.duration,
									next: next.duration,
								}),
							}),
						}).toFixed(2)}
						s · giữ nguyên thời lượng timeline
					</small>
				)}
			</div>
			<div className="bh-transition-grid">
				{choices.map((choice) => (
					<button
						type="button"
						key={choice.id}
						className={active === choice.id ? "is-active" : ""}
						disabled={!canApply || busy}
						onClick={() => apply(choice.id)}
						aria-label={`Áp dụng ${choice.name}`}
					>
						<div
							className={`bh-transition-sample bh-transition-${choice.id}`}
							aria-hidden="true"
						>
							<span>A</span>
							<span>B</span>
						</div>
						<strong>{choice.name}</strong>
					</button>
				))}
			</div>
			<div className="bh-transition-actions">
				<button type="button" disabled={!canApply} onClick={() => apply()}>
					Bỏ preset
				</button>
				<button type="button" disabled={!target} onClick={preview}>
					▶ Xem trên timeline
				</button>
			</div>
			<p className="bh-transition-note">
				Preset vào/ra thay keyframe trong đoạn được chọn; keyframe ngoài đoạn
				được giữ. Dùng Ctrl+Z để trở lại chính xác bản trước.
			</p>
			{mode === "transition" && (
				<p className="bh-transition-note">
					Nếu clip trước hết hình dư, chuyển cảnh giữ frame cuối để hòa sang
					clip tiếp theo.
				</p>
			)}
		</section>
	);
}
