import { useEffect, useRef, useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimelineAssigneePicker } from "@/pages/campaign/components/TimelineAssigneePicker";
import {
  addDays,
  dayInstant,
  todayIn,
} from "@/pages/campaign/utils/timelineDates";
import type { TaskMemberOption } from "@/pages/tasks/types/taskWorkflow";
export function TimelineSubtaskCreator({
  timezone,
  members,
  busy,
  onCreate,
  onCancel,
}: {
  timezone: string;
  members: TaskMemberOption[];
  busy: boolean;
  onCreate: (
    name: string,
    assigneeId: string | null,
    dueDate: string,
  ) => Promise<unknown>;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [assignee, setAssignee] = useState<string | null>(null);
  const [due, setDue] = useState(() => addDays(todayIn(timezone), 2));
  const [dateOpen, setDateOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const focusAfterSubmit = useRef(false);
  const submitting = useRef(false);
  const composing = useRef(false);
  useEffect(() => {
    if (!busy && focusAfterSubmit.current) {
      input.current?.focus();
      focusAfterSubmit.current = false;
    }
  }, [busy, name]);
  async function submit() {
    if (!name.trim() || busy || submitting.current || composing.current) return;
    if (due <= todayIn(timezone)) return;
    submitting.current = true;
    try {
      await onCreate(name.trim(), assignee, dayInstant(due, timezone));
      setName("");
      setDue(addDays(todayIn(timezone), 2));
      focusAfterSubmit.current = true;
    } catch {
      /* Keep the unsent name and selected assignee. */
    } finally {
      submitting.current = false;
    }
  }
  return (
    <form
      className="ct-subtask-creator bg-brand-orange-soft flex h-9 items-center gap-2 border-b px-3 py-0"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <Input
        ref={input}
        autoFocus
        value={name}
        maxLength={255}
        disabled={busy}
        wrapperClassName="ct-subtask-name"
        className="h-8 min-w-0 text-xs"
        aria-label={t("campaign.timeline.subtaskName")}
        placeholder={t("campaign.timeline.subtaskName")}
        onChange={(e) => setName(e.target.value)}
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={() => {
          composing.current = false;
        }}
      />
      <TimelineAssigneePicker
        value={assignee}
        name={members.find((m) => m.userId === assignee)?.displayName}
        options={members}
        allowEmpty
        labelled
        disabled={busy}
        onChange={setAssignee}
      />
      <Popover open={dateOpen} onOpenChange={setDateOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={busy}
            className="size-8 shrink-0"
            aria-label={t("campaign.timeline.deadline")}
            title={due}
          >
            <CalendarDays className="text-brand-orange size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <label className="text-xs">
            {t("campaign.timeline.deadline")}
            <Input
              type="date"
              value={due}
              onChange={(e) => {
                setDue(e.target.value);
              }}
              className="mt-2"
            />
          </label>
          <Button
            size="sm"
            type="button"
            disabled={!due || due <= todayIn(timezone)}
            onClick={() => setDateOpen(false)}
            className="mt-2"
          >
            {t("campaign.timeline.done")}
          </Button>
        </PopoverContent>
      </Popover>
      <Button
        type="submit"
        size="sm"
        variant="orange"
        disabled={busy || !name.trim() || !due || due <= todayIn(timezone)}
        className="h-8 text-xs"
      >
        {t("campaign.timeline.add")}
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled={busy}
        onClick={onCancel}
        aria-label={t("campaign.timeline.cancel")}
        className="size-8 shrink-0"
      >
        <X className="size-3.5" />
      </Button>
    </form>
  );
}
