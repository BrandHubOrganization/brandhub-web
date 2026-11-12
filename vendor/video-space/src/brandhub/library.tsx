"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
	ArrowUpRight,
	Cloud,
	Film,
	FolderOpen,
	Loader2,
	Plus,
	Search,
	Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { createProjectFromFile } from "./import-file";
import { storageService } from "@/services/storage/service";
import type { TProjectMetadata } from "@/project/types";
import { API_BASE, projectRequest, type ProjectSummary } from "./api";
import { restoreFromServer } from "./sync";
import { getHostContext, subscribeHostContext } from "@/platform/host";
import { libraryMessages } from "./library-messages";

export function VideoProjectLibrary() {
	const router = useRouter();
	const { locale } = useSyncExternalStore(subscribeHostContext, getHostContext);
	const m = libraryMessages[locale];
	const fileInput = useRef<HTMLInputElement>(null);
	const createTrigger = useRef<HTMLButtonElement>(null);
	const [local, setLocal] = useState<TProjectMetadata[]>([]);
	const [remote, setRemote] = useState<ProjectSummary[]>([]);
	const [busy, setBusy] = useState(false);
	const [loading, setLoading] = useState(true);
	const [query, setQuery] = useState("");
	const [name, setName] = useState("");
	const [showCreate, setShowCreate] = useState(false);
	const [serverError, setServerError] = useState("");
	const [remotePage, setRemotePage] = useState(0);
	const [hasMore, setHasMore] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);

	useEffect(() => {
		let cancelled = false;
		Promise.allSettled([
			storageService.loadAllProjectsMetadata(),
			projectRequest<ProjectSummary[]>({ path: `${API_BASE}?page=0&size=50` }),
		]).then(([a, b]) => {
			if (cancelled) return;
			if (a.status === "fulfilled") setLocal(a.value);
			if (b.status === "fulfilled") {
				setRemote(b.value);
				setHasMore(b.value.length === 50);
			} else
				setServerError(
					b.reason instanceof Error ? b.reason.message : m.connectionFailed,
				);
			setLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	async function loadMore() {
		if (loadingMore) return;
		setLoadingMore(true);
		try {
			const next = remotePage + 1;
			const page = await projectRequest<ProjectSummary[]>({
				path: `${API_BASE}?page=${next}&size=50`,
			});
			setRemote((current) => [
				...new Map(
					[...current, ...page].map((project) => [project.id, project]),
				).values(),
			]);
			setRemotePage(next);
			setHasMore(page.length === 50);
			setServerError("");
		} catch (error) {
			setServerError(error instanceof Error ? error.message : m.loadFailed);
		} finally {
			setLoadingMore(false);
		}
	}

	async function create(file?: File) {
		if (busy) return;
		setBusy(true);
		try {
			const projectId = await createProjectFromFile({ file, name });
			router.push(`/editor/${projectId}`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : m.createFailed);
			setBusy(false);
		}
	}

	async function openRemote(project: ProjectSummary) {
		if (busy) return;
		if (
			local.some((p) => p.id === project.id) &&
			!window.confirm(m.restoreConfirm.replace("{name}", project.name))
		)
			return;
		setBusy(true);
		try {
			await restoreFromServer(project.id);
			router.push(`/editor/${project.id}`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : m.openFailed);
			setBusy(false);
		}
	}

	const projectMap = new Map(
		local.map((p) => [
			p.id,
			{
				id: p.id,
				name: p.name,
				thumbnail: p.thumbnail,
				updated: p.updatedAt.toISOString(),
				local: true,
				remote: remote.find((r) => r.id === p.id),
			},
		]),
	);
	for (const project of remote)
		if (!projectMap.has(project.id))
			projectMap.set(project.id, {
				id: project.id,
				name: project.name,
				thumbnail: project.thumbnail,
				updated: project.updated_at,
				local: false,
				remote: project,
			});
	const projects = [...projectMap.values()]
		.filter((p) =>
			p.name.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")),
		)
		.sort((a, b) => b.updated.localeCompare(a.updated));

	return (
		<div className="bh-library">
			<main className="bh-library-main">
				<header className="bh-library-top">
					<span className="bh-connection">
						<span className={serverError ? "bh-dot-off" : "bh-dot"} />
						{loading ? m.connecting : serverError ? m.localOnly : m.connected}
					</span>
				</header>
				<div className="bh-library-content">
					<div className="bh-page-title">
						<div>
							<h1>{m.title}</h1>
							<p>{m.description}</p>
						</div>
						<Button
							ref={createTrigger}
							onClick={() => setShowCreate(true)}
							disabled={busy}
						>
							<Plus size={16} />
							{m.create}
						</Button>
					</div>
					<section className="bh-import-strip" aria-labelledby="import-title">
						<div className="bh-import-icon">
							<Film size={25} />
						</div>
						<div>
							<h2 id="import-title">{m.importTitle}</h2>
							<p>{m.importDescription}</p>
						</div>
						<Button
							variant="outline"
							disabled={busy}
							onClick={() => fileInput.current?.click()}
						>
							{busy ? (
								<Loader2 className="animate-spin" />
							) : (
								<Upload size={16} />
							)}
							{m.importVideo}
						</Button>
						<input
							ref={fileInput}
							type="file"
							accept="video/mp4,video/webm,video/quicktime"
							hidden
							aria-label={m.chooseVideo}
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) void create(file);
								e.target.value = "";
							}}
						/>
					</section>
					{serverError && (
						<div role="status" className="bh-inline-notice">
							{serverError} {m.offlineNotice}
						</div>
					)}
					<div className="bh-library-toolbar">
						<h2>
							{m.allProjects} <span>{projects.length}</span>
						</h2>
						<label className="bh-search">
							<Search size={16} />
							<input
								aria-label={m.search}
								placeholder={m.searchPlaceholder}
								value={query}
								onChange={(e) => setQuery(e.target.value)}
							/>
						</label>
					</div>
					{loading ? (
						<div className="bh-empty">
							<Loader2 className="animate-spin" />
							<p>{m.loading}</p>
						</div>
					) : projects.length ? (
						<div className="bh-project-grid">
							{projects.map((project) => (
								<article key={project.id} className="bh-project-card">
									<button
										type="button"
										className="bh-project-cover"
										disabled={busy}
										onClick={() =>
											project.local
												? router.push(`/editor/${project.id}`)
												: void openRemote(project.remote!)
										}
										aria-label={`${m.open} ${project.name}`}
									>
										{project.thumbnail ? (
											<Image
												src={project.thumbnail}
												alt=""
												width={720}
												height={405}
												unoptimized
											/>
										) : (
											<Film size={36} strokeWidth={1.2} />
										)}
										<span className="bh-cover-arrow">
											<ArrowUpRight size={18} />
										</span>
									</button>
									<div className="bh-project-info">
										<h3 title={project.name}>{project.name}</h3>
										<p>
											{new Date(project.updated).toLocaleString(
												locale === "en" ? "en-US" : "vi-VN",
												{
													day: "2-digit",
													month: "2-digit",
													hour: "2-digit",
													minute: "2-digit",
												},
											)}
										</p>
										<div>
											<span className="bh-project-state">
												{project.remote ? (
													<>
														<Cloud size={12} />
														{m.cloudSaved} · v{project.remote.revision}
													</>
												) : (
													m.browserSaved
												)}
											</span>
											{project.remote && project.local && (
												<button
													type="button"
													disabled={busy}
													onClick={() => void openRemote(project.remote!)}
												>
													{m.restore}
												</button>
											)}
										</div>
									</div>
								</article>
							))}
						</div>
					) : (
						<section className="bh-empty">
							<FolderOpen size={34} strokeWidth={1.25} />
							<h3>{query ? m.noResults : m.emptyTitle}</h3>
							<p>{query ? m.noResultsHint : m.emptyHint}</p>
							<Button
								variant="outline"
								onClick={() => fileInput.current?.click()}
								disabled={busy}
							>
								<Upload size={16} />
								{m.firstImport}
							</Button>
						</section>
					)}
					{hasMore && (
						<div className="flex justify-center py-4">
							<Button
								variant="outline"
								disabled={loadingMore || busy}
								onClick={() => void loadMore()}
							>
								{loadingMore ? <Loader2 className="animate-spin" /> : null}
								{m.loadMore}
							</Button>
						</div>
					)}
					<footer className="bh-library-footer">{m.footer}</footer>
				</div>
			</main>
			<Dialog
				open={showCreate}
				onOpenChange={(nextOpen) => {
					if (!busy) setShowCreate(nextOpen);
				}}
			>
				<DialogContent
					className="bh-modal"
					onCloseAutoFocus={(event) => {
						event.preventDefault();
						createTrigger.current?.focus();
					}}
				>
					<DialogTitle>{m.createTitle}</DialogTitle>
					<DialogDescription className="sr-only">
						{m.createHint}
					</DialogDescription>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							void create();
						}}
					>
						<label htmlFor="project-name">{m.projectName}</label>
						<input
							id="project-name"
							maxLength={200}
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={m.namePlaceholder}
						/>
						<div>
							<Button
								variant="outline"
								disabled={busy}
								onClick={() => setShowCreate(false)}
							>
								{m.cancel}
							</Button>
							<Button type="submit" disabled={busy}>
								{busy ? (
									<Loader2 className="animate-spin" />
								) : (
									<Plus size={16} />
								)}
								{m.create}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
