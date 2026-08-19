import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateClientDTO, PackageTier } from "../types/client";
import { Building2, Mail, UserCheck } from "lucide-react";

interface CreateEditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateClientDTO) => Promise<void>;
  isLoading?: boolean;
}

export function CreateEditClientModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateEditClientModalProps) {
  const [formData, setFormData] = useState<CreateClientDTO>({
    name: "",
    logoUrl: "",
    industry: "",
    contactEmail: "",
    assignedAccountManagerId: "am-1",
    packageTier: "GROWTH",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) {
      errs.name = "Tên thương hiệu không được để trống";
    }
    if (!formData.contactEmail.trim()) {
      errs.contactEmail = "Email liên hệ không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errs.contactEmail = "Email không đúng định dạng";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Building2 className="size-4 text-[#f05a28]" />
            Tạo mới Brand Client
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Tên thương hiệu */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold">
              Tên Thương hiệu / Doanh nghiệp <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="VD: Heineken Vietnam, Nike Store..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="text-xs"
            />
            {errors.name && <p className="text-[11px] text-rose-500 font-medium">{errors.name}</p>}
          </div>

          {/* Email người liên hệ */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">
              Email liên hệ đại diện <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="contact@brand.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="text-xs pl-8"
              />
              <Mail className="size-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
            </div>
            {errors.contactEmail && (
              <p className="text-[11px] text-rose-500 font-medium">{errors.contactEmail}</p>
            )}
          </div>

          {/* Ngành hàng & Logo URL */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="industry" className="text-xs font-semibold">
                Ngành hàng / Lĩnh vực
              </Label>
              <Input
                id="industry"
                placeholder="VD: Thời trang, F&B..."
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="logoUrl" className="text-xs font-semibold">
                Logo Image URL
              </Label>
              <Input
                id="logoUrl"
                placeholder="https://..."
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          {/* Account Manager Phụ trách & Gói Dịch vụ */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <UserCheck className="size-3 text-muted-foreground" /> Account Manager
              </Label>
              <select
                value={formData.assignedAccountManagerId}
                onChange={(e) => setFormData({ ...formData, assignedAccountManagerId: e.target.value })}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#f05a28]"
              >
                <option value="am-1">Nguyễn Văn An (AM)</option>
                <option value="am-2">Phạm Minh Dung (AM)</option>
                <option value="am-3">Trần Hoàng Long (AM)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Gói dịch vụ ban đầu</Label>
              <select
                value={formData.packageTier}
                onChange={(e) => setFormData({ ...formData, packageTier: e.target.value as PackageTier })}
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#f05a28]"
              >
                <option value="STARTER">STARTER (15 posts/tháng)</option>
                <option value="GROWTH">GROWTH (30 posts/tháng)</option>
                <option value="ENTERPRISE">ENTERPRISE (45 posts/tháng)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs cursor-pointer">
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="bg-[#f05a28] hover:bg-[#f05a28]/90 text-white text-xs gap-1.5 cursor-pointer"
            >
              {isLoading ? "Đang xử lý..." : "Tạo Client Mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
