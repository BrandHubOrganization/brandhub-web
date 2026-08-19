import type { LinkedSocialAccount } from "../types/client";
import { Share2 } from "lucide-react";

interface ClientSocialAccountsProps {
  accounts?: LinkedSocialAccount[];
}

export function ClientSocialAccounts({ accounts = [] }: ClientSocialAccountsProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Share2 className="size-4 text-brand-orange" />
        <h3 className="text-sm font-bold text-foreground">Tài khoản Mạng xã hội đã liên kết</h3>
      </div>

      <div className="space-y-3">
        {accounts.length > 0 ? (
          accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/10"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-full bg-brand-orange/10 text-brand-orange font-bold text-xs flex items-center justify-center">
                  {acc.platform.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    {acc.accountName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {acc.accountHandle} ({acc.platform})
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Đã kết nối
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            Chưa có tài khoản mạng xã hội nào được liên kết.
          </p>
        )}
      </div>
    </div>
  );
}
