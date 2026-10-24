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
  return (
    <section className="bg-card flex h-full min-h-0 flex-col">
      <div className="border-border flex items-center justify-between border-b p-4">
        <h2 className="text-base font-semibold">
          {t(props.direct ? "chat.channels.newDirect" : "chat.channels.create")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
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
                {[false, true].map((isPrivate) => {
                  const Icon = isPrivate ? LockKeyhole : Hash;
                  return (
                    <Button
                      key={String(isPrivate)}
                      variant="outline"
                      type="button"
                      aria-pressed={privateChannel === isPrivate}
                      onClick={() => setPrivateChannel(isPrivate)}
                      className={cn(
                        "min-h-14 w-full justify-start text-left whitespace-normal",
                        privateChannel === isPrivate &&
                          "border-brand-orange bg-brand-orange-soft",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>
                        <span className="block">
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
            </>
          )}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">
              {t(
                props.direct
                  ? "chat.channels.choosePerson"
                  : "chat.channels.invite",
              )}
            </h3>
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
            {props.people
              .filter(
                (person) =>
                  person.userId !== props.userId &&
                  person.displayName
                    .toLocaleLowerCase()
                    .includes(query.toLocaleLowerCase()),
              )
              .map((person) => (
                <Button
                  type="button"
                  key={person.userId}
                  variant="ghost"
                  aria-pressed={selected.includes(person.userId)}
                  className="min-h-12 w-full justify-start"
                  onClick={() => select(person.userId)}
                >
                  <MessageSquare className="text-muted-foreground size-4" />
                  <span className="min-w-0 flex-1 truncate text-left">
                    {person.displayName}
                    <span className="text-muted-foreground ml-2 text-xs">
                      {t(`chat.ui.roles.${person.role}`)}
                    </span>
                  </span>
                  {selected.includes(person.userId) && (
                    <Check className="text-brand-orange size-4" />
                  )}
                </Button>
              ))}
            {props.hasMore && (
              <Button
                type="button"
                variant="outline"
                loading={props.loadingMore}
                onClick={props.onLoadMore}
              >
                {t("chat.channels.loadMorePeople")}
              </Button>
            )}
          </div>
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
        </div>
        <div className="border-border border-t p-4">
          <Button
            type="submit"
            variant="orange"
            className="w-full"
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
