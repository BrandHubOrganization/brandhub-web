import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage } from "@/utils/error";

export function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("agency.accept.missingToken"));
      return;
    }
    agencyService
      .acceptInvitation(token)
      .then(() => {
        setStatus("success");
        toast.success(t("agency.accept.successToast"));
        setTimeout(() => navigate("/agency"), 1200);
      })
      .catch((err: unknown) => {
        setStatus("error");
        setMessage(extractErrorMessage(err, t("agency.accept.invalid")));
      });
  }, [token, navigate, t]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border p-8 text-center shadow-sm">
        {status === "loading" && (
          <p className="text-muted-foreground text-sm">
            {t("agency.accept.loading")}
          </p>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto size-10 text-green-600" />
            <p className="mt-3 font-semibold">{t("agency.accept.successTitle")}</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("agency.accept.redirecting")}
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="text-destructive mx-auto size-10" />
            <p className="mt-3 font-semibold">{t("agency.accept.failedTitle")}</p>
            <p className="text-muted-foreground mt-1 text-sm">{message}</p>
            <Button
              className="bg-brand-orange hover:bg-brand-orange/90 mt-4 cursor-pointer text-white"
              onClick={() => navigate("/agency")}
            >
              {t("agency.accept.back")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default AcceptInvitationPage;
