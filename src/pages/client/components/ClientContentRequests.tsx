import type { ContentRequest } from "../types/client";
import { FileText } from "lucide-react";

interface ClientContentRequestsProps {
  requests?: ContentRequest[];
}

export function ClientContentRequests({ requests = [] }: ClientContentRequestsProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <FileText className="size-4 text-brand-orange" />
        <h3 className="text-sm font-bold text-foreground">Yêu cầu Nội dung mới nhất</h3>
      </div>

      <div className="space-y-3">
        {requests.length > 0 ? (
          requests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/10"
            >
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  {req.title}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Tạo bởi: {req.authorName} &bull; {req.createdAt}
                </span>
              </div>
              <span className="text-[10px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded">
                {req.status}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            Chưa có yêu cầu nội dung nào mới.
          </p>
        )}
      </div>
    </div>
  );
}
