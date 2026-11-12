import { useEffect, useRef, useState } from "react";
import { Download, Film, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEditor } from "@/editor/use-editor";
import { getHostContext, hostFetch } from "@/platform/host";
import { API_BASE, projectRequest, VideoSpaceApiError, type RemoteProject } from "./api";
import { saveToServer } from "./sync";
import { autoEditChatMessages } from "./studio-messages";
import { QuestionCards } from "./question-cards";
import { validEditQuestion, type EditQuestion } from "./edit-plan";
import {
  ImportRenderPlanCommand,
  renderPlanScene,
  type RenderPlan,
} from "./import-render-plan";
import { processMediaAssets } from "@/media/processing";

/** One chat turn = one auto-edit job; a follow-up continues its parent's editing session. */
interface Turn {
  id: string;
  status:
    "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "RECONCILIATION_REQUIRED";
  stage: string;
  created_at: string;
  instruction?: string;
  parent_job_id?: string | null;
  summary?: string | null;
  notes?: string[];
  questions?: EditQuestion[] | null;
  output: { output_asset_id: string } | null;
  plan?: RenderPlan | null;
}

function validTurn(value: unknown): value is Turn {
  if (!value || typeof value !== "object") return false;
  const turn = value as Turn;
  return (
    typeof turn.id === "string" &&
    [
      "QUEUED",
      "RUNNING",
      "COMPLETED",
      "FAILED",
      "RECONCILIATION_REQUIRED",
    ].includes(turn.status) &&
    typeof turn.stage === "string" &&
    typeof turn.created_at === "string" &&
    (turn.instruction === undefined || typeof turn.instruction === "string") &&
    (turn.notes === undefined ||
      (Array.isArray(turn.notes) &&
        turn.notes.every((n) => typeof n === "string"))) &&
    (turn.questions == null ||
      (Array.isArray(turn.questions) &&
        turn.questions.every(
          (q) => validEditQuestion(q) && typeof q !== "string",
        )))
  );
}
/** Short technical reason so a failure can be diagnosed from a screenshot. */
const reason = (failure: unknown) =>
  failure instanceof Error && failure.message ? `(${failure.message.slice(0, 160)})` : "";
const unfinished = (turn: Turn) =>
  turn.status !== "COMPLETED" && turn.status !== "FAILED";

/** The conversation shown is the parent chain ending at the newest turn. */
function thread(turns: Turn[]) {
  const byId = new Map(turns.map((turn) => [turn.id, turn]));
  const newest = [...turns].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  )[0];
  const chain: Turn[] = [];
  for (
    let turn = newest;
    turn && !chain.includes(turn);
    turn = byId.get(turn.parent_job_id ?? "")!
  )
    chain.unshift(turn);
  return chain;
}

export function AutoEditChat({ locale }: { locale: "vi" | "en" }) {
  const projectId = useEditor(
    (editor) => editor.project.getActiveOrNull()?.metadata.id,
  );
  return projectId ? (
    <ProjectChat key={projectId} locale={locale} projectId={projectId} />
  ) : null;
}

