import { hostFetch } from "@/platform/host";
import type { EditorCore } from "@/core";
import { storageService } from "@/services/storage/service";
import type { TProject } from "@/project/types";
import { API_BASE, projectRequest, type RemoteProject } from "./api";
import { deserializeProject, editingBasis, serializeProject } from "./snapshot";

const operationsInFlight = new Set<string>();

export function currentProject(editor: EditorCore): TProject {
	return {
		...editor.project.getActive(),
		scenes: editor.scenes.getScenes(),
		currentSceneId: editor.scenes.getActiveSceneOrNull()?.id ?? editor.project.getActive().currentSceneId,
	};
}

export async function saveToServer(editor: EditorCore): Promise<RemoteProject> {
	const initial = editor.project.getActive();
	const projectId = initial.metadata.id;
	if (operationsInFlight.has(projectId)) throw new Error("Bản dựng này đang được lưu hoặc khôi phục. Hãy đợi hoàn tất.");
	operationsInFlight.add(projectId);
	try {
		await editor.save.flush();
		if (editor.project.getActiveOrNull()?.metadata.createdAt !== initial.metadata.createdAt)
			throw new Error("Bạn đã chuyển bản dựng. Hãy lưu lại bản đang mở.");
		const project = currentProject(editor);
		// Capture the base with the snapshot, before any asynchronous upload.
		const expectedRevision = project.metadata.videoSpaceRevision ?? 0;
		const basis = editingBasis(project);
		const assets = [...editor.media.getAssets()];
		const snapshot = { ...serializeProject(project), mediaAssetIds: assets.map((asset) => asset.id) };
		for (const asset of assets) {
			const { file, url: _url, ...metadata } = asset;
			const extension = asset.name.split(".").pop()?.toLowerCase() ?? "";
			const fallbackMime: Record<string, string> = {
				mp4: "video/mp4", mov: "video/quicktime", webm: "video/webm", mp3: "audio/mpeg",
				wav: "audio/wav", m4a: "audio/mp4", ogg: "audio/ogg", png: "image/png",
				jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif",
			};
			const mimeType = file.type || asset.mimeType || fallbackMime[extension] || "application/octet-stream";
			const form = new FormData();
			form.set("file", new File([file], asset.name, { type: mimeType, lastModified: file.lastModified }), asset.name);
			form.set("metadata", JSON.stringify({ ...metadata, mimeType, lastModified: file.lastModified }));
			await projectRequest({ path: `${API_BASE}/${projectId}/media/${asset.id}`, options: { method: "PUT", body: form } });
		}
		const result = await projectRequest<RemoteProject>({
			path: `${API_BASE}/${projectId}`,
			options: { method: "PUT", headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ expected_revision: expectedRevision, snapshot }) },
		});
		const active = editor.project.getActiveOrNull();
		if (active?.metadata.createdAt === initial.metadata.createdAt &&
			(active.metadata.videoSpaceRevision ?? 0) === expectedRevision) {
			// Keep edits made while uploading; only advance their persisted base revision.
			const live = currentProject(editor);
			editor.project.setActiveProject({ project: { ...live, metadata: { ...live.metadata, videoSpaceRevision: result.revision } } });
			await editor.save.flush();
		} else {
			// Navigation must not mutate another active project or rebase a different draft.
			const local = await storageService.loadProject({ id: projectId });
			if (local && editingBasis(local.project) === basis &&
				(local.project.metadata.videoSpaceRevision ?? 0) === expectedRevision) {
				await storageService.saveProject({ project: { ...local.project,
					metadata: { ...local.project.metadata, videoSpaceRevision: result.revision } } });
			}
		}
		return result;
	} finally {
		operationsInFlight.delete(projectId);
	}
}

async function fileDigest(file: File): Promise<string> {
	const hash = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
	return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function restoreFromServer(projectId: string): Promise<TProject> {
	if (operationsInFlight.has(projectId)) throw new Error("Bản dựng này đang được lưu hoặc khôi phục. Hãy đợi hoàn tất.");
	operationsInFlight.add(projectId);
	const created: string[] = [];
	let committed = false;
	try {
		const remote = await projectRequest<RemoteProject>({ path: `${API_BASE}/${projectId}` });
		const project = deserializeProject(remote.snapshot);
		project.metadata.videoSpaceRevision = remote.revision;
		const existing = await storageService.loadAllMediaAssets({ projectId });
		try {
			for (const asset of remote.assets) {
				const local = existing.find((item) => item.id === asset.id);
				if (local) {
					if (await fileDigest(local.file) !== asset.sha256)
						throw new Error(`Media trên máy khác nội dung máy chủ: ${asset.name}. Bản nháp hiện tại được giữ nguyên.`);
					// Immutable content already exists; never rewrite it during restoration.
					continue;
				}
				const response = await hostFetch(`${API_BASE}/${projectId}/media/${asset.id}`, { responseType: "blob" });
				if (!response.ok) throw new Error(`Không tải được media: ${asset.name}`);
				const file = new File([await response.blob()], asset.name, { type: asset.mime_type, lastModified: asset.metadata.lastModified });
				if (await fileDigest(file) !== asset.sha256) throw new Error(`Media tải về không toàn vẹn: ${asset.name}`);
				const url = URL.createObjectURL(file);
				try {
					await storageService.saveMediaAsset({ projectId, mediaAsset: { ...asset.metadata, file, id: asset.id, url } });
					created.push(asset.id);
				} finally { URL.revokeObjectURL(url); }
			}
			// Replace the timeline only after every required original is available.
			await storageService.saveProject({ project });
			committed = true;
			for (const asset of existing) {
				if (!remote.assets.some((item) => item.id === asset.id)) {
					await storageService.deleteMediaAsset({ projectId, id: asset.id });
				}
			}
			return project;
		} finally { for (const asset of existing) if (asset.url) URL.revokeObjectURL(asset.url); }
	} catch (error) {
		if (!committed) {
			for (const id of created) await storageService.deleteMediaAsset({ projectId, id }).catch(() => {});
		}
		throw error;
	} finally { operationsInFlight.delete(projectId); }
}
