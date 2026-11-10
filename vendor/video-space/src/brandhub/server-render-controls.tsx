import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Download, Film, Loader2, WandSparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useEditor } from "@/editor/use-editor";
import {
  getHostContext,
  hostFetch,
  subscribeHostContext,
} from "@/platform/host";
import { API_BASE, projectRequest, VideoSpaceApiError } from "./api";
import { saveToServer } from "./sync";
import { serverRenderMessages } from "./studio-messages";
import {
  ImportRenderPlanCommand,
  renderPlanScene,
  type RenderPlan,
} from "./import-render-plan";

interface RenderJob {
  id: string;
  status:
    "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "RECONCILIATION_REQUIRED";
  stage: string;
  progress: number;
  base_revision: number;
  output: { output_asset_id: string } | null;
  render_mp4?: boolean;
  summary?: string | null;
  plan?: RenderPlan | null;
  agent?: { turns?: number; previews?: number; frames?: number } | null;
}
const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
function validJob(value: unknown): value is RenderJob {
  if (!value || typeof value !== "object") return false;
  const job = value as RenderJob;
  return (
    typeof job.id === "string" &&
    uuid.test(job.id) &&
    [
      "QUEUED",
      "RUNNING",
      "COMPLETED",
      "FAILED",
      "RECONCILIATION_REQUIRED",
    ].includes(job.status) &&
    typeof job.stage === "string" &&
    Number.isFinite(job.progress) &&
    job.progress >= 0 &&
    job.progress <= 100 &&
    Number.isSafeInteger(job.base_revision) &&
    job.base_revision >= 1
  );
}
function unfinished(job: RenderJob) {
  return job.status !== "COMPLETED" && job.status !== "FAILED";
}

export function ServerRenderControls(props: {
  instruction: string;
  disabled: boolean;
  locale: "vi" | "en";
}) {
  const projectId = useEditor(
    (editor) => editor.project.getActiveOrNull()?.metadata.id,
  );
  return projectId ? (
    <ProjectRenderControls key={projectId} {...props} projectId={projectId} />
  ) : null;
}

