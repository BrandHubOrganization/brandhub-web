import Link from "next/link";
"use client";

import { useEffect, useRef, useState } from "react";
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
import { DEFAULT_LOGO_URL } from "@/site/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { createProjectFromFile } from "./import-file";
import { storageService } from "@/services/storage/service";
import type { TProjectMetadata } from "@/project/types";
import { API_BASE, projectRequest, type ProjectSummary } from "./api";
import { restoreFromServer } from "./sync";
import { getHostContext } from "@/platform/host";

export function VideoProjectLibrary() {
	const router = useRouter();
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
			}
			else
				setServerError(
					b.reason instanceof Error
						? b.reason.message
						: "Chưa kết nối được máy chủ.",
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
			const page = await projectRequest<ProjectSummary[]>({ path: `${API_BASE}?page=${next}&size=50` });
			setRemote((current) => [...new Map([...current, ...page].map((project) => [project.id, project])).values()]);
			setRemotePage(next);
			setHasMore(page.length === 50);
			setServerError("");
		} catch (error) {
			setServerError(error instanceof Error ? error.message : "Could not load projects");
		} finally { setLoadingMore(false); }
	}

	async function create(file?: File) {
		if (busy) return;
		setBusy(true);
		try {
			const projectId = await createProjectFromFile({ file, name });
			router.push(`/editor/${projectId}`);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Chưa tạo được bản dựng.",
			);
			setBusy(false);
		}
	}

	async function openRemote(project: ProjectSummary) {
		if (busy) return;
		if (
			local.some((p) => p.id === project.id) &&
			!window.confirm(
				`Mở bản đã lưu của “${project.name}”? Thao tác này thay bản trên trình duyệt bằng phiên bản máy chủ. Chọn Hủy để tiếp tục phần đang sửa trên máy.`,
			)
		)
			return;
		setBusy(true);
		try {
			await restoreFromServer(project.id);
			router.push(`/editor/${project.id}`);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Không mở được bản dựng.",
			);
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
			<aside className="bh-sidebar">
				<Link className="bh-brand" href="/projects">
					<Image src={DEFAULT_LOGO_URL} width={28} height={28} alt="" />
					<span>
						Brand<span className="text-primary">Hub</span>
					</span>
				</Link>
				<div className="bh-scope">
					<span className="bh-workspace-icon">B</span>
					<div>
						<strong>Video Space</strong>
						<span>Không gian thử nghiệm</span>
					</div>
				</div>
				<nav aria-label="Điều hướng video">
					<Link className="bh-nav-active" href="/projects">
						<FolderOpen size={17} />
						Bản dựng của bạn
					</Link>
				</nav>
				<div className="bh-sidebar-bottom">
					<span>Được xây dựng trên OpenCut</span>
					<ThemeToggle />
				</div>
			</aside>
			<main className="bh-library-main">
				<header className="bh-library-top">
					<span>
						Không gian làm việc{" "}
						<span className="text-muted-foreground">/ Video Space</span>
					</span>
					<span className="bh-connection">
						<span className={serverError ? "bh-dot-off" : "bh-dot"} />
						{loading
							? "Đang kết nối"
							: serverError
								? "Bản trên máy"
								: "Máy chủ đã kết nối"}
					</span>
				</header>
				<div className="bh-library-content">
					<div className="bh-page-title">
						<div>
							<h1>Bản dựng của bạn</h1>
							<p>Biến video AI thành câu chuyện mang dấu ấn thương hiệu.</p>
						</div>
						<Button
							ref={createTrigger}
							onClick={() => setShowCreate(true)}
							disabled={busy}
						>
							<Plus size={16} />
							Tạo bản dựng
						</Button>
					</div>
					<section className="bh-import-strip" aria-labelledby="import-title">
						<div className="bh-import-icon">
							<Film size={25} />
						</div>
						<div>
							<h2 id="import-title">Video đã sẵn sàng. Bắt đầu chỉnh sửa.</h2>
							<p>
								Đưa clip AI vào timeline, thêm chữ, âm thanh và những nét riêng
								của bạn.
							</p>
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
							Nhập video
						</Button>
						<input
							ref={fileInput}
							type="file"
							accept="video/mp4,video/webm,video/quicktime"
							hidden
							aria-label="Chọn video để chỉnh sửa"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) void create(file);
								e.target.value = "";
							}}
						/>
					</section>
					{serverError && (
						<div role="status" className="bh-inline-notice">
							{serverError} Các bản dựng trên trình duyệt vẫn có thể mở và chỉnh
							sửa.
						</div>
					)}
					<div className="bh-library-toolbar">
						<h2>
							Tất cả bản dựng <span>{projects.length}</span>
						</h2>
						<label className="bh-search">
							<Search size={16} />
							<input
								aria-label="Tìm bản dựng"
								placeholder="Tìm bản dựng…"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
							/>
						</label>
					</div>
					{loading ? (
						<div className="bh-empty">
							<Loader2 className="animate-spin" />
							<p>Đang tải bản dựng…</p>
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
										aria-label={`Mở ${project.name}`}
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
											{new Date(project.updated).toLocaleString("vi-VN", {
												day: "2-digit",
												month: "2-digit",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
										<div>
											<span className="bh-project-state">
												{project.remote ? (
													<>
														<Cloud size={12} />
														Đã lưu máy chủ · v{project.remote.revision}
													</>
												) : (
													"Trên trình duyệt"
												)}
											</span>
											{project.remote && project.local && (
												<button
													type="button"
													disabled={busy}
													onClick={() => void openRemote(project.remote!)}
												>
													Khôi phục
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
							<h3>
								{query
									? "Không tìm thấy bản dựng"
									: "Câu chuyện đầu tiên bắt đầu ở đây"}
							</h3>
							<p>
								{query
									? "Thử tìm bằng một tên khác."
									: "Nhập một video có sẵn hoặc tạo timeline trống để bắt đầu."}
							</p>
							<Button
								variant="outline"
								onClick={() => fileInput.current?.click()}
								disabled={busy}
							>
								<Upload size={16} />
								Nhập video đầu tiên
							</Button>
						</section>
					)}
					{hasMore && <div className="flex justify-center py-4"><Button variant="outline" disabled={loadingMore || busy} onClick={() => void loadMore()}>{loadingMore ? <Loader2 className="animate-spin" /> : null}{getHostContext().locale === "en" ? "Load more cloud projects" : "T?i th?m b?n d?ng tr?n m?y ch?"}</Button></div>}
					<footer className="bh-library-footer">
						Bản dựng có thể tiếp tục chỉnh sửa; MP4 là video xuất để sử dụng.
					</footer>
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
					<DialogTitle>Tạo bản dựng mới</DialogTitle>
					<DialogDescription className="sr-only">
						Đặt tên cho bản dựng để bắt đầu biên tập video.
					</DialogDescription>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							void create();
						}}
					>
						<label htmlFor="project-name">Tên bản dựng</label>
						<input
							id="project-name"
							maxLength={200}
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Ví dụ: Video giới thiệu sản phẩm"
						/>
						<div>
							<Button
								variant="outline"
								disabled={busy}
								onClick={() => setShowCreate(false)}
							>
								Hủy
							</Button>
							<Button type="submit" disabled={busy}>
								{busy ? (
									<Loader2 className="animate-spin" />
								) : (
									<Plus size={16} />
								)}
								Tạo bản dựng
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
