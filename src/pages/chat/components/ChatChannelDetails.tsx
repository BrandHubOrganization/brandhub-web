import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Archive,
  Hash,
  LockKeyhole,
  MessageSquare,
  Search,
  ShieldAlert,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
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

const ROLE_BADGE_STYLES: Record<string, string> = {
  OWNER: "border-brand-orange/30 bg-brand-orange-soft text-brand-orange",
  MANAGER: "border-brand-orange/30 bg-brand-orange-soft text-brand-orange",
  CREATOR: "border-border bg-secondary text-secondary-foreground",
  CLIENT: "border-border/80 bg-muted text-muted-foreground",
};

function getInitials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
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
  const ChannelIcon =
    props.channel.type === "DIRECT"
      ? MessageSquare
      : props.channel.type === "PRIVATE"
        ? LockKeyhole
        : Hash;
  return (
    <section className="bg-card flex h-full min-h-0 flex-col">
      <div className="border-border/80 flex min-h-14 items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="bg-brand-orange-soft text-brand-orange flex size-8 shrink-0 items-center justify-center rounded-lg"
          >
            <ChannelIcon className="size-4" />
          </span>
          <h2 className="truncate text-base font-semibold tracking-tight">
            {t("chat.channels.details")}
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
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        <div className="border-border/80 bg-muted/20 flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3">
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
            <ChannelIcon className="size-3.5" aria-hidden="true" />
            {t(`chat.channels.type.${props.channel.type}`)}
          </span>
          {props.channel.archived && (
            <span className="border-warning/30 bg-warning/15 text-warning inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold">
              <Archive className="size-3" aria-hidden="true" />
              {t("chat.channels.archived")}
            </span>
          )}
        </div>
        {props.channel.canManage ? (
          <div className="space-y-4">
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
            <div className="border-border/80 bg-muted/20 flex items-center justify-between gap-3 rounded-xl border p-3.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <ShieldAlert
                  className="text-brand-orange size-4 shrink-0"
                  aria-hidden="true"
                />
                <Label
                  htmlFor="channel-posting"
                  className="cursor-pointer text-sm leading-5 font-medium"
                >
                  {t("chat.channels.managersOnly")}
                </Label>
              </div>
              <Switch
                id="channel-posting"
                checked={managersOnly}
                onCheckedChange={setManagersOnly}
                disabled={busy}
              />
            </div>
            <div className="space-y-2.5 pt-1">
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
            </div>
          </div>
        ) : (
          <div className="border-border/80 bg-muted/15 space-y-2 rounded-xl border p-3.5">
            <h3 className="text-sm font-semibold">
              {props.channel.id === "general"
                ? t("chat.channels.general")
                : props.channel.name}
            </h3>
            <p className="text-muted-foreground text-sm leading-6">
              {props.channel.description || t("chat.channels.noDescription")}
            </p>
            {props.channel.managersOnly && (
              <p className="text-muted-foreground flex items-center gap-1.5 pt-1 text-xs">
                <ShieldAlert
                  className="text-brand-orange size-3.5 shrink-0"
                  aria-hidden="true"
                />
                {t("chat.channels.managersOnly")}
              </p>
            )}
          </div>
        )}
        {error && (
          <p
            role="alert"
            className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
          >
            {error}
          </p>
        )}
        {saved && (
          <p
            role="status"
            className="border-success/30 bg-success/10 text-success rounded-lg border px-3 py-2 text-sm"
          >
            {t("chat.channels.saved")}
          </p>
        )}
        <div className="border-border/80 border-t pt-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              {t("chat.channels.members")}
            </h3>
            <span className="border-border/80 bg-muted text-muted-foreground rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums">
              {members.length}
            </span>
          </div>
          {props.channel.id !== "general" &&
            props.channel.type === "PUBLIC" && (
              <p className="text-muted-foreground mb-3 text-xs leading-5">
                {t("chat.channels.publicMembership")}
              </p>
            )}
          {props.directoryError && (
            <Button
              variant="outline"
              size="sm"
              className="mb-3"
              onClick={props.onRetryDirectory}
            >
              {t("chat.actions.retry")}
            </Button>
          )}
          <div className="divide-border/50 border-border/70 divide-y rounded-xl border">
            {members.map((person) => (
              <div
                key={person.userId}
                className="flex min-h-12 items-center gap-2.5 px-3 py-2"
              >
                <span
                  aria-hidden="true"
                  className="bg-secondary text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
                >
                  {getInitials(person.displayName)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {person.displayName}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase",
                    ROLE_BADGE_STYLES[person.role] ??
                      "border-border/80 bg-muted text-muted-foreground",
                  )}
                >
                  {t(`chat.ui.roles.${person.role}`)}
                </span>
                {props.channel.canManage &&
                  !props.channel.archived &&
                  person.userId !== props.userId &&
                  (props.channel.type !== "PUBLIC" ||
                    person.role === "CLIENT") &&
                  person.userId !== props.channel.createdBy &&
                  props.channel.memberUserIds.includes(person.userId) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 rounded-lg"
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
          </div>
          {props.channel.canManage && !props.channel.archived && (
            <div className="mt-5 space-y-3">
              <h3 className="text-sm font-semibold">
                {t("chat.channels.invite")}
              </h3>
              <Input
                value={memberSearch}
                aria-label={t("chat.composer.findMember")}
                placeholder={t("chat.composer.findMember")}
                iconPrefix={<Search />}
                onChange={(event) => setMemberSearch(event.target.value)}
              />
              <div className="space-y-1">
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
                      className="min-h-11 w-full justify-start gap-2.5 rounded-xl px-2.5"
                      disabled={busy}
                      onClick={() =>
                        void run(() => props.onMember(person.userId, true))
                      }
                    >
                      <span
                        aria-hidden="true"
                        className="bg-secondary text-secondary-foreground flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
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
                      <UserPlus className="text-muted-foreground size-4 shrink-0" />
                    </Button>
                  ))}
              </div>
            </div>
          )}
          {props.hasMorePeople && (
            <Button
              className="mt-3 w-full"
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
