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
import { Select } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      errs.name = t("client.createEdit.nameRequired");
    }
    if (!formData.contactEmail.trim()) {
      errs.contactEmail = t("client.createEdit.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errs.contactEmail = t("client.createEdit.emailInvalid");
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
            <Building2 className="text-brand-orange size-4" />
            {t("client.createEdit.modalTitle")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Tên thương hiệu */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold">
              {t("client.createEdit.nameLabel")}{" "}
              <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder={t("client.createEdit.namePlaceholder")}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="text-xs"
            />
            {errors.name && (
              <p className="text-2xs font-medium text-rose-500">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email người liên hệ */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">
              {t("client.createEdit.emailLabel")}{" "}
              <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder={t("client.createEdit.emailPlaceholder")}
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                className="pl-8 text-xs"
              />
              <Mail className="text-muted-foreground absolute top-2.5 left-2.5 size-3.5" />
            </div>
            {errors.contactEmail && (
              <p className="text-2xs font-medium text-rose-500">
                {errors.contactEmail}
              </p>
            )}
          </div>

          {/* Ngành hàng & Logo URL */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="industry" className="text-xs font-semibold">
                {t("client.createEdit.industryLabel")}
              </Label>
              <Input
                id="industry"
                placeholder={t("client.createEdit.industryPlaceholder")}
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="logoUrl" className="text-xs font-semibold">
                {t("client.createEdit.logoUrlLabel")}
              </Label>
              <Input
                id="logoUrl"
                placeholder={t("client.createEdit.logoUrlPlaceholder")}
                value={formData.logoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, logoUrl: e.target.value })
                }
                className="text-xs"
              />
            </div>
          </div>

          {/* Account Manager Phụ trách & Gói Dịch vụ */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-xs font-semibold">
                <UserCheck className="text-muted-foreground size-3" />{" "}
                {t("client.createEdit.accountManagerLabel")}
              </Label>
              <Select
                value={formData.assignedAccountManagerId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assignedAccountManagerId: e.target.value,
                  })
                }
                className="border-border bg-background text-xs"
              >
                <option value="am-1">Nguyễn Văn An (AM)</option>
                <option value="am-2">Phạm Minh Dung (AM)</option>
                <option value="am-3">Trần Hoàng Long (AM)</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t("client.createEdit.packageTierLabel")}
              </Label>
              <Select
                value={formData.packageTier}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    packageTier: e.target.value as PackageTier,
                  })
                }
                className="border-border bg-background text-xs"
              >
                <option value="STARTER">STARTER (15 posts/tháng)</option>
                <option value="GROWTH">GROWTH (30 posts/tháng)</option>
                <option value="ENTERPRISE">ENTERPRISE (45 posts/tháng)</option>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="cursor-pointer text-xs"
            >
              {t("client.createEdit.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="bg-brand-orange hover:bg-brand-orange/90 cursor-pointer gap-1.5 text-xs text-white"
            >
              {isLoading
                ? t("client.createEdit.processing")
                : t("client.createEdit.createButton")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
