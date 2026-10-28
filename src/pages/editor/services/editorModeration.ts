import type { ModerationResult } from "@/types/moderation";

export interface EditorModerationSnapshot {
  workspaceId?: string;
  text: string;
  phase: "IDLE" | "WAITING" | "CHECKING" | "DONE";
  result?: ModerationResult;
}

type Request = (
  workspaceId: string,
  text: string,
  signal: AbortSignal,
) => Promise<ModerationResult>;
const unavailable = (): ModerationResult => ({
  status: "NOT_CHECKED",
  issues: [],
});

export class EditorModeration {
  private state: EditorModerationSnapshot = { text: "", phase: "IDLE" };
  private revision = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private active?: {
    revision: number;
    abort: AbortController;
    promise: Promise<ModerationResult | undefined>;
  };
  private listeners = new Set<() => void>();
  private readonly request: Request;

  constructor(request: Request) {
    this.request = request;
  }

  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private emit(state: EditorModerationSnapshot) {
    this.state = state;
    this.listeners.forEach((listener) => listener());
  }

  update(workspaceId: string | undefined, text: string) {
    if (this.state.workspaceId === workspaceId && this.state.text === text)
      return;
    this.revision++;
    clearTimeout(this.timer);
    this.active?.abort.abort();
    this.active = undefined;
    const enabled = Boolean(workspaceId && text.trim());
    this.emit({ workspaceId, text, phase: enabled ? "WAITING" : "IDLE" });
    if (enabled)
      this.timer = setTimeout(() => {
        void this.ensure();
      }, 3_000);
  }

  ensure = (): Promise<ModerationResult | undefined> => {
    clearTimeout(this.timer);
    if (this.active) return this.active.promise;
    const { workspaceId, text, result } = this.state;
    if (result && result.status !== "NOT_CHECKED")
      return Promise.resolve(result);
    if (!workspaceId || !text.trim() || text.length > 8000) {
      const invalid = unavailable();
      this.emit({ workspaceId, text, phase: "DONE", result: invalid });
      return Promise.resolve(invalid);
    }
    const revision = this.revision;
    const abort = new AbortController();
    this.emit({ workspaceId, text, phase: "CHECKING" });
    const promise = Promise.resolve()
      .then(() => this.request(workspaceId, text, abort.signal))
      .catch(() => unavailable())
      .then((next) => {
        if (abort.signal.aborted || revision !== this.revision)
          return undefined;
        this.emit({ workspaceId, text, phase: "DONE", result: next });
        return next;
      })
      .finally(() => {
        if (this.active?.revision === revision) this.active = undefined;
      });
    this.active = { revision, abort, promise };
    return promise;
  };

  dispose = () => {
    this.revision++;
    clearTimeout(this.timer);
    this.active?.abort.abort();
    this.active = undefined;
    this.state = { text: "", phase: "IDLE" };
  };
}
