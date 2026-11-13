import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  ClipboardList,
  Clock3,
  Flag,
  LayoutDashboard,
  UserRound,
  CalendarDays,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { taskService } from "@/services/taskService";
import { campaignService } from "@/pages/campaign/services/campaignService";
import { requireApiData } from "@/lib/apiData";
import { useAuthStore } from "@/store/authStore";
import type {
  Campaign,
  CampaignReviewEvent,
  Timeline,
} from "@/pages/campaign/types";

/** Workspace-scoped read-only overview. Mutations stay in their owning screens. */
export function RoleWorkspaceOverview({
  workspaceId,
  role,
}: {
  workspaceId: string;
  role: string;
}) {
  const { t, i18n } = useTranslation();
  const userId = useAuthStore((s) => s.user?.id);
  const page = 0;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const base = `/workspaces/${workspaceId}`;
  const label = (key: string) => t(`workspace.dashboard.overview.${key}`);
  const creator = role === "CREATOR";
  const client = role === "CLIENT";
  const allowed = ["OWNER", "MANAGER", "CREATOR", "CLIENT"].includes(role);
  const tasks = useQuery({
    queryKey: ["workspace-overview-tasks", workspaceId, userId, role, page],
    queryFn: () =>
      taskService.getWorkspaceTasks(workspaceId, {
        page,
        size: 20,
        sort: "dueDate",
        direction: "asc",
      }),
    enabled: allowed && !!userId,
  });
  const campaigns = useQuery({
    queryKey: ["workspace-overview-campaign", workspaceId, userId, role],
    queryFn: async () =>
      requireApiData<Campaign[]>(
        (await campaignService.list(workspaceId)).data,
      ),
    enabled: allowed && !creator && !!userId,
  });
  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "—"
      : new Intl.DateTimeFormat(i18n.language, {
          day: "2-digit",
          month: "2-digit",
        }).format(date);
  };
  const rows = (tasks.data?.content ?? []).filter(
    (task) => !creator || task.assigneeId === userId,
  );
  const active = rows.filter(
    (task) => !["FINISHED", "CANCELLED"].includes(task.status),
  );
  const overdue = active.filter(
    (task) => task.dueDate && new Date(task.dueDate).getTime() < now,
  );
  const review = active.filter((task) => task.status === "IN_REVIEW");
  const unassigned = active.filter((task) => !task.assigneeId);
  const ordered = [...rows].sort((a, b) => {
    const priority = (task: typeof a) =>
      task.status === "FINISHED" || task.status === "CANCELLED"
        ? 3
        : task.dueDate && new Date(task.dueDate).getTime() < now
          ? 0
          : task.status === "IN_REVIEW"
            ? 1
            : 2;
    return priority(a) - priority(b);
  });
  const campaign =
    campaigns.data?.find((item) => item.status === "IN_PROGRESS") ??
    campaigns.data?.[0];
  const feedback = useQuery({
    queryKey: [
      "workspace-overview-feedback",
      workspaceId,
      userId,
      role,
      campaign?.id,
    ],
    queryFn: async () =>
      requireApiData<CampaignReviewEvent[]>(
        (await campaignService.events(workspaceId, campaign!.id)).data,
      ),
    enabled: allowed && !creator && !!campaign && !!userId,
  });
  const comments = (feedback.data ?? [])
    .filter(
      (item) =>
        item.eventType === "FEEDBACK" &&
        item.comment &&
        (role !== "MANAGER" || item.actorSide === "CLIENT"),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 2);
  let timeline: Timeline = {};
  try {
    timeline = campaign?.timeline ? (JSON.parse(campaign.timeline) ?? {}) : {};
  } catch {
    /* Historical free text has no structured timeline. */
  }
  const milestones = Array.isArray(timeline.milestones)
    ? [...timeline.milestones].sort((a, b) => a.date.localeCompare(b.date))
    : [];
  const nextMilestone = milestones.find(
    (item) => item.date >= new Date(now).toLocaleDateString("en-CA"),
  );
  const upcoming = [...active]
    .filter((task) => task.dueDate && new Date(task.dueDate).getTime() >= now)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
    .slice(0, 3);
  const stats = client
    ? [
        ["review", review.length],
        ["finished", rows.filter((task) => task.status === "FINISHED").length],
        ["active", active.length],
      ]
    : creator
      ? [
          ["overdue", overdue.length],
          ["active", active.length],
          ["review", review.length],
        ]
      : [
          ["overdue", overdue.length],
          ["unassigned", unassigned.length],
          ["review", review.length],
        ];
  const panel = "rounded-xl border border-border bg-card p-4 sm:p-5";
  const loadingRows = (
    <div className="space-y-3" aria-label={label("loading")}>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
  if (!allowed) return <p role="status">{label("rolePending")}</p>;
  return (
    <div className="space-y-5">
      <div className="border-brand-orange/20 bg-brand-orange-soft border-l-brand-orange flex flex-wrap items-center justify-between gap-3 rounded-xl border border-l-4 p-4 sm:p-5">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <LayoutDashboard
              className="text-brand-orange size-5 shrink-0"
              aria-hidden="true"
            />
            {label(`title${role}`)}
          </h2>
          <p className="text-muted-foreground text-sm">
            {label(`intro${role}`)}
          </p>
        </div>
        <Button variant="orange" asChild>
          <Link
            to={`${base}/${client ? "chat" : creator ? "tasks" : "campaigns"}`}
          >
            {label(client ? "chat" : creator ? "tasks" : "campaign")}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">{label("pageScope")}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map(([key, count]) => (
          <div key={key} className={panel}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-sm">
                {label(String(key))}
              </span>
              <span
                className="bg-brand-orange-soft text-brand-orange flex size-9 shrink-0 items-center justify-center rounded-lg"
                aria-hidden="true"
              >
                {key === "overdue" ? (
                  <Clock3 className="size-4" />
                ) : key === "unassigned" ? (
                  <UserRound className="size-4" />
                ) : (
                  <ClipboardList className="size-4" />
                )}
              </span>
            </div>
            {tasks.isPending ? (
              <Skeleton className="mt-2 h-8 w-12" />
            ) : (
              <strong className="mt-2 block font-mono text-[28px] font-semibold tabular-nums">
                {tasks.isError ? "—" : count}
              </strong>
            )}
          </div>
        ))}
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(240px,1fr)]">
        <div className="min-w-0 space-y-4">
          <section className={panel}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 font-semibold">
                <ClipboardList
                  className="text-brand-orange size-4"
                  aria-hidden="true"
                />
                {label(
                  client ? "contentReview" : creator ? "myTasks" : "attention",
                )}
              </h3>
              <Button asChild variant="ghost" size="sm">
                <Link to={`${base}/${client ? "task-approvals" : "tasks"}`}>
                  {label("viewAll")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            {tasks.isPending ? (
              loadingRows
            ) : tasks.isError ? (
              <div role="alert">
                <p className="mb-2 text-sm">{label("loadError")}</p>
                <Button
                  variant="secondary"
                  onClick={() => void tasks.refetch()}
                >
                  <RefreshCw className="size-4" />
                  {label("retry")}
                </Button>
              </div>
            ) : (
              <>
                {!ordered.length && (
                  <p className="text-muted-foreground py-6 text-sm">
                    {label("empty")}
                  </p>
                )}
                <div className="divide-border divide-y">
                  {ordered.slice(0, 5).map((task) => (
                    <Link
                      key={task.id}
                      to={`${base}/${client && task.status === "IN_REVIEW" ? "task-approvals" : "tasks"}?task=${encodeURIComponent(task.id)}`}
                      className="hover:bg-brand-orange-soft focus-visible:outline-ring flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-md py-3 transition-colors focus-visible:outline-2 sm:flex-nowrap"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium break-words">
                          {task.name}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {task.assigneeName || label("unassigned")} ·{" "}
                          {task.dueDate
                            ? formatDate(task.dueDate)
                            : label("noDeadline")}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`shrink-0 ${task.status === "IN_REVIEW" || task.status === "IN_PROGRESS" ? "bg-brand-orange-soft text-brand-orange border-brand-orange/20" : ""}`}
                      >
                        {label(task.status)}
                      </Badge>
                    </Link>
                  ))}
                </div>
                {ordered.length > 5 && (
                  <Button variant="ghost" size="sm" asChild className="mt-2">
                    <Link to={`${base}/tasks`}>
                      {label("viewAll")}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                )}
              </>
            )}
          </section>
          <section className={panel}>
            <h3 className="mb-3 font-semibold">
              {label(creator ? "tools" : "upcoming")}
            </h3>
            {creator ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" asChild>
                  <Link to={`${base}/tasks`}>{label("tasks")}</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link to={`${base}/library`}>{label("library")}</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link to={`${base}/calendar`}>{label("calendar")}</Link>
                </Button>
              </div>
            ) : tasks.isPending ? (
              loadingRows
            ) : tasks.isError ? (
              <p className="text-muted-foreground text-sm">
                {label("loadError")}
              </p>
            ) : upcoming.length ? (
              upcoming.map((task) => (
                <Link
                  key={task.id}
                  className="border-border hover:text-brand-orange flex flex-wrap items-center justify-between gap-2 border-t py-3"
                  to={`${base}/tasks?task=${encodeURIComponent(task.id)}`}
                >
                  <span className="min-w-0 text-sm break-words">
                    {task.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatDate(task.dueDate!)}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                {label("noUpcoming")}
              </p>
            )}
          </section>
        </div>
        <div className="min-w-0 space-y-4">
          {!creator && (
            <section className={panel}>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Flag className="text-brand-orange size-4" aria-hidden="true" />
                {label("campaign")}
              </h3>
              {campaigns.isPending ? (
                loadingRows
              ) : campaigns.isError ? (
                <div role="alert">
                  <p className="mb-2 text-sm">{label("loadError")}</p>
                  <Button
                    variant="secondary"
                    onClick={() => void campaigns.refetch()}
                  >
                    {label("retry")}
                  </Button>
                </div>
              ) : campaign ? (
                <>
                  <p className="font-medium">{campaign.name}</p>
                  <Badge
                    variant="secondary"
                    className="bg-brand-orange-soft text-brand-orange my-2"
                  >
                    {label(campaign.status)}
                  </Badge>
                  <p className="text-muted-foreground text-sm">
                    {timeline.startDate ? formatDate(timeline.startDate) : "—"}{" "}
                    — {timeline.endDate ? formatDate(timeline.endDate) : "—"}
                  </p>
                  {nextMilestone && (
                    <div className="border-brand-orange/30 bg-brand-orange-soft my-3 rounded-r-lg border-l-2 p-3">
                      <p className="text-muted-foreground text-xs">
                        {label("nextMilestone")}
                      </p>
                      <p className="text-sm">
                        {nextMilestone.name} · {formatDate(nextMilestone.date)}
                      </p>
                    </div>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    className="border-brand-orange/25 text-brand-orange hover:bg-brand-orange-soft mt-3"
                  >
                    <Link to={`${base}/campaigns`}>{label("viewPlan")}</Link>
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {label("noCampaign")}
                </p>
              )}
            </section>
          )}
          {!creator && campaign && (
            <section className={panel}>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <MessageSquare
                  className="text-brand-orange size-4"
                  aria-hidden="true"
                />
                {label("feedback")}
              </h3>
              {feedback.isPending ? (
                loadingRows
              ) : feedback.isError ? (
                <div role="alert">
                  <p>{label("loadError")}</p>
                  <Button
                    variant="secondary"
                    onClick={() => void feedback.refetch()}
                  >
                    {label("retry")}
                  </Button>
                </div>
              ) : comments.length ? (
                comments.map((item) => (
                  <div key={item.id} className="border-border border-t py-3">
                    <p className="text-sm break-words whitespace-pre-wrap">
                      {item.comment}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {label(item.actorSide)} · {formatDate(item.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  {label("noFeedback")}
                </p>
              )}
              <Button variant="ghost" asChild className="mt-2">
                <Link to={`${base}/campaigns`}>
                  {label("viewPlan")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </section>
          )}
          <section className={panel}>
            <h3 className="font-semibold">{label("collaborate")}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild variant="secondary">
                <Link to={`${base}/chat`}>
                  <MessageSquare className="size-4" />
                  {label("chat")}
                </Link>
              </Button>
              {creator && (
                <Button asChild variant="secondary">
                  <Link to={`${base}/tasks`}>{label("tasks")}</Link>
                </Button>
              )}
              <Button asChild variant="secondary">
                <Link to={`${base}/calendar`}>
                  <CalendarDays className="size-4" />
                  {label("calendar")}
                </Link>
              </Button>
            </div>
            <p className="text-muted-foreground mt-3 text-xs">
              {label("separateStates")}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
