import { useEffect, useRef } from "react";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { consumeAuthRedirect } from "@/utils/authRedirect";
import type { TFunction } from "i18next";
import type { NavigateFunction } from "react-router-dom";
import type { UserProfileResponse } from "@/services/authService";
import type { User } from "@/types/user";

const INVALID_CALLBACK = "oauth_failed";
const ACCOUNT_SUSPENDED = "ACCOUNT_SUSPENDED";
const ERROR_TOAST_DURATION_MS = 5000;

interface CallbackContext {
  isActive: boolean;
  translate: TFunction;
  navigate: NavigateFunction;
}

function mapOAuthUser(profile: UserProfileResponse): User {
  return {
    id: profile.userId,
    name: profile.fullName || profile.email,
    email: profile.email,
    role: profile.role === "ADMIN" ? "ADMIN" : "USER",
    workspaceId: profile.workspaceId,
    avatar: profile.avatarUrl,
  };
}

async function resolveCallback() {
  const query = new URLSearchParams(window.location.search);
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const token = fragment.get("token") ?? query.get("token");
  window.history.replaceState(
    window.history.state,
    "",
    window.location.pathname,
  );
  useAuthStore.getState().clearAuth();
  // FR 3.2.3: ACCOUNT_SUSPENDED gets its own toast instead of the generic
  // oauth_failed message, so the user knows why sign-in was rejected.
  if (query.get("error") === ACCOUNT_SUSPENDED)
    throw new Error(ACCOUNT_SUSPENDED);
  if (query.has("error") || !token) throw new Error(INVALID_CALLBACK);

  useAuthStore.getState().setTokens(token, null);
  const response = await authService.getProfile();
  const profile = response.data.data;
  if (!profile) throw new Error("OAuth profile response is empty");
  return { user: mapOAuthUser(profile), token };
}

function reportCallbackError(error: unknown) {
  // Axios errors can contain bearer tokens; only log status and error category.
  console.error("Google OAuth profile resolution failed", {
    category: error instanceof Error ? error.name : "UnknownError",
    status: isAxiosError(error) ? error.response?.status : undefined,
  });
  if (error instanceof Error && error.message === ACCOUNT_SUSPENDED) {
    return "auth.login.oauthAccountSuspended";
  }
  return error instanceof Error && error.message === INVALID_CALLBACK
    ? "auth.login.oauthFailed"
    : "auth.login.oauthProfileFailed";
}

async function finishCallback(
  request: ReturnType<typeof resolveCallback>,
  context: CallbackContext,
) {
  try {
    const result = await request;
    if (!context.isActive) return;
    useAuthStore.getState().setAuth(result.user, result.token);
    useAuthStore.getState().setSystemRole(result.user.role);
    toast.success(context.translate("auth.login.successToast"));
    context.navigate(consumeAuthRedirect(), { replace: true });
  } catch (error: unknown) {
    if (!context.isActive) return;
    useAuthStore.getState().clearAuth();
    toast.error(context.translate(reportCallbackError(error)), {
      duration: ERROR_TOAST_DURATION_MS,
    });
    context.navigate("/login", { replace: true });
  }
}

/** Resolves a callback once, including React StrictMode effect replay. */
export function useOAuthCallback() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pending = useRef<ReturnType<typeof resolveCallback> | null>(null);

  useEffect(() => {
    const context = { isActive: true, translate: t, navigate };
    const request = (pending.current ??= resolveCallback());
    void finishCallback(request, context);
    return () => {
      context.isActive = false;
    };
  }, [navigate, t]);
}
