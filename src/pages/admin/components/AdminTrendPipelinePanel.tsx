import { AdminTrendPipelineControl } from "@/pages/admin/components/AdminTrendPipelineControl";
import { AdminTrendSettings } from "@/pages/admin/components/AdminTrendSettings";

export function AdminTrendPipelinePanel() {
  return (
    <div className="max-w-full min-w-0 space-y-4">
      <AdminTrendPipelineControl />
      <AdminTrendSettings />
    </div>
  );
}
