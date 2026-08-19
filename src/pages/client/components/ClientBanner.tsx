import type { Client } from "../types/client";
import { Building2, Mail, Phone, UserCheck } from "lucide-react";

interface ClientBannerProps {
  client: Client;
}

export function ClientBanner({ client }: ClientBannerProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {client.logoUrl ? (
          <img
            src={client.logoUrl}
            alt={client.name}
            className="size-16 rounded-xl object-cover border border-border shrink-0"
          />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-brand-orange-soft text-brand-orange font-bold text-xl">
            {client.name.charAt(0)}
          </div>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">{client.name}</h2>
            <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-semibold px-2 py-0.5 rounded">
              {client.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Building2 className="size-3 text-brand-orange" /> {client.industry}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="size-3 text-muted-foreground" /> {client.contactEmail}
            </span>
            {client.contactPhone && (
              <span className="flex items-center gap-1">
                <Phone className="size-3 text-muted-foreground" /> {client.contactPhone}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-border">
        <UserCheck className="size-5 text-brand-orange shrink-0" />
        <div className="text-xs">
          <span className="text-muted-foreground block text-[10px]">Account Manager</span>
          <span className="font-semibold text-foreground">
            {client.assignedAccountManagerName || "Chưa phân công"}
          </span>
        </div>
      </div>
    </div>
  );
}
