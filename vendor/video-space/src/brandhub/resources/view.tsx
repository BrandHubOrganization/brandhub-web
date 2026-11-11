"use client";

import {
	useEffect,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import {
	Headphones,
	Loader2,
	Music2,
	Pause,
	Play,
	Plus,
	Search,
	Type,
	X,
	ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useEditor } from "@/editor/use-editor";
import { loadFullFont } from "@/fonts/google-fonts";
import { buildTextElement } from "@/timeline/element-utils";
import { DEFAULTS } from "@/timeline/defaults";
import { StickersView } from "@/stickers/components/assets-view";
import { applyLibraryItem } from "./apply";
import { filterLibrary, loadLibrary, type LibraryItem } from "./catalog";
import { ResourceArtwork } from "./artwork";
import { useResourcePreviewStore } from "./preview-store";
import "./resources.css";
import { getHostContext, subscribeHostContext } from "@/platform/host";
import { UploadedAudioView } from "./uploaded-audio";
import { editorResourceMessages } from "./messages";

const AUDIO_KINDS: LibraryItem["kind"][] = ["music", "sound"];
const TEXT_KINDS: LibraryItem["kind"][] = ["font", "template"];
const STICKER_KINDS: LibraryItem["kind"][] = ["sticker"];
const TEMPLATE_KINDS: LibraryItem["kind"][] = ["template"];

export function AudioResourcesView() {
	const [kind, setKind] = useState("uploaded");
	const { locale } = useSyncExternalStore(subscribeHostContext, getHostContext);
	const t = editorResourceMessages[locale];
	const navigation = (
		<ResourceSwitch
			options={[
				{ id: "uploaded", label: t.uploaded },
				{ id: "music", label: t.music },
				{ id: "sound", label: t.sounds },
			]}
			value={kind}
			onChange={setKind}
			label={t.audioType}
		/>
	);
	return kind === "uploaded" ? (
		<UploadedAudioView navigation={navigation} locale={locale} />
	) : (
		<ResourceLibraryView
			key={kind}
			title="Audio"
			kinds={AUDIO_KINDS}
			kind={kind}
			navigation={navigation}
		/>
	);
}

export function TextResourcesView() {
	const editor = useEditor();
	const [kind, setKind] = useState("font");
	return (
		<ResourceLibraryView
			key={kind}
			title="Text"
			kinds={TEXT_KINDS}
			kind={kind}
			navigation={
				<>
					<button
						type="button"
						className="bh-resource-add-text"
						onClick={() => {
							useResourcePreviewStore.getState().close();
							editor.timeline.insertElement({
								element: buildTextElement({
									raw: DEFAULTS.text.element,
									startTime: editor.playback.getCurrentTime(),
								}),
								placement: { mode: "auto" },
							});
						}}
					>
						<Type size={16} />
						<span>Add text</span>
						<Plus size={14} />
					</button>
					<ResourceSwitch
						options={[
							{ id: "font", label: "Fonts" },
							{ id: "template", label: "Text templates" },
						]}
						value={kind}
						onChange={setKind}
						label="Text type"
					/>
				</>
			}
		/>
	);
}

export function StickerResourcesView() {
	const [source, setSource] = useState("library");
	const navigation = (
		<ResourceSwitch
			options={[
				{ id: "library", label: "Library" },
				{ id: "shapes", label: "Shapes & flags" },
			]}
			value={source}
			onChange={setSource}
			label="Sticker source"
		/>
	);
	return source === "library" ? (
		<ResourceLibraryView
			title="Stickers"
			kinds={STICKER_KINDS}
			navigation={navigation}
		/>
	) : (
		<div className="bh-resource-body">
			<nav className="bh-resource-categories" aria-label="Sticker source">
				{navigation}
			</nav>
			<div className="bh-resource-main">
				<StickersView />
			</div>
		</div>
	);
}

export function TemplatesResourcesView() {
	return <ResourceLibraryView title="Templates" kinds={TEMPLATE_KINDS} />;
}

function ResourceSwitch({
	options,
	value,
	onChange,
	label,
}: {
	options: { id: string; label: string }[];
	value: string;
	onChange: (value: string) => void;
	label: string;
}) {
	return (
		<div className="bh-resource-switch" role="group" aria-label={label}>
			{options.map((option) => (
				<button
					type="button"
					key={option.id}
					aria-pressed={value === option.id}
					onClick={() => onChange(option.id)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
}

function ResourceLibraryView({
	title,
	kinds,
	kind,
	navigation,
}: {
	title: string;
	kinds: LibraryItem["kind"][];
	kind?: string;
	navigation?: ReactNode;
}) {
	const editor = useEditor();
	const [items, setItems] = useState<LibraryItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [retry, setRetry] = useState(0);
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState("All");
	const [addingId, setAddingId] = useState<string | null>(null);
	const [playingId, setPlayingId] = useState<string | null>(null);
	const [audioId, setAudioId] = useState<string | null>(null);
	const [audioTime, setAudioTime] = useState(0);
	const previewId = useResourcePreviewStore((state) => state.item?.id);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const audioRequest = useRef(0);

	useEffect(() => {
		let mounted = true;
		loadLibrary()
			.then((data) => {
				if (mounted) {
					setItems(data);
					setIsLoading(false);
				}
			})
			.catch(() => {
				if (mounted) {
					setError(
						"Couldn't load the library. Check the connection and try again.",
					);
					setIsLoading(false);
				}
			});
		return () => {
			mounted = false;
		};
	}, [retry]);
	useEffect(
		() => () => {
			audioRequest.current += 1;
			audioRef.current?.pause();
			if (audioRef.current) audioRef.current.src = "";
			useResourcePreviewStore.getState().close();
		},
		[],
	);

	const scoped = useMemo(
		() =>
			items.filter(
				(item) => kinds.includes(item.kind) && (!kind || item.kind === kind),
			),
		[items, kinds, kind],
	);
	const categories = useMemo(
		() => ["All", ...new Set(scoped.map((item) => item.category))],
		[scoped],
	);
	const selectedCategory = categories.includes(category) ? category : "All";
	const visible = filterLibrary({
		items: scoped,
		kinds,
		category: selectedCategory,
		query,
	});
	const isAudio = kind === "music" || kind === "sound";
	useEffect(() => {
		for (const item of scoped) {
			const family = item.fontFamily ?? item.template?.fontFamily;
			if (family) void loadFullFont({ family }).catch(() => undefined);
		}
	}, [scoped]);

	const stopAudio = () => {
		audioRequest.current += 1;
		audioRef.current?.pause();
		setPlayingId(null);
	};
	const preview = async ({ item }: { item: LibraryItem }) => {
		editor.playback.pause();
		if (item.kind !== "music" && item.kind !== "sound") {
			stopAudio();
			useResourcePreviewStore.getState().open(item);
			return;
		}
		if (playingId === item.id) {
			stopAudio();
			return;
		}
		stopAudio();
		const request = audioRequest.current;
		const audio =
			audioId === item.id && audioRef.current
				? audioRef.current
				: new Audio(item.previewUrl ?? item.url);
		if (audioId !== item.id) {
			setAudioTime(0);
			audio.addEventListener("timeupdate", () => {
				if (audioRef.current === audio) setAudioTime(audio.currentTime);
			});
			audio.addEventListener("ended", () => {
				if (audioRef.current === audio) setPlayingId(null);
			});
		}
		audioRef.current = audio;
		setAudioId(item.id);
		setPlayingId(item.id);
		try {
			await audio.play();
			if (request !== audioRequest.current) audio.pause();
		} catch {
			if (request === audioRequest.current) {
				setPlayingId(null);
				toast.error("Couldn't play this audio. Try again.");
			}
		}
	};
	const add = async ({ item }: { item: LibraryItem }) => {
		setAddingId(item.id);
		useResourcePreviewStore.getState().close();
		try {
			await applyLibraryItem({ editor, item });
			toast.success(
				item.kind === "font"
					? `${item.name} applied to selected text`
					: `${item.name} added to timeline`,
			);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Couldn't add this resource.",
			);
		} finally {
			setAddingId(null);
		}
	};

	return (
		<section className="bh-resource-library" aria-label={`${title} library`}>
			<div className="bh-resource-body">
				<nav
					className="bh-resource-categories"
					aria-label={`${title} categories`}
				>
					{navigation}
					<div className="bh-resource-category-heading">
						{isAudio ? (kind === "music" ? "Music" : "Sound effects") : title}
						<ChevronDown size={13} />
					</div>
					{categories.map((entry) => (
						<button
							type="button"
							key={entry}
							title={entry}
							aria-pressed={selectedCategory === entry}
							onClick={() => {
								setCategory(entry);
								stopAudio();
							}}
						>
							{entry}
						</button>
					))}
				</nav>
				<div className="bh-resource-main">
					<div className="bh-resource-search">
						<Search size={15} aria-hidden="true" />
						<input
							aria-label={`Search ${title.toLowerCase()}`}
							placeholder={
								isAudio
									? "Search songs or sound effects"
									: `Search ${title.toLowerCase()}`
							}
							value={query}
							onChange={(event) => {
								setQuery(event.target.value);
								stopAudio();
							}}
						/>
						{query && (
							<button
								type="button"
								aria-label="Clear search"
								onClick={() => setQuery("")}
							>
								<X size={14} />
							</button>
						)}
					</div>
					<header className="bh-resource-header">
						<h2>
							{query
								? "Search results"
								: selectedCategory === "All"
									? `All ${title.toLowerCase()}`
									: selectedCategory}
						</h2>
						{!isLoading && !error && <span>{visible.length} items</span>}
					</header>
					<div className="bh-resource-results">
						{isLoading ? (
							<div className="bh-resource-state" role="status">
								<Loader2 className="animate-spin" size={20} />
								<p>Loading {title.toLowerCase()}…</p>
							</div>
						) : error ? (
							<div className="bh-resource-state" role="alert">
								<p>{error}</p>
								<button
									type="button"
									onClick={() => {
										setError("");
										setIsLoading(true);
										setRetry((value) => value + 1);
									}}
								>
									Try again
								</button>
							</div>
						) : !visible.length ? (
							<div className="bh-resource-state">
								<Search size={20} />
								<p>No {title.toLowerCase()} found.</p>
								<span>Try another word or category.</span>
							</div>
						) : (
							<div
								className={
									isAudio ? "bh-resource-audio-list" : "bh-resource-grid"
								}
							>
								{visible.map((item) => (
									<ResourceCard
										key={item.id}
										item={item}
										isPlaying={playingId === item.id}
										selected={previewId === item.id || audioId === item.id}
										isAdding={addingId === item.id}
										disabled={addingId !== null}
										onPreview={() => void preview({ item })}
										onAdd={() => void add({ item })}
										audioTime={audioId === item.id ? audioTime : undefined}
										onSeek={(value) => {
											if (audioRef.current && audioId === item.id) {
												audioRef.current.currentTime = value;
												setAudioTime(value);
											}
										}}
									/>
								))}
							</div>
						)}
					</div>
					<div className="bh-resource-hint">
						{isAudio
							? "Click to listen · + to add"
							: "Hover to preview · Click to open · + to add"}
					</div>
				</div>
			</div>
		</section>
	);
}

function ResourceCard({
	item,
	isPlaying,
	selected,
	isAdding,
	disabled,
	onPreview,
	onAdd,
	audioTime,
	onSeek,
}: {
	item: LibraryItem;
	isPlaying: boolean;
	selected: boolean;
	isAdding: boolean;
	disabled: boolean;
	onPreview: () => void;
	onAdd: () => void;
	audioTime?: number;
	onSeek: (value: number) => void;
}) {
	const isAudio = item.kind === "music" || item.kind === "sound";
	return (
		<article
			className={`bh-resource-card ${isAudio ? "bh-resource-audio" : ""}`}
			data-selected={selected || undefined}
		>
			<div className="bh-resource-cover">
				<button
					type="button"
					className="bh-resource-thumb"
					onClick={onPreview}
					aria-label={`${isPlaying ? "Pause" : "Preview"} ${item.name}`}
					aria-pressed={isAudio ? isPlaying : selected}
				>
					{isAudio ? (
						isPlaying ? (
							<Pause size={21} />
						) : item.kind === "music" ? (
							<Music2 size={21} />
						) : (
							<Headphones size={21} />
						)
					) : (
						<ResourceArtwork item={item} />
					)}
					{!isAudio && (
						<span className="bh-resource-preview-icon">
							<Play size={12} fill="currentColor" />
						</span>
					)}
					{item.template && (
						<span className="bh-resource-duration">
							{formatDuration({ seconds: item.template.duration })}
						</span>
					)}
				</button>
			</div>
			<div className="bh-resource-info">
				<strong title={item.name}>{item.name}</strong>
				<span>
					{isAudio
						? `${item.author} · ${formatDuration({ seconds: item.duration ?? 0 })}`
						: item.kind === "font"
							? "Vietnamese supported"
							: item.category}
				</span>
				{isAudio && audioTime !== undefined && (
					<input
						className="bh-resource-audio-progress"
						type="range"
						min={0}
						max={item.duration ?? 1}
						step={0.01}
						value={audioTime}
						aria-label={`Seek ${item.name}`}
						onChange={(event) => onSeek(Number(event.target.value))}
					/>
				)}
			</div>
			<button
				type="button"
				className="bh-resource-add"
				aria-label={`${item.kind === "font" ? "Apply" : "Add"} ${item.name}${item.kind === "font" ? " to selected text" : " to timeline"}`}
				title={
					item.kind === "font" ? "Apply to selected text" : "Add to timeline"
				}
				disabled={disabled}
				onClick={onAdd}
			>
				{isAdding ? (
					<Loader2 size={14} className="animate-spin" />
				) : (
					<Plus size={15} />
				)}
			</button>
		</article>
	);
}

function formatDuration({ seconds }: { seconds: number }): string {
	if (seconds < 1) return `${seconds.toFixed(1)}s`;
	const whole = Math.round(seconds);
	return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
