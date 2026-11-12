import type { EditorCore } from "@/core";
import { API_BASE, projectRequest, type RemoteProject } from "./api";
import { currentProject, saveToServer } from "./sync";
import { editingBasis } from "./snapshot";
import { validateEditPlan, type EditPlan } from "./edit-plan";
import { applyEditPlan } from "./apply-plan";
import { TICKS_PER_SECOND } from "@/wasm";

export interface PendingEditPlan {
  plan: EditPlan;
  basis: string;
}

function requireBasis(editor: EditorCore, basis: string, revision?: number) {
  const project = currentProject(editor);
  if (
    editingBasis(project) !== basis ||
    (revision !== undefined && project.metadata.videoSpaceRevision !== revision)
  )
    throw new Error("VIDEO_EDIT_PLAN_STALE");
}

export async function requestEditPlan(
  editor: EditorCore,
  instruction: string,
): Promise<PendingEditPlan> {
  if (!instruction.trim() || instruction.length > 4000)
    throw new Error("VIDEO_EDIT_PLAN_INVALID");
  const basis = editingBasis(currentProject(editor));
  const remote = await saveToServer(editor);
  requireBasis(editor, basis, remote.revision);
  const plan = await projectRequest<unknown>({
    path: `${API_BASE}/${remote.id}/edit-plans`,
    options: {
      method: "POST",
      body: JSON.stringify({
        expected_revision: remote.revision,
        instruction: instruction.trim(),
      }),
    },
  });
  requireBasis(editor, basis, remote.revision);
  validateEditPlan(
    plan,
    editor.scenes.getActiveScene().tracks,
    TICKS_PER_SECOND,
  );
  if (plan.base_revision !== remote.revision)
    throw new Error("VIDEO_EDIT_PLAN_STALE");
  return { plan, basis };
}

export async function applyPendingEditPlan(
  editor: EditorCore,
  pending: PendingEditPlan,
): Promise<void> {
  requireBasis(editor, pending.basis, pending.plan.base_revision);
  const remote = await projectRequest<RemoteProject>({
    path: `${API_BASE}/${editor.project.getActive().metadata.id}`,
  });
  if (remote.revision !== pending.plan.base_revision)
    throw new Error("VIDEO_EDIT_PLAN_STALE");
  requireBasis(editor, pending.basis, pending.plan.base_revision);
  applyEditPlan({ editor, plan: pending.plan });
}
