import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const WORKSPACES = [
  { name: "Nike Vietnam Campaign", code: "NK", members: 8, posts: 24, color: "bg-blue-600" },
  { name: "Heineken Campaign 2026", code: "HN", members: 12, posts: 45, color: "bg-emerald-600" },
  { name: "Sữa Hạt Organic", code: "SH", members: 4, posts: 12, color: "bg-amber-600" },
];

export function WorkspacePage() {
  return (
    <PageWrapper
      title="Workspaces"
      description="Danh sách không gian làm việc của các nhãn hàng."
      actions={
        <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white cursor-pointer text-xs">
          <Plus className="size-4 mr-1.5" />
          Tạo Workspace mới
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {WORKSPACES.map((ws) => (
          <div key={ws.code} className="border border-border bg-card rounded-lg overflow-hidden flex flex-col justify-between hover:border-brand-orange/40 transition-colors">
            <div className={`h-1.5 ${ws.color}`} />
            <div className="p-6 space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-brand-orange-soft text-brand-orange font-bold text-sm">
                  {ws.code}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{ws.name}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Workspace</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Quản lý các tài nguyên, bài đăng mạng xã hội, lịch biểu và phê duyệt nội dung.
              </p>
            </div>
            <div className="border-t border-border px-6 py-3 bg-muted/20 flex justify-between items-center text-xs text-muted-foreground select-none">
              <span>{ws.members} thành viên</span>
              <span>{ws.posts} bài đăng</span>
            </div>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
}

export default WorkspacePage;
