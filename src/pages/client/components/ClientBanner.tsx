import type { Client } from "../types/client";
import { Building2, Mail, Phone, UserCheck } from "lucide-react";

interface ClientBannerProps {
  client: Client;
}

export function ClientBanner({ client }: ClientBannerProps) {
  return (
    <div className="border-border bg-card flex flex-col items-start justify-between gap-4 rounded-xl border p-6 md:flex-row md:items-center">
      <div className="flex items-center gap-4">
        {client.logoUrl ? (
          <img
            src={client.logoUrl}
            alt={client.name}
            className="border-border size-16 shrink-0 rounded-xl border object-cover"
          />
        ) : (
          <div className="bg-brand-orange-soft text-brand-orange flex size-16 shrink-0 items-center justify-center rounded-xl text-xl font-bold">
            {client.name.charAt(0)}
          </div>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-foreground text-lg font-bold">{client.name}</h2>
            <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-3xs font-semibold text-emerald-600">
              {client.status}
            </span>
          </div>
          <p className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="flex items-center gap-1">
              <Building2 className="text-brand-orange size-3" />{" "}
              {client.industry}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="text-muted-foreground size-3" />{" "}
              {client.contactEmail}
            </span>
            {client.contactPhone && (
              <span className="flex items-center gap-1">
                <Phone className="text-muted-foreground size-3" />{" "}
                {client.contactPhone}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="bg-muted/30 border-border flex items-center gap-3 rounded-lg border p-3">
        <UserCheck className="text-brand-orange size-5 shrink-0" />
        <div className="text-xs">
          <span className="text-muted-foreground block text-3xs">
            Account Manager
          </span>
          <span className="text-foreground font-semibold">
            {client.assignedAccountManagerName || "Chưa phân công"}
          </span>
        </div>
      </div>
    </div>
  );
}
