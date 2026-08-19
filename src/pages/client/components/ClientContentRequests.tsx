import type { ContentRequest } from "../types/client";
import { FileText } from "lucide-react";

interface ClientContentRequestsProps {
  requests?: ContentRequest[];
}

export function ClientContentRequests({
  requests = [],
}: ClientContentRequestsProps) {
  return (
    <div className="border-border bg-card space-y-4 rounded-xl border p-5">
      <div className="border-border flex items-center gap-2 border-b pb-3">
        <FileText className="text-brand-orange size-4" />
        <h3 className="text-foreground text-sm font-bold">
          Yêu cầu Nội dung mới nhất
        </h3>
      </div>

      <div className="space-y-3">
        {requests.length > 0 ? (
          requests.map((req) => (
            <div
              key={req.id}
              className="border-border bg-muted/10 flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <span className="text-foreground block text-xs font-semibold">
                  {req.title}
                </span>
                <span className="text-muted-foreground text-[10px]">
                  Tạo bởi: {req.authorName} &bull; {req.createdAt}
                </span>
              </div>
              <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                {req.status}
              </span>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground py-4 text-center text-xs">
            Chưa có yêu cầu nội dung nào mới.
          </p>
        )}
      </div>
    </div>
  );
}
