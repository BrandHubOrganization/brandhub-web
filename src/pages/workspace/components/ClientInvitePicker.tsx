import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserLookup } from "@/hooks/useUserLookup";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

export function ClientInvitePicker({ value, onChange }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const userMatch = useUserLookup(draft);

  const addEmail = () => {
    const email = draft.trim().toLowerCase();
    if (!email) return;
    if (!EMAIL_RE.test(email)) {
      setError(t("workspace.create.clientInviteInvalidEmail"));
      return;
    }
    if (value.includes(email)) {
      setError(t("workspace.create.clientInviteDuplicate"));
      return;
    }
    onChange([...value, email]);
    setDraft("");
    setError("");
  };

  const removeEmail = (email: string) => {
    onChange(value.filter((e) => e !== email));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder={t("workspace.create.clientInvitePlaceholder")}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addEmail();
            }
          }}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="cursor-pointer"
          onClick={addEmail}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
      {!error && userMatch && (
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          {userMatch.avatarUrl ? (
            <img
              src={userMatch.avatarUrl}
              alt=""
              className="size-4 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="bg-brand-orange-soft text-brand-orange text-3xs flex size-4 shrink-0 items-center justify-center rounded-full font-bold">
              {userMatch.fullName.charAt(0).toUpperCase()}
            </span>
          )}
          {t("workspace.create.clientInviteUserMatch", {
            name: userMatch.fullName,
          })}
        </p>
      )}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((email) => (
            <span
              key={email}
              className="bg-muted flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
            >
              {email}
              <button
                type="button"
                onClick={() => removeEmail(email)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
