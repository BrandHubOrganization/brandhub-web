import PageWrapper from "@/components/layout/PageWrapper";
import { Badge } from "@/components/ui/badge";

const QUEUE_ITEMS = [
  { id: 1, title: "Social Post: Giới thiệu Nike Air Max Pulse", workspace: "Nike Vietnam", status: "Awaiting Approval", date: "17-07-2026" },
  { id: 2, title: "Blog Post: Lợi ích của sữa hạt organic hàng ngày", workspace: "Sữa Hạt Organic", status: "Approved", date: "16-07-2026" },
  { id: 3, title: "Video Campaign: Heineken Silver Chill Vibes", workspace: "Heineken Campaign", status: "Revision Requested", date: "15-07-2026" },
];

export function PortalPage() {
  return (
    <PageWrapper
      title="Client Portal"
      description="Không gian phê duyệt nội dung của khách hàng."
    >
      <div className="border border-border bg-card rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/10 font-bold text-sm">
          Hàng đợi Phê duyệt Nội dung
        </div>
        <div className="divide-y divide-border">
          {QUEUE_ITEMS.map((item) => (
            <div key={item.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-muted/5 transition-colors">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{item.workspace}</span>
                  <span>•</span>
                  <span>Ngày tạo: {item.date}</span>
                </div>
              </div>
              <div>
                <Badge
                  className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full"
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
