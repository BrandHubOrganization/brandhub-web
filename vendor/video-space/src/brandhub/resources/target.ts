import type { EditorCore } from "@/core";

/** Async picker results belong to the scene and project instance that requested them. */
export function guardResourceTarget({
	editor,
}: {
	editor: EditorCore;
}): () => void {
	const project = editor.project.getActive();
	const sceneId = editor.scenes.getActiveScene().id;
	return () => {
		const active = editor.project.getActiveOrNull();
		if (
			active?.metadata.id !== project.metadata.id ||
			active.metadata.createdAt !== project.metadata.createdAt ||
			editor.scenes.getActiveSceneOrNull()?.id !== sceneId
		) {
			throw new Error(
				"Bản dựng hoặc scene đã thay đổi. Tài nguyên chưa được chèn; hãy chọn lại trong bản đang mở.",
			);
		}
	};
}
