import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { CloudUpload, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEditor } from "@/editor/use-editor";
import { getHostContext, subscribeHostContext } from "@/platform/host";
import { saveToServer } from "./sync";
import {
  applyPendingEditPlan,
  requestEditPlan,
  type PendingEditPlan,
} from "./edit-session";
import { assistantMessages } from "./studio-messages";
import { ServerRenderControls } from "./server-render-controls";
import { QuestionCards } from "./question-cards";
import {
  chatInstruction,
  displayAnswer,
  type ChatMessage,
} from "./chat-context";

export function StudioControls() {
  const projectId = useEditor(
    (editor) => editor.project.getActiveOrNull()?.metadata.id,
  );
  return <ProjectStudioControls key={projectId ?? "none"} />;
}

function ProjectStudioControls() {
  const editor = useEditor();
  const { locale } = useSyncExternalStore(subscribeHostContext, getHostContext);
  const t = assistantMessages[locale];
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [working, setWorking] = useState(false);
  const [revision, setRevision] = useState<number | null>(null);
  const [instruction, setInstruction] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<PendingEditPlan | null>(null);
  const [conversation, setConversation] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const followBottom = useRef(true);
  const alive = useRef(true);
  const busy = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  function reset() {
    setPending(null);
    setConversation("");
    setInstruction("");
    setError("");
    setMessages([]);
    setActiveQuestionId(null);
    input.current?.focus();
  }
  useEffect(() => {
    if (followBottom.current && log.current)
      log.current.scrollTop = log.current.scrollHeight;
  }, [messages, working, error]);
  function failure(error: unknown) {
    return error instanceof Error
      ? error.message === "VIDEO_EDIT_PLAN_STALE"
        ? t.stale
        : error.message === "VIDEO_EDIT_PLAN_INVALID"
          ? t.invalid
          : error.message
      : t.failed;
  }
  const save = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    try {
      const remote = await saveToServer(editor);
      setRevision(remote.revision);
      toast.success(t.savedMedia);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.saveFailed);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }, [editor, t]);
  useEffect(() => {
    const listener = () => {
      void save();
    };
    window.addEventListener("brandhub:save-project", listener);
    return () => window.removeEventListener("brandhub:save-project", listener);
  }, [save]);

  const clarifying = Boolean(conversation && pending?.plan.questions?.length);
  async function request(answer?: string) {
    const message = answer ?? instruction.trim();
    if (busy.current || !message) return;
    const text = conversation
      ? `${conversation}\n\nUser clarification JSON:\n${message}`
      : chatInstruction(messages, message);
    if (text.length > 4000) {
      setError(t.tooLong);
      return;
    }
    busy.current = true;
    followBottom.current = true;
    setInstruction("");
    setMessages((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        role: "user",
        text: answer ? displayAnswer(answer) : message,
      },
    ]);
    setWorking(true);
    setError("");
    try {
      const result = await requestEditPlan(editor, text);
      if (!alive.current) return;
      setRevision(result.plan.base_revision);
      if (result.plan.questions?.length) {
        const id = crypto.randomUUID();
        setMessages((previous) => [
          ...previous,
          {
            id,
            role: "assistant",
            text: result.plan.summary,
            plan: result.plan,
          },
        ]);
        setActiveQuestionId(id);
        setPending(result);
        setConversation(text);
        setInstruction("");
        return;
      }
      if (result.plan.actions.length) {
        await applyPendingEditPlan(editor, result);
        if (!alive.current) return;
        setPending(result);
        setConversation("");
        setInstruction("");
        setActiveQuestionId(null);
        setMessages((previous) => [
          ...previous,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: result.plan.summary,
            plan: result.plan,
            applied: true,
          },
        ]);
        toast.success(t.applied);
        try {
          const remote = await saveToServer(editor);
          if (alive.current) setRevision(remote.revision);
        } catch {
          if (alive.current) setError(t.appliedSaveFailed);
        }
      } else {
        setPending(result);
        setConversation("");
        setActiveQuestionId(null);
        setMessages((previous) => [
          ...previous,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: result.plan.summary,
            plan: result.plan,
          },
        ]);
      }
    } catch (error) {
      if (alive.current)
        setMessages((previous) => [
          ...previous,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: failure(error),
            failed: true,
          },
        ]);
    } finally {
      busy.current = false;
      if (alive.current) setWorking(false);
    }
  }
  return (
    <>
      <div className="bh-studio-controls">
        <span className="bh-save-state" role="status">
          {revision === null ? t.local : `${t.saved} · v${revision}`}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void save()}
          disabled={saving || working}
        >
          {saving ? <Loader2 className="animate-spin" /> : <CloudUpload />}
          {t.save}
        </Button>
        <Button
          ref={trigger}
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Sparkles />
          {t.assistant}
        </Button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="bh-ai-panel"
          closeLabel={t.close}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            followBottom.current = true;
            if (log.current) log.current.scrollTop = log.current.scrollHeight;
            input.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            trigger.current?.focus();
          }}
        >
          <header className="bh-ai-header">
            <div>
              <SheetTitle>
                <Sparkles size={18} />
                {t.title}
              </SheetTitle>
              <SheetDescription>{t.description}</SheetDescription>
              {messages.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={working}
                  onClick={reset}
                >
                  {t.newRequest}
                </Button>
              )}
            </div>
          </header>
          <div
            ref={log}
            className="bh-ai-messages"
            role="log"
            aria-label={t.conversation}
            aria-live="polite"
            aria-relevant="additions text"
            aria-busy={working}
            onScroll={() => {
              if (log.current)
                followBottom.current =
                  log.current.scrollHeight -
                    log.current.scrollTop -
                    log.current.clientHeight <
                  100;
            }}
          >
            {messages.length === 0 && (
              <div className="bh-ai-message" data-role="assistant">
                <strong>{t.question}</strong>
                <p>{t.capabilities}</p>
              </div>
            )}
            {messages.length === 0 && !clarifying && (
              <div className="bh-ai-examples">
                {t.examples.map((text) => (
                  <Button
                    key={text}
                    variant="outline"
                    onClick={() => {
                      reset();
                      setInstruction(text);
                      input.current?.focus();
                    }}
                    disabled={working}
                  >
                    {text}
                  </Button>
                ))}
              </div>
            )}
            {messages.map((message) => (
              <article
                key={message.id}
                className="bh-ai-message"
                data-role={message.role}
              >
                <div className="bh-chat-role">
                  {message.role === "user" ? t.you : t.assistant}
                </div>
                <p role={message.failed ? "alert" : undefined}>
                  {message.text}
                </p>
                {message.plan?.questions?.length ? (
                  message.id === activeQuestionId && clarifying ? (
                    <>
                      <p className="bh-chat-hint">{t.clarify}</p>
                      <QuestionCards
                        key={`${message.plan.base_revision}:${message.id}`}
                        questions={message.plan.questions}
                        disabled={working || saving}
                        locale={locale}
                        onComplete={(answer) => void request(answer)}
                      />
                    </>
                  ) : (
                    <ol className="bh-chat-history-questions">
                      {message.plan.questions.map((question, index) => (
                        <li key={index}>
                          {typeof question === "string"
                            ? question
                            : question.question}
                        </li>
                      ))}
                    </ol>
                  )
                ) : null}
                {message.applied && message.plan && (
                  <>
                    <p className="bh-chat-hint">
                      {message.plan.actions.length} {t.undoable}
                    </p>
                    <details className="bh-chat-changes">
                      <summary>{t.changes}</summary>
                      <ul>
                        {message.plan.actions.map((action, index) => (
                          <li key={index}>{t.actions[action.kind]}</li>
                        ))}
                      </ul>
                    </details>
                  </>
                )}
              </article>
            ))}
            {working && (
              <div className="bh-chat-working" role="status">
                <Loader2 className="animate-spin" size={14} />
                {t.working}
              </div>
            )}
            {error && (
              <div role="alert" className="bh-inline-notice">
                {error}
              </div>
            )}
          </div>
          <details className="bh-chat-render-tools" hidden={clarifying}>
            <summary>{t.renderTools}</summary>
            <ServerRenderControls
              instruction={conversation ? "" : instruction}
              disabled={working || saving || Boolean(conversation)}
              locale={locale}
            />
          </details>
          {!clarifying && (
            <form
              className="bh-ai-form"
              onSubmit={(event) => {
                event.preventDefault();
                void request();
              }}
            >
              <label htmlFor="video-edit-instruction" className="sr-only">
                {conversation ? t.answer : t.instruction}
              </label>
              <Textarea
                ref={input}
                id="video-edit-instruction"
                rows={3}
                maxLength={4000}
                value={instruction}
                onChange={(event) => setInstruction(event.target.value)}
                placeholder={t.placeholder}
                disabled={working}
              />
              <div>
                <span>{t.saveFirst}</span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={working || saving || !instruction.trim()}
                >
                  {working ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  {conversation ? t.reply : t.propose}
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
