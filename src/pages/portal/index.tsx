import PageWrapper from "@/components/layout/PageWrapper";
import { Badge } from "@/components/ui/badge";

const QUEUE_ITEMS = [
  {
    id: 1,
    title: "Social Post: Giới thiệu Nike Air Max Pulse",
    workspace: "Nike Vietnam",
    status: "Awaiting Approval",
    date: "17-07-2026",
  },
  {
    id: 2,
    title: "Blog Post: Lợi ích của sữa hạt organic hàng ngày",
    workspace: "Sữa Hạt Organic",
    status: "Approved",
    date: "16-07-2026",
  },
  {
    id: 3,
    title: "Video Campaign: Heineken Silver Chill Vibes",
    workspace: "Heineken Campaign",
    status: "Revision Requested",
    date: "15-07-2026",
  },
];

export function PortalPage() {
  return (
    <PageWrapper
      title="Client Portal"
      description="Không gian phê duyệt nội dung của khách hàng."
    >
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="border-border bg-muted/10 border-b p-4 text-sm font-bold">
          Hàng đợi Phê duyệt Nội dung
        </div>
        <div className="divide-border divide-y">
          {QUEUE_ITEMS.map((item) => (
            <div
              key={item.id}
              className="hover:bg-muted/5 flex flex-col justify-between gap-4 p-4 transition-colors sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span>{item.workspace}</span>
                  <span>•</span>
                  <span>Ngày tạo: {item.date}</span>
                </div>
              </div>
              <div>
                <Badge
                  className="rounded-full px-2 py-0.5 font-mono text-3xs uppercase"
                  variant={
                    item.status === "Approved"
                      ? "PUBLISHED"
                      : item.status === "Awaiting Approval"
                        ? "PENDING_REVIEW"
                        : "REJECTED"
                  }
                >
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

export default PortalPage;
