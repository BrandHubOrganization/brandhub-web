import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Archive, UserPlus, UserMinus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type {
  ChatChannel,
  ChatDirectoryMember,
  UpdateChannelRequest,
} from "@/types/chatCollaboration";

interface DetailsProps {
  channel: ChatChannel;
  userId: string;
  people: ChatDirectoryMember[];
  hasMorePeople: boolean;
  onLoadMorePeople: () => void;
  onRetryDirectory: () => void;
  directoryError: boolean;
  onUpdate: (request: UpdateChannelRequest) => Promise<ChatChannel>;
  onMember: (userId: string, add: boolean) => Promise<ChatChannel>;
  onClose: () => void;
}

export function ChatChannelDetails(props: DetailsProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(props.channel.name);
  const [description, setDescription] = useState(
    props.channel.description ?? "",
  );
  const [managersOnly, setManagersOnly] = useState(props.channel.managersOnly);
  const [memberSearch, setMemberSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const run = async (action: () => Promise<ChatChannel>) => {
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await action();
      setSaved(true);
    } catch {
      setError(t("chat.errors.action"));
    } finally {
      setBusy(false);
    }
  };
  const save = (archived: boolean) =>
    run(() =>
      props.onUpdate({
        name: name.trim(),
        description,
        managersOnly,
        archived,
      }),
    );
  const members =
    props.channel.id === "general" || props.channel.type === "PUBLIC"
      ? props.people.filter(
          (person) =>
            person.role !== "CLIENT" ||
            props.channel.id === "general" ||
            props.channel.memberUserIds.includes(person.userId),
        )
      : props.people.filter((person) =>
          props.channel.memberUserIds.includes(person.userId),
        );
  return (
    <section className="bg-card flex h-full min-h-0 flex-col">
      <div className="border-border flex items-center justify-between border-b p-4">
        <h2 className="text-base font-semibold">
          {t("chat.channels.details")}
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
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        <p className="text-muted-foreground text-sm leading-6">
          {t(`chat.channels.type.${props.channel.type}`)}
        </p>
        {props.channel.canManage ? (
          <>
            <Input
              label={t("chat.channels.name")}
              value={name}
              maxLength={80}
              required
              onChange={(event) => setName(event.target.value)}
              disabled={busy}
            />
            <div className="space-y-2">
              <Label htmlFor="channel-about">
                {t("chat.channels.description")}
              </Label>
              <Textarea
                id="channel-about"
                value={description}
                maxLength={500}
                disabled={busy}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="channel-posting" className="text-sm leading-6">
                {t("chat.channels.managersOnly")}
              </Label>
              <Switch
                id="channel-posting"
                checked={managersOnly}
                onCheckedChange={setManagersOnly}
                disabled={busy}
              />
            </div>
            <Button
              variant="orange"
              className="w-full"
              disabled={!name.trim()}
              loading={busy}
              onClick={() => void save(props.channel.archived)}
            >
              {t("chat.actions.save")}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={busy}
              onClick={() => void save(!props.channel.archived)}
            >
              <Archive className="size-4" />
              {t(
                props.channel.archived
                  ? "chat.channels.restore"
                  : "chat.channels.archive",
              )}
            </Button>
          </>
        ) : (
          <div>
            <h3 className="text-sm font-semibold">
              {props.channel.id === "general"
                ? t("chat.channels.general")
                : props.channel.name}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {props.channel.description || t("chat.channels.noDescription")}
            </p>
          </div>
        )}
        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}
        {saved && (
          <p role="status" className="text-success text-sm">
            {t("chat.channels.saved")}
          </p>
        )}
        <div className="border-border border-t pt-4">
          <h3 className="mb-3 text-sm font-semibold">
            {t("chat.channels.members")}
          </h3>
          {props.channel.id !== "general" &&
            props.channel.type === "PUBLIC" && (
              <p className="text-muted-foreground mb-3 text-xs leading-5">
                {t("chat.channels.publicMembership")}
              </p>
            )}
          {props.directoryError && (
            <Button variant="outline" onClick={props.onRetryDirectory}>
              {t("chat.actions.retry")}
            </Button>
          )}
          {members.map((person) => (
            <div
              key={person.userId}
              className="border-border/50 flex min-h-12 items-center gap-2 border-b py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{person.displayName}</p>
                <p className="text-muted-foreground text-xs">
                  {t(`chat.ui.roles.${person.role}`)}
                </p>
              </div>
              {props.channel.canManage &&
                !props.channel.archived &&
                person.userId !== props.userId &&
                (props.channel.type !== "PUBLIC" || person.role === "CLIENT") &&
                person.userId !== props.channel.createdBy &&
                props.channel.memberUserIds.includes(person.userId) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={busy}
                    aria-label={t("chat.channels.removePerson", {
                      name: person.displayName,
                    })}
                    onClick={() =>
                      void run(() => props.onMember(person.userId, false))
                    }
                  >
                    <UserMinus className="size-4" />
                  </Button>
                )}
            </div>
          ))}
          {props.channel.canManage && !props.channel.archived && (
            <>
              <h3 className="mt-5 mb-3 text-sm font-semibold">
                {t("chat.channels.invite")}
              </h3>
              <Input
                value={memberSearch}
                aria-label={t("chat.composer.findMember")}
                placeholder={t("chat.composer.findMember")}
                onChange={(event) => setMemberSearch(event.target.value)}
              />
              {props.people
                .filter(
                  (person) =>
                    person.userId !== props.userId &&
                    !props.channel.memberUserIds.includes(person.userId) &&
                    person.displayName
                      .toLocaleLowerCase()
                      .includes(memberSearch.toLocaleLowerCase()),
                )
                .map((person) => (
                  <Button
                    key={person.userId}
                    variant="ghost"
                    className="min-h-11 w-full justify-start"
                    disabled={busy}
                    onClick={() =>
                      void run(() => props.onMember(person.userId, true))
                    }
                  >
                    <UserPlus className="size-4" />
                    <span className="truncate">{person.displayName}</span>
                  </Button>
                ))}
            </>
          )}
          {props.hasMorePeople && (
            <Button
              className="mt-3"
              variant="outline"
              onClick={props.onLoadMorePeople}
            >
              {t("chat.channels.loadMorePeople")}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
