import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";
import { useOAuthCallback } from "@/pages/auth/hooks/useOAuthCallback";

/** Displays progress while the OAuth callback resolves the signed-in user. */
export function OAuthCallbackPage() {
  const { t } = useTranslation();
  useOAuthCallback();

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Spinner size="lg" aria-label={t("auth.login.oauthLoading")} />
    </div>
  );
}

export default OAuthCallbackPage;
