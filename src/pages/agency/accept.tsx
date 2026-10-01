import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { agencyService } from "@/services/agencyService";
import { extractErrorMessage } from "@/utils/error";
import type { InvitationPreviewResponse } from "@/types/agency";
import type { UpdateClientProfileRequest } from "@/types/clientProfile";
import { ClientProfileForm } from "@/pages/client-profiles/components/ClientProfileForm";

type Mode = "PICK_EXISTING" | "CREATE_NEW";

export function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [status, setStatus] = useState<
    "loading" | "picking" | "accepting" | "success" | "error"
  >("loading");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<InvitationPreviewResponse | null>(
    null,
  );
  const [mode, setMode] = useState<Mode>("PICK_EXISTING");
  const [selectedProfileId, setSelectedProfileId] = useState("");

  const acceptNow = (
    tok: string,
    options?: {
      clientProfileId?: string;
      newClientProfile?: UpdateClientProfileRequest;
    },
    wsId?: string | null,
  ) => {
    setStatus("accepting");
    const targetWsId = wsId ?? preview?.invitation.workspaceId;
    agencyService
      .acceptInvitation(tok, options)
      .then(() => {
        setStatus("success");
        toast.success(t("agency.accept.successToast"));
        const targetUrl = targetWsId
          ? `/workspaces/${targetWsId}/dashboard`
          : "/agency";
        setTimeout(() => navigate(targetUrl), 1200);
      })
      .catch((err: unknown) => {
        setStatus("error");
        setMessage(extractErrorMessage(err, t("agency.accept.invalid")));
      });
  };

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("agency.accept.missingToken"));
      return;
    }
    agencyService
      .previewInvitation(token)
      .then(({ data }) => {
        const resp = data.data;
        setPreview(resp);
        if (resp.invitation.role === "CLIENT") {
          // Có profile sẵn: mặc định chọn cái đầu tiên, khỏi bắt user bấm 2 lần.
          if (resp.myClientProfiles && resp.myClientProfiles.length > 0) {
            setSelectedProfileId(resp.myClientProfiles[0].id);
          } else {
            setMode("CREATE_NEW");
          }
          setStatus("picking");
        } else {
          // Role khác CLIENT: giữ hành vi accept 1 bước như cũ.
          acceptNow(token, undefined, resp.invitation.workspaceId);
        }
      })
      .catch((err: unknown) => {
        setStatus("error");
        setMessage(extractErrorMessage(err, t("agency.accept.invalid")));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleConfirmClientPick = () => {
    if (!token) return;
    if (!selectedProfileId) {
      toast.error(t("clientProfile.picker.requiredError"));
      return;
    }
    acceptNow(
      token,
      { clientProfileId: selectedProfileId },
      preview?.invitation.workspaceId,
    );
  };

  const handleCreateAndAccept = (data: UpdateClientProfileRequest) => {
    if (!token) return;
    acceptNow(
      token,
      { newClientProfile: data },
      preview?.invitation.workspaceId,
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border p-8 text-center shadow-sm">
        {(status === "loading" || status === "accepting") && (
          <p className="text-muted-foreground text-sm">
            {t("agency.accept.loading")}
          </p>
        )}

        {status === "picking" && preview && (
          <div className="text-left">
            <p className="mb-4 text-center font-semibold">
              {t("clientProfile.picker.title")}
            </p>
            <p className="text-muted-foreground mb-4 text-center text-xs">
              {t("clientProfile.picker.description")}
            </p>

            {preview.myClientProfiles &&
              preview.myClientProfiles.length > 0 && (
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="mode-existing"
                      checked={mode === "PICK_EXISTING"}
                      onChange={() => setMode("PICK_EXISTING")}
                    />
                    <label
                      htmlFor="mode-existing"
                      className="text-sm font-medium"
                    >
                      {t("clientProfile.picker.useExisting")}
                    </label>
                  </div>
                  {mode === "PICK_EXISTING" && (
                    <Select
                      value={selectedProfileId}
                      onChange={(e) => setSelectedProfileId(e.target.value)}
                    >
                      {preview.myClientProfiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.displayName}
                          {p.company ? ` — ${p.company}` : ""}
                        </option>
                      ))}
                    </Select>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="radio"
                      id="mode-new"
                      checked={mode === "CREATE_NEW"}
                      onChange={() => setMode("CREATE_NEW")}
                    />
                    <label htmlFor="mode-new" className="text-sm font-medium">
                      {t("clientProfile.picker.createNew")}
                    </label>
                  </div>
                </div>
              )}

            {mode === "CREATE_NEW" ? (
              <ClientProfileForm
                submitLabel={t("clientProfile.picker.confirmButton")}
                onSubmit={handleCreateAndAccept}
              />
            ) : (
              <Button
                variant="orange"
                className="w-full"
                onClick={handleConfirmClientPick}
              >
                {t("clientProfile.picker.confirmButton")}
              </Button>
            )}
          </div>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto size-10 text-green-600" />
            <p className="mt-3 font-semibold">
              {t("agency.accept.successTitle")}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("agency.accept.redirecting")}
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="text-destructive mx-auto size-10" />
            <p className="mt-3 font-semibold">
              {t("agency.accept.failedTitle")}
            </p>
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