function ProjectChat({
  locale,
  projectId,
}: {
  locale: "vi" | "en";
  projectId: string;
}) {
  const editor = useEditor();
  const t = autoEditChatMessages[locale];
  const base = `${API_BASE}/${projectId}/auto-edits`;
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(true);
  const [fresh, setFresh] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  // Kept until the next send: the 3 s history poll clears `error`, which hid every send failure.
  const [sendError, setSendError] = useState("");
  const [videos, setVideos] = useState<Record<string, string>>({});
  const [videoErrors, setVideoErrors] = useState<Record<string, string>>({});
  const [refresh, setRefresh] = useState(0);
  const [applying, setApplying] = useState<string | null>(null);
  const [applied, setApplied] = useState<string[]>([]);
  const [limitations, setLimitations] = useState<Record<string, string[]>>({});
  const log = useRef<HTMLDivElement>(null);
  const urls = useRef<string[]>([]);
  const fetching = useRef(new Set<string>());
  const alive = useRef(true);
  const [pending, setPending] = useState("");
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      urls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    // A request the host drops is otherwise only rejected after 10 minutes, freezing the chat.
    const bounded = () => AbortSignal.any([abort.signal, AbortSignal.timeout(15_000)]);
    let reannounce = false;  // after a failed round, tell the host about the project again
    async function poll() {
      try {
        // The host only serves this project's chat once it knows the project is open; reading the
        // saved project (nothing is written) tells it. Checked every round so polling never stalls.
        if (reannounce || getHostContext().projectId !== projectId)
          await projectRequest<RemoteProject>({ path: `${API_BASE}/${projectId}`, options: { signal: bounded() } });
        const value = await projectRequest<unknown>({
          path: base,
          options: { signal: bounded() },
        });
        if (!Array.isArray(value) || !value.every(validTurn))
          throw new Error("Invalid chat receipt");
        if (abort.signal.aborted) return;
        setTurns(value);
        setError("");
        reannounce = false;
      } catch (failure) {
        reannounce = true;
        if (abort.signal.aborted) return;
        if (failure instanceof VideoSpaceApiError && failure.status === 404)
          setTurns([]);
        else setError(`${t.connection} ${reason(failure)}`);
      }
      setLoading(false);
      if (!abort.signal.aborted) timer = setTimeout(() => void poll(), 3000);
    }
    void poll();
    return () => {
      abort.abort();
      clearTimeout(timer);
    };
  }, [base, refresh, t.connection, projectId]);

  const shown = fresh ? [] : thread(turns);
  const last = shown.at(-1);
  // Loading history must not block sending; only a send in flight or a running turn does.
  const busy = sending || turns.some(unfinished);

  // Each finished video plays inline; fetched once per turn through the authenticated host bridge.
  useEffect(() => {
    for (const turn of shown) {
      if (
        turn.status !== "COMPLETED" ||
        !turn.output ||
        videos[turn.id] ||
        videoErrors[turn.id] ||
        fetching.current.has(turn.id)
      )
        continue;
      fetching.current.add(turn.id);
      hostFetch(`${base}/${turn.id}/content`, { responseType: "blob" })
        .then(async (response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const url = URL.createObjectURL(await response.blob());
          if (!alive.current) return URL.revokeObjectURL(url);
          urls.current.push(url);
          setVideos((current) => ({ ...current, [turn.id]: url }));
        })
        .catch((failure) => {
          fetching.current.delete(turn.id);
          // Stop silent retries: show why, and let the user retry.
          if (alive.current) setVideoErrors((current) => ({ ...current, [turn.id]: reason(failure) || "?" }));
        });
    }
  });
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [shown.length, last?.status, last?.notes?.length, videos]);

  async function send(message: string) {
    const instruction = message.trim();
    if (!instruction) return;
    if (busy) {
      setSendError(sending ? t.sending : t.stillWorking);
      return;
    }
    // Continue the newest finished turn (also after a reload); "new video" starts without one.
    const parent = fresh
      ? undefined
      : [...turns]
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .find((turn) => turn.status === "COMPLETED");
    setSending(true);
    setPending(instruction);  // show the message at once
    setSendError("");
    try {
      // Claude edits the media saved on the server, so the chat only needs the current saved revision;
      // saving the browser draft here re-uploaded every clip and failed on any revision mismatch.
      let remote: RemoteProject;
      try {
        remote = await projectRequest<RemoteProject>({ path: `${API_BASE}/${projectId}` });
      } catch (failure) {
        if (!(failure instanceof VideoSpaceApiError && failure.status === 404)) throw failure;
        remote = await saveToServer(editor);  // never saved yet: create it with its clips
      }
      // Claude only sees clips saved on the server; upload any clip that exists only in this browser.
      const saved = new Set(remote.assets.map((asset) => asset.id));
      if (editor.media.getAssets().some((asset) => !saved.has(asset.id))) remote = await saveToServer(editor);
      if (!alive.current || remote.id !== projectId) return;
      const result = await projectRequest<unknown>({
        path: base,
        options: {
          method: "POST",
          body: JSON.stringify({
            expected_revision: remote.revision,
            instruction,
            ...(parent && { parent_job_id: parent.id }),
          }),
        },
      });
      if (!alive.current) return;
      if (!validTurn(result)) throw new Error("Invalid chat receipt");
      setTurns((current) => [
        ...current.filter((turn) => turn.id !== result.id),
        result,
      ]);
      setFresh(false);
      setText("");
    } catch (failure) {
      if (alive.current) setSendError(`${t.sendFailed} ${reason(failure)}`);
    } finally {
      if (alive.current) {
        setPending("");
        setSending(false);
        setRefresh((value) => value + 1);
      }
    }
  }
  /** Adds editable layers when exported; old flattened results remain available as MP4 scenes. */
  async function applyToTimeline(turn: Turn) {
    const url = videos[turn.id],
      plan = turn.plan;
    if (!url || !plan || applying) return;
    setApplying(turn.id);
    setError("");
    const active = () =>
      alive.current &&
      editor.project.getActiveOrNull()?.metadata.id === projectId;
    try {
      let imported = plan;
      if (!plan.editable) {
        const file = new File(
          [await (await fetch(url)).blob()],
          `claude-${turn.id.slice(0, 8)}.mp4`,
          { type: "video/mp4" },
        );
        const [asset] = await processMediaAssets({ files: [file] });
        if (!active()) return;
        const saved =
          asset && (await editor.media.addMediaAsset({ projectId, asset }));
        if (!saved || saved.type !== "video")
          throw new Error("VIDEO_IMPORT_FAILED");
        const frames = plan.duration_frames;
        imported = {
          ...plan,
          clips: [
            {
              asset_id: saved.id,
              start_frame: 0,
              duration_frames: frames,
              source_start_seconds: 0,
              speed: 1,
              freeze: false,
              fit: "contain",
              zoom: 1,
              transition: "cut",
              transition_frames: 0,
            },
          ],
          graphics: [],
          audio: [
            {
              asset_id: saved.id,
              role: "source",
              start_frame: 0,
              duration_frames: frames,
              source_start_seconds: 0,
              speed: 1,
              gain: 1,
            },
          ],
        };
      }
      if (!active()) return;
      const { scene, mp4Only } = renderPlanScene({
        plan: imported,
        name: t.sceneName,
        canvas: editor.project.getActive().settings.canvasSize,
        mediaIds: new Map(
          editor.media
            .getAssets()
            .map((asset) => [
              asset.id,
              { type: asset.type, duration: asset.duration },
            ]),
        ),
      });
      editor.command.execute({
        command: new ImportRenderPlanCommand(editor, scene),
      });
      setApplied((current) => [...current, turn.id]);
      if (plan.editable)
        setLimitations((current) => ({ ...current, [turn.id]: mp4Only }));
      try {
        await saveToServer(editor);
      } catch {
        if (active()) setError(t.saveFailed);
      }
    } catch {
      if (active()) setError(t.applyFailed);
    } finally {
      if (alive.current) setApplying(null);
    }
  }
  function answer(json: string) {
    const answers = JSON.parse(json) as { question: string; answer: string }[];
    void send(answers.map((a) => `${a.question} ${a.answer}`).join("\n"));
  }

  return (
    <>
      <div
        ref={log}
        className="bh-ai-messages"
        role="log"
        aria-label={t.conversation}
        aria-live="polite"
        aria-busy={busy}
      >
        {shown.length === 0 && !pending && (
          <div className="bh-ai-message" data-role="assistant">
            <strong>{t.hello}</strong>
            <p>{t.intro}</p>
          </div>
        )}
        {shown.map((turn) => (
          <div key={turn.id}>
            <article className="bh-ai-message" data-role="user">
              <div className="bh-chat-role">{t.you}</div>
              <p className="whitespace-pre-line">{turn.instruction}</p>
            </article>
            <article className="bh-ai-message" data-role="assistant">
              <div className="bh-chat-role">{t.assistant}</div>
              {unfinished(turn) ? (
                <Progress turn={turn} t={t} />
              ) : turn.status === "FAILED" ? (
                <p role="alert">{t.failed}</p>
              ) : (
                <>
                  {turn.summary && (
                    <p className="whitespace-pre-line">{turn.summary}</p>
                  )}
                  {turn.questions?.length ? (
                    turn === last ? (
                      <QuestionCards
                        questions={turn.questions}
                        disabled={busy}
                        locale={locale}
                        onComplete={answer}
                      />
                    ) : (
                      <ol className="bh-chat-history-questions">
                        {turn.questions.map((q, index) => (
                          <li key={index}>{q.question}</li>
                        ))}
                      </ol>
                    )
                  ) : null}
                  {turn.output &&
                    (videos[turn.id] ? (
                      <>
                        <video
                          src={videos[turn.id]}
                          controls
                          playsInline
                          className="w-full rounded-md"
                        />
                        <div className="flex flex-wrap gap-2">
                          {turn.plan && (
                            <Button
                              type="button"
                              size="sm"
                              disabled={Boolean(applying)}
                              onClick={() => void applyToTimeline(turn)}
                            >
                              {applying === turn.id ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                <Film />
                              )}{" "}
                              {applied.includes(turn.id)
                                ? t.appliedAgain
                                : t.apply}
                            </Button>
                          )}
                          <Button asChild variant="outline" size="sm">
                            <a
                              href={videos[turn.id]}
                              download={`video-${turn.id}.mp4`}
                            >
                              <Download /> {t.download}
                            </a>
                          </Button>
                        </div>
                        {turn.plan && (
                          <p className="bh-chat-hint">
                            {turn.plan.editable
                              ? t.layersAvailable
                              : t.flattened}
                          </p>
                        )}
                        {applied.includes(turn.id) && (
                          <p className="bh-chat-hint">{t.applied}</p>
                        )}
                        {limitations[turn.id]?.length ? (
                          <p className="bh-inline-notice" role="status">
                            {t.approximate}
                          </p>
                        ) : null}
                      </>
                    ) : videoErrors[turn.id] ? (
                      <p role="alert" className="bh-chat-hint">
                        {t.videoFailed} {videoErrors[turn.id]}{" "}
                        <Button type="button" variant="outline" size="sm"
                          onClick={() => setVideoErrors(({ [turn.id]: _, ...rest }) => rest)}>
                          {t.retry}
                        </Button>
                      </p>
                    ) : (
                      <p className="bh-chat-working">
                        <Loader2 className="animate-spin" size={14} />{" "}
                        {t.loadingVideo}
                      </p>
                    ))}
                </>
              )}
            </article>
          </div>
        ))}
        {pending && (
          <article className="bh-ai-message" data-role="user">
            <div className="bh-chat-role">{t.you}</div>
            <p className="whitespace-pre-line">{pending}</p>
            <p className="bh-chat-working" role="status">
              <Loader2 className="animate-spin" size={14} /> {t.sending}
            </p>
          </article>
        )}
        {sendError && (
          <div role="alert" className="bh-inline-notice">
            {sendError}
          </div>
        )}
        {error && (
          <div role="alert" className="bh-inline-notice">
            {error}
          </div>
        )}
      </div>
      {!(last?.questions?.length && last.status === "COMPLETED") && (
        <form
          className="bh-ai-form"
          onSubmit={(event) => {
            event.preventDefault();
            void send(text);
          }}
        >
          <label htmlFor="auto-edit-message" className="sr-only">
            {t.placeholder}
          </label>
          <Textarea
            id="auto-edit-message"
            rows={3}
            maxLength={4000}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send(text);
              }
            }}
            placeholder={shown.length ? t.followUp : t.placeholder}
            disabled={busy}
          />
          <div>
            {shown.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => setFresh(true)}
              >
                {t.newVideo}
              </Button>
            )}
            <Button type="submit" size="sm" disabled={busy || !text.trim()}>
              {sending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send size={15} />
              )}{" "}
              {t.send}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}

function Progress({
  turn,
  t,
}: {
  turn: Turn;
  t: (typeof autoEditChatMessages)["vi"];
}) {
  if (turn.status === "RECONCILIATION_REQUIRED") return <p>{t.checking}</p>;
  const notes = turn.notes ?? [];
  // After editing finishes, the MP4 is checked and saved; say so instead of the last editing step.
  const tail = ["rendering", "qc", "uploading"].includes(turn.stage)
    ? t.saving
    : (notes.at(-1) ?? t.starting);
  return (
    <>
      {notes
        .slice(
          -4,
          ["rendering", "qc", "uploading"].includes(turn.stage)
            ? undefined
            : -1,
        )
        .map((note, index) => (
          <p key={index} className="bh-chat-hint">
            ✓ {note}
          </p>
        ))}
      <p className="bh-chat-working" role="status">
        <Loader2 className="animate-spin" size={14} /> {tail}
      </p>
      <p className="bh-chat-hint">{t.patience}</p>
    </>
  );
}
