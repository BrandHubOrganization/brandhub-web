import type { LinkedSocialAccount } from "../types/client";
import { Share2 } from "lucide-react";

interface ClientSocialAccountsProps {
  accounts?: LinkedSocialAccount[];
}

export function ClientSocialAccounts({
  accounts = [],
}: ClientSocialAccountsProps) {
  return (
    <div className="border-border bg-card space-y-4 rounded-xl border p-5">
      <div className="border-border flex items-center gap-2 border-b pb-3">
        <Share2 className="text-brand-orange size-4" />
        <h3 className="text-foreground text-sm font-bold">
          Tài khoản Mạng xã hội đã liên kết
        </h3>
      </div>

      <div className="space-y-3">
        {accounts.length > 0 ? (
          accounts.map((acc) => (
            <div
              key={acc.id}
              className="border-border bg-muted/10 flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="bg-brand-orange/10 text-brand-orange flex size-7 items-center justify-center rounded-full text-xs font-bold">
                  {acc.platform.charAt(0)}
                </div>
                <div>
                  <span className="text-foreground block text-xs font-semibold">
                    {acc.accountName}
                  </span>
                  <span className="text-muted-foreground text-3xs">
                    {acc.accountHandle} ({acc.platform})
                  </span>
                </div>
              </div>
              <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-3xs font-semibold text-emerald-600">
                Đã kết nối
              </span>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground py-4 text-center text-xs">
            Chưa có tài khoản mạng xã hội nào được liên kết.
          </p>
        )}
      </div>
    </div>
  );
}