function ProjectRenderControls({
  instruction,
  disabled,
  locale,
  projectId,
}: {
  instruction: string;
  disabled: boolean;
  locale: "vi" | "en";
  projectId: string;
}) {
  const editor = useEditor();
  const hostProjectId = useSyncExternalStore(
    subscribeHostContext,
    getHostContext,
  ).projectId;
  const t = serverRenderMessages[locale];
  const [job, setJob] = useState<RenderJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [renderMp4, setRenderMp4] = useState(true);
  const [imported, setImported] = useState<string[] | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const memoryPath = `${API_BASE}/${projectId}/auto-edit-memory`;
  useEffect(() => {
    if (hostProjectId !== projectId) return;
    const abort = new AbortController();
    projectRequest<{ notes?: unknown }>({ path: memoryPath, options: { signal: abort.signal } })
      .then((value) => {
        if (Array.isArray(value?.notes)) setNotes(value.notes.filter((n): n is string => typeof n === "string"));
      })
      .catch(() => undefined);  // memory is optional; the panel works without it
    return () => abort.abort();
  }, [memoryPath, hostProjectId, projectId, refresh]);
  async function forget(note: string) {
    try {
      const value = await projectRequest<{ notes?: unknown }>({
        path: memoryPath,
        options: { method: "PUT", body: JSON.stringify({ notes: notes.filter((n) => n !== note) }) },
      });
      if (Array.isArray(value?.notes)) setNotes(value.notes.filter((n): n is string => typeof n === "string"));
    } catch {
      setError(t.memoryFailed);
    }
  }
  function openOnTimeline(plan: RenderPlan) {
    try {
      const project = editor.project.getActive();
      const media = new Map(
        editor.media.getAssets().map((asset) => [asset.id, { type: asset.type, duration: asset.duration }] as const),
      );
      const { scene, mp4Only } = renderPlanScene({
        plan,
        name: t.sceneName,
        canvas: project.settings.canvasSize,
        mediaIds: media,
      });
      editor.command.execute({ command: new ImportRenderPlanCommand(editor, scene) });
      setImported(mp4Only);
    } catch {
      setError(t.importFailed);
    }
  }
  const alive = useRef(true);
  const submittingRef = useRef(false);
  const actionAbort = useRef<AbortController | null>(null);
  const downloadUrl = useRef<string | null>(null);
  const revokeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const base = `${API_BASE}/${projectId}/auto-edits`;
  const current = () =>
    alive.current &&
    editor.project.getActiveOrNull()?.metadata.id === projectId;
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      actionAbort.current?.abort();
      if (revokeTimer.current) clearTimeout(revokeTimer.current);
      if (downloadUrl.current) URL.revokeObjectURL(downloadUrl.current);
    };
  }, []);
  useEffect(() => {
    if (hostProjectId !== projectId) {
      setLoading(false);
      return;
    }
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const jobs = await projectRequest<unknown>({
          path: base,
          options: { signal: abort.signal },
        });
        if (!Array.isArray(jobs) || !jobs.every(validJob))
          throw new Error("Invalid render receipt");
        if (abort.signal.aborted) return;
        setJob(jobs.find(unfinished) ?? jobs[0] ?? null);
        setError("");
        setLoading(false);
      } catch (failure) {
        if (abort.signal.aborted) return;
        if (failure instanceof VideoSpaceApiError && failure.status === 404) {
          setJob(null);
          setLoading(false);
          setError("");
        } else setError(t.connection);
        // Keep admission disabled until resume lookup succeeds: a previous POST may have been accepted.
      }
      if (!abort.signal.aborted) timer = setTimeout(() => void poll(), 3000);
    }
    void poll();
    return () => {
      abort.abort();
      clearTimeout(timer);
    };
  }, [base, refresh, t.connection, hostProjectId, projectId]);

  async function submit() {
    if (
      submittingRef.current ||
      loading ||
      disabled ||
      (job && unfinished(job)) ||
      !instruction.trim()
    )
      return;
    submittingRef.current = true;
    setSubmitting(true);
    setError("");
    const text = instruction.trim();
    const abort = new AbortController();
    actionAbort.current = abort;
    try {
      const remote = await saveToServer(editor);
      if (!current() || remote.id !== projectId) return;
      const result = await projectRequest<unknown>({
        path: base,
        options: {
          method: "POST",
          signal: abort.signal,
          body: JSON.stringify({
            expected_revision: remote.revision,
            instruction: text,
            ...(!renderMp4 && { render_mp4: false }),
          }),
        },
      });
      if (!current()) return;
      if (!validJob(result)) throw new Error("Invalid render receipt");
      setJob(result);
    } catch {
      if (current()) setError(t.submitFailed);
    } finally {
      submittingRef.current = false;
      if (current()) {
        setSubmitting(false);
        setLoading(true);
        setRefresh((value) => value + 1);
      }
    }
  }
  async function download() {
    if (!job || job.status !== "COMPLETED" || downloading) return;
    setDownloading(true);
    setError("");
    const abort = new AbortController();
    actionAbort.current = abort;
    try {
      const response = await hostFetch(`${base}/${job.id}/content`, {
        responseType: "blob",
        signal: abort.signal,
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      if (!current()) return;
      if (downloadUrl.current) URL.revokeObjectURL(downloadUrl.current);
      if (revokeTimer.current) clearTimeout(revokeTimer.current);
      const url = URL.createObjectURL(blob);
      downloadUrl.current = url;
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `auto-edit-${job.id}.mp4`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      revokeTimer.current = setTimeout(() => {
        URL.revokeObjectURL(url);
        if (downloadUrl.current === url) downloadUrl.current = null;
      }, 5000);
    } catch {
      if (current()) setError(t.downloadFailed);
    } finally {
      if (current()) setDownloading(false);
    }
  }
  return (
    <section className="bh-ai-plan" aria-label={t.title}>
      <Button
        type="button"
        onClick={() => void submit()}
        disabled={
          disabled ||
          loading ||
          submitting ||
          !instruction.trim() ||
          Boolean(job && unfinished(job))
        }
      >
        {submitting ? <Loader2 className="animate-spin" /> : <WandSparkles />}{" "}
        {submitting ? t.submitting : t.title}
      </Button>
      <p>{t.description}</p>
      <label className="flex items-center gap-2">
        <Checkbox
          checked={renderMp4}
          onCheckedChange={(value) => setRenderMp4(value === true)}
          disabled={submitting || Boolean(job && unfinished(job))}
        />
        {t.renderMp4}
      </label>
      {notes.length > 0 && (
        <details>
          <summary>{t.memoryTitle(notes.length)}</summary>
          <ul>
            {notes.map((note) => (
              <li key={note} className="flex items-center justify-between gap-2">
                <span>{note}</span>
                <Button type="button" variant="ghost" size="icon" aria-label={t.forget(note)} onClick={() => void forget(note)}>
                  <X />
                </Button>
              </li>
            ))}
          </ul>
        </details>
      )}
      {job && (
        <div role="status" aria-live="polite">
          <strong>
            {t.stages[job.stage as keyof typeof t.stages] ?? t.stages.queued}
          </strong>
          <p>
            {t.version} {job.base_revision} · {Math.round(job.progress)}%
          </p>
          <progress
            value={job.progress}
            max={100}
            aria-label={t.progress}
            className="w-full"
          />
          {job.agent?.turns && unfinished(job) && (
            <p>{t.agentProgress(job.agent.turns, job.agent.previews ?? 0)}</p>
          )}
          {job.summary && <p>{job.summary}</p>}
          {job.status === "RECONCILIATION_REQUIRED" && (
            <p>{t.reconciliation}</p>
          )}
          {job.status === "FAILED" && <p>{t.failed}</p>}
          {job.status === "COMPLETED" && job.plan && (
            <Button type="button" variant="outline" onClick={() => openOnTimeline(job.plan!)}>
              <Film /> {t.openTimeline}
            </Button>
          )}
          {imported && (
            <p>{imported.length ? t.mp4Only(imported.join(", ")) : t.importedAll}</p>
          )}
          {job.status === "COMPLETED" && job.output && (
            <Button
              type="button"
              variant="outline"
              onClick={() => void download()}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Download />
              )}{" "}
              {t.download}
            </Button>
          )}
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
