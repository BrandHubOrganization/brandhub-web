export interface ClientProfile {
  id: string;
  userId: string;
  // Null cho profile tạo qua trang "Hồ sơ thương hiệu của tôi" (BA mới, N
  // profile/user, không giới hạn theo agency) — vẫn có giá trị cho profile
  // cũ tạo qua accept-invite (giữ liên hệ agency đã mời, không phải khoá).
  agencyId: string | null;
  displayName: string;
  company: string | null;
  phone: string | null;
  note: string | null;
  logoUrl: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  description: string | null;
  socialLinks: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateClientProfileRequest {
  displayName: string;
  company?: string;
  phone?: string;
  note?: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  location?: string;
  description?: string;
  socialLinks?: Record<string, string>;
}
