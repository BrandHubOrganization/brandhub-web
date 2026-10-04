import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { adminAccountService } from "@/services/adminAccountService";
import type {
  StrikeLevel,
  StrikeRequest,
} from "@/services/adminAccountService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const LEVEL_STYLE = {
  YELLOW:
    "border-yellow-500 bg-yellow-400/15 text-yellow-700 dark:text-yellow-300",
  ORANGE: "border-brand-orange bg-brand-orange-soft text-brand-orange",
  RED: "border-destructive bg-destructive/10 text-destructive",
};

type Action =
  | { kind: "strike"; request: Omit<StrikeRequest, "operationId"> }
  | { kind: "unflag"; reason: string }
  | { kind: "confirm"; reviewId: string };

export function AdminStrikeDialog({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const actorId = useAuthStore((s) => s.user?.id);
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState<StrikeLevel>("YELLOW");
  const [category, setCategory] = useState("");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  // Pardon and unflag carry their own reason; they used to depend on the add-strike field.
  const [pardoning, setPardoning] = useState<string | null>(null);
  const [pardonReason, setPardonReason] = useState("");
  const [unflagReason, setUnflagReason] = useState("");
  const operation = useRef<{ payload: string; id: string } | null>(null);
  const history = useQuery({
    queryKey: ["admin-strikes", actorId, userId, page],
    queryFn: () => adminAccountService.history(userId, page),
  });
  const mutation = useMutation<unknown, Error, Action>({
    mutationFn: (action: Action) => {
      if (action.kind === "unflag")
        return adminAccountService.unflag(userId, action.reason);
      if (action.kind === "confirm")
        return adminAccountService.confirm(
          userId,
          action.reviewId,
          reason.trim(),
        );
      const payload = JSON.stringify(action.request);
      if (operation.current?.payload !== payload)
        operation.current = { payload, id: crypto.randomUUID() };
      return adminAccountService.record(userId, {
        ...action.request,
        operationId: operation.current.id,
      });
    },
    onSuccess: async () => {
      operation.current = null;
      setReason("");
      setConfirmed(false);
      setPardoning(null);
      setPardonReason("");
      setUnflagReason("");
      toast.success(t("admin.strikes.saved"));
      await Promise.all([
        client.invalidateQueries({
          queryKey: ["admin-strikes", actorId, userId],
        }),
        client.invalidateQueries({ queryKey: ["admin-accounts", actorId] }),
      ]);
    },
  });
  const user = history.data?.user;
  const canManage =
    user?.role === "USER" &&
    user.id !== actorId &&
    !["SUSPENDED", "DELETED", "PENDING_VERIFICATION"].includes(user.status);
  const ready =
    !!canManage &&
    reason.trim().length >= 3 &&
    !mutation.isPending &&
    !history.isFetching;
  const date = (value: string) =>
    new Date(value).toLocaleString(i18n.language === "vi" ? "vi-VN" : "en-GB");
  const errorCode = isAxiosError(mutation.error)
    ? mutation.error.response?.data?.error?.code
    : "";
  const errorKey = [
    "FORBIDDEN",
    "ADMIN_STATE_CONFLICT",
    "ADMIN_OPERATION_CONFLICT",
    "STRIKE_NOT_FOUND",
  ].includes(errorCode)
    ? `admin.errors.${errorCode}`
    : "admin.strikes.error";

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("admin.strikes.title")}</DialogTitle>
          <DialogDescription>
            {user ? `${user.fullName} · ${user.email}` : t("admin.loading")}
          </DialogDescription>
        </DialogHeader>
        {history.isPending && <p role="status">{t("admin.loading")}</p>}
        {history.isError && (
          <div role="alert">
            <p>{t("admin.accounts.error")}</p>
            <Button onClick={() => history.refetch()}>
              {t("admin.accounts.retry")}
            </Button>
          </div>
        )}
        {user && !history.isError && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {t(`admin.status.${user.status}`)}
              </Badge>
              <Badge
                variant="PENDING_REVIEW"
                className="rounded-full font-mono"
              >
                {t("admin.level.YELLOW")}: {user.yellow}/3
              </Badge>
              <Badge variant="SCHEDULED" className="rounded-full font-mono">
                {t("admin.level.ORANGE")}: {user.orange}/3
              </Badge>
              <Badge variant="FAILED" className="rounded-full font-mono">
                {t("admin.level.RED")}: {user.red}
              </Badge>
            </div>
            {user.cleanPeriodEndsAt && (
              <p className="text-sm">
                {t("admin.strikes.cleanUntil")}: {date(user.cleanPeriodEndsAt)}
              </p>
            )}
            {user.reactivateAt && (
              <p className="text-sm">
                {t("admin.strikes.reactivateAt")}: {date(user.reactivateAt)}
              </p>
            )}
            {canManage ? (
              <div className="border-border space-y-3 rounded-lg border p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="strike-level">
                      {t("admin.strikes.level")}
                    </Label>
                    <div
                      id="strike-level"
                      role="radiogroup"
                      aria-label={t("admin.strikes.level")}
                      className="flex gap-2"
                    >
                      {(["YELLOW", "ORANGE", "RED"] as const).map((value) => (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={level === value}
                          disabled={mutation.isPending}
                          onClick={() => setLevel(value)}
                          className={cn(
                            "focus-visible:outline-ring h-10 flex-1 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-2",
                            level === value
                              ? LEVEL_STYLE[value]
                              : "border-border text-muted-foreground hover:bg-muted",
                          )}
                        >
                          {t(`admin.level.${value}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="strike-category">
                      {t("admin.strikes.category")}
                    </Label>
                    <Input
                      id="strike-category"
                      maxLength={100}
                      value={category}
                      disabled={mutation.isPending}
                      onChange={(event) => setCategory(event.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="strike-reason">
                    {t("admin.strikes.reason")}
                  </Label>
                  <Textarea
                    id="strike-reason"
                    minLength={3}
                    maxLength={2000}
                    value={reason}
                    disabled={mutation.isPending}
                    onChange={(event) => setReason(event.target.value)}
                  />
                </div>
                {mutation.isError && (
                  <p role="alert" className="text-destructive text-sm">
                    {t(errorKey)}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={
                      !ready ||
                      !category.trim() ||
                      user.status === "DEACTIVATED"
                    }
                    onClick={() =>
                      mutation.mutate({
                        kind: "strike",
                        request: {
                          action: "ADD",
                          level,
                          category: category.trim(),
                          reason: reason.trim(),
                        },
                      })
                    }
                  >
                    {t("admin.strikes.add")}
                  </Button>
                </div>
                {user.status === "FLAGGED" && (
                  <div className="border-border space-y-2 border-t pt-3">
                    <p className="font-medium">{t("admin.strikes.unflag")}</p>
                    {user.orange + user.yellow + user.red > 0 ? (
                      <p className="text-muted-foreground text-sm">
                        {t("admin.strikes.unflagBlocked")}
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                          aria-label={t("admin.strikes.unflagReason")}
                          placeholder={t("admin.strikes.unflagReason")}
                          maxLength={2000}
                          value={unflagReason}
                          disabled={mutation.isPending}
                          onChange={(event) =>
                            setUnflagReason(event.target.value)
                          }
                        />
                        <Button
                          variant="outline"
                          disabled={
                            unflagReason.trim().length < 3 || mutation.isPending
                          }
                          onClick={() =>
                            mutation.mutate({
                              kind: "unflag",
                              reason: unflagReason.trim(),
                            })
                          }
                        >
                          {t("admin.strikes.unflag")}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                {user.pendingReviewId && (
                  <div className="border-border space-y-3 border-t pt-3">
                    <p className="font-medium">
                      {t("admin.strikes.pendingReview")}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {t("admin.strikes.ownerImpact")}
                    </p>
                    <label className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={confirmed}
                        disabled={mutation.isPending}
                        onChange={(event) => setConfirmed(event.target.checked)}
                      />
                      {t("admin.strikes.confirmLabel")}
                    </label>
                    <Button
                      variant="destructive"
                      disabled={!ready || !confirmed}
                      onClick={() =>
                        mutation.mutate({
                          kind: "confirm",
                          reviewId: user.pendingReviewId!,
                        })
                      }
                    >
                      {t("admin.strikes.confirm")}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                {t("admin.strikes.readOnly")}
              </p>
            )}
            <h3 className="font-medium">{t("admin.strikes.history")}</h3>
            {!history.data?.items.length && (
              <p className="text-muted-foreground text-sm">
                {t("admin.strikes.empty")}
              </p>
            )}
            {history.data?.items.map((strike) => (
              <article
                className="border-border space-y-1 rounded-lg border p-3 text-sm"
                key={strike.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>
                    {t(`admin.level.${strike.level}`)} · {strike.category}
                  </strong>
                  <Badge variant="outline">
                    {t(`admin.strikeState.${strike.state}`)}
                  </Badge>
                </div>
                <p className="break-words whitespace-pre-wrap">
                  {strike.reason}
                </p>
                <p className="text-muted-foreground">
                  {date(strike.createdAt)}
                </p>
                {strike.convertedToId && (
                  <p className="text-muted-foreground break-all">
                    {t("admin.strikes.convertedTo")}: {strike.convertedToId}
                  </p>
                )}
                {strike.removalReason && (
                  <p>
                    {t("admin.strikes.removalReason")}: {strike.removalReason}
                  </p>
                )}
                {["ACTIVE", "CONVERTED"].includes(strike.state) &&
                  canManage &&
                  (pardoning === strike.id ? (
                    <div className="space-y-2 pt-1">
                      <Textarea
                        aria-label={t("admin.strikes.pardonReason")}
                        placeholder={t("admin.strikes.pardonReason")}
                        rows={2}
                        maxLength={2000}
                        value={pardonReason}
                        disabled={mutation.isPending}
                        onChange={(event) =>
                          setPardonReason(event.target.value)
                        }
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPardoning(null)}
                        >
                          {t("admin.strikes.cancel")}
                        </Button>
                        <Button
                          size="sm"
                          disabled={
                            pardonReason.trim().length < 3 || mutation.isPending
                          }
                          onClick={() =>
                            mutation.mutate({
                              kind: "strike",
                              request: {
                                action: "REMOVE",
                                strikeId: strike.id,
                                reason: pardonReason.trim(),
                              },
                            })
                          }
                        >
                          {t("admin.strikes.confirmPardon")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={mutation.isPending}
                      onClick={() => {
                        setPardoning(strike.id);
                        setPardonReason("");
                      }}
                    >
                      {t("admin.strikes.pardon")}
                    </Button>
                  ))}
              </article>
            ))}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={page === 1 || history.isFetching}
                onClick={() => setPage(page - 1)}
              >
                {t("admin.accounts.previous")}
              </Button>
              <Button
                variant="outline"
                disabled={
                  page * 20 >= (history.data?.total ?? 0) || history.isFetching
                }
                onClick={() => setPage(page + 1)}
              >
                {t("admin.accounts.next")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
