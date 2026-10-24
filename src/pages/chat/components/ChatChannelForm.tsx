import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  Hash,
  LockKeyhole,
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
  ChatChannel,
  ChatDirectoryMember,
  CreateChannelRequest,
} from "@/types/chatCollaboration";

interface FormProps {
  direct: boolean;
  userId: string;
  people: ChatDirectoryMember[];
  loading: boolean;
  directoryError: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onRetryDirectory: () => void;
  onCreate: (request: CreateChannelRequest) => Promise<ChatChannel>;
  onCreated: (channel: ChatChannel) => void;
  onClose: () => void;
}

const ROLE_BADGE_STYLES: Record<string, string> = {
  OWNER: "border-brand-orange/30 bg-brand-orange-soft text-brand-orange",
  MANAGER: "border-brand-orange/30 bg-brand-orange-soft text-brand-orange",
  CREATOR: "border-border bg-secondary text-secondary-foreground",
  CLIENT: "border-border/80 bg-muted text-muted-foreground",
};

function getInitials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function ChatChannelForm(props: FormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privateChannel, setPrivateChannel] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [requestId] = useState(() => crypto.randomUUID());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (props.direct ? selected.length !== 1 : !name.trim()) {
      setError(t("chat.channels.invalid"));
      return;
    }
    setSaving(true);
    try {
      const target = props.people.find(
        (person) => person.userId === selected[0],
      );
      const channel = await props.onCreate({
        requestId,
        name: props.direct ? (target?.displayName ?? "Direct") : name.trim(),
        description,
        type: props.direct ? "DIRECT" : privateChannel ? "PRIVATE" : "PUBLIC",
        memberUserIds: selected,
      });
      props.onCreated(channel);
    } catch {
      setError(t("chat.errors.create"));
    } finally {
      setSaving(false);
    }
  };
  const select = (userId: string) =>
    setSelected((current) =>
      props.direct
        ? [userId]
        : current.includes(userId)
          ? current.filter((id) => id !== userId)
          : [...current, userId],
    );
  const HeaderIcon = props.direct ? MessageSquare : Hash;
  return (
    <section className="bg-card flex h-full min-h-0 flex-col">
      <div className="border-border/80 flex min-h-14 items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="bg-brand-orange-soft text-brand-orange flex size-8 shrink-0 items-center justify-center rounded-lg"
          >
            <HeaderIcon className="size-4" />
          </span>
          <h2 className="truncate text-base font-semibold tracking-tight">
            {t(
              props.direct ? "chat.channels.newDirect" : "chat.channels.create",
            )}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 rounded-lg"
          aria-label={t("chat.actions.close")}
          onClick={props.onClose}
        >
          <X className="size-4" />
        </Button>
      </div>
      <form
        onSubmit={(event) => void submit(event)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
          {!props.direct && (
            <>
              <Input
                label={t("chat.channels.name")}
                value={name}
                maxLength={80}
                required
                placeholder={t("chat.channels.namePlaceholder")}
                onChange={(event) => setName(event.target.value)}
              />
              <div className="space-y-2">
                <Label htmlFor="channel-description">
                  {t("chat.channels.description")}
                </Label>
                <Textarea
                  id="channel-description"
                  value={description}
                  maxLength={500}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("chat.channels.visibility")}</Label>
                <div className="space-y-2">
                  {[false, true].map((isPrivate) => {
                    const Icon = isPrivate ? LockKeyhole : Hash;
                    const active = privateChannel === isPrivate;
                    return (
                      <Button
                        key={String(isPrivate)}
                        variant="outline"
                        type="button"
                        aria-pressed={active}
                        onClick={() => setPrivateChannel(isPrivate)}
                        className={cn(
                          "min-h-14 w-full justify-start gap-3 rounded-xl px-3.5 py-2.5 text-left whitespace-normal transition-all",
                          active &&
                            "border-brand-orange bg-brand-orange-soft/60 ring-brand-orange/20 ring-1",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-lg",
                            active && "bg-brand-orange-soft text-brand-orange",
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">
                            {t(
                              isPrivate
                                ? "chat.channels.type.PRIVATE"
                                : "chat.channels.type.PUBLIC",
                            )}
                          </span>
                          <span className="text-muted-foreground block text-xs font-normal">
                            {t(
                              isPrivate
                                ? "chat.channels.privateHint"
                                : "chat.channels.publicHint",
                            )}
                          </span>
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">
                {t(
                  props.direct
                    ? "chat.channels.choosePerson"
                    : "chat.channels.invite",
                )}
              </h3>
              {selected.length > 0 && (
                <span className="border-brand-orange/30 bg-brand-orange-soft text-brand-orange rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums">
                  {selected.length}
                </span>
              )}
            </div>
            <Input
              value={query}
              aria-label={t("chat.composer.findMember")}
              placeholder={t("chat.composer.findMember")}
              iconPrefix={<Search />}
              onChange={(event) => setQuery(event.target.value)}
            />
            {props.directoryError && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={props.onRetryDirectory}
              >
                {t("chat.actions.retry")}
              </Button>
            )}
            {props.loading && (
              <p role="status" className="text-muted-foreground text-sm">
                {t("chat.channels.loadingPeople")}
              </p>
            )}
            <div className="space-y-1">
              {props.people
                .filter(
                  (person) =>
                    person.userId !== props.userId &&
                    person.displayName
                      .toLocaleLowerCase()
                      .includes(query.toLocaleLowerCase()),
                )
                .map((person) => {
                  const isSelected = selected.includes(person.userId);
                  return (
                    <Button
                      type="button"
                      key={person.userId}
                      variant="ghost"
                      aria-pressed={isSelected}
                      className={cn(
                        "min-h-12 w-full justify-start gap-2.5 rounded-xl px-2.5",
                        isSelected && "bg-brand-orange-soft/50",
                      )}
                      onClick={() => select(person.userId)}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "bg-secondary text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
                          isSelected &&
                            "bg-brand-orange-soft text-brand-orange",
                        )}
                      >
                        {getInitials(person.displayName)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-left text-sm font-medium">
                        {person.displayName}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase",
                          ROLE_BADGE_STYLES[person.role] ??
                            "border-border/80 bg-muted text-muted-foreground",
                        )}
                      >
                        {t(`chat.ui.roles.${person.role}`)}
                      </span>
                      {isSelected && (
                        <Check className="text-brand-orange size-4 shrink-0" />
                      )}
                    </Button>
                  );
                })}
            </div>
            {props.hasMore && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                loading={props.loadingMore}
                onClick={props.onLoadMore}
              >
                {t("chat.channels.loadMorePeople")}
              </Button>
            )}
          </div>
          {error && (
            <p
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
            >
              {error}
            </p>
          )}
        </div>
        <div className="border-border/80 border-t p-4">
          <Button
            type="submit"
            variant="orange"
            className="w-full transition-transform active:scale-[0.98]"
            loading={saving}
            disabled={
              props.direct
                ? selected.length !== 1
                : !name.trim() || name.trim().toLowerCase() === "general"
            }
          >
            {t(
              props.direct
                ? "chat.channels.startDirect"
                : "chat.channels.create",
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
