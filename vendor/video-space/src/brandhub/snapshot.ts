import type { TProject } from "@/project/types";
import type { SerializedProject } from "@/services/storage/types";

export function serializeProject(project: TProject): SerializedProject {
  // AudioBuffer is reconstructed from original media, never sent as JSON.
  return JSON.parse(
    JSON.stringify(project, (key, value) =>
      key === "buffer" ? undefined : value,
    ),
  );
}

export function deserializeProject(project: SerializedProject): TProject {
  return {
    ...project,
    metadata: {
      ...project.metadata,
      createdAt: new Date(project.metadata.createdAt),
      updatedAt: new Date(project.metadata.updatedAt),
    },
    scenes: project.scenes.map((scene) => ({
      ...scene,
      createdAt: new Date(scene.createdAt),
      updatedAt: new Date(scene.updatedAt),
    })),
  };
}

export function editingBasis(project: TProject): string {
  const serialized = serializeProject(project);
  return JSON.stringify({
    projectId: serialized.metadata.id,
    name: serialized.metadata.name,
    settings: serialized.settings,
    currentSceneId: serialized.currentSceneId,
    scenes: serialized.scenes.map(
      ({ createdAt: _created, updatedAt: _updated, ...scene }) => scene,
    ),
  });
}
